import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { logger } from '@ingetin/logger';

export class AdminMonitorController {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly reminderQueue: Queue
    ) {}

    getDashboardStats = async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const now = new Date();
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));

            // Measure DB Latency safely - Use $queryRaw for modern Prisma compatibility
            const start = Date.now();
            await this.prisma.$queryRaw`SELECT 1`.catch(() => null);
            const dbLatency = Date.now() - start;

            // Use separate try-catch blocks or Promise.allSettled if you want total safety,
            // but here we'll use Promise.all for speed.
            const [
                totalUsers,
                newUsersToday,
                activeReminders,
                totalMessagesSent,
                totalMessagesReceived,
                messagesSentToday,
                recentErrors,
                totalCalendarSyncs,
                verifiedConvs,
                unverifiedConvs
            ] = await Promise.all([
                this.prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
                this.prisma.user.count({ where: { role: { not: 'ADMIN' }, createdAt: { gte: startOfToday } } }),
                this.prisma.reminder.count({ where: { status: 'PENDING' } }),
                this.prisma.message.count({ where: { direction: 'OUTBOUND' } }),
                this.prisma.message.count({ where: { direction: 'INBOUND' } }),
                this.prisma.message.count({ where: { direction: 'OUTBOUND', timestamp: { gte: startOfToday } } }),
                this.prisma.message.count({ 
                    where: { 
                        status: 'FAILED', 
                        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
                    } 
                }),
                this.prisma.socialAccount.count({ where: { provider: 'GOOGLE', refreshToken: { not: null } } }),
                this.prisma.conversation.count({ where: { isRegistered: true } }),
                this.prisma.conversation.count({ where: { isRegistered: false } })
            ]);

            logger.info({ 
                msg: 'DEBUG: Dashboard Stats Fetched', 
                totalUsers, 
                activeReminders, 
                totalMessagesSent 
            });

            // BullMQ queue count can sometimes be tricky
            let waitingJobs = 0;
            try {
                waitingJobs = await this.reminderQueue.getWaitingCount();
            } catch (e) {
                logger.warn('Could not fetch queue count');
            }

            const balanceRatio = totalMessagesSent > 0 ? (totalMessagesReceived / totalMessagesSent) : 1;
            let balanceStatus = 'OPTIMAL';
            if (balanceRatio < 0.2) balanceStatus = 'LOW_ENGAGEMENT';
            if (balanceRatio > 2) balanceStatus = 'HIGH_TRAFFIC';

            return reply.send({
                success: true,
                data: {
                    kpis: {
                        users: { total: totalUsers, growth: newUsersToday },
                        reminders: { active: activeReminders, queued: waitingJobs },
                        messages: {
                            total: totalMessagesSent + totalMessagesReceived,
                            outbound: totalMessagesSent,
                            inbound: totalMessagesReceived,
                            reliability: totalMessagesSent > 0 
                                ? Math.round(((totalMessagesSent - recentErrors) / totalMessagesSent) * 100) 
                                : 100
                        },
                        integrations: { calendarSyncs: totalCalendarSyncs },
                        signals: {
                            balance: balanceStatus,
                            latency: dbLatency,
                            verified: verifiedConvs,
                            unverified: unverifiedConvs
                        }
                    },
                    system: {
                        nodeStatus: 'STABLE',
                        uptime: process.uptime(),
                        memoryUsage: process.memoryUsage().rss,
                        protocol: req.protocol.toUpperCase()
                    }
                }
            });
        } catch (error) {
            logger.error({ msg: 'Dashboard Stats Error', error: (error as Error).message });
            return reply.status(500).send({ 
                success: false, 
                error: 'Failed to load dashboard stats',
                details: (error as Error).message
            });
        }
    }
}
