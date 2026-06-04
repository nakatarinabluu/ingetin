import { FinanceRepository } from './finance.repository';
import { GeminiService } from './gemini.service';
import { logger } from '@ingetin/logger';
import { TransactionType } from '@prisma/client';
import { Success, Result, Failure } from '../../core/result';
import { FinanceSummaryDTO } from '@ingetin/types';

const CATEGORY_COLORS: Record<string, string> = {
    FOOD: '#16a34a',
    TRANSPORT: '#2563eb',
    SHOPPING: '#db2777',
    BILLS: '#9333ea',
    ENTERTAINMENT: '#ea580c',
    HEALTH: '#dc2626',
    EDUCATION: '#0891b2',
    OTHERS: '#64748b'
};

export class FinanceService {
    constructor(
        private readonly repository: FinanceRepository,
        private readonly gemini: GeminiService
    ) {}

    /**
     * Process incoming WhatsApp messages for financial tracking using Gemini AI
     */
    async processWhatsAppMessage(userId: string, message: string): Promise<Result<string | null>> {
        try {
            // 1. Parse intent and data using Gemini
            const parsed = await this.gemini.parseFinanceMessage(message);

            if (parsed.intent === 'UNKNOWN') {
                return Success(null);
            }

            // 2. Execute business logic based on intent
            switch (parsed.intent) {
                case 'RECORD_EXPENSE': {
                    if (parsed.amount === undefined) return Failure('Amount is required for expenses');
                    
                    await this.repository.createTransaction(userId, {
                        type: TransactionType.EXPENSE,
                        amount: parsed.amount,
                        description: parsed.description || 'Pengeluaran via WhatsApp',
                        category: parsed.category || 'OTHERS'
                    });
                    
                    const summary = await this.getMonthlySummary(userId);
                    return Success(`✅ Berhasil mencatat pengeluaran: *${parsed.description || 'Tanpa deskripsi'}* sebesar *Rp ${parsed.amount.toLocaleString()}*.\n\nSisa budget bulan ini: *Rp ${summary.remainingBudget.toLocaleString()}*`);
                }

                case 'RECORD_INCOME': {
                    if (parsed.amount === undefined) return Failure('Amount is required for income');

                    await this.repository.createTransaction(userId, {
                        type: TransactionType.INCOME,
                        amount: parsed.amount,
                        description: parsed.description || 'Pemasukan via WhatsApp',
                        category: 'INCOME'
                    });
                    
                    return Success(`💰 Mantap! Pemasukan dicatat: *${parsed.description || 'Tanpa deskripsi'}* sebesar *Rp ${parsed.amount.toLocaleString()}*.`);
                }

                case 'UPDATE_LIMIT': {
                    if (parsed.monthlyLimit === undefined) return Failure('Limit amount is required');

                    await this.repository.updateProfile(userId, {
                        monthlyBudgetLimit: parsed.monthlyLimit
                    });
                    
                    return Success(`⚙️ Budget limit kamu bulan ini sudah di-set ke *Rp ${parsed.monthlyLimit.toLocaleString()}*.`);
                }

                case 'GET_SUMMARY': {
                    const summary = await this.getMonthlySummary(userId);
                    return Success(`📊 *Ringkasan Keuangan Bulan Ini*\n\n📈 Total Masuk: Rp ${summary.totalIncome.toLocaleString()}\n📉 Total Keluar: Rp ${summary.totalExpense.toLocaleString()}\n💰 Sisa Budget: Rp ${summary.remainingBudget.toLocaleString()}\n\nTetap semangat hemat ya!`);
                }

                default:
                    return Success(null);
            }
        } catch (error) {
            logger.error({ msg: 'Finance Service WhatsApp Processing Failed', userId, error: (error as Error).message });
            return Success('⚠️ Maaf, gagal memproses data keuangan kamu. Coba lagi nanti ya.');
        }
    }

    /**
     * Calculate monthly financial summary for a user
     */
    async getMonthlySummary(userId: string): Promise<FinanceSummaryDTO> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [transactions, profile] = await Promise.all([
            this.repository.findTransactionsSince(userId, startOfMonth),
            this.repository.getProfile(userId)
        ]);

        const income = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        const limit = profile?.monthlyBudgetLimit || 0;
        const remainingBudget = limit - expense;
        const balance = income - expense;
        const expensePercentage = limit > 0 ? Math.min((expense / limit) * 100, 100) : 0;
        const status = limit <= 0
            ? 'NO_BUDGET'
            : remainingBudget < 0
                ? 'OVER_BUDGET'
                : expensePercentage >= 80
                    ? 'WARNING'
                    : 'HEALTHY';

        const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
        const categories = Object.values(expenseTransactions.reduce<Record<string, { name: string; amount: number; color: string }>>((acc, transaction) => {
            const name = transaction.category || 'OTHERS';
            acc[name] ??= {
                name,
                amount: 0,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS.OTHERS
            };
            acc[name].amount += transaction.amount;
            return acc;
        }, {}));

        const dailyStats = Array.from({ length: now.getDate() }, (_, index) => {
            const day = index + 1;
            const amount = expenseTransactions
                .filter(t => t.date.getDate() === day)
                .reduce((sum, t) => sum + t.amount, 0);

            return { name: day.toString(), amount };
        });

        const weeklyBuckets = new Map<string, number>();
        for (const transaction of expenseTransactions) {
            const week = Math.ceil(transaction.date.getDate() / 7);
            const name = `Week ${week}`;
            weeklyBuckets.set(name, (weeklyBuckets.get(name) || 0) + transaction.amount);
        }

        const weeklyStats = Array.from({ length: 5 }, (_, index) => {
            const name = `Week ${index + 1}`;
            return { name, amount: weeklyBuckets.get(name) || 0 };
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            monthlyBudgetLimit: limit,
            remainingBudget,
            balance,
            expensePercentage,
            status,
            dailyStats,
            weeklyStats,
            monthlyStats: [{
                name: now.toLocaleString('en-US', { month: 'short' }),
                amount: expense
            }],
            categories,
            dailyEstimation: now.getDate() > 0 ? expense / now.getDate() : 0,
            subscriptions: [],
            debts: []
        };
    }
}
