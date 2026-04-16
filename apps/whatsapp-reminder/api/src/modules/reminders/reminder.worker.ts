import { Worker, Job } from 'bullmq';
import { bullConnection } from '../../core/bull-connection';
import { logger } from '@ingetin/logger';
import { metricsService } from '../infra/metrics.service';
import { TemplateType, TemplateService } from '../whatsapp/template.service';
import { UsageType, UsageService } from '../infra/usage.service';
import { DateUtils } from '../../utils/dateUtils';
import { LiveService } from '../whatsapp/live.service';
import { ReminderRepository } from './reminder.repository';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

export interface ReminderJobData {
    reminderId: string;
    userId: string;
    phone: string;
    title: string;
    message: string;
    requestId?: string;
}

let reminderWorker: Worker<ReminderJobData, void> | null = null;

/**
 * Initialize and start the BullMQ Worker for reminders
 */
export function startReminderWorker(
    liveService: LiveService,
    reminderRepository: ReminderRepository,
    templateService: TemplateService,
    whatsappService: WhatsAppService,
    usageService: UsageService
) {
    if (reminderWorker) {
        logger.warn('Worker: Reminder worker already started');
        return;
    }

    reminderWorker = new Worker<ReminderJobData, void>(
        'reminders',
        async (job: Job<ReminderJobData>) => {
            const { reminderId, userId, phone, title, message, requestId } = job.data;
            
            logger.info({ 
                msg: 'Worker: Processing job', 
                jobId: job.id, 
                reminderId,
                requestId 
            });

            try {
                // 1. ATOMIC LOCK & IDEMPOTENCY CHECK
                const updateResult = await reminderRepository.prismaDb.reminder.updateMany({
                    where: { 
                        id: reminderId,
                        status: 'QUEUED'
                    },
                    data: { status: 'SENT' }
                });

                if (updateResult.count === 0) {
                    logger.warn({ 
                        msg: 'Worker: Job aborted - reminder already processed or not in QUEUED state', 
                        reminderId,
                        jobId: job.id
                    });
                    return;
                }

                const reminder = await reminderRepository.findById(reminderId);
                if (!reminder) return;

                const whatsappMessage = templateService.format(TemplateType.REMINDER, { 
                    title, 
                    message 
                });

                // 2. ACTUAL SENDING
                const result = await whatsappService.sendNotification(userId, phone, whatsappMessage, title);

                if (!result.success) {
                    // Revert status to FAILED so it shows up in history/logs correctly
                    await reminderRepository.updateStatus(reminder.id, 'FAILED', new Date());
                    liveService.sendPulse(`Reminder failed: ${title} to ${phone}`, 'ERROR', 'SENT');
                    
                    // Throwing here triggers BullMQ's automatic retry mechanism (exponential backoff)
                    throw new Error(`WhatsApp delivery failed: ${result.error}`);
                }

                // 3. LOGIC FOR RECURRING
                const now = new Date();
                if (reminder.repeat && reminder.repeat !== 'NONE') {
                    const nextSchedule = DateUtils.calculateNextOccurrence(reminder.schedule, reminder.repeat, reminder.daysOfWeek || []);
                    await reminderRepository.handleRecurring(reminder, nextSchedule, now);
                } else {
                    await reminderRepository.update(reminder.id, { sentAt: now });
                }

                liveService.sendPulse(`Reminder sent: ${title} to ${phone}`, 'SUCCESS', 'SENT');
                await usageService.logUsage(userId, UsageType.NOTIF_SENT, phone, 'SUCCESS');
                metricsService.remindersSent.inc({ status: 'SUCCESS' });
                
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error({ msg: 'Worker: Job failed', jobId: job.id, error: message });
                metricsService.remindersFailed.inc({ reason: message || 'UNKNOWN' });
                throw error; // Let BullMQ handle the failure
            }
        },
        {
            connection: bullConnection,
            limiter: {
                max: 50,
                duration: 10000
            }
        }
    );

    reminderWorker.on('completed', (job) => {
        logger.info({ msg: 'Job completed', jobId: job.id });
    });

    reminderWorker.on('failed', (job, err) => {
        logger.error({ 
            msg: 'Job failed permanently or exceeded retries', 
            jobId: job?.id, 
            error: err.message,
            attempts: job?.attemptsMade 
        });
    });

    logger.info('Worker: Reminder background processor started');
}

/**
 * Graceful shutdown hook for the worker
 */
export async function stopReminderWorker() {
    if (reminderWorker) {
        await reminderWorker.close();
        reminderWorker = null;
        logger.info('Worker: Reminder background processor stopped');
    }
}
