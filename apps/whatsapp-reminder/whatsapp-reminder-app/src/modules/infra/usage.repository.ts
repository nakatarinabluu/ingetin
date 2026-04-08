import { PrismaClient, UsageType } from '@prisma/client';

export class UsageRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async createLog(data: { userId: string, type: UsageType, target: string, status: string, cost: number }) {
        return this.prisma.usageLog.create({ data });
    }

    async findLogsByUser(userId: string, limit: number = 100) {
        return this.prisma.usageLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    async countGroupedByUser(userId: string) {
        return this.prisma.usageLog.groupBy({
            by: ['type'],
            where: { userId },
            _count: true
        });
    }

    async getGlobalStats() {
        return this.prisma.usageLog.groupBy({
            by: ['type'],
            _count: true,
            _sum: {
                cost: true
            }
        });
    }
}
