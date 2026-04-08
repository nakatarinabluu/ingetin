import React, { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, Zap, Terminal, TrendingUp, Users, MessageCircle, Server, RefreshCw, Search, Menu, Send, Inbox, Cog, Globe } from 'lucide-react';
import { useDashboardStats, useSystemPulse, useProviderHealth } from '../../hooks/useWhatsApp';
import MainAppLayout from '../../layouts/MainAppLayout';

type PulseCategory = 'ALL' | 'SENT' | 'RECEIVED' | 'SYSTEM';

interface KPIProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    label: string;
}

export default function AdminMonitor() {
    const queryClient = useQueryClient();
    const { data: stats, isLoading: statsLoading, isFetching: statsFetching } = useDashboardStats(true);
    const { data: pulseData, isLoading: pulseLoading, isFetching: pulseFetching } = useSystemPulse(true);
    const { data: providers, isLoading: healthLoading, isFetching: healthFetching } = useProviderHealth(true);
    
    const [activeCategory, setActiveCategory] = useState<PulseCategory>('ALL');

    // Real-time synchronization via WebSocket
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        let wsUrl: string;

        if (apiUrl.startsWith('http')) {
            const protocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
            const host = apiUrl.replace(/^https?:\/\//, '');
            wsUrl = `${protocol}//${host}/api/live`;
        } else {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            wsUrl = `${protocol}//${host}${apiUrl}/api/live`;
        }

        const sessionStr = localStorage.getItem('wa_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                if (session.token) {
                    wsUrl += `?token=${session.token}`;
                }
            } catch (e) {}
        }
        
        let socket: WebSocket | null = null;
        let reconnectTimer: any = null;

        const connect = () => {
            try {
                socket = new WebSocket(wsUrl);
                socket.onmessage = (event) => {
                    try {
                        const { event: type, data } = JSON.parse(event.data);
                        if (type === 'stats_update') {
                            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
                        } else if (type === 'chat_update') {
                            queryClient.invalidateQueries({ queryKey: ['conversations'] });
                            queryClient.invalidateQueries({ queryKey: ['messages'] });
                        } else if (type === 'pulse_signal') {
                            queryClient.setQueryData(['admin-system-pulse'], (old: any) => {
                                const currentData = Array.isArray(old) ? old : [];
                                return [data, ...currentData].slice(0, 100);
                            });
                        }
                    } catch (err) { console.error('WS Parse Error', err); }
                };
                socket.onclose = () => { socket = null; reconnectTimer = setTimeout(connect, 5000); };
            } catch (err) { reconnectTimer = setTimeout(connect, 5000); }
        };

        connect();
        return () => {
            if (socket) { socket.onclose = null; socket.close(); }
            clearTimeout(reconnectTimer);
        };
    }, [queryClient]);

    const isRefreshing = statsFetching || pulseFetching || healthFetching;
    const isInitialLoading = (statsLoading && !stats) || (pulseLoading && !pulseData) || (healthLoading && !providers);

    const filteredPulse = useMemo(() => {
        if (!Array.isArray(pulseData)) return [];
        if (activeCategory === 'ALL') return pulseData;
        return pulseData.filter((p: any) => (p.category || 'SYSTEM') === activeCategory);
    }, [pulseData, activeCategory]);

    if (isInitialLoading) {
        return (
            <MainAppLayout title="System Status" subtitle="Updating...">
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-8 h-8 border-2 border-slate-100 border-t-[#25D366] rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Updating...</p>
                </div>
            </MainAppLayout>
        );
    }

    return (
        <MainAppLayout 
            title="System Overview" 
            subtitle={isRefreshing ? "Updating live data..." : "System Operational"}
        >
            <div className="p-6 lg:p-10 space-y-8">
                
                {/* --- KPI GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KPIModern 
                        title="Total Members" 
                        value={stats?.kpis?.users?.total ?? '0'} 
                        icon={<Users size={18} />} 
                        label="Registered accounts"
                    />
                    <KPIModern 
                        title="Guest Signals" 
                        value={stats?.kpis?.signals?.unverified ?? '0'} 
                        icon={<Globe size={18} />} 
                        label="Unregistered contacts"
                    />
                    <KPIModern 
                        title="Message Volume" 
                        value={stats?.kpis?.messages?.total ?? '0'} 
                        icon={<MessageCircle size={18} />} 
                        label="Total traffic"
                    />
                    <KPIModern 
                        title="Success Rate" 
                        value={stats ? `${stats?.kpis?.messages?.reliability || 100}%` : '100%'} 
                        icon={<TrendingUp size={18} />} 
                        label="Overall accuracy"
                    />
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LIVE ACTIVITY FEED */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-sm">
                        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-[#25D366]" />
                                <span className="text-[13px] font-bold tracking-tight">Live Activity Feed</span>
                            </div>
                            
                            {/* CATEGORY TABS */}
                            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                                <CategoryTab 
                                    active={activeCategory === 'ALL'} 
                                    onClick={() => setActiveCategory('ALL')}
                                    label="All"
                                    icon={<RefreshCw size={10} />}
                                />
                                <CategoryTab 
                                    active={activeCategory === 'SENT'} 
                                    onClick={() => setActiveCategory('SENT')}
                                    label="Sent"
                                    icon={<Send size={10} />}
                                />
                                <CategoryTab 
                                    active={activeCategory === 'RECEIVED'} 
                                    onClick={() => setActiveCategory('RECEIVED')}
                                    label="Received"
                                    icon={<Inbox size={10} />}
                                />
                                <CategoryTab 
                                    active={activeCategory === 'SYSTEM'} 
                                    onClick={() => setActiveCategory('SYSTEM')}
                                    label="System"
                                    icon={<Cog size={10} />}
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white font-mono text-[12px]">
                            {filteredPulse.length > 0 ? (
                                filteredPulse.map((p: any, i: number) => (
                                    <div key={i} className="flex gap-4 py-2 px-4 hover:bg-slate-50 rounded-lg transition-colors group border border-transparent hover:border-slate-100">
                                        <span className="text-[11px] text-slate-300 tabular-nums min-w-[70px]">
                                            {new Date(p.time || p.timestamp).toLocaleTimeString([], { hour12: false })}
                                        </span>
                                        <div className="flex-1 flex gap-3 overflow-hidden">
                                            <span className={`text-[10px] font-bold uppercase tracking-tight px-1.5 rounded border h-fit whitespace-nowrap ${
                                                p.status === 'ERROR' ? 'text-rose-500 border-rose-100 bg-rose-50' : 
                                                p.status === 'SUCCESS' ? 'text-[#25D366] border-green-100 bg-green-50' :
                                                'text-blue-500 border-blue-100 bg-blue-50'
                                            }`}>
                                                {p.category || 'SYSTEM'}
                                            </span>
                                            <span className="text-slate-600 leading-tight truncate">
                                                {p.message}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-200 space-y-2">
                                    <Activity size={32} className="animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                        {activeCategory === 'ALL' ? 'Listening for activity...' : `No ${activeCategory.toLowerCase()} activity...`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SERVICE STATUS SIDEBAR */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Server size={16} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Service Status</span>
                            </div>
                            <div className="space-y-4">
                                <StatusItem 
                                    label="WhatsApp Network" 
                                    status={providers?.providers?.whatsapp || 'CONNECTED'} 
                                    resilience={providers?.resilience?.whatsapp}
                                />
                                <StatusItem 
                                    label="Google Integration" 
                                    status={providers?.providers?.google || 'CONNECTED'} 
                                    resilience={providers?.resilience?.google}
                                />
                                <StatusItem label="Database" status={providers?.providers?.database || 'STABLE'} />
                                <StatusItem label="Cache" status={providers?.providers?.redis || 'STABLE'} />
                            </div>
                        </div>

                        <div className="bg-[#25D366] rounded-xl p-6 text-white relative overflow-hidden group shadow-xl shadow-slate-900/20">
                            <div className="absolute inset-0 wa-chat-pattern opacity-5" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                                        <Zap size={16} fill="currentColor" />
                                    </div>
                                    <span className="text-[12px] font-bold tracking-widest uppercase text-white/90">Ecosystem Health</span>
                                </div>
                                
                                <div className="space-y-5">
                                    <ProgressMetric 
                                        label="Linked Google Calendars" 
                                        current={stats?.kpis?.integrations?.calendarSyncs || 0}
                                        total={stats?.kpis?.users?.total || 1}
                                    />
                                    <ProgressMetric 
                                        label="Active Reminder Queue" 
                                        current={stats?.kpis?.reminders?.active || 0}
                                        total={Math.max(100, (stats?.kpis?.reminders?.active || 0) * 2)}
                                    />
                                    
                                    <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Engagement</p>
                                            <p className="text-lg font-bold text-white">{stats?.kpis?.signals?.balance || 'OPTIMAL'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Response Time</p>
                                            <p className="text-lg font-bold text-white/90">{stats?.kpis?.signals?.latency ?? 0}ms</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            <span className="text-[10px] font-bold uppercase text-white/60">Encryption</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white">{stats?.system?.protocol || 'ACTIVE'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainAppLayout>
    );
}

function CategoryTab({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                active 
                ? 'bg-white text-[#0F172A] shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
        >
            <span className={active ? 'text-[#25D366]' : 'text-slate-400'}>{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    );
}

function KPIModern({ title, value, icon, label }: KPIProps) {
    return (
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm hover:border-[#25D366] transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className="text-slate-400 group-hover:text-[#25D366] transition-colors">
                    {icon}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-3xl font-bold tracking-tight text-[#0F172A]">{value}</p>
                <p className="text-[11px] text-slate-400 font-medium">{label}</p>
            </div>
        </div>
    );
}

function StatusItem({ label, status, resilience }: { label: string, status: string, resilience?: any }) {
    const isOk = ['OPERATIONAL', 'CONNECTED', 'ACTIVE', 'STABLE', 'CLOSED'].includes(status.toUpperCase());
    const isError = ['DEGRADED', 'FAILED', 'OPEN'].includes(status.toUpperCase());

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-500">{label}</span>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isOk ? 'text-[#25D366]' : isError ? 'text-rose-500' : 'text-amber-500'}`}>
                        {status}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-[#25D366]' : isError ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
                </div>
            </div>
            {resilience && (
                <div className="flex justify-between items-center px-2 py-1 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Safety Check</span>
                    <span className={`text-[9px] font-bold uppercase ${resilience.state === 'CLOSED' ? 'text-[#25D366]' : 'text-rose-500'}`}>
                        {resilience.state}
                    </span>
                </div>
            )}
        </div>
    );
}

function ProgressMetric({ label, current, total }: { label: string, current: number, total: number }) {
    const pct = Math.min(100, Math.round((current / (total || 1)) * 100));
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</span>
                <span className="text-[12px] font-bold tabular-nums">{current}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#25D366] transition-all duration-1000" 
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
