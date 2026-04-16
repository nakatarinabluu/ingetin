import { FinanceRepository } from './finance.repository';
import { GeminiService } from './gemini.service';
import { logger } from '@ingetin/logger';
import { TransactionType } from '@prisma/client';
import { Success, Result, Failure } from '../../core/result';
import { FinanceSummaryDTO } from '@ingetin/types';

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

        return {
            totalIncome: income,
            totalExpense: expense,
            monthlyBudgetLimit: limit,
            remainingBudget: limit - expense
        };
    }
}
