import { useState } from 'react';
import { History, Download, Calendar, ChevronLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { TransactionHistory } from '@/features/manage-finance/ui/TransactionHistory';
import { FinanceCharts } from '@/features/manage-finance/ui/FinanceCharts';
import { useFinanceSummary, useFinanceHistory } from '@/entities/finance/model/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/tw.utils';
import { toast } from 'sonner';

import { formatIDR } from '@/shared/lib/format';

const MONTHS = [
    { id: '01', name: 'Jan' }, { id: '02', name: 'Feb' }, { id: '03', name: 'Mar' },
    { id: '04', name: 'Apr' }, { id: '05', name: 'Mei' }, { id: '06', name: 'Jun' },
    { id: '07', name: 'Jul' }, { id: '08', name: 'Agu' }, { id: '09', name: 'Sep' },
    { id: '10', name: 'Okt' }, { id: '11', name: 'Nov' }, { id: '12', name: 'Des' }
];

const MONTHS_FULL: Record<string, string> = {
    '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
    '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
};

const YEARS = ['2026', '2025', '2024'];

/**
 * UserHistory — Mobile-First, Selection-First UX
 * Optimized touch targets, abbreviated month names, compact header actions.
 */
export default function UserHistory() {
    const [page] = useState(1);
    const [activeTab, setActiveTab] = useState<'analytics' | 'log'>('analytics');

    const [selectedMonth, setSelectedMonth] = useState('04');
    const [selectedYear, setSelectedYear] = useState('2026');
    const [isReportVisible, setIsReportVisible] = useState(false);

    const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary();
    const { data: historyRes } = useFinanceHistory({ page, limit: 100, month: selectedMonth, year: selectedYear });

    const selectedMonthName = MONTHS_FULL[selectedMonth];
    const periodKey = `${selectedYear}-${selectedMonth}`;

    const periodTransactions = (historyRes?.items || []).filter((t) => (t.date || '').toString().startsWith(periodKey));
    const periodIncome = periodTransactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const periodExpense = periodTransactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const periodBalance = periodIncome - periodExpense;

    return (
        <div className="w-full space-y-4 pb-24 text-left">

            {/* ─── Header ─── */}
            <header className="flex items-center justify-between gap-3 pb-4 border-b border-wa-border">
                <div className="flex items-center gap-3 min-w-0">
                    {isReportVisible && (
                        <button
                            onClick={() => setIsReportVisible(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-wa-bg text-wa-icon transition-colors shrink-0"
                        >
                            <ChevronLeft size={22} />
                        </button>
                    )}
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-wa-green mb-1">
                            <History size={12} strokeWidth={2} />
                            Arsip Finansial
                        </div>
                        <h1 className="text-xl font-bold text-wa-dark truncate">
                            {isReportVisible ? `${selectedMonthName} ${selectedYear}` : 'Riwayat Keuangan'}
                        </h1>
                    </div>
                </div>

                {/* Report actions — compact on mobile */}
                {isReportVisible && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button 
                            onClick={() => toast.success('Mengunduh laporan...')}
                            className="w-10 h-10 rounded-xl border border-wa-border bg-white text-wa-icon flex items-center justify-center hover:bg-wa-bg transition-colors"
                        >
                            <Download size={16} strokeWidth={2} />
                        </button>
                        <button
                            onClick={() => setIsReportVisible(false)}
                            className="h-10 px-3 bg-wa-bg text-wa-dark text-xs font-semibold rounded-xl hover:bg-wa-border transition-colors whitespace-nowrap"
                        >
                            Ganti
                        </button>
                    </div>
                )}
            </header>

            <AnimatePresence mode="wait">
                {!isReportVisible ? (
                    /* ─── SELECTION SCREEN ─── */
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        <div className="bg-wa-bg/50 p-4 rounded-2xl border border-wa-border">
                            <h3 className="text-sm font-bold text-wa-dark mb-4 px-1">Pilih Periode Laporan</h3>
                            
                            {/* Year Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {YEARS.map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => setSelectedYear(y)}
                                        className={cn(
                                            "h-11 rounded-xl text-xs font-bold transition-all border",
                                            selectedYear === y 
                                                ? "bg-wa-dark text-white border-wa-dark shadow-sm" 
                                                : "bg-white text-wa-icon border-wa-border hover:bg-wa-bg"
                                        )}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>

                            {/* Month Grid */}
                            <div className="grid grid-cols-4 gap-2">
                                {MONTHS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMonth(m.id)}
                                        className={cn(
                                            "h-12 rounded-xl text-xs font-bold transition-all border",
                                            selectedMonth === m.id 
                                                ? "bg-wa-green text-white border-wa-green shadow-sm" 
                                                : "bg-white text-wa-icon border-wa-border hover:bg-wa-bg"
                                        )}
                                    >
                                        {m.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsReportVisible(true)}
                            className="w-full h-14 bg-wa-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-wa-dark/10 active:scale-95 transition-transform"
                        >
                            Tampilkan Analisis
                            <Calendar size={18} />
                        </button>
                    </motion.div>
                ) : (
                    /* ─── REPORT VIEW ─── */
                    <motion.div
                        key="report"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <PeriodStat label="Pemasukan" value={periodIncome} color="#00a884" icon={TrendingUp} />
                            <PeriodStat label="Pengeluaran" value={periodExpense} color="#ea0038" icon={TrendingDown} />
                            <PeriodStat label="Sisa Dana" value={periodBalance} color="#005c4b" icon={Wallet} />
                        </div>

                        {/* Analysis Tabs */}
                        <div className="flex bg-wa-bg p-1 rounded-xl border border-wa-border">
                            <TabBtn 
                                label="Grafik & Insight" 
                                active={activeTab === 'analytics'} 
                                onClick={() => setActiveTab('analytics')} 
                            />
                            <TabBtn 
                                label="Daftar Transaksi" 
                                active={activeTab === 'log'} 
                                onClick={() => setActiveTab('log')} 
                            />
                        </div>

                        <div className="min-h-[400px]">
                            {activeTab === 'analytics' ? (
                                <div className="space-y-5">
                                    <FinanceCharts data={summary} loading={isSummaryLoading} />
                                    <div className="p-5 bg-white border border-wa-border rounded-2xl shadow-wa">
                                        <h4 className="text-sm font-bold text-wa-dark mb-1">Catatan Auditor</h4>
                                        <p className="text-xs text-wa-icon leading-relaxed">
                                            Laporan periode ini menunjukkan {(periodIncome > periodExpense) ? 'surplus' : 'defisit'} kas sebesar Rp {formatIDR(Math.abs(periodBalance))}. 
                                            Data disinkronkan secara otomatis dari mutasi rekening dan pencatatan manual WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <TransactionHistory 
                                    transactions={periodTransactions.map((t) => ({
                                        id: t.id,
                                        title: t.title,
                                        amount: t.amount,
                                        type: t.type,
                                        category: t.category || 'Lainnya',
                                        date: t.date,
                                        status: 'SUCCESS'
                                    }))} 
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PeriodStat({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
    return (
        <Card className="p-4 border-wa-border shadow-wa flex flex-col gap-1">
            <div className="flex items-center gap-2 text-wa-icon mb-1">
                <Icon size={14} style={{ color }} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-lg font-black text-wa-dark tabular-nums">
                Rp {formatIDR(value)}
            </div>
        </Card>
    );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 h-10 text-[11px] font-bold uppercase tracking-widest transition-all rounded-lg",
                active ? "bg-white text-wa-dark shadow-sm border border-wa-border" : "text-wa-muted hover:text-wa-dark"
            )}
        >
            {label}
        </button>
    );
}
