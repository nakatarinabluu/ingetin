import { useState, useMemo } from 'react';
import {
    TrendingUp,
    ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, KPICard } from '@/shared/ui';
import { GettingStarted } from '@/widgets/dashboard-overview/GettingStarted';
import { UpcomingRemindersList } from '@/widgets/dashboard-overview/UpcomingRemindersList';
import { FinanceSummaryCard } from '@/widgets/dashboard-overview/FinanceSummaryCard';
import { WhatsAppConnectModal } from '@/features/create-reminder/ui/WhatsAppConnectModal';
import { useFinanceSummary } from '@/entities/finance/model/hooks';
import { useReminders } from '@/entities/reminder/model/hooks';
import { DASHBOARD_COPY } from '@/shared/config/copy';
import { motion } from 'framer-motion';
import { SLIDE_UP } from '@/shared/lib/motion';
import { formatIDR, formatMillion, getSafePercent } from '@/shared/lib/format';

/**
 * UserOverview — WhatsApp Official Dashboard
 * Clean, informative, mobile-first.
 */
export default function UserOverview() {
    const { session } = useAuth();

    const { data: finance, isLoading: isFinanceLoading } = useFinanceSummary();
    const { data: remindersRes, isLoading: isRemindersLoading } = useReminders({ page: 1, limit: 10 });

    const isDashboardLoading = isFinanceLoading || isRemindersLoading;
    const [isConnModalOpen, setIsConnModalOpen] = useState(false);

    // Memoized Metrics for performance and clean JSX
    const metrics = useMemo(() => [
        { 
            icon: TrendingUp, 
            label: 'Pengeluaran', 
            value: isDashboardLoading ? '...' : `Rp ${formatMillion(finance?.totalExpense)}`, 
            color: '#667781' 
        },
        { 
            icon: ShieldCheck, 
            label: 'Batas Aman', 
            value: isDashboardLoading ? '...' : `Rp ${formatMillion(finance?.remainingBudget)}`, 
            color: '#00a884' 
        },
    ], [finance, isDashboardLoading]);

    const safeExpensePercent = useMemo(() => 
        getSafePercent(finance?.expensePercentage || 15), 
    [finance]);

    return (
        <div className="w-full space-y-6 text-left">
            
            {/* ─── 01. WELCOME HEADER ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wa-border">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                        <ShieldCheck size={14} strokeWidth={2.5} />
                        Identity Verified & Connected
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">
                        Halo, {session?.username || 'User'} 👋
                    </h1>
                    <p className="text-sm text-wa-icon">
                        {DASHBOARD_COPY.overview.desc}
                    </p>
                </div>
                
                <button 
                    onClick={() => setIsConnModalOpen(true)}
                    className="h-10 px-4 bg-wa-bg text-wa-dark text-xs font-bold rounded-xl hover:bg-wa-border transition-all flex items-center gap-2 shrink-0 self-start sm:self-center"
                >
                    <div className="w-2 h-2 rounded-full bg-wa-green animate-pulse" />
                    Status WA: Terhubung
                </button>
            </header>

            {/* ─── 02. CORE METRICS ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {metrics.map((item, idx) => (
                    <KPICard 
                        key={idx}
                        title={item.label}
                        value={item.value}
                        icon={item.icon}
                        color={item.color}
                    />
                ))}
            </div>

            {/* ─── 03. MAIN DASHBOARD CONTENT ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Intelligence & Reports */}
                <div className="lg:col-span-8 space-y-6">
                    <motion.div {...SLIDE_UP}>
                        <Card className="rounded-3xl border-wa-border shadow-wa overflow-hidden">
                            <CardHeader className="p-6 md:p-8 border-b border-wa-border/60 bg-[#fcfcfc]">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-wa-dark">Saku Digital</CardTitle>
                                        <p className="text-xs text-wa-icon font-medium">Laporan kecerdasan finansial bulan ini.</p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-wa-green/10 text-wa-green text-[10px] font-black uppercase tracking-widest border border-wa-green/20">
                                        {finance?.status || 'OPTIMAL'}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 bg-white">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 bg-wa-bg rounded-2xl border border-wa-border/40 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                                            <TrendingUp size={60} />
                                        </div>
                                        <div className="relative z-10 text-center">
                                            <p className="text-[10px] font-bold text-wa-muted uppercase mb-1">Sisa Anggaran</p>
                                            <h4 className="text-xl font-black text-wa-dark tracking-tighter">
                                                Rp {formatIDR(finance?.remainingBudget)}
                                            </h4>
                                        </div>

                                        <div className="mt-6 relative w-24 h-24 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle className="text-wa-border" strokeWidth="4" stroke="currentColor" fill="none" r="36" cx="48" cy="48" />
                                                <motion.path 
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: (100 - safeExpensePercent) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="text-wa-green" 
                                                    strokeWidth="4" 
                                                    strokeLinecap="round" 
                                                    stroke="currentColor" 
                                                    fill="none" 
                                                    d="M48 12 a 36 36 0 0 1 0 72 a 36 36 0 0 1 0 -72" 
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-black text-wa-dark">{Math.max(0, 100 - safeExpensePercent)}%</span>
                                                <span className="text-[7px] font-bold text-wa-muted uppercase">Safe</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full">
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-wa-dark">Uang riil: <span className="text-wa-green">Rp {formatIDR(finance?.balance)}</span></p>
                                            <p className="text-[10px] text-wa-icon mt-1">Anggaran disesuaikan berdasarkan saldo nyata Anda.</p>
                                        </div>
                                        
                                        <FinanceSummaryCard data={finance || null} isLoading={isFinanceLoading} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <GettingStarted />
                </div>

                {/* Right Column: Dynamic Feed */}
                <div className="lg:col-span-4 space-y-6">
                    <UpcomingRemindersList 
                        reminders={remindersRes?.items || []} 
                        isLoading={isRemindersLoading} 
                    />
                </div>
            </div>

            <WhatsAppConnectModal 
                isOpen={isConnModalOpen} 
                onClose={() => setIsConnModalOpen(false)} 
                session={session}
            />
        </div>
    );
}
