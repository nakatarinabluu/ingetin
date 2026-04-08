import { logger } from '@ingetin/logger';
import { Queue, JobsOptions } from 'bullmq';
import { ReminderRepository } from './reminder.repository';
import { Reminder, User, RepeatInterval } from '@prisma/client';

type DueReminder = Reminder & { user: User };

export class ReminderService {
    private MAX_ATTEMPTS = 3;
    private STALE_THRESHOLD_MS = 60 * 60 * 1000;

    constructor(
        private readonly reminderRepository: ReminderRepository,
        private readonly reminderQueue: Queue
    ) {
        logger.info('Reminder Service: Initialized');
    }

    private async addToQueue(name: string, data: Record<string, unknown>, opts?: JobsOptions) {
        return await this.reminderQueue.add(name, data, opts);
    }

    /**
     * Proactively schedule a reminder in BullMQ.
     * Use this when a reminder is created or updated to avoid waiting for the cron pusher.
     */
    async scheduleReminder(reminder: Reminder & { user: { phoneNumber: string | null } }) {
        const now = new Date();
        const delay = reminder.schedule.getTime() - now.getTime();

        // SV-GRADE FIX: Only push to Redis if delay is less than 10 minutes (600,000 ms)
        // This prevents OOM in Redis for future reminders.
        if (delay > 0 && delay <= 600000) {
            try {
                await this.addToQueue('reminder-send', {
                    reminderId: reminder.id,
                    userId: reminder.userId,
                    phone: reminder.user.phoneNumber,
                    title: reminder.title,
                    message: reminder.message
                }, {
                    jobId: `reminder_${reminder.id}_${reminder.schedule.getTime()}`,
                    delay: delay,
                    attempts: this.MAX_ATTEMPTS,
                    backoff: { type: 'exponential', delay: 5000 }
                });

                await this.reminderRepository.update(reminder.id, { status: 'QUEUED' });
                logger.info({ msg: 'Reminder scheduled ahead via BullMQ delay', id: reminder.id, delayMs: delay });
            } catch (error: unknown) {
                const err = error as Error;
                logger.error({ msg: 'Failed to proactively schedule reminder', id: reminder.id, error: err.message });
            }
        } else if (delay <= 0) {
            // If it's due now or in the past, let the pusher handle it or push immediately
            await this.pushDueReminders();
        } else {
            // Delay > 10 mins: Leave it PENDING in Postgres, cron job will pick it up later.
            logger.info({ msg: 'Reminder scheduled for far future, leaving in Postgres', id: reminder.id, delayMs: delay });
        }
    }

    /**
     * Scan database for due reminders and push them to BullMQ
     * Triggered by BullMQ System Queue (repeatable job)
     */
    async pushDueReminders() {
        const now = new Date();
        
        try {
            // Find reminders due NOW or in the past that aren't already queued/sent
            const dueReminders = await this.reminderRepository.findDueReminders(now, this.MAX_ATTEMPTS) as DueReminder[];

            if (dueReminders.length === 0) {
                return;
            }

            logger.info({ msg: 'ReminderPusher: pushing to queue', count: dueReminders.length });

            await Promise.all(dueReminders.map(async (reminder) => {
                try {
                    const isStale = (now.getTime() - reminder.schedule.getTime()) > this.STALE_THRESHOLD_MS;
                    
                    // 1. Handle Stale Non-Recurring
                    if (isStale && (!reminder.repeat || reminder.repeat === RepeatInterval.NONE)) {
                        logger.warn({ msg: 'Reminder dropped: STALE', title: reminder.title, id: reminder.id });
                        await this.reminderRepository.updateStatus(reminder.id, 'FAILED', now);
                        return;
                    }

                    // 2. Handle Missing Phone
                    if (!reminder.user.phoneNumber) {
                        logger.warn({ msg: 'Reminder dropped: No phone', user: reminder.user.username, id: reminder.id });
                        await this.reminderRepository.updateStatus(reminder.id, 'FAILED', now);
                        return;
                    }

                    // 3. Add to BullMQ Queue
                    // We mark it as QUEUED immediately in DB to prevent duplicate pushes
                    await this.reminderRepository.update(reminder.id, { status: 'QUEUED' });

                    await this.addToQueue(
                        'reminder-send',
                        {
                            reminderId: reminder.id,
                            userId: reminder.userId,
                            phone: reminder.user.phoneNumber,
                            title: reminder.title,
                            message: reminder.message
                        },
                        {
                            jobId: `reminder_${reminder.id}_${reminder.schedule.getTime()}`,
                            attempts: this.MAX_ATTEMPTS,
                            backoff: {
                                type: 'exponential',
                                delay: 5000
                            }
                        }
                    );

                    logger.info({ msg: 'Reminder enqueued to BullMQ', id: reminder.id });

                } catch (error: unknown) {
                    const err = error as Error;
                    logger.error({ msg: 'Failed to push reminder to queue', id: reminder.id, error: err.message });
                    
                    // Revert to PENDING so it can be picked up by the next cycle
                    await this.reminderRepository.update(reminder.id, { 
                        status: 'PENDING',
                        attempts: { increment: 1 }
                    });
                }
            }));
        } catch (error: unknown) {
            const err = error as Error;
            logger.error({ msg: 'Reminder Pusher Failure', error: err.message });
        }
    }
}
