import { FastifyReply, FastifyRequest, RouteHandler, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifySchema, RouteGenericInterface } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { Prisma } from '@prisma/client';
import { CalendarService } from '../reminders/calendar.service';
import { ReminderRepository } from '../reminders/reminder.repository';
import { UserRepository } from './user.repository';
import { logger } from '@ingetin/logger';
import { NotFoundError, BadRequestError } from '../../core/errors/AppError';
import { UserService } from './user.service';
import crypto from 'crypto';

interface PaginationQuery extends RouteGenericInterface {
    Querystring: {
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
    };
}

interface IdParam extends RouteGenericInterface {
    Params: {
        id: string;
    };
}

interface UserRemindersRequest extends RouteGenericInterface {
    Params: { id: string };
    Querystring: {
        page?: string;
        limit?: string;
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

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userRepository: UserRepository,
        private readonly calendarService: CalendarService,
        private readonly reminderRepository: ReminderRepository
    ) {}

    /**
     * Get current user profile
     */
    getProfile: TypedHandler = async (req, reply) => {
        const userId = req.user!.id;
        const user = await this.userRepository.findProfile(userId);
        
        if (!user) {
            throw new NotFoundError('Account not found');
        }
        return reply.send({ success: true, data: user });
    };

    /**
     * List all users (Admin only)
     */
    getAllUsers: TypedHandler<PaginationQuery> = async (req, reply) => {
        try {
            const { page: pageStr, limit: limitStr, search = '' } = req.query;
            const page = parseInt(pageStr || '1');
            const limit = parseInt(limitStr || '50');

            const skip = (page - 1) * limit;
            const take = limit;

            const where: Prisma.UserWhereInput = { role: { not: 'ADMIN' } };
            
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [users, total] = await Promise.all([
                this.userRepository.findManyWithFilter(where, skip, take),
                this.userRepository.count(where)
            ]);

            return reply.send({ 
                success: true,
                data: {
                    items: users, 
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (err) {
            logger.error({ msg: 'GetAllUsers Error', error: (err as Error).message });
            return reply.status(500).send({ success: false, error: 'Internal Server Error' });
        }
    };

    /**
     * Delete a user account (Admin only)
     */
    deleteUser: TypedHandler<IdParam> = async (req, reply) => {
        const { id } = req.params;

        if (id === req.user!.id) {
            throw new BadRequestError('Cannot delete your own admin account');
        }
        
        const user = await this.userRepository.findById(id);
        if (user?.licenseId) {
            await this.userRepository.updateLicense(user.licenseId, { status: 'AVAILABLE', userId: null });
        }

        await this.userRepository.delete(id);
        return reply.send({ success: true, data: { message: 'User deleted successfully' } });
    };

    /**
     * Wipe all reminder archives for a user (Admin only)
     */
    clearUserReminders: TypedHandler<IdParam> = async (req, reply) => {
        await this.userRepository.clearAllReminders(req.params.id);
        return reply.send({ success: true, data: { message: 'All reminder archives cleared' } });
    };

    // --- LICENSE POOL MANAGEMENT (Admin only) ---

    getAllLicenses: TypedHandler<PaginationQuery> = async (req, reply) => {
        try {
            const { page: pageStr, limit: limitStr, search = '', status = '' } = req.query;
            const page = parseInt(pageStr || '1');
            const limit = parseInt(limitStr || '50');

            const skip = (page - 1) * limit;
            const take = limit;

            const where: Prisma.LicenseWhereInput = {};
            if (search) {
                where.OR = [
                    { key: { contains: search.toUpperCase() } },
                    { targetName: { contains: search, mode: 'insensitive' } }
                ];
            }

            if (status && status !== 'ALL') {
                where.status = status as Prisma.EnumLicenseStatusFilter<'License'> | undefined;
            }

            const [licenses, total] = await Promise.all([
                this.userRepository.findAllLicenses(where, skip, take),
                this.userRepository.countLicenses(where)
            ]);

            return reply.send({
                success: true,
                data: {
                    items: licenses,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (err) {
            logger.error({ msg: 'GetAllLicenses Error', error: (err as Error).message });
            return reply.status(500).send({ success: false, error: 'Internal Server Error' });
        }
    };

    generateLicense: TypedHandler<{ Body: { targetName?: string } }> = async (req, reply) => {
        const { targetName } = req.body;
        
        const key = [
            crypto.randomBytes(4).toString('hex').toUpperCase(),
            crypto.randomBytes(4).toString('hex').toUpperCase(),
            crypto.randomBytes(4).toString('hex').toUpperCase()
        ].join('-');

        const license = await this.userRepository.createLicense({ 
            key, 
            targetName: targetName || 'Bulk Generation', 
            status: 'AVAILABLE' 
        });

        return reply.send({ success: true, data: { license } });
    };

    pauseLicense: TypedHandler<IdParam> = async (req, reply) => {
        const { id } = req.params;
        const license = await this.userRepository.findLicenseById(id);
        if (!license) throw new NotFoundError('License not found');

        await this.userRepository.updateLicense(id, { status: 'PAUSED' });
        return reply.send({ success: true, data: { message: 'License paused' } });
    };

    unpauseLicense: TypedHandler<IdParam> = async (req, reply) => {
        const { id } = req.params;
        const license = await this.userRepository.findLicenseById(id);
        if (!license) throw new NotFoundError('License not found');

        await this.userRepository.updateLicense(id, { status: 'USED' });
        return reply.send({ success: true, data: { message: 'License reactivated' } });
    };

    revokeLicense: TypedHandler<IdParam> = async (req, reply) => {
        const { id } = req.params;
        const license = await this.userRepository.findLicenseById(id);
        if (!license) throw new NotFoundError('License not found');

        await this.userRepository.revokeLicense(id);
        return reply.send({ success: true, data: { message: 'License permanently revoked' } });
    };

    getUserReminders: TypedHandler<UserRemindersRequest> = async (req, reply) => {
        const { id: userId } = req.params;
        const { page: pageStr, limit: limitStr } = req.query;
        const page = parseInt(pageStr || '1');
        const limit = parseInt(limitStr || '15');

        const skipValue = (page - 1) * limit;
        const takeValue = limit;

        const [reminders, counts] = await Promise.all([
            this.reminderRepository.findRecentReminders(userId, skipValue, takeValue),
            this.userRepository.getUserStats(userId)
        ]);

        const remindersTotal = counts.scheduledCount + counts.sentCount + counts.deletedCount;

        return reply.send({ 
            success: true,
            data: {
                reminders,
                stats: {
                    remindersTotal,
                    messagesTotal: counts.messagesCount,
                    combinedTotal: remindersTotal + counts.messagesCount
                },
                pagination: {
                    total: remindersTotal,
                    page,
                    limit,
                    totalPages: Math.ceil(remindersTotal / limit)
                }
            }
        });
    };

    triggerDeepSync: TypedHandler<IdParam> = async (req, reply) => {
        const { id } = req.params;
        const result = await this.calendarService.syncUserEventsHistorical(id);
        return reply.send({ success: true, data: { message: 'Update started', ...result } });
    };

    getUserFullDetails: TypedHandler<IdParam> = async (req, reply) => {
        const { id: identifier } = req.params;
        const user = await this.userRepository.findFullDetails(identifier);

        if (!user) {
            throw new NotFoundError("We couldn't find that user");
        }
        return reply.send({ success: true, data: user });
    };
}
