import { PrismaClient, Prisma, Reminder, ReminderStatus, RepeatInterval, User } from '@prisma/client';
import { RedisService } from '../infra/redis.service';

export class ReminderRepository {
    constructor(
        public readonly prismaDb: PrismaClient,
        private readonly redisService: RedisService
    ) {}

    async findById(id: string): Promise<Reminder | null> {
        return await this.prismaDb.reminder.findFirst({ 
            where: { id, deletedAt: null } 
        });
    }

    async findAll(params?: { 
        skip?: number; 
        take?: number; 
        where?: Prisma.ReminderWhereInput; 
        orderBy?: Prisma.ReminderOrderByWithRelationInput;
    }): Promise<Reminder[]> {
        const where = { ...params?.where, deletedAt: null };
        return await this.prismaDb.reminder.findMany({ ...params, where });
    }

    async count(where?: Prisma.ReminderWhereInput): Promise<number> {
        return await this.prismaDb.reminder.count({ 
            where: { ...where, deletedAt: null } 
        });
    }

    async create(data: Prisma.ReminderUncheckedCreateInput): Promise<Reminder> {
        return await this.prismaDb.reminder.create({ data });
    }

    async update(id: string, data: Prisma.ReminderUncheckedUpdateInput): Promise<Reminder> {
        return await this.prismaDb.reminder.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<Reminder> {
        // Strict Soft Delete implementation
        return await this.prismaDb.reminder.update({
            where: { id },
            data: { 
                deletedAt: new Date(),
                status: ReminderStatus.CANCELLED
            }
        });
    }

    async findDueReminders(now: Date, maxAttempts: number): Promise<Array<Reminder & { user: User }>> {
        return await this.prismaDb.reminder.findMany({
            where: {
                status: ReminderStatus.PENDING,
                schedule: { lte: now },
                attempts: { lt: maxAttempts },
                deletedAt: null, // Critical: don't process deleted reminders
                user: {
                    OR: [
                        { role: 'ADMIN' },
                        { license: { status: 'USED' } }
                    ]
                }
            },
            take: 100, // Prevention of OOM on 2GB VPS
            include: { user: true }
        });
    }

    async updateStatus(id: string, status: ReminderStatus, sentAt?: Date): Promise<void> {
        await this.prismaDb.reminder.update({
            where: { id },
            data: { 
                status,
                sentAt: sentAt ?? null,
                ...(status === ReminderStatus.CANCELLED ? { deletedAt: new Date() } : {})
            }
        });
    }

    async handleRecurring(reminder: Reminder, nextSchedule: Date, sentAt: Date): Promise<void> {
        await this.prismaDb.$transaction([
            // Create a record for the completed occurrence
            this.prismaDb.reminder.create({
                data: {
                    title: reminder.title,
                    message: reminder.message,
                    schedule: reminder.schedule,
                    status: ReminderStatus.SENT,
                    repeat: RepeatInterval.NONE,
                    externalId: reminder.externalId,
                    userId: reminder.userId,
                    sentAt
                }
            }),
            // Update the existing reminder to the next schedule
            this.prismaDb.reminder.update({
                where: { id: reminder.id },
                data: { 
                    schedule: nextSchedule, 
                    status: ReminderStatus.PENDING, 
                    attempts: 0 
                }
            })
        ]);
    }

    async findRecentReminders(userId: string, skip: number, take: number) {
        return await this.prismaDb.reminder.findMany({
            where: { userId, deletedAt: null },
            orderBy: { schedule: 'desc' },
            skip,
            take
        });
    }

    async findUserReminders(userId: string, skip: number, take: number) {
        return await this.prismaDb.reminder.findMany({
            where: { 
                userId,
                deletedAt: null
            },
            orderBy: { schedule: 'asc' },
            skip,
            take
        });
    }

    async countUserReminders(userId: string) {
        return await this.prismaDb.reminder.count({
            where: { 
                userId,
                deletedAt: null
            }
        });
    }

    async findStaleReminders(minutes: number) {
        const threshold = new Date();
        threshold.setMinutes(threshold.getMinutes() - minutes);

        return await this.prismaDb.reminder.findMany({
            where: {
                status: { in: [ReminderStatus.PENDING, ReminderStatus.QUEUED] },
                schedule: { lt: threshold },
                deletedAt: null
            },
            take: 100 
        });
    }

    async purgeReminder(id: string): Promise<void> {
        // Still use soft delete for consistency unless hard purge is explicitly required
        await this.prismaDb.reminder.updateMany({ 
            where: { id },
            data: { deletedAt: new Date(), status: ReminderStatus.CANCELLED }
        });
    }

    /**
     * Data Retention: Purge old logs to prevent database bloating
     */
    async purgeOldLogs(daysToKeep: number = 30): Promise<{ usagePurged: number }> {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - daysToKeep);

        const [usage] = await this.prismaDb.$transaction([
            this.prismaDb.usageLog.deleteMany({
                where: { createdAt: { lt: threshold } }
            })
        ]);

        return {
            usagePurged: usage.count
        };
    }
}
