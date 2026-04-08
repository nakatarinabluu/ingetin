import { Worker, Job, Queue } from 'bullmq';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import { formatPhone } from '../../utils/phoneFormatter';
import { MessageRepository } from './message.repository';
import { UserRepository } from '../auth/user.repository';
import { RedisService } from '../infra/redis.service';
import { ConversationService } from './conversation.service';
import { metricsService } from '../infra/metrics.service';
import { MessageStatus, MessageDirection } from '@prisma/client';
import { z } from 'zod';
import { LiveService } from './live.service';
import { WebhookPayloadSchema, WebhookPayload } from '@ingetin/types';


let webhookWorker: Worker | null = null;
const dlqQueue = new Queue('whatsapp-webhook-dlq', { connection: { url: env.REDIS_URL } });

export function startWebhookWorker(
    liveService: LiveService, 
    messageRepository: MessageRepository,
    userRepository: UserRepository,
    redisService: RedisService,
    conversationService: ConversationService
) {
    if (webhookWorker) return;

    webhookWorker = new Worker(
        'whatsapp-webhook',
        async (job: Job) => {
            const end = metricsService.webhookLatency.startTimer();
            const rawBody = job.data;
            const parseResult = WebhookPayloadSchema.safeParse(rawBody);
            
            if (!parseResult.success) {
                logger.warn({ msg: 'Invalid webhook payload received in worker', errors: parseResult.error.errors });
                metricsService.webhooksProcessed.inc({ type: 'UNKNOWN', status: 'INVALID' });
                return;
            }

            const body = parseResult.data;

            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    const value = change.value;
                    const metadata = value.metadata;

                    // 1. Process Status Updates
                    if (value.statuses && Array.isArray(value.statuses)) {
                        for (const statusUpdate of value.statuses) {
                            const statusMapping: Record<string, MessageStatus> = {
                                'sent': MessageStatus.SENT,
                                'delivered': MessageStatus.DELIVERED,
                                'read': MessageStatus.READ,
                                'failed': MessageStatus.FAILED
                            };

                            const prismaStatus = statusMapping[statusUpdate.status.toLowerCase()];
                            if (prismaStatus) {
                                const existing = await messageRepository.findUnique({ where: { whatsappId: statusUpdate.id } });
                                if (existing) {
                                    await messageRepository.updateStatusByWhatsappId(statusUpdate.id, prismaStatus);
                                    liveService.sendPulse(`Message status: ${prismaStatus}`, 'INFO', 'SYSTEM');
                                }
                                metricsService.webhooksProcessed.inc({ type: 'STATUS', status: 'SUCCESS' });
                            }
                        }
                    }

                    // 2. Process Incoming Messages
                    if (value.messages && Array.isArray(value.messages)) {
                        for (const msg of value.messages) {
                            // Check DB first for true idempotency
                            const existing = await messageRepository.findUnique({ where: { whatsappId: msg.id } });
                            if (existing) {
                                logger.info({ msg: 'Webhook: skipping duplicate (already in DB)', id: msg.id });
                                continue;
                            }

                            const lockKey = `idempotency:webhook:${msg.id}`;
                            const isNew = await redisService.acquireLock(lockKey, 3600); // 1h is plenty for concurrency

                            if (!isNew) {
                                logger.warn({ msg: 'Webhook: Concurrent duplicate detected', id: msg.id });
                                continue;
                            }

                            try {
                                const from = formatPhone(msg.from);
                                const msgBody = msg.text?.body || `[${msg.type.toUpperCase()}]`;
                                const originalTimestamp = msg.timestamp ? new Date(parseInt(msg.timestamp) * 1000) : new Date();

                                const user = await userRepository.findByPhone(from);

                                await messageRepository.create({
                                    whatsappId: msg.id,
                                    from,
                                    to: metadata?.display_phone_number || 'SYSTEM',
                                    body: msgBody,
                                    direction: MessageDirection.INBOUND,
                                    messageType: 'NOTIF',
                                    status: MessageStatus.DELIVERED,
                                    timestamp: originalTimestamp,
                                    userId: user?.id || null
                                });

                                await conversationService.syncMessage({
                                    userId: user?.id || undefined,
                                    body: msgBody,
                                    from,
                                    to: metadata?.display_phone_number || 'SYSTEM',
                                    direction: MessageDirection.INBOUND,
                                    timestamp: originalTimestamp
                                });

                                logger.info({ msg: 'Webhook: Processed', from, id: msg.id });
                                liveService.sendPulse(`Received: "${msgBody}" from ${from}`, 'SUCCESS', 'RECEIVED');
                                metricsService.webhooksProcessed.inc({ type: 'MESSAGE', status: 'SUCCESS' });
                            } catch (err: unknown) {
                                // Release lock on failure so it can be retried, 
                                // EXCEPT if it's a Prisma Unique Constraint error (P2002), 
                                // which means it's a confirmed duplicate in DB.
                                const isDuplicateInDb = err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
                                
                                if (!isDuplicateInDb) {
                                    await redisService.releaseLock(lockKey);
                                }
                                throw err;
                            }
                        }
                    }
                }
            }
            end();
        },
        {
            connection: {
                url: env.REDIS_URL
            },
            concurrency: 5
        }
    );

    webhookWorker.on('failed', async (job, err) => {
        logger.error(`Webhook job ${job?.id} failed: ${err.message}`);
        if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
            logger.warn({ msg: 'Job exhausted retries, moving to DLQ', jobId: job.id });
            try {
                await dlqQueue.add('failed-webhook', {
                    originalJobId: job.id,
                    data: job.data,
                    error: err.message,
                    failedAt: new Date().toISOString()
                });
            } catch (dlqErr: unknown) {
                const message = dlqErr instanceof Error ? dlqErr.message : String(dlqErr);
                logger.error({ msg: 'Failed to add job to DLQ', jobId: job.id, error: message });
            }
        }
    });

    logger.info('Worker: WhatsApp Webhook processor started');
}

export async function stopWebhookWorker() {
    if (webhookWorker) {
        await webhookWorker.close();
        webhookWorker = null;
        logger.info('Worker: WhatsApp Webhook processor stopped');
    }
}
