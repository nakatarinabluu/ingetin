import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@ingetin/logger';
import crypto from 'crypto';
import { UserRepository } from './user.repository';
import { CalendarService } from '../reminders/calendar.service';
import { ReminderRepository } from '../reminders/reminder.repository';
import { NotFoundError } from '../../core/errors/AppError';
import { AuthRequest } from '../../middlewares/auth';

interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
}

interface IdParam {
    id: string;
}

export class UserController {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly calendarService: CalendarService,
        private readonly reminderRepository: ReminderRepository
    ) {}

    /**
     * Get current user profile
     */
    getProfile = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const user = await this.userRepository.findProfile(userId);
        
        if (!user) {
            throw new NotFoundError('Account not found');
        }
        return user;
    };

    /**
     * List all users (Admin only)
     */
    getAllUsers = async (req: AuthRequest, reply: FastifyReply) => {
        const query = req.query as PaginationQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        const search = query.search || '';

        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = { role: { not: 'ADMIN' } };
        
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            this.userRepository.findManyWithFilter(where, skip, take),
            this.userRepository.count(where)
        ]);

        return { 
            users, 
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    };

    /**
     * Delete a user account (Admin only)
     */
    deleteUser = async (req: AuthRequest, reply: FastifyReply) => {
        const params = req.params as IdParam;
        const { id } = params;
        
        const user = await this.userRepository.findById(id);
        if (user?.licenseId) {
            await this.userRepository.updateLicense(user.licenseId, { status: 'AVAILABLE', userId: null });
        }

        await this.userRepository.delete(id);
        return { message: 'User deleted successfully' };
    };

    /**
     * Wipe all reminder archives for a user (Admin only)
     */
    clearUserReminders = async (req: AuthRequest, reply: FastifyReply) => {
        const params = req.params as IdParam;
        await this.userRepository.clearAllReminders(params.id);
        return { message: 'All reminder archives cleared' };
    };

    // --- LICENSE POOL MANAGEMENT (Admin only) ---

    getAllLicenses = async (req: AuthRequest, reply: FastifyReply) => {
        const query = req.query as PaginationQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        const search = query.search || '';
        const status = query.status || '';

        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { key: { contains: search.toUpperCase() } },
                { targetName: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status && status !== 'ALL') {
            where.status = status;
        }

        const [licenses, total] = await Promise.all([
            this.userRepository.findAllLicenses(where, skip, take),
            this.userRepository.countLicenses(where)
        ]);

        return {
            licenses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    };

    generateLicense = async (req: AuthRequest, reply: FastifyReply) => {
        const body = req.body as { targetName?: string };
        const { targetName } = body;
        
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

        return { license };
    };

    pauseLicense = async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as IdParam;
        const license = await this.userRepository.findLicenseById(id);
        if (!license) throw new NotFoundError('License not found');

        await this.userRepository.updateLicense(id, { status: 'PAUSED' });
        return { message: 'License paused' };
    };

    unpauseLicense = async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as IdParam;
        const license = await this.userRepository.findLicenseById(id);
        if (!license) throw new NotFoundError('License not found');

        await this.userRepository.updateLicense(id, { status: 'USED' });
        return { message: 'License reactivated' };
    };

    revokeLicense = async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as IdParam;
        const license = await this.userRepository.findLicenseById(id);
        if (!license) throw new NotFoundError('License not found');

        await this.userRepository.revokeLicense(id);
        return { message: 'License permanently revoked' };
    };

    getUserReminders = async (req: AuthRequest, reply: FastifyReply) => {
        const { id: userId } = req.params as IdParam;
        const query = req.query as PaginationQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '15');

        const skipValue = (page - 1) * limit;
        const takeValue = limit;

        const [reminders, counts] = await Promise.all([
            this.reminderRepository.findRecentReminders(userId, skipValue, takeValue),
            this.userRepository.getUserStats(userId)
        ]);

        const remindersTotal = counts.scheduledCount + counts.sentCount + counts.deletedCount;

        return { 
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
        };
    };

    triggerDeepSync = async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as IdParam;
        const result = await this.calendarService.syncUserEventsHistorical(id);
        return { message: 'Update started', ...result };
    };

    getUserFullDetails = async (req: AuthRequest, reply: FastifyReply) => {
        const { id: identifier } = req.params as IdParam;
        const user = await this.userRepository.findFullDetails(identifier);

        if (!user) {
            throw new NotFoundError("We couldn't find that user");
        }
        return user;
    };
}
