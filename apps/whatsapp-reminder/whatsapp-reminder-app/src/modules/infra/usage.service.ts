import { logger } from '@ingetin/logger';
import { UsageType } from '@prisma/client';
import { UsageRepository } from './usage.repository';
export { UsageType };

interface UsageTypeCount {
    type: string;
    _count: number;
}

export class UsageService {
    constructor(private readonly repository: UsageRepository) {}

    /**
     * Log a usage event for billing and transparency
     */
    async logUsage(userId: string, type: UsageType, target: string, status: string = 'SUCCESS', cost: number = 0) {
        try {
            await this.repository.createLog({
                userId,
                type,
                target,
                status,
                cost
            });
        } catch (error: any) {
            logger.error({ msg: 'Failed to log usage', userId, type, error: ((error as Error).message) });
        }
    }

    /**
     * Get usage stats for a user
     */
    async getUserStats(userId: string) {
        const [logs, counts] = await Promise.all([
            this.repository.findLogsByUser(userId),
            this.repository.countGroupedByUser(userId) as Promise<UsageTypeCount[]>
        ]);

        return {
            logs,
            summary: counts.reduce((acc: Record<string, number>, curr) => {
                acc[curr.type] = curr._count;
                return acc;
            }, {})
        };
    }

    /**
     * Get global usage stats (Admin)
     */
    async getGlobalStats() {
        return await this.repository.getGlobalStats();
    }
}
