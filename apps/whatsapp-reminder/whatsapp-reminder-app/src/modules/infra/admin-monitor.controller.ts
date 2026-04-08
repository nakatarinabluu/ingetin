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
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));

        // Measure DB Latency
        const start = Date.now();
        await this.prisma.$executeRaw`SELECT 1`;
        const dbLatency = Date.now() - start;

        const [
            totalUsers,
            newUsersToday,
            activeReminders,
            totalMessagesSent,
            totalMessagesReceived,
            messagesSentToday,
            recentErrors,
            totalCalendarSyncs,
            waitingJobs,
            verifiedConvs,
            unverifiedConvs
        ] = await Promise.all([
            this.prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
            this.prisma.user.count({ where: { role: { not: 'ADMIN' }, createdAt: { gte: startOfToday } } }),
            this.prisma.reminder.count({ where: { status: 'PENDING' } }),
            this.prisma.message.count({ where: { direction: 'OUTBOUND' } }),
            this.prisma.message.count({ where: { direction: 'INBOUND' } }),
            this.prisma.message.count({ where: { direction: 'OUTBOUND', timestamp: { gte: startOfToday } } }),
            // Only count errors from the last 24 hours for dashboard performance
            this.prisma.message.count({ 
                where: { 
                    status: 'FAILED', 
                    timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
                } 
            }),
            this.prisma.socialAccount.count({ where: { provider: 'GOOGLE', refreshToken: { not: null } } }),
            this.reminderQueue.getWaitingCount(),
            this.prisma.conversation.count({ where: { isRegistered: true } }),
            this.prisma.conversation.count({ where: { isRegistered: false } })
        ]);


        // Calculate Signal Balance (Inbound vs Outbound)
        const balanceRatio = totalMessagesSent > 0 ? (totalMessagesReceived / totalMessagesSent) : 1;
        let balanceStatus = 'OPTIMAL';
        if (balanceRatio < 0.2) balanceStatus = 'LOW_ENGAGEMENT';
        if (balanceRatio > 2) balanceStatus = 'HIGH_TRAFFIC';

        return {
            kpis: {
                users: {
                    total: totalUsers,
                    growth: newUsersToday
                },
                reminders: {
                    active: activeReminders,
                    queued: waitingJobs
                },
                messages: {
                    total: totalMessagesSent + totalMessagesReceived,
                    outbound: totalMessagesSent,
                    inbound: totalMessagesReceived,
                    reliability: totalMessagesSent > 0 
                        ? Math.round(((totalMessagesSent - recentErrors) / totalMessagesSent) * 100) 
                        : 100
                },
                integrations: {
                    calendarSyncs: totalCalendarSyncs
                },
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
        };
    }
}
