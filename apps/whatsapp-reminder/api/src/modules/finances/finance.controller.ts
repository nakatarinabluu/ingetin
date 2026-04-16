import { FastifyReply } from 'fastify';
import { FinanceService } from './finance.service';
import { FinanceRepository } from './finance.repository';
import { AuthRequest } from '../../middlewares/auth';
import { logger } from '@ingetin/logger';

export class FinanceController {
    constructor(
        private readonly financeService: FinanceService,
        private readonly repository: FinanceRepository
    ) {}

    /**
     * Get monthly financial summary for the dashboard
     */
    getSummary = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const summary = await this.financeService.getMonthlySummary(userId);
        return reply.send({ success: true, data: summary });
    };

    /**
     * Update user's financial profile (Limit & Salary)
     */
    updateProfile = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const body = req.body as { monthlyBudgetLimit?: number; baseSalary?: number };
        
        const profile = await this.repository.updateProfile(userId, body);
        return reply.send({ success: true, data: profile });
    };

    /**
     * List recent transactions
     */
    getTransactions = async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user!.id;
        const summary = await this.financeService.getMonthlySummary(userId);
        return reply.send({ success: true, data: summary });
    };
}
