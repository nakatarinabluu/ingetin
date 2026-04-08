import { Worker, Job } from 'bullmq';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import { container } from '../../core/container';

let calendarWorker: Worker | null = null;

/**
 * Initialize and start the BullMQ Worker for Google Calendar synchronization
 */
export function startCalendarWorker() {
    if (calendarWorker) {
        logger.warn('Worker: Calendar sync worker already started');
        return;
    }

    calendarWorker = new Worker(
        'calendar-sync',
        async (job: Job) => {
            const { userId } = job.data;
            
            logger.info({ 
                msg: 'Worker: Syncing Google Calendar', 
                jobId: job.id, 
                userId 
            });

            try {
                const calendarService = container.calendarService;
                await calendarService.syncUserEvents(userId);
                
                logger.info({ msg: 'Worker: Calendar sync complete', userId, jobId: job.id });
            } catch (error: any) {
                logger.error({ 
                    msg: 'Worker: Calendar sync job failed', 
                    jobId: job.id, 
                    userId, 
                    error: error.message 
                });
                throw error; // Let BullMQ handle retries
            }
        },
        {
            connection: {
                url: env.REDIS_URL
            },
            // Concurrency limit to avoid hitting Google API Rate Limits too hard
            concurrency: 5, 
            limiter: {
                max: 10,
                duration: 1000 // 10 jobs per second max
            }
        }
    );

    calendarWorker.on('completed', (job) => {
        logger.debug({ msg: 'Calendar sync job completed', jobId: job.id });
    });

    calendarWorker.on('failed', (job, err) => {
        logger.error({ 
            msg: 'Calendar sync job failed permanently', 
            jobId: job?.id, 
            error: err.message 
        });
    });

    logger.info('Worker: Calendar sync processor started');
}

/**
 * Graceful shutdown hook for the worker
 */
export async function stopCalendarWorker() {
    if (calendarWorker) {
        await calendarWorker.close();
        calendarWorker = null;
        logger.info('Worker: Calendar sync processor stopped');
    }
}
