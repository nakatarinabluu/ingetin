import { PrismaClient, TransactionType } from '@prisma/client';

export class FinanceRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async createTransaction(userId: string, data: {
        type: TransactionType;
        amount: number;
        description?: string;
        category?: string;
    }) {
        return this.prisma.transaction.create({
            data: {
                userId,
                type: data.type,
                amount: data.amount,
                description: data.description,
                category: data.category || 'OTHERS'
            }
        });
    }

    async updateProfile(userId: string, data: {
        monthlyBudgetLimit?: number;
        baseSalary?: number;
    }) {
        return this.prisma.financialProfile.upsert({
            where: { userId },
            create: {
                userId,
                monthlyBudgetLimit: data.monthlyBudgetLimit || 0,
                baseSalary: data.baseSalary || 0
            },
            update: {
                monthlyBudgetLimit: data.monthlyBudgetLimit,
                baseSalary: data.baseSalary
            }
        });
    }

    async getProfile(userId: string) {
        return this.prisma.financialProfile.findUnique({
            where: { userId }
        });
    }

    async findTransactionsSince(userId: string, date: Date) {
        return this.prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: date }
            }
        });
    }
}
