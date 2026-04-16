import { FastifyReply, FastifyRequest, RouteHandler, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifySchema, RouteGenericInterface } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { CalendarService } from '../reminders/calendar.service';
import { ReminderRepository } from '../reminders/reminder.repository';
import { ReminderService } from '../reminders/reminder.service';
import { logger } from '@ingetin/logger';
import { ReminderInput } from '@ingetin/types';
import { RepeatInterval } from '@prisma/client';

interface PaginationQuery extends RouteGenericInterface {
    Querystring: {
        page?: string;
        limit?: string;
    };
}

interface IdParam extends RouteGenericInterface {
    Params: {
        id: string;
    };
}

type TypedHandler<T extends RouteGenericInterface = RouteGenericInterface> = RouteHandler<
    T, 
    RawServerDefault, 
    RawRequestDefaultExpression, 
    RawReplyDefaultExpression, 
    any, 
    FastifySchema, 
    ZodTypeProvider
>;

export class ReminderController {
    constructor(
        private readonly reminderRepository: ReminderRepository,
        private readonly reminderService: ReminderService,
        private readonly calendarService: CalendarService
    ) {}

    /**
     * Get paginated list of reminders for the current user
     */
    getReminders: TypedHandler<PaginationQuery> = async (req, reply) => {
        const userId = req.user!.id;
        const { page: pageStr, limit: limitStr } = req.query;
        const page = parseInt(pageStr || '1');
        const limit = parseInt(limitStr || '10');
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
    createReminder: TypedHandler<{ Body: ReminderInput }> = async (req, reply) => {
        const userId = req.user!.id;
        const { title, message, schedule, repeat, daysOfWeek } = req.body;

        const result = await this.reminderService.createReminder({
            userId,
            title,
            message,
            schedule: new Date(schedule),
            repeat: repeat as RepeatInterval || RepeatInterval.NONE,
            daysOfWeek: daysOfWeek || []
        });

        if (!result.success) return reply.status(400).send(result);
        return reply.send({ success: true, data: result.data });
    };

    /**
     * Delete a reminder (soft delete/purge logic)
     */
    deleteReminder: TypedHandler<IdParam> = async (req, reply) => {
        const { id } = req.params;
        const result = await this.reminderService.deleteReminder(id);
        
        if (!result.success) return reply.status(400).send(result);
        return reply.send({ success: true, data: { message: 'Reminder deleted' } });
    };

    /**
     * Manually trigger a Google Calendar sync
     */
    syncReminders: TypedHandler = async (req, reply) => {
        const userId = req.user!.id;
        logger.info({ msg: 'Manual sync request received', userId });
        await this.calendarService.syncUserEvents(userId);
        return reply.send({ success: true, data: { message: 'Sync started' } });
    };
}
