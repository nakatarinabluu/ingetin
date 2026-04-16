import React, { useMemo, useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Users, 
  MessageCircle, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Play,
  Pause,
  Trash2,
  Radio,
  Power,
  RefreshCw,
  AlertTriangle,
  HardDrive,
  Database,
  Search,
  Settings
} from 'lucide-react';
import { useDashboardStats, useSystemPulse, useProviderHealth } from '../../hooks/useAdminHooks';
import { useAdminMonitorBridge } from '../../hooks/useAdminMonitorBridge';
import type { PulseEntry } from '../../types';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SLIDE_UP, STAGGER_CONTAINER, FADE_IN } from '../../utils/motion';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip,
  CartesianGrid
} from 'recharts';

type PulseCategory = 'ALL' | 'SENT' | 'RECEIVED' | 'SYSTEM';

/**
 * 🚀 THE MODERN PRO ADMIN MONITOR - v9.0 "Mission Control"
 * Real-time infrastructure telemetry & command center.
 */
export default function AdminMonitor() {
    const { data: stats, isLoading: statsLoading } = useDashboardStats(true);
    const { data: pulseData, isLoading: pulseLoading } = useSystemPulse(true);
    const { data: providers, isLoading: healthLoading } = useProviderHealth(true);
    const { isConnected } = useAdminMonitorBridge();
    
    const [activeCategory, setActiveCategory] = useState<PulseCategory>('ALL');
    const [isPaused, setIsPaused] = useState(false);

    // Simulated Real-time Latency Data for the Chart
    const [chartData, setChartData] = useState<any[]>([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (isPaused) return;
            setChartData(prev => {
                const newData = [...prev, { 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                    latency: 20 + Math.random() * 40 + (Math.random() > 0.9 ? 100 : 0) 
                }];
                return newData.slice(-15);
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [isPaused]);

    const isInitialLoading = (statsLoading && !stats) || (pulseLoading && !pulseData) || (healthLoading && !providers);

    const filteredPulse = useMemo(() => {
        if (!Array.isArray(pulseData)) return [];
        const base = activeCategory === 'ALL' ? pulseData : pulseData.filter((p: PulseEntry) => (p.category || 'SYSTEM') === activeCategory);
        return isPaused ? base.slice(0, 50) : base;
    }, [pulseData, activeCategory, isPaused]);

    const handleQuickAction = (action: string) => {
        toast.promise(new Promise(res => setTimeout(res, 1200)), {
            loading: `Memproses ${action}...`,
            success: `Protokol ${action} Diaktifkan.`,
            error: `Gagal Mengeksekusi ${action}.`,
        });
    };

    if (isInitialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 max-w-7xl mx-auto">
                <div className="w-16 h-16 border-4 border-accent/10 border-t-accent rounded-3xl animate-spin" />
                <Typography variant="small" className="font-bold tracking-[0.4em] text-[10px] uppercase text-accent animate-pulse">Sinkronisasi Mesin Registry...</Typography>
            </div>
        );
    }

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="relative min-h-full pb-20 space-y-12 max-w-7xl mx-auto text-left"
        >
            {/* 01. INTEGRATED COMMAND HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-gray-100/50">
                <div className="space-y-6">
                    <motion.div variants={SLIDE_UP} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/50 border border-gray-200/50 text-[#00a884] backdrop-blur-md">
                        <Terminal size={14} className="text-accent" />
                        <Typography variant="small" className="font-bold tracking-[0.2em] text-[10px] uppercase">Registry Command Center</Typography>
                    </motion.div>
                    
                    <div className="space-y-3">
                        <motion.div variants={SLIDE_UP}>
                            <Typography variant="h1" className="text-4xl md:text-7xl font-bold tracking-tighter leading-none italic uppercase">Telemetri Os</Typography>
                        </motion.div>
                        <motion.div variants={FADE_IN}>
                            <Typography variant="p" className="max-w-xl text-gray-400 font-medium text-lg leading-relaxed">
                                Pengawasan daya pancar dan operasional infrastruktur ekosistem Ingetin secara real-time.
                            </Typography>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={SLIDE_UP} className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-modern">
                    <CommandBtn onClick={() => handleQuickAction('Flush Cache')} icon={<Zap size={18} />} label="Flush" activeColor="text-orange-500" />
                    <CommandBtn onClick={() => handleQuickAction('Restart Engine')} icon={<RefreshCw size={18} />} label="Reboot" activeColor="text-accent" />
                    <CommandBtn onClick={() => handleQuickAction('System Lockdown')} icon={<Power size={18} />} label="Lock" activeColor="text-destructive" />
                </motion.div>
            </header>

            {/* 02. INFRA KPI - PREMIUM BENTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPIMetric title="Sinyal Trafik" value={stats?.kpis?.messages?.total ?? '0'} desc="Total Transmisi" icon={<MessageCircle />} color="text-accent" />
                <KPIMetric title="Latensi Sinyal" value={`${stats?.kpis?.signals?.latency ?? 0}ms`} desc="Responsivitas Core" icon={<Zap />} color="text-orange-500" />
                <KPIMetric title="Identitas Aktif" value={stats?.kpis?.users?.total ?? '0'} desc="Anggota Terdaftar" icon={<Users />} color="text-[#111b21]" />
                <KPIMetric title="Health Index" value="99.9%" desc="Uptime Registry" icon={<ShieldAlert />} color="text-[#00a884]" />
            </div>

            {/* 03. MISSION CONTROL CONSOLE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* 1. ACTIVITIY STREAM & VISUALIZER */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Visualizer Chart */}
                    <Card className="rounded-[2.5rem] border border-gray-100 bg-white shadow-modern p-10 overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-accent rounded-full animate-pulse" />
                                <Typography variant="h3" className="text-xl font-bold tracking-tight">Oskiloskop Latensi</Typography>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary/50 text-accent font-black text-[10px] uppercase tracking-widest leading-none">
                                Real-time Stream
                            </div>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00a884" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#00a884" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide domain={[0, 200]} />
                                    <ChartTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="latency" 
                                        stroke="#00a884" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorLatency)" 
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Terminal Grid */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100/50 pb-6 gap-6">
                            <div className="flex items-center gap-4">
                                <Typography variant="h2" className="text-2xl font-bold tracking-tight italic">Log Frekuensi</Typography>
                                <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-[#00a884] shadow-[0_0_10px_#00a884]" : "bg-red-500 animate-pulse")} />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-secondary/30 p-1 rounded-xl border border-gray-200/30 gap-1 backdrop-blur-sm">
                                    <FilterBtn active={activeCategory === 'ALL'} onClick={() => setActiveCategory('ALL')} label="ALL" />
                                    <FilterBtn active={activeCategory === 'SYSTEM'} onClick={() => setActiveCategory('SYSTEM')} label="SYS" />
                                </div>
                                <button 
                                    onClick={() => setIsPaused(!isPaused)} 
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center rounded-xl transition-all border", 
                                        isPaused ? "bg-orange-400 text-white border-orange-500 shadow-modern" : "bg-white text-gray-300 hover:text-accent border-gray-200"
                                    )}
                                >
                                    {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-[#111b21] rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden min-h-[500px] relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111b21] pointer-events-none z-20 h-full w-full opacity-50" />
                            <div className="max-h-[600px] overflow-y-auto font-mono scrollbar-hide p-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredPulse.length > 0 ? (
                                        filteredPulse.map((p: PulseEntry, i: number) => (
                                            <motion.div 
                                                key={i} 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex gap-6 py-4 px-6 border-b border-white/5 hover:bg-white/5 transition-colors group items-center"
                                            >
                                                <span className="text-[10px] font-bold text-gray-600 tabular-nums shrink-0 uppercase">
                                                    {new Date(p.time || p.timestamp || Date.now()).toLocaleTimeString([], { hour12: false })}
                                                </span>
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <span className={cn(
                                                        "text-[8px] font-black px-1.5 py-0.5 rounded leading-none uppercase tracking-widest shrink-0",
                                                        p.category === 'SYSTEM' ? "bg-accent text-[#111b21]" : "bg-gray-800 text-gray-400"
                                                    )}>{p.category || 'SIGNAL'}</span>
                                                    <Typography variant="p" className="text-[13px] font-medium leading-none truncate text-gray-400 lowercase tracking-tight">
                                                        {`> `}{p.message || p.body}
                                                    </Typography>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="h-[500px] flex flex-col items-center justify-center text-gray-800 space-y-6">
                                            <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center">
                                                <Activity size={32} className="animate-pulse opacity-20 text-accent" />
                                            </div>
                                            <Typography variant="small" className="font-bold uppercase tracking-[0.5em] text-[10px]">Menunggu Transmisi...</Typography>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. INFRA TELEMETRY */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-6 text-left">
                        <div className="flex items-center gap-4">
                            <Cpu size={20} className="text-accent" />
                            <Typography variant="h4" className="text-sm font-bold uppercase tracking-[0.2em] italic">Cluster Vitalitas</Typography>
                        </div>
                        
                        <Card className="border border-gray-100 bg-white p-10 space-y-10 shadow-modern rounded-[2.5rem]" padding="none">
                            <HardwareMetric label="Neural Core (CPU)" val={42} icon={<Cpu size={14} />} color="bg-accent" />
                            <HardwareMetric label="Synapse Load (RAM)" val={68} icon={<Database size={14} />} color="bg-[#111b21]" />
                            <HardwareMetric label="Log Persistensi" val={12} icon={<HardDrive size={14} />} color="bg-accent" />
                        </Card>
                    </div>

                    <div className="space-y-6 text-left">
                        <div className="flex items-center gap-4">
                            <ShieldAlert size={20} className="text-red-500" />
                            <Typography variant="h4" className="text-sm font-bold uppercase tracking-[0.2em] italic">Anomali & Sekuritas</Typography>
                        </div>
                        
                        <Card className="border border-red-100 bg-red-50/30 p-10 space-y-8 rounded-[2.5rem]" padding="none">
                            <SecurityAlert text="Instabilitas database terdeteksi (>200ms)" />
                            <SecurityAlert text="Upaya sinkronisasi registry tak terdaftar" />
                            <SecurityAlert text="Integrasi sinyal abnormal diblokir" isCritical />
                        </Card>
                        
                        <div className="p-8 bg-secondary/40 rounded-3xl border border-gray-100 border-dashed flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Settings size={20} className="text-gray-400 rotate-90" />
                            </div>
                            <div className="space-y-1">
                                <Typography variant="small" className="font-bold text-[#111b21] block leading-none">Konfigurasi Registry</Typography>
                                <button className="text-[10px] font-bold text-[#00a884] uppercase tracking-widest hover:underline">Kelola Parameter</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CommandBtn({ onClick, icon, label, activeColor }: { onClick: () => void; icon: React.ReactNode; label: string; activeColor: string; }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 w-24 h-16 hover:bg-secondary/40 rounded-2xl transition-all group shrink-0"
        >
            <div className={cn("text-gray-300 transition-all group-hover:scale-125 duration-300", `group-hover:${activeColor}`)}>{icon}</div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-[#111b21]">{label}</span>
        </button>
    );
}

function KPIMetric({ title, value, desc, icon, color }: { title: string; value: string | number; desc: string; icon: React.ReactNode; color: string; }) {
    return (
        <Card className="border border-gray-100 bg-white p-10 flex flex-col justify-between h-56 group shadow-modern rounded-[2.5rem] relative overflow-hidden" padding="none">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-150 transition-transform duration-1000 group-hover:opacity-[0.05]">
                {icon}
            </div>
            <div className="flex justify-between items-start relative z-10">
                <Typography variant="small" className="font-bold text-gray-300 uppercase tracking-[0.2em] text-[10px]">{title}</Typography>
                <div className={cn("transition-all duration-500 group-hover:scale-110", color)}>{icon}</div>
            </div>
            <div className="space-y-2 relative z-10 text-left">
                <Typography variant="h3" className="text-4xl font-bold tracking-tighter tabular-nums leading-none">{value}</Typography>
                <Typography variant="p" className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{desc}</Typography>
            </div>
        </Card>
    );
}

function HardwareMetric({ label, val, icon, color }: { label: string; val: number; icon: React.ReactNode; color: string; }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                    <span className="text-gray-300 group-hover:text-accent transition-colors">{icon}</span>
                    <Typography variant="h4" className="text-[13px] font-bold text-[#111b21] tracking-tight">{label}</Typography>
                </div>
                <span className="text-xs font-black tabular-nums text-[#111b21]">{val}%</span>
            </div>
            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-gray-100/50 relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className={cn("h-full relative z-10", color)} 
                />
            </div>
        </div>
    );
}

function SecurityAlert({ text, isCritical }: { text: string, isCritical?: boolean }) {
    return (
        <div className="flex items-start gap-4 group">
            <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0 shadow-sm", isCritical ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-red-400/40")} />
            <Typography variant="p" className={cn("text-[13px] font-medium leading-relaxed tracking-tight transition-colors", isCritical ? "text-red-600 font-bold" : "text-gray-500 group-hover:text-red-400")}>
                {text}
            </Typography>
        </div>
    );
}

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string; }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                active ? "bg-white text-[#111b21] shadow-modern border border-gray-200/50" : "text-gray-400 hover:text-[#111b21]"
            )}
        >
            {label}
        </button>
    );
}
