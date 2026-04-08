import { Worker, Job } from 'bullmq';
import { env } from '../../core/config';
import { logger } from '@ingetin/logger';
import { container } from '../../core/container';
import { DomainEvent } from '../../core/events';

let domainEventWorker: Worker | null = null;

/**
 * Initialize and start the Domain Event Worker
 */
export function startDomainEventWorker() {
    if (domainEventWorker) return;

    domainEventWorker = new Worker(
        'domain-events',
        async (job: Job) => {
            const eventType = job.name as DomainEvent;
            const payload = job.data;

            logger.info({ msg: `Worker: Processing Domain Event: ${eventType}`, jobId: job.id });

            try {
                switch (eventType) {
                    case DomainEvent.REMINDER_CREATED:
                    case DomainEvent.REMINDER_UPDATED:
                        // Process Reminder scheduling
                        await container.reminderService.scheduleReminder(payload);
                        break;

                    case DomainEvent.USER_REGISTERED:
                        // Log registration usage
                        await container.usageService.logUsage(payload.userId, 'REGISTRATION' as any, 'INTERNAL', 'SUCCESS');
                        logger.info({ msg: 'Processed User Registration Event', userId: payload.userId });
                        break;

                    case DomainEvent.USER_ACTIVATED:
                        // Log license activation and clear setup cache
                        await container.usageService.logUsage(payload.userId, 'LICENSE_ACTIVATE' as any, `LICENSE:${payload.licenseId}`, 'SUCCESS');
                        await container.redisService.deleteCache(`setup:${payload.userId}`);
                        logger.info({ msg: 'Processed User Activation Event', userId: payload.userId });
                        break;
                        
                    default:
                        logger.info({ msg: 'No specific worker handler for event', event: eventType });
                }
            } catch (error: any) {
                logger.error({ 
                    msg: `Worker: Domain Event processing failed: ${eventType}`, 
                    jobId: job.id, 
                    error: error.message 
                });
                throw error;
            }
        },
        {
            connection: {
                url: env.REDIS_URL
            },
            concurrency: 5
        }
    );

    domainEventWorker.on('completed', (job) => {
        logger.info({ msg: 'Domain Event processed', event: job.name, jobId: job.id });
    });

    domainEventWorker.on('failed', (job, err) => {
        logger.error({ msg: 'Domain Event job failed', event: job?.name, error: err.message });
    });
}

export async function stopDomainEventWorker() {
    if (domainEventWorker) {
        await domainEventWorker.close();
        domainEventWorker = null;
    }
}
