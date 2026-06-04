import { useState } from 'react';
import {
    Plus,
    Download,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Shield,
    Target,
    Edit2
} from 'lucide-react';
import { MetricCard } from '@/features/manage-finance/ui/FinanceMetrics';
import { AddTransactionModal } from '@/features/manage-finance/ui/AddTransactionModal';
import { EditBudgetModal } from '@/features/manage-finance/ui/EditBudgetModal';
import { AddSubscriptionModal } from '@/features/manage-finance/ui/AddSubscriptionModal';
import { AddDebtModal } from '@/features/manage-finance/ui/AddDebtModal';
import { useFinanceSummary, useFinanceHistory } from '@/entities/finance/model/hooks';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/tw.utils';
import { toast } from 'sonner';

// Tab Components
import { AnalyticsTab } from '@/features/manage-finance/tabs/AnalyticsTab';
import { TransactionsTab } from '@/features/manage-finance/tabs/TransactionsTab';
import { BudgetTab } from '@/features/manage-finance/tabs/BudgetTab';
import { SubscriptionsTab } from '@/features/manage-finance/tabs/SubscriptionsTab';
import { DebtsTab } from '@/features/manage-finance/tabs/DebtsTab';

import { formatIDR } from '@/shared/lib/format';

/**
 * UserFinances — WhatsApp Official Style (Refactored v2.1)
 * Fixes: [Q-02] dead JSX removed, [Q-06] fake export replaced with honest info toast.
 */
export default function UserFinances() {
    const [page] = useState(1);
    const [activeTab, setActiveTab] = useState<'analytics' | 'log' | 'budget' | 'subscriptions' | 'debts'>('analytics');
    const [localBudgetLimit, setLocalBudgetLimit] = useState<number | null>(null);

    // Modals State
    const [isAddTxOpen, setIsAddTxOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isAddSubOpen, setIsAddSubOpen] = useState(false);
    const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);

    const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary();
    const { data: historyRes } = useFinanceHistory({ page, limit: 10 });

    const budgetLimit = localBudgetLimit ?? summary?.monthlyBudgetLimit ?? 15000000;

    // These types are managed locally by the tab components.
    // Cast is safe here; proper @ingetin/types sync is tracked separately.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = (summary?.categories || []) as unknown as any[];
    // NOTE: subscriptions/debts pending addition to @ingetin/types FinanceSummaryDTO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptions = ((summary as unknown as Record<string, unknown[]>)?.subscriptions || []) as unknown as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debts = ((summary as unknown as Record<string, unknown[]>)?.debts || []) as unknown as any[];

    // Fix [Q-06]: was a fake toast that claimed success with no real download
    const handleExport = () => {
        toast.info('Fitur Segera Hadir', {
            description: 'Ekspor laporan finansial sedang dalam pengembangan.',
        });
    };

    return (
        <div className="w-full space-y-5 pb-24 text-left">

            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wa-border">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                        <Wallet size={13} strokeWidth={2} />
                        Asisten Finansial Cerdas
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">Keuangan &amp; Tagihan</h1>
                    <p className="text-sm text-wa-icon mt-0.5">Pantau saldo riil, atur tagihan rutin, dan kelola piutang kamu.</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={handleExport}
                        className="h-10 px-4 rounded-xl border border-wa-border bg-white text-wa-icon text-sm font-medium hover:bg-wa-bg transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                        <Download size={15} strokeWidth={2} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => setIsAddTxOpen(true)}
                        className="h-10 px-5 bg-wa-green text-white text-sm font-semibold rounded-xl hover:bg-wa-green-dark transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Catat Transaksi
                    </button>
                </div>
            </header>

            {/* ─── Metric Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isSummaryLoading ? (
                    <>
                        <div className="h-32 bg-secondary/50 animate-pulse border border-border/60 rounded-2xl" />
                        <div className="h-32 bg-secondary/50 animate-pulse border border-border/60 rounded-2xl" />
                        <div className="h-32 bg-secondary/50 animate-pulse border border-border/60 rounded-2xl" />
                    </>
                ) : (
                    <>
                        <MetricCard title="Pemasukan" value={`Rp ${formatIDR(summary?.totalIncome)}`} subValue="Bulan ini" icon={<ArrowUpRight size={18} />} type="success" />
                        <MetricCard title="Pengeluaran" value={`Rp ${formatIDR(summary?.totalExpense)}`} subValue="Bulan ini" icon={<ArrowDownLeft size={18} />} type="danger" />
                        <MetricCard title="Sisa Saldo" value={`Rp ${formatIDR(summary?.balance)}`} subValue="Uang riil saat ini" icon={<TrendingUp size={18} />} type="primary" />
                    </>
                )}
                <button
                    onClick={() => { setActiveTab('budget'); setIsBudgetModalOpen(true); }}
                    className="p-5 border border-wa-border shadow-wa bg-white rounded-2xl flex flex-col justify-between hover:bg-[#fcfcfc] transition-all text-left group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-wa-icon">Batas Anggaran</span>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 text-orange-500 group-hover:scale-110 transition-transform">
                            <Target size={18} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <div className="text-xl font-black text-wa-dark">Rp {formatIDR(budgetLimit)}</div>
                        <div className="w-7 h-7 flex items-center justify-center text-wa-icon group-hover:text-wa-green bg-wa-bg rounded-lg transition-all">
                            <Edit2 size={12} />
                        </div>
                    </div>
                </button>
            </div>

            {/* ─── Tab navigation ─── */}
            <div className="flex items-center gap-1 bg-wa-bg p-1 rounded-xl w-fit border border-wa-border overflow-x-auto no-scrollbar max-w-full">
                {[
                    { id: 'analytics', label: 'Statistik' },
                    { id: 'log', label: 'Transaksi' },
                    { id: 'budget', label: 'Batas Budget' },
                    { id: 'subscriptions', label: 'Tagihan Rutin' },
                    { id: 'debts', label: 'Hutang Piutang' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'analytics' | 'log' | 'budget' | 'subscriptions' | 'debts')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                            activeTab === tab.id ? "bg-white text-wa-dark shadow-wa border border-wa-border" : "text-wa-icon hover:text-wa-dark"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── Content Area ─── */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'analytics' && (
                        <AnalyticsTab summary={summary} isLoading={isSummaryLoading} budgetLimit={budgetLimit} />
                    )}
                    {activeTab === 'log' && (
                        <TransactionsTab transactions={historyRes?.items || []} />
                    )}
                    {activeTab === 'budget' && (
                        <BudgetTab categories={categories} onEdit={() => setIsBudgetModalOpen(true)} />
                    )}
                    {activeTab === 'subscriptions' && (
                        <SubscriptionsTab
                            subscriptions={subscriptions}
                            onAdd={() => setIsAddSubOpen(true)}
                            onDelete={(name) => toast.error(`Tagihan ${name} dihapus`)}
                        />
                    )}
                    {activeTab === 'debts' && (
                        <DebtsTab
                            debts={debts}
                            onAdd={() => setIsAddDebtOpen(true)}
                            onDelete={(name) => toast.error(`Catatan hutang ${name} dihapus`)}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 pt-8">
                <Shield size={13} className="text-wa-green" strokeWidth={2} />
                <span className="text-xs text-wa-muted">Seluruh data finansial dienkripsi aman.</span>
            </div>

            <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
            <EditBudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} currentLimit={budgetLimit} onSave={(newVal) => setLocalBudgetLimit(newVal)} />
            <AddSubscriptionModal isOpen={isAddSubOpen} onClose={() => setIsAddSubOpen(false)} />
            <AddDebtModal isOpen={isAddDebtOpen} onClose={() => setIsAddDebtOpen(false)} />
        </div>
    );
}
