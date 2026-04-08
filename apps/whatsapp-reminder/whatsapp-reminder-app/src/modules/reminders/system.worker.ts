import { Worker, Queue, Job } from 'bullmq';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import { container } from '../../core/container';
import { LiveService } from '../whatsapp/live.service';

// Queue for system tasks
export const systemQueue = new Queue('system', {
  connection: {
    url: env.REDIS_URL
  }
});

let systemWorker: Worker | null = null;
const dlqQueue = new Queue('system-dlq', { connection: { url: env.REDIS_URL } });

/**
 * Initialize and start the system worker
 */
export function startSystemWorker(liveService: LiveService) {
    if (systemWorker) return;

    systemWorker = new Worker(
        'system',
        async (job: Job) => {
            logger.info({ msg: 'Worker: Processing system job', jobName: job.name, jobId: job.id });

            try {
                if (job.name === 'calendar-sync') {
                    liveService.sendPulse('Starting Google Calendar sync scheduler', 'INFO', 'SYSTEM');
                    const users = await container.calendarRepository.findActiveUsersWithGoogle();
                    
                    if (users.length > 0) {
                        // 15 minutes in milliseconds
                        const windowMs = 15 * 60 * 1000;
                        const staggerInterval = Math.floor(windowMs / users.length);
                        
                        logger.info({ msg: 'Scheduling staggered calendar syncs', count: users.length, windowMs, staggerInterval });
                        
                        for (let i = 0; i < users.length; i++) {
                            const delay = i * staggerInterval;
                            await systemQueue.add('sync-user-calendar', { userId: users[i].id }, { delay });
                        }
                    }
                    liveService.sendPulse(`Google Calendar sync scheduled for ${users.length} users over 15m`, 'SUCCESS', 'SYSTEM');
                }

                if (job.name === 'sync-user-calendar') {
                    const { userId } = job.data;
                    await container.calendarService.syncUserEvents(userId);
                }

                if (job.name === 'reminder-pusher') {
                    await container.reminderService.pushDueReminders();
                }

                if (job.name === 'log-cleanup') {
                    liveService.sendPulse('Starting daily log cleanup', 'INFO', 'SYSTEM');
                    const result = await container.reminderRepository.purgeOldLogs(env.DB_RETENTION_DAYS); 
                    logger.info({ msg: 'Log cleanup completed', ...result });
                    liveService.sendPulse(`Log cleanup completed: ${result.usagePurged} records removed`, 'SUCCESS', 'SYSTEM');
                }

                if (job.name === 'delivery-ack') {
                    // Check for reminders that should have been sent 5+ minutes ago but are still pending/queued
                    const staleReminders = await container.reminderRepository.findStaleReminders(5);
                    if (staleReminders.length > 0) {
                        logger.error({ msg: `DELIVERY ALERT: Found ${staleReminders.length} stale reminders not sent!`, count: staleReminders.length });
                        liveService.sendPulse(`DELIVERY ALERT: ${staleReminders.length} reminders missed their delivery window!`, 'ERROR', 'SYSTEM');
                        
                        // Proactive Strategy: Group by user to avoid spamming
                        const userMissedMap = new Map<string, { phone: string, count: number }>();

                        for (const r of staleReminders) {
                            const user = await container.userRepository.findById(r.userId);
                            if (user && user.phoneNumber) {
                                const data = userMissedMap.get(r.userId) || { phone: user.phoneNumber, count: 0 };
                                data.count++;
                                userMissedMap.set(r.userId, data);
                            }

                            // Self-healing: Mark them as FAILED to prevent infinite retries on dead messages
                            await container.reminderRepository.updateStatus(r.id, 'FAILED');
                        }

                        // Send aggregated alerts in parallel
                        await Promise.all(
                            Array.from(userMissedMap.entries()).map(([userId, data]) => 
                                container.whatsappService.sendMissedReminderAlert(userId, data.phone, data.count)
                            )
                        );
                    }
                }
            } catch (error: any) {
                liveService.sendPulse(`System job ${job.name} failed: ${((error as Error).message)}`, 'ERROR', 'SYSTEM');
                logger.error({ msg: 'Worker: System job failed', jobId: job.id, error: ((error as Error).message) });
                throw error;
            }
        },
        {
            connection: {
                url: env.REDIS_URL
            },
            concurrency: 10 
        }
    );

    systemWorker.on('completed', (job) => {
        logger.info({ msg: 'System job completed', jobName: job.name, jobId: job.id });
    });

    systemWorker.on('failed', async (job, err) => {
        logger.error({ msg: 'System job failed', jobName: job?.name, jobId: job?.id, error: err.message });
        if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
            logger.warn({ msg: 'Job exhausted retries, moving to DLQ', jobId: job.id });
            try {
                await dlqQueue.add('failed-system', {
                    originalJobId: job.id,
                    jobName: job.name,
                    data: job.data,
                    error: err.message,
                    failedAt: new Date().toISOString()
                });
            } catch (dlqErr: any) {
                logger.error({ msg: 'Failed to add job to DLQ', jobId: job.id, error: dlqErr.message });
            }
        }
    });
}

/**
 * Schedule the repeatable system jobs
 */
export async function scheduleSystemJobs() {
    // 1. Google Calendar Sync (Every 15 minutes)
    await systemQueue.add('calendar-sync', {}, {
        jobId: 'calendar-sync-singleton',
        repeat: {
            pattern: '*/15 * * * *'
        }
    });

    // 2. Reminder Pusher (Every minute)
    await systemQueue.add('reminder-pusher', {}, {
        jobId: 'reminder-pusher-singleton',
        repeat: {
            pattern: '* * * * *'
        }
    });

    // 3. Log Cleanup (Daily at midnight)
    await systemQueue.add('log-cleanup', {}, {
        jobId: 'log-cleanup-singleton',
        repeat: {
            pattern: '0 0 * * *'
        }
    });

    // 4. Delivery Acknowledgement (Every 5 minutes)
    await systemQueue.add('delivery-ack', {}, {
        jobId: 'delivery-ack-singleton',
        repeat: {
            pattern: '*/5 * * * *'
        }
    });

    logger.info('System jobs scheduled (calendar, pusher, cleanup, delivery-ack)');
}
