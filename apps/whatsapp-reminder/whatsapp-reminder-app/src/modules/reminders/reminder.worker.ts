import { Worker, Job } from 'bullmq';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import { container } from '../../core/container';
import { metricsService } from '../infra/metrics.service';
import { TemplateType } from '../whatsapp/template.service';
import { UsageType } from '../infra/usage.service';
import { DateUtils } from '../../utils/dateUtils';
import { LiveService } from '../whatsapp/live.service';

let reminderWorker: Worker | null = null;

/**
 * Initialize and start the BullMQ Worker for reminders
 */
export function startReminderWorker(liveService: LiveService) {
    if (reminderWorker) {
        logger.warn('Worker: Reminder worker already started');
        return;
    }

    reminderWorker = new Worker(
        'reminders',
        async (job: Job) => {
            const { reminderId, userId, phone, title, message, requestId } = job.data;
            
            logger.info({ 
                msg: 'Worker: Processing job', 
                jobId: job.id, 
                reminderId,
                requestId 
            });

            try {
                // 1. ATOMIC LOCK & IDEMPOTENCY CHECK
                const reminderRepo = container.reminderRepository;
                const updateResult = await reminderRepo.prismaDb.reminder.updateMany({
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

                const reminder = await reminderRepo.findById(reminderId);
                if (!reminder) return;

                const whatsappMessage = container.templateService.format(TemplateType.REMINDER, { 
                    title, 
                    message 
                });

                // 2. ACTUAL SENDING
                const result = await container.whatsappService.sendNotification(userId, phone, whatsappMessage, title);

                if (!result.success) {
                    // Revert status to FAILED so it shows up in history/logs correctly
                    await reminderRepo.updateStatus(reminder.id, 'FAILED', new Date());
                    liveService.sendPulse(`Reminder failed: ${title} to ${phone}`, 'ERROR', 'SENT');
                    
                    // Throwing here triggers BullMQ's automatic retry mechanism (exponential backoff)
                    throw new Error(`WhatsApp delivery failed: ${result.error}`);
                }

                // 3. LOGIC FOR RECURRING
                const now = new Date();
                if (reminder.repeat && reminder.repeat !== 'NONE') {
                    const nextSchedule = DateUtils.calculateNextOccurrence(reminder.schedule, reminder.repeat, reminder.daysOfWeek || []);
                    await reminderRepo.handleRecurring(reminder, nextSchedule, now);
                } else {
                    await reminderRepo.update(reminder.id, { sentAt: now });
                }

                liveService.sendPulse(`Reminder sent: ${title} to ${phone}`, 'SUCCESS', 'SENT');
                await container.usageService.logUsage(userId, UsageType.NOTIF_SENT, phone, 'SUCCESS');
                metricsService.remindersSent.inc({ status: 'SUCCESS' });
                
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                logger.error({ msg: 'Worker: Job failed', jobId: job.id, error: message });
                metricsService.remindersFailed.inc({ reason: message || 'UNKNOWN' });
                throw error; // Let BullMQ handle the failure
            }
        },
        {
            connection: {
                url: env.REDIS_URL
            },
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
