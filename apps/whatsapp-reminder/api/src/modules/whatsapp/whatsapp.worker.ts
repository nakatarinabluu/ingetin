import { Worker, Job } from 'bullmq';
import { bullConnection } from '../../core/bull-connection';
import { logger } from '@ingetin/logger';
import { metricsService } from '../infra/metrics.service';
import { LiveService } from './live.service';
import { UsageService } from '../infra/usage.service';
import { MessagingProvider, MessagingResponse } from './providers/messaging.provider';
import { MessageRepository } from './message.repository';
import { MessageStatus } from '@prisma/client';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';
import { WhatsAppJob } from './whatsapp.queue';

let whatsappWorker: Worker | null = null;

export function startWhatsAppWorker(
    liveService: LiveService,
    provider: MessagingProvider,
    messageRepository: MessageRepository,
    usageService: UsageService
) {
    if (whatsappWorker) return;

    whatsappWorker = new Worker<WhatsAppJob>(
        'whatsapp-outbound',
        async (job: Job<WhatsAppJob>) => {
            const { messageId, to, type, body, userId, templateName, components, timestamp } = job.data;

            logger.info({ msg: 'Worker: Processing Outbound WhatsApp', messageId, to });

            try {
                let response: MessagingResponse;
                if (templateName) {
                    response = await provider.sendTemplate({ 
                        type, 
                        to, 
                        templateName, 
                        components: components || [], 
                        userId 
                    });
                } else {
                    response = await provider.sendText({ 
                        type, 
                        to, 
                        text: body, 
                        userId 
                    });
                }

                if (response.success) {
                    const providerId = response.providerMessageId!;
                    
                    // 1. Update Persistence
                    await messageRepository.updateStatus(messageId, MessageStatus.SENT, providerId);
                    
                    // 2. Emit Success for real-time UI/Metrics (Subscribers will handle this)
                    eventBus.emitDomainEvent(DomainEvent.MESSAGE_SENT, {
                        messageId: providerId,
                        to,
                        type,
                        body,
                        userId,
                        timestamp
                    });

                    return { success: true, providerId };
                } else {
                    throw new Error(response.error || 'Provider failed to send');
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error({ msg: 'Worker: WhatsApp Processing Failed', messageId, error: message });
                
                // On failure, update status to FAILED in DB 
                // BullMQ will still retry this job based on its settings
                await messageRepository.updateStatus(messageId, MessageStatus.FAILED);
                
                // Optionally emit failure for real-time monitoring
                eventBus.emitDomainEvent(DomainEvent.MESSAGE_FAILED, {
                    to,
                    type,
                    error: message,
                    userId,
                    timestamp
                });

                throw error; // Let BullMQ handle retries
            }
        },
        {
            connection: bullConnection,
            limiter: {
                max: 80,
                duration: 10000
            },
            concurrency: 10
        }
    );

    whatsappWorker.on('completed', (job) => {
        logger.info({ msg: 'WhatsApp outbound completed', jobId: job.id });
    });

    whatsappWorker.on('failed', (job, err) => {
        logger.error({ msg: 'WhatsApp outbound FAILED PERMANENTLY', jobId: job?.id, error: err.message });
    });

    logger.info('Worker: WhatsApp Outbound processor started');
}

export async function stopWhatsAppWorker() {
    if (whatsappWorker) {
        await whatsappWorker.close();
        whatsappWorker = null;
        logger.info('Worker: WhatsApp Outbound processor stopped');
    }
}
