import React, { useState } from 'react';
import { 
    Clock, 
    RefreshCw, 
    Trash2, 
    CheckCircle2, 
    Mail, 
    Smartphone, 
    ArrowLeft,
    Database,
    Activity,
    ShieldAlert,
    History as HistoryIcon,
    Zap
} from 'lucide-react';
import { AxiosResponse } from 'axios';
import { UserDTO, ApiResponse } from '@ingetin/types';
import type { UserProfile, AuditEvent, OperationalHistoryEntry } from '../../../types';
import { useUserReminders, useDeepSyncCalendar } from '../../../hooks/useReminderHooks';
import { useUserDetails } from '../../../hooks/useUserHooks';
import { WhatsAppAPI } from '../../../api/whatsapp.api';
import { Typography } from '../../ui/Typography';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { cn } from '../../../utils/tw.utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_COPY } from '../../../constants/copy';

interface UserEventAuditProps {
    user: UserDTO;
    onBack: () => void;
}

type FilterType = 'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

/**
 * 🚀 THE MODERN PRO ADMIN AUDIT COMPONENT - v9.0
 */
export default function UserEventAudit({ user, onBack }: UserEventAuditProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    
    const { data: remindersData, isLoading: remindersLoading, refetch } = useUserReminders(user.id, {
        page: 1,
        limit: 500
    });
    const { data: userDetailsResponse } = useUserDetails(user.id);
    const detailedUser = (userDetailsResponse || user) as UserProfile;
    const allReminders = remindersData?.items || [];
    
    const filteredData = allReminders.filter((r) => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'PENDING') return r.status === 'PENDING' || r.status === 'QUEUED';
        if (activeFilter === 'SUCCESS') return r.status === 'SENT';
        if (activeFilter === 'FAILED') return r.status === 'FAILED';
        if (activeFilter === 'CANCELLED') return r.status === 'CANCELLED';
        return true;
    });

    const { mutate: triggerDeepSync, isPending: isSyncing } = useDeepSyncCalendar();

    const handleDeepSync = () => {
        triggerDeepSync(user.id, {
            onSuccess: (res: AxiosResponse<ApiResponse<{ count: number }>>) => {
                const data = res.data;
                toast.success(ADMIN_COPY.event_audit.toast.sync_success, { 
                    description: `Berhasil menemukan ${data.success ? data.data.count : 0} event.` 
                });
                refetch();
            },
            onError: () => toast.error(ADMIN_COPY.event_audit.toast.sync_fail)
        });
    };

    const handleDelete = async (id: string) => {
        try {
            await WhatsAppAPI.deleteReminder(id);
            toast.success(ADMIN_COPY.event_audit.toast.delete_success);
            refetch();
        } catch (err) {
            toast.error(ADMIN_COPY.event_audit.toast.delete_fail);
        }
    };

    return (
        <div className="flex flex-col space-y-8 animate-in fade-in duration-700 text-left">
            
            {/* 01. COMMAND BAR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="secondary"
                        size="sm"
                        onClick={onBack}
                        className="rounded-xl font-bold border border-border"
                        leftIcon={<ArrowLeft size={14} />}
                    >
                        {ADMIN_COPY.event_audit.btn_back}
                    </Button>
                    <div className="h-6 w-px bg-border hidden md:block" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}&backgroundColor=F1F5F9`} alt="Avatar" />
                        </div>
                        <div className="min-w-0">
                            <Typography variant="h4" className="text-sm font-bold tracking-tight leading-none mb-1">{user.fullName}</Typography>
                            <Typography variant="small" className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">@{user.username}</Typography>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => refetch()}
                        className="p-3 bg-white border border-border rounded-xl text-muted-foreground/40 hover:text-accent transition-all shadow-subtle"
                    >
                        <RefreshCw size={18} className={cn(remindersLoading && 'animate-spin text-accent')} />
                    </button>
                    <Button 
                        onClick={handleDeepSync}
                        isLoading={isSyncing}
                        className="rounded-xl shadow-modern font-bold px-6 h-12"
                        leftIcon={<HistoryIcon size={16} />}
                    >
                        {ADMIN_COPY.event_audit.btn_sync}
                    </Button>
                </div>
            </div>

            {/* 02. KPI REGISTRY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AuditKPI label="Email Akun" value={detailedUser?.email || '...'} icon={<Mail size={16} />} status={detailedUser?.email ? 'LINKED' : 'PENDING'} />
                <AuditKPI label="Link WhatsApp" value={detailedUser?.phoneNumber ? `+${detailedUser.phoneNumber}` : 'No Link'} icon={<Smartphone size={16} />} status={detailedUser?.phoneNumber ? 'ONLINE' : 'OFFLINE'} isAccent />
                <AuditKPI label="Success Rate" value={allReminders.length > 0 ? `${Math.round((allReminders.filter((r) => r.status === 'SENT').length / allReminders.length) * 100)}%` : '100%'} icon={<CheckCircle2 size={16} />} status="STABLE" />
                <AuditKPI label="Total Sinyal" value={allReminders.length} icon={<Database size={16} />} status="LOADED" />
            </div>

            {/* 03. ACTIVITY TABLE */}
            <Card className="shadow-subtle border border-border overflow-hidden bg-white flex flex-col min-h-[600px] rounded-2xl" padding="none">
                <div className="px-8 py-6 border-b border-border bg-secondary/30 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Activity size={18} className="text-accent" />
                        <Typography variant="small" className="font-bold text-foreground tracking-widest uppercase text-[10px]">{ADMIN_COPY.event_audit.badge}</Typography>
                    </div>
                    <div className="flex gap-1 p-1 bg-white border border-border rounded-xl shadow-sm">
                        <FilterButton label="Semua" active={activeFilter === 'ALL'} onClick={() => setActiveFilter('ALL')} count={allReminders.length} />
                        <FilterButton label="Berhasil" active={activeFilter === 'SUCCESS'} onClick={() => setActiveFilter('SUCCESS')} count={allReminders.filter((r) => r.status === 'SENT').length} />
                        <FilterButton label="Gagal" active={activeFilter === 'FAILED'} onClick={() => setActiveFilter('FAILED')} count={allReminders.filter((r) => r.status === 'FAILED').length} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 text-left">
                    <AnimatePresence mode="wait">
                        {remindersLoading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-20 gap-4">
                                <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                                <Typography variant="small" className="font-bold opacity-30 uppercase tracking-widest text-[10px]">Memuat Log...</Typography>
                            </motion.div>
                        ) : filteredData.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center opacity-20 space-y-4">
                                <ShieldAlert size={48} className="mx-auto" strokeWidth={1.5} />
                                <Typography variant="small" className="font-bold uppercase tracking-[0.4em] text-[10px]">{ADMIN_COPY.event_audit.empty}</Typography>
                            </motion.div>
                        ) : (
                            <div className="space-y-1 text-left">
                                {filteredData.map((r, idx) => (
                                    <motion.div 
                                        key={r.id} 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="flex items-center gap-5 p-4 hover:bg-secondary/40 rounded-2xl transition-all group border border-transparent hover:border-border/50 text-left"
                                    >
                                        <div className={cn(
                                            "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-sm",
                                            r.status === 'SENT' ? 'bg-accent/5 border-accent/20 text-accent' :
                                            r.status === 'FAILED' ? 'bg-destructive/5 border-destructive/10 text-destructive' :
                                            'bg-secondary border-border text-muted-foreground/40'
                                        )}>
                                            {r.status === 'SENT' ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Zap size={18} strokeWidth={2.5} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <Typography variant="h4" className="text-sm font-bold tracking-tight truncate">{r.title}</Typography>
                                                <span className={cn(
                                                    "text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest",
                                                    r.status === 'SENT' ? "bg-success/5 text-success border-success/10" : "bg-secondary text-muted-foreground/40 border-border"
                                                )}>{r.status}</span>
                                            </div>
                                            <Typography variant="p" className="text-xs font-medium text-muted-foreground/60 truncate">{r.message}</Typography>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-3 shrink-0 ml-4">
                                            <div className="flex flex-col items-end">
                                                <Typography variant="small" className="text-[10px] font-bold text-foreground uppercase tracking-tight tabular-nums">
                                                    {new Date(r.schedule).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </Typography>
                                                <Typography variant="small" className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest tabular-nums">
                                                    {new Date(r.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </div>
                                            <button onClick={() => handleDelete(r.id)} className="p-2 text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
}

interface AuditKPIProps {
    label: string;
    value: string | number;
    icon: React.ReactElement;
    status: string;
    isAccent?: boolean;
}

function AuditKPI({ label, value, icon, status }: AuditKPIProps) {
    const isOk = ['CONNECTED', 'LINKED', 'STABLE', 'ONLINE'].includes(status);
    return (
        <Card className="hover:border-accent/40 transition-all rounded-2xl bg-white border border-border shadow-subtle group text-left" padding="sm">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground/40 group-hover:bg-accent group-hover:text-white transition-all border border-border">
                    {React.cloneElement(icon, { size: 16, strokeWidth: 2.5 })}
                </div>
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full", 
                    isOk ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                )} />
            </div>
            <div className="space-y-1">
                <Typography variant="small" className="font-bold text-muted-foreground/30 uppercase tracking-widest text-[9px]">{label}</Typography>
                <Typography variant="h4" className="text-base font-bold tracking-tight truncate">{value}</Typography>
                <Typography variant="small" className={cn("font-bold uppercase tracking-widest text-[10px]", isOk ? "text-accent" : "text-orange-500")}>{status}</Typography>
            </div>
        </Card>
    );
}

interface FilterButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
    count: number;
}

function FilterButton({ label, active, onClick, count }: FilterButtonProps) {
    return (
        <button onClick={onClick} className={cn(
            "px-5 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm",
            active ? "bg-white text-primary border border-border" : "text-muted-foreground/40 hover:text-muted-foreground"
        )}>
            {label}
            <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-bold tabular-nums", active ? "bg-secondary text-accent" : "bg-muted-foreground/10")}>{count}</span>
        </button>
    );
}
