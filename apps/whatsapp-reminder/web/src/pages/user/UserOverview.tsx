import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageCircle,
    Calendar,
    ShieldCheck,
    Plus,
    Settings,
    Wallet,
    ArrowRight,
    Bell,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { GettingStarted } from '../../components/features/dashboard/GettingStarted';
import { UpcomingRemindersList } from '../../components/features/dashboard/UpcomingRemindersList';
import { FinanceSummaryCard } from '../../components/features/dashboard/FinanceSummaryCard';
import { WhatsAppConnectModal } from '../../components/features/dashboard/WhatsAppConnectModal';
import { useFinanceSummary } from '../../hooks/useFinanceHooks';
import { useReminders } from '../../hooks/useReminderHooks';
import { DASHBOARD_COPY, COMMON_COPY } from '../../constants/copy';
import { motion } from 'framer-motion';

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

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 11) return `Selamat ${COMMON_COPY.greetings.morning}`;
        if (hour < 15) return `Selamat ${COMMON_COPY.greetings.afternoon}`;
        if (hour < 19) return `Selamat ${COMMON_COPY.greetings.evening}`;
        return `Selamat ${COMMON_COPY.greetings.night}`;
    };

    const onboardingSteps = [
        { id: 'wa', completed: session?.isActivated || false },
        { id: 'first', completed: (remindersRes?.items?.length || 0) > 0 }
    ];

    return (
        <div className="space-y-6 w-full text-left">

            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e9edef]">
                <div className="space-y-1">
                    {/* Status pill */}
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#00a884] mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
                        {DASHBOARD_COPY.overview.badge}
                    </div>
                    <h1 className="text-2xl font-bold text-[#111b21]">
                        {getTimeGreeting()},{' '}
                        <span className="text-[#00a884]">{session?.username}</span> 👋
                    </h1>
                    <p className="text-sm text-[#54656f]">
                        {DASHBOARD_COPY.overview.desc}
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={() => setIsConnModalOpen(true)}
                        className="h-10 px-4 rounded-xl border border-[#e9edef] bg-white text-[#54656f] text-sm font-medium hover:bg-[#f0f2f5] transition-colors flex items-center gap-2"
                    >
                        <Settings size={16} strokeWidth={2} />
                        <span className="hidden sm:inline">Pengaturan</span>
                    </button>
                    <Link
                        to="/reminders?action=new"
                        className="h-10 px-4 bg-[#00a884] text-white text-sm font-semibold rounded-xl hover:bg-[#008069] transition-colors inline-flex items-center gap-2"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Agenda Baru
                    </Link>
                </div>
            </header>

            {/* ─── Onboarding ─── */}
            <GettingStarted steps={onboardingSteps} />

            {/* ─── Stats Row (mobile-friendly) ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    {
                        icon: Bell,
                        label: 'Pengingat Aktif',
                        value: remindersRes?.items?.length ?? '—',
                        color: '#00a884',
                    },
                    {
                        icon: Calendar,
                        label: 'Jadwal Hari Ini',
                        value: '—',
                        color: '#128C7E',
                    },
                    {
                        icon: TrendingUp,
                        label: 'Pengeluaran Bulan Ini',
                        value: '—',
                        color: '#667781',
                    },
                    {
                        icon: ShieldCheck,
                        label: 'Status Enkripsi',
                        value: 'Aman',
                        color: '#25D366',
                    },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white border border-[#e9edef] rounded-xl p-4 shadow-wa">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${color}12` }}
                        >
                            <Icon size={18} strokeWidth={2} style={{ color }} />
                        </div>
                        <div className="text-xl font-bold text-[#111b21] leading-none">{isDashboardLoading ? '...' : value}</div>
                        <div className="text-xs text-[#54656f] mt-1 font-medium">{label}</div>
                    </div>
                ))}
            </div>

            {/* ─── Main grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Upcoming agendas */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-8 order-2 lg:order-1"
                >
                    <Card className="h-full rounded-2xl border-[#e9edef] shadow-wa overflow-hidden">
                        <CardHeader className="p-5 md:p-6 border-b border-[#e9edef] flex-row items-center justify-between mb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#00a884]/8 flex items-center justify-center">
                                    <Calendar size={18} className="text-[#00a884]" strokeWidth={2} />
                                </div>
                                <div>
                                    <CardTitle className="text-[15px] font-semibold text-[#111b21]">
                                        {DASHBOARD_COPY.overview.main_title}
                                    </CardTitle>
                                    <p className="text-xs text-[#54656f] mt-0.5">Notifikasi dikirim ke WhatsApp kamu</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#00a884] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                                Sinkron
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <UpcomingRemindersList
                                reminders={remindersRes?.items || []}
                                isLoading={isDashboardLoading}
                            />
                        </CardContent>
                        <div className="px-6 py-4 border-t border-[#e9edef] bg-[#f0f2f5]/40">
                            <Link
                                to="/reminders"
                                className="text-sm text-[#00a884] font-semibold hover:text-[#008069] transition-colors flex items-center gap-1.5"
                            >
                                Lihat semua agenda
                                <ArrowRight size={14} strokeWidth={2.5} />
                            </Link>
                        </div>
                    </Card>
                </motion.div>

                {/* Sidebar cards */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="lg:col-span-4 space-y-4 order-1 lg:order-2"
                >
                    {/* Finance */}
                    <Card className="rounded-2xl border-[#e9edef] shadow-wa p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-xs font-semibold text-[#00a884] block mb-0.5">
                                    {DASHBOARD_COPY.overview.finance_badge}
                                </span>
                                <h3 className="text-[15px] font-semibold text-[#111b21]">Keuangan</h3>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-[#00a884]/8 flex items-center justify-center">
                                <Wallet size={18} className="text-[#00a884]" strokeWidth={2} />
                            </div>
                        </div>
                        <FinanceSummaryCard data={finance} isLoading={isDashboardLoading} />
                        <div className="mt-4 pt-4 border-t border-[#e9edef]">
                            <Link
                                to="/finances"
                                className="text-sm text-[#00a884] font-semibold hover:text-[#008069] transition-colors flex items-center gap-1.5"
                            >
                                Laporan lengkap <ArrowRight size={14} strokeWidth={2.5} />
                            </Link>
                        </div>
                    </Card>

                    {/* System Status */}
                    <Card className="rounded-2xl border-[#e9edef] shadow-wa p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[15px] font-semibold text-[#111b21]">
                                {DASHBOARD_COPY.overview.system_badge}
                            </h3>
                            <span className="text-xs text-[#667781]">Real-time</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { icon: MessageCircle, label: 'WhatsApp', status: 'Online' },
                                { icon: ShieldCheck, label: 'Enkripsi', status: 'Aktif' },
                            ].map(({ icon: Icon, label, status }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={16} className="text-[#54656f]" strokeWidth={2} />
                                        <span className="text-sm text-[#111b21] font-medium">{label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                                        <span className="text-xs text-[#00a884] font-medium">{status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-[#667781] mt-4 pt-3 border-t border-[#e9edef]">
                            {DASHBOARD_COPY.overview.system_status}
                        </p>
                    </Card>
                </motion.div>
            </div>

            <WhatsAppConnectModal isOpen={isConnModalOpen} onClose={() => setIsConnModalOpen(false)} session={session} />
        </div>
    );
}
