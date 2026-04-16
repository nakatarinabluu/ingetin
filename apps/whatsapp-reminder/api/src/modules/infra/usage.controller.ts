import { FastifyRequest, FastifyReply } from 'fastify';
import { UsageService } from './usage.service';
import { logger } from '@ingetin/logger';
import { AuthRequest } from '../../middlewares/auth';

export class UsageController {
    constructor(private readonly usageService: UsageService) {}

    /**
     * Get individual usage stats
     */
    getMyUsage = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const stats = await this.usageService.getUserStats(userId);
        return { stats };
    };

    getGlobalUsage = async (req: FastifyRequest, reply: FastifyReply) => {
        const stats = await this.usageService.getGlobalStats();
        return { stats };
    };
}
