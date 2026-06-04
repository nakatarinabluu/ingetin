import { useMemo } from 'react';
import { 
  Activity, 
  Users, 
  Send, 
  Inbox,
  Target,
  Wallet
} from 'lucide-react';
import { useDashboardStats, useTrafficStats } from '@/entities/admin/model/hooks';
import { Card } from '@/shared/ui/Card';
import { KPICard } from '@/shared/ui/KPICard';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn } from '@/shared/lib/tw.utils';
import { motion } from 'framer-motion';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  Tooltip as ChartTooltip,
} from 'recharts';

import { useChatThreads } from '@/entities/chat/model/hooks';

import { formatIDR } from '@/shared/lib/format';

/**
 * 🚀 ADMIN MONITOR — BUSINESS & APP USAGE FOCUSED
 * Concept: Clinical, Minimal, Stable.
 * Aligned with User Dashboard.
 */
export default function AdminMonitor() {
    const { data: stats, isLoading: statsLoading } = useDashboardStats(true);
    const { data: threadsData, isLoading: threadsLoading } = useChatThreads(true, { page: 1, limit: 5 });
    const { data: trafficData, isLoading: trafficLoading } = useTrafficStats(true);
    
    // Traffic Trend Chart Data
    const chartData = useMemo(() => trafficData || [], [trafficData]);

    const isInitialLoading = statsLoading || threadsLoading || trafficLoading;

    // Extracted for UI
    const messagesSent = stats?.kpis?.messages?.total ?? 0;
    const inboxPending = threadsData?.pagination?.total ?? 0;
    const totalUsers = stats?.kpis?.users?.total ?? 0;
    const totalReminders = stats?.kpis?.reminders?.active ?? 0;

    return (
        <div className="space-y-6 w-full text-left">
            
            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wa-border">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                        <span className="w-2 h-2 rounded-full bg-wa-green animate-pulse" />
                        Laporan Performa Bisnis & Aplikasi
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">
                        Halo, Admin <span className="text-wa-green">Ingetin</span> 👋
                    </h1>
                    <p className="text-sm text-wa-icon">
                        Pantau metrik operasional bot WhatsApp, antrean pesan, dan statistik pengguna.
                    </p>
                </div>
            </header>

            {/* ─── Stats Grid (Operational Focused) ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard title="Pesan Terkirim" value={isInitialLoading ? <Skeleton className="h-8 w-16 mb-1" /> : `${(messagesSent / 1000).toFixed(1)}k`} desc="Total Transmisi WA" icon={Send} color="#00a884" />
                <KPICard title="Pesan Masuk" value={isInitialLoading ? <Skeleton className="h-8 w-12 mb-1" /> : inboxPending} desc="Menunggu Balasan" icon={Inbox} color="#128C7E" />
                <KPICard title="User Terdaftar" value={isInitialLoading ? <Skeleton className="h-8 w-16 mb-1" /> : totalUsers} desc="Nomor WA Aktif" icon={Users} color="#667781" />
                <KPICard title="Total Agenda" value={isInitialLoading ? <Skeleton className="h-8 w-14 mb-1" /> : `${(totalReminders / 1000).toFixed(1)}k`} desc="Dibuat oleh User" icon={Target} color="#25D366" />
            </div>

            {/* ─── Main Content Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* 1. Main Chart (Left Side) */}
                <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 space-y-5"
                >
                    {/* Traffic Chart */}
                    <Card className="rounded-2xl border-wa-border shadow-wa p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-wa-green/8 flex items-center justify-center">
                                    <Activity size={18} className="text-wa-green" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-wa-dark">Lalu Lintas Pesan WA</h3>
                                    <p className="text-xs text-wa-icon mt-0.5">Tren pengiriman dan penerimaan pesan</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[280px] mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00a884" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#00a884" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#667781' }} 
                                        dy={10}
                                    />
                                    <ChartTooltip 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e9edef', boxShadow: '0 4px 12px rgba(11,20,26,0.08)', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="sent" stroke="#00a884" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                                    <Area type="monotone" dataKey="received" stroke="#667781" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* 2. Side Panel (Right Side) */}
                <div className="lg:col-span-4 space-y-5">
                    {/* System Health Card */}
                    <Card className="rounded-2xl border-wa-border shadow-wa p-5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-wa-green-light flex items-center justify-center">
                                <Activity size={18} className="text-wa-teal" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold text-wa-dark">Kesehatan Sistem</h3>
                                <p className="text-[11px] text-wa-icon">Real-time status API & Provider</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <UsageBar label="Core Engine" val={stats?.systemHealth ?? 100} status="Operational" color="#00a884" icon={Activity} />
                            <UsageBar label="WhatsApp API" val={98} status="Stable" color="#128C7E" icon={Send} />
                            <UsageBar label="Redis Queue" val={100} status="Online" color="#ea0038" icon={Inbox} />
                        </div>
                    </Card>

                    {/* Revenue/Business Focus */}
                    <Card className="rounded-2xl border-wa-border shadow-wa p-5 bg-wa-dark text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wallet size={80} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-wa-green uppercase tracking-widest mb-1">Total Revenue</p>
                            <h4 className="text-2xl font-black tabular-nums">Rp {formatIDR(stats?.revenue)}</h4>
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] text-white/50 uppercase font-bold">Lisensi Aktif</p>
                                    <p className="text-sm font-bold">{stats?.activeLicenses ?? 0}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-white/50 uppercase font-bold">Growth</p>
                                    <p className="text-sm font-bold text-wa-green">+12.5%</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ─── Shared Components (Admin-only visuals aligned with User Style) ─── */

function UsageBar({ label, val, status, color, icon: Icon }: { label: string; val: number; status: string; color: string; icon: React.ElementType; }) {
    const isOk = val > 90;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-wa-icon" />
                    <span className="text-[11px] font-bold text-wa-dark">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={cn("text-[11px] font-bold", isOk ? "text-wa-green" : "text-wa-icon")}>{status}</span>
                </div>
            </div>
            <div className="h-1.5 w-full bg-wa-bg rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}
