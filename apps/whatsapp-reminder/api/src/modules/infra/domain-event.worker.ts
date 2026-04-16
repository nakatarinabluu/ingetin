import { Worker, Job } from 'bullmq';
import { bullConnection } from '../../core/bull-connection';
import { logger } from '@ingetin/logger';
import { DomainEvent } from '../../core/events';
import { UsageType, UsageService } from '../infra/usage.service';
import { ReminderService } from '../reminders/reminder.service';
import { RedisService } from '../infra/redis.service';

let domainEventWorker: Worker | null = null;

/**
 * Initialize and start the Domain Event Worker
 */
export function startDomainEventWorker(
    reminderService: ReminderService,
    usageService: UsageService,
    redisService: RedisService
) {
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
                        await reminderService.scheduleReminder(payload);
                        break;

                    case DomainEvent.USER_REGISTERED:
                        await usageService.logUsage(payload.userId, UsageType.REGISTRATION, 'INTERNAL', 'SUCCESS');
                        logger.info({ msg: 'Processed User Registration Event', userId: payload.userId });
                        break;

                    case DomainEvent.USER_ACTIVATED:
                        await usageService.logUsage(payload.userId, UsageType.LICENSE_ACTIVATE, `LICENSE:${payload.licenseId}`, 'SUCCESS');
                        await redisService.deleteCache(`setup:${payload.userId}`);
                        logger.info({ msg: 'Processed User Activation Event', userId: payload.userId });
                        break;
                        
                    default:
                        logger.info({ msg: 'No specific worker handler for event', event: eventType });
                }
            } catch (error: unknown) {
                logger.error({ 
                    msg: `Worker: Domain Event processing failed: ${eventType}`, 
                    jobId: job.id, 
                    error: (error as Error).message 
                });
                throw error;
            }
        },
        {
            connection: bullConnection,
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
