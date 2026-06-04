import { motion } from 'framer-motion';
import { TrendingUp, Check } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { FinanceCharts } from '../ui/FinanceCharts';
import { FinanceSummaryDTO } from '@ingetin/types';

interface AnalyticsTabProps {
    summary?: FinanceSummaryDTO;
    isLoading: boolean;
    budgetLimit: number;
}

export function AnalyticsTab({ summary, isLoading, budgetLimit }: AnalyticsTabProps) {
    return (
        <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <Card className="p-6 border-wa-border shadow-wa bg-white rounded-2xl border-l-4 border-l-wa-green text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-wa-green">
                            <TrendingUp size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ringkasan Bulan Ini</span>
                        </div>
                        <h3 className="text-lg font-bold text-wa-dark">Estimasi Pengeluaran Akhir Bulan</h3>
                        <p className="text-sm text-wa-icon max-w-md">
                            Berdasarkan tren 14 hari terakhir, estimasi pengeluaranmu hingga akhir bulan adalah{" "}
                            <span className="font-bold text-wa-dark">Rp 14.850.000</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-wa-bg p-4 rounded-xl shrink-0">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-wa-muted uppercase">Sisa Anggaran</p>
                            <p className="text-lg font-black text-wa-green">Rp 150.000</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-wa-green-light flex items-center justify-center text-wa-teal">
                            <Check size={20} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </Card>
            <FinanceCharts data={summary!} loading={isLoading} budgetLimit={budgetLimit} />
        </motion.div>
    );
}
