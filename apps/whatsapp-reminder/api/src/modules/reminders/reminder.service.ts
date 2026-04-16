import { logger } from '@ingetin/logger';
import { Queue, JobsOptions } from 'bullmq';
import { ReminderRepository } from './reminder.repository';
import { Reminder, User, RepeatInterval } from '@prisma/client';
import { Result, Success, Failure } from '../../core/result';
import { ErrorCode } from '../../core/errors/AppError';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';

type DueReminder = Reminder & { user: User };

interface ReminderCreateData {
    userId: string;
    title: string;
    message: string;
    schedule: Date;
    repeat?: RepeatInterval;
    daysOfWeek?: number[];
}

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
     * Create a new reminder with lifecycle events
     */
    async createReminder(data: ReminderCreateData): Promise<Result<Reminder>> {
        try {
            const reminder = await this.reminderRepository.create({
                userId: data.userId,
                title: data.title,
                message: data.message,
                schedule: data.schedule,
                repeat: data.repeat || RepeatInterval.NONE,
                daysOfWeek: data.daysOfWeek || []
            });

            eventBus.emitDomainEvent(DomainEvent.REMINDER_CREATED, { 
                reminderId: reminder.id, 
                userId: data.userId 
            });

            return Success(reminder);
        } catch (error: unknown) {
            logger.error({ msg: 'Failed to create reminder', error: (error as Error).message });
            return Failure('Could not create reminder', ErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Delete a reminder permanently
     */
    async deleteReminder(id: string): Promise<Result<void>> {
        try {
            await this.reminderRepository.purgeReminder(id);
            return Success(undefined);
        } catch (error: unknown) {
            logger.error({ msg: 'Failed to delete reminder', id, error: (error as Error).message });
            return Failure('Could not delete reminder', ErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Proactively schedule a reminder in BullMQ.
     */
    async scheduleReminder(reminder: Reminder & { user: { phoneNumber: string | null } }) {
        const now = new Date();
        const delay = reminder.schedule.getTime() - now.getTime();

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
            await this.pushDueReminders();
        } else {
            logger.info({ msg: 'Reminder scheduled for far future, leaving in Postgres', id: reminder.id, delayMs: delay });
        }
    }

    /**
     * Scan database for due reminders and push them to BullMQ
     */
    async pushDueReminders() {
        const now = new Date();
        
        try {
            const dueReminders = await this.reminderRepository.findDueReminders(now, this.MAX_ATTEMPTS);

            if (dueReminders.length === 0) {
                return;
            }

            logger.info({ msg: 'ReminderPusher: pushing to queue', count: dueReminders.length });

            await Promise.all(dueReminders.map(async (reminder) => {
                try {
                    const isStale = (now.getTime() - reminder.schedule.getTime()) > this.STALE_THRESHOLD_MS;
                    
                    if (isStale && (!reminder.repeat || reminder.repeat === RepeatInterval.NONE)) {
                        logger.warn({ msg: 'Reminder dropped: STALE', title: reminder.title, id: reminder.id });
                        await this.reminderRepository.updateStatus(reminder.id, 'FAILED', now);
                        return;
                    }

                    if (!reminder.user.phoneNumber) {
                        logger.warn({ msg: 'Reminder dropped: No phone', user: reminder.user.username, id: reminder.id });
                        await this.reminderRepository.updateStatus(reminder.id, 'FAILED', now);
                        return;
                    }

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
