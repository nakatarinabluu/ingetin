import { FastifyReply } from 'fastify';
import { CalendarService } from '../reminders/calendar.service';
import { ReminderRepository } from '../reminders/reminder.repository';
import { logger } from '@ingetin/logger';
import { AuthRequest } from '../../middlewares/auth';
import { ReminderInput } from '@ingetin/types';
import { eventBus } from '../infra/event-emitter.service';
import { DomainEvent } from '../../core/events';

interface PaginationQuery {
    page?: string;
    limit?: string;
}

export class ReminderController {
    constructor(
        private readonly reminderRepository: ReminderRepository,
        private readonly calendarService: CalendarService
    ) {}

    /**
     * Get paginated list of reminders for the current user
     */
    getReminders = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const query = req.query as PaginationQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const skip = (page - 1) * limit;

        const [reminders, total] = await Promise.all([
            this.reminderRepository.findUserReminders(userId, skip, limit),
            this.reminderRepository.countUserReminders(userId)
        ]);

        return reply.send({
            success: true,
            data: {
                items: reminders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    };

    /**
     * Create a new manual reminder
     */
    createReminder = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const validatedData = req.body as ReminderInput;

        const reminder = await this.reminderRepository.create({
            userId,
            title: validatedData.title,
            message: validatedData.message,
            schedule: new Date(validatedData.schedule),
            repeat: validatedData.repeat || 'NONE',
            daysOfWeek: validatedData.daysOfWeek || []
        });

        eventBus.emitDomainEvent(DomainEvent.REMINDER_CREATED, { 
            reminderId: reminder.id, 
            userId 
        });

        return reply.send({ success: true, data: reminder });
    };

    /**
     * Delete a reminder (soft delete/purge logic)
     */
    deleteReminder = async (req: AuthRequest, reply: FastifyReply) => {
        const params = req.params as { id: string };
        const { id } = params;
        await this.reminderRepository.purgeReminder(id);
        return reply.send({ success: true, data: { message: 'Reminder deleted' } });
    };

    /**
     * Manually trigger a Google Calendar sync
     */
    syncReminders = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        logger.info({ msg: 'Manual sync request received', userId });
        await this.calendarService.syncUserEvents(userId);
        return reply.send({ success: true, data: { message: 'Sync started' } });
    };
}
