import React, { useState } from 'react';
import {
    Plus,
    Download,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Shield,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { TransactionHistory } from '../../components/features/finances/TransactionHistory';
import { FinanceCharts } from '../../components/features/finances/FinanceCharts';
import { AddTransactionModal } from '../../components/features/finances/AddTransactionModal';
import { useFinanceSummary, useFinanceHistory } from '../../hooks/useFinanceHooks';
import { FINANCE_COPY } from '../../constants/copy';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/tw.utils';

/**
 * UserFinances — WhatsApp Official Style
 */
export default function UserFinances() {
    const [page] = useState(1);
    const [activeTab, setActiveTab] = useState<'analytics' | 'log'>('analytics');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary();
    const { data: historyRes } = useFinanceHistory({ page, limit: 10 });

    return (
        <div className="w-full space-y-5 pb-24 text-left">

            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e9edef]">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#00a884] mb-2">
                        <Wallet size={13} strokeWidth={2} />
                        {FINANCE_COPY.header.badge}
                    </div>
                    <h1 className="text-2xl font-bold text-[#111b21]">Laporan Keuangan</h1>
                    <p className="text-sm text-[#54656f] mt-0.5">
                        {FINANCE_COPY.header.desc_addon}
                    </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <button className="h-10 px-4 rounded-xl border border-[#e9edef] bg-white text-[#54656f] text-sm font-medium hover:bg-[#f0f2f5] transition-colors inline-flex items-center gap-2">
                        <Download size={15} strokeWidth={2} />
                        <span className="hidden sm:inline">{FINANCE_COPY.header.btn_export}</span>
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-10 px-5 bg-[#00a884] text-white text-sm font-semibold rounded-xl hover:bg-[#008069] transition-colors inline-flex items-center gap-2"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        {FINANCE_COPY.header.btn_record}
                    </button>
                </div>
            </header>

            {/* ─── Metric Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                    title={FINANCE_COPY.metrics.income_title}
                    value={summary?.totalIncome || 0}
                    sub={FINANCE_COPY.metrics.income_sub}
                    icon={<ArrowUpRight size={18} strokeWidth={2} />}
                    loading={isSummaryLoading}
                    type="success"
                />
                <MetricCard
                    title={FINANCE_COPY.metrics.expense_title}
                    value={summary?.totalExpense || 0}
                    sub={FINANCE_COPY.metrics.expense_sub}
                    icon={<ArrowDownLeft size={18} strokeWidth={2} />}
                    loading={isSummaryLoading}
                    type="danger"
                />
                <MetricCard
                    title={FINANCE_COPY.metrics.balance_title}
                    value={summary?.balance || 0}
                    sub={FINANCE_COPY.metrics.balance_sub}
                    icon={<TrendingUp size={18} strokeWidth={2} />}
                    loading={isSummaryLoading}
                    type="primary"
                />
            </div>

            {/* ─── Tab navigation ─── */}
            <div className="flex items-center gap-1 bg-[#f0f2f5] p-1 rounded-xl w-fit border border-[#e9edef]">
                {(['analytics', 'log'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === tab
                                ? "bg-white text-[#111b21] shadow-wa border border-[#e9edef]"
                                : "text-[#54656f] hover:text-[#111b21]"
                        )}
                    >
                        {tab === 'analytics' ? FINANCE_COPY.tabs.analytics : FINANCE_COPY.tabs.log}
                    </button>
                ))}
            </div>

            {/* ─── Content ─── */}
            <AnimatePresence mode="wait">
                {activeTab === 'analytics' ? (
                    <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <FinanceCharts data={summary} loading={isSummaryLoading} />
                    </motion.div>
                ) : (
                    <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="rounded-2xl border-[#e9edef] shadow-wa bg-white overflow-hidden p-5 md:p-6 text-left">
                            <TransactionHistory transactions={historyRes?.items || []} />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 pt-2">
                <Shield size={13} className="text-[#00a884]" strokeWidth={2} />
                <span className="text-xs text-[#667781]">{FINANCE_COPY.history.footer_secured}</span>
            </div>

            <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
}

function MetricCard({ title, value, sub, icon, loading, type }: {
    title: string;
    value: number;
    sub: string;
    icon: React.ReactNode;
    loading: boolean;
    type: 'success' | 'danger' | 'primary';
}) {
    const colorMap = {
        success: { text: 'text-[#00a884]', bg: 'bg-[#00a884]/8' },
        danger: { text: 'text-red-500', bg: 'bg-red-50' },
        primary: { text: 'text-[#128C7E]', bg: 'bg-[#128C7E]/8' },
    };
    const colors = colorMap[type];

    return (
        <Card className="p-5 border-[#e9edef] shadow-wa bg-white rounded-2xl text-left">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#54656f]">{title}</span>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg, colors.text)}>
                    {icon}
                </div>
            </div>
            <div>
                {loading ? (
                    <div className="h-8 w-32 bg-[#f0f2f5] animate-pulse rounded-lg mb-1" />
                ) : (
                    <div className="text-2xl font-bold text-[#111b21] tabular-nums">
                        Rp {value.toLocaleString('id-ID')}
                    </div>
                )}
                <p className={cn("text-xs font-medium mt-1", colors.text)}>{sub}</p>
            </div>
        </Card>
    );
}
