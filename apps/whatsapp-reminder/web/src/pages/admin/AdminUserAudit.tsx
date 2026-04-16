import React, { useState, useMemo } from 'react';
import { AxiosResponse } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Clock, 
    Calendar as CalendarIcon, 
    RefreshCw, 
    Trash2, 
    Shield, 
    AlertCircle, 
    CheckCircle2, 
    User as UserIcon, 
    Mail, 
    Smartphone, 
    Zap, 
    ArrowLeft,
    Database,
    Activity,
    ChevronRight,
    X,
    ShieldAlert,
    History as HistoryIcon,
    Search,
    Filter,
    Terminal
} from 'lucide-react';
import { useUserReminders, useDeepSyncCalendar } from '../../hooks/useReminderHooks';
import { useUserDetails } from '../../hooks/useUserHooks';
import { WhatsAppAPI } from '../../api/whatsapp.api';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/tw.utils';
import type { UserDTO, ApiResponse, ReminderDTO } from '@ingetin/types';
import type { AuditEvent, OperationalHistoryEntry, AuditKPIProps } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { SLIDE_UP, STAGGER_CONTAINER, FADE_IN } from '../../utils/motion';
import { toast } from 'sonner';
import { ADMIN_COPY } from '../../constants/copy';

type FilterType = 'PENDING' | 'SUCCESS' | 'CANCELLED' | 'PAST';

/**
 * 🚀 THE MODERN PRO ADMIN AUDIT - v9.0
 * Deep forensic analysis of operational signals.
 */
export default function AdminUserAudit() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<FilterType>('PENDING');
    const [syncResult, setSyncResult] = useState<{ count: number } | null>(null);
    
    const { data: user, isLoading: userLoading } = useUserDetails(username || '');
    const userId = user?.id;

    const { data: remindersData, isLoading: remindersLoading, refetch } = useUserReminders(userId || '', {
        page,
        limit: 30
    });
    const allReminders = remindersData?.items || [];
    const pagination = remindersData?.pagination;
    
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const combinedActivity = useMemo(() => {
        const systemEvents: AuditEvent[] = [];
        if (user?.phoneHistory) {
            user.phoneHistory.forEach((h: OperationalHistoryEntry) => systemEvents.push({
                id: `phone-${h.at}`,
                title: h.action === 'UNLINK_WHATSAPP' ? 'WhatsApp Unlinked' : 'WhatsApp Linked',
                message: h.action === 'UNLINK_WHATSAPP' ? `Previous: ${h.old}` : `New: ${h.new}`,
                schedule: h.at,
                status: 'SYSTEM',
                type: 'WHATSAPP'
            }));
        }
        if (user?.emailHistory) {
            user.emailHistory.forEach((h: OperationalHistoryEntry) => systemEvents.push({
                id: `email-${h.at}`,
                title: h.action === 'UNLINK_GOOGLE' ? 'Google Unlinked' : 'Email Changed',
                message: h.action === 'UNLINK_GOOGLE' ? `Previous: ${h.old}` : `New: ${h.new}`,
                schedule: h.at,
                status: 'SYSTEM',
                type: 'GOOGLE'
            }));
        }

        return [...allReminders, ...systemEvents].sort((a, b) => 
            new Date(b.schedule).getTime() - new Date(a.schedule).getTime()
        );
    }, [allReminders, user?.phoneHistory, user?.emailHistory]);

    const filteredData = useMemo(() => combinedActivity.filter((r) => {
        if (activeFilter === 'PENDING') return r.status === 'PENDING' || r.status === 'QUEUED';
        if (activeFilter === 'SUCCESS') return r.status === 'SENT' || r.status === 'SYSTEM';
        if (activeFilter === 'CANCELLED') return r.status === 'CANCELLED';
        if (activeFilter === 'PAST') return r.status === 'PAST';
        return true;
    }), [combinedActivity, activeFilter]);

    const { mutate: triggerDeepSync, isPending: isSyncing } = useDeepSyncCalendar();

    const handleFilterChange = (f: FilterType) => {
        setActiveFilter(f);
        setPage(1);
    };

    const handleDeepSync = () => {
        if (!userId) return;
        triggerDeepSync(userId, {
            onSuccess: (res: AxiosResponse<ApiResponse<{ count: number }>>) => {
                if (res.data.success) {
                    setSyncResult({ count: res.data.data.count || 0 });
                    toast.success("Sinkronisasi Audit Berhasil");
                }
                refetch();
            }
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        try {
            await WhatsAppAPI.deleteReminder(deleteId);
            refetch();
            setDeleteId(null);
            toast.success("Sinyal Dicabut");
        } catch (err) {
            setDeleteId(null);
        }
    };

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="flex flex-col min-h-full space-y-12 pb-20 max-w-6xl mx-auto text-left"
        >
            {/* 01. FORENSIC HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
                <div className="space-y-4 text-left">
                    <motion.div variants={SLIDE_UP} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-primary">
                        <Terminal size={12} className="text-accent" />
                        <Typography variant="small" className="font-bold tracking-widest text-[10px] uppercase">{ADMIN_COPY.user_audit.badge}</Typography>
                    </motion.div>
                    
                    <div className="space-y-2">
                        <motion.div variants={SLIDE_UP}>
                            <Typography variant="h1" className="text-4xl md:text-5xl font-bold tracking-tighter">
                                {ADMIN_COPY.user_audit.title} <span className="text-accent">@{username}</span>
                            </Typography>
                        </motion.div>
                        <motion.div variants={FADE_IN}>
                            <Typography variant="p" className="max-w-xl text-muted-foreground font-medium">
                                {ADMIN_COPY.user_audit.desc}
                            </Typography>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={SLIDE_UP} className="flex items-center gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={() => navigate('/admin-user')}
                        className="rounded-xl border border-border"
                        leftIcon={<ArrowLeft size={16} />}
                    >
                        {ADMIN_COPY.user_audit.btn_registry}
                    </Button>
                    <Button 
                      onClick={handleDeepSync}
                      isLoading={isSyncing}
                      className="rounded-xl shadow-modern font-bold px-6"
                      leftIcon={<RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />}
                    >
                        {ADMIN_COPY.user_audit.btn_sync}
                    </Button>
                </motion.div>
            </header>

            {/* 02. AUDIT KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                <AuditKPI label={ADMIN_COPY.user_audit.kpi.account} value={user?.email || '...'} icon={<Mail size={16} />} status={user?.email ? 'LINKED' : 'UNSET'} />
                <AuditKPI label={ADMIN_COPY.user_audit.kpi.wa_link} value={user?.phoneNumber ? `+${user.phoneNumber}` : 'None'} icon={<Smartphone size={16} />} status={user?.phoneNumber ? 'ONLINE' : 'OFFLINE'} isSuccess={!!user?.phoneNumber} />
                <AuditKPI label={ADMIN_COPY.user_audit.kpi.registry_load} value={pagination?.total || 0} icon={<Database size={16} />} status="TOTAL TUGAS" />
                <AuditKPI label={ADMIN_COPY.user_audit.kpi.signal_load} value={filteredData.length} icon={<Activity size={16} />} status="AKTIVITAS LOG" />
            </div>

            {/* 03. OPERATIONAL LOGS */}
            <section className="space-y-8 text-left">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                        <Typography variant="h2" className="text-2xl font-bold tracking-tight">Log Operasional</Typography>
                    </div>
                    <div className="flex bg-secondary p-1 rounded-xl border border-border">
                        <FilterBtn label={ADMIN_COPY.user_audit.filter.pending} active={activeFilter === 'PENDING'} onClick={() => handleFilterChange('PENDING')} />
                        <FilterBtn label={ADMIN_COPY.user_audit.filter.success} active={activeFilter === 'SUCCESS'} onClick={() => handleFilterChange('SUCCESS')} />
                        <FilterBtn label={ADMIN_COPY.user_audit.filter.cancelled} active={activeFilter === 'CANCELLED'} onClick={() => handleFilterChange('CANCELLED')} />
                        <FilterBtn label={ADMIN_COPY.user_audit.filter.history} active={activeFilter === 'PAST'} onClick={() => handleFilterChange('PAST')} />
                    </div>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="wait">
                        {remindersLoading ? (
                            <motion.div key="loading" {...FADE_IN} className="py-20 flex flex-col items-center gap-4">
                                <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                                <Typography variant="small" className="font-bold opacity-30 uppercase tracking-widest">Memuat Log...</Typography>
                            </motion.div>
                        ) : filteredData.length === 0 ? (
                            <motion.div key="empty" {...FADE_IN} className="py-32 text-center flex flex-col items-center gap-6 bg-secondary/20 rounded-2xl border border-dashed border-border p-12">
                                <Zap className="w-12 h-12 text-muted-foreground/20" />
                                <Typography variant="small" className="font-bold opacity-30 uppercase tracking-[0.4em]">{ADMIN_COPY.user_audit.empty}</Typography>
                            </motion.div>
                        ) : (
                            <motion.div key="content" initial="initial" animate="animate" variants={STAGGER_CONTAINER} className="space-y-3">
                                {filteredData.map((r, idx) => (
                                    <motion.div 
                                        key={r.id} 
                                        variants={SLIDE_UP}
                                        transition={{ delay: idx * 0.02 }}
                                        className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 bg-white border border-border rounded-xl hover:border-accent/40 hover:shadow-subtle transition-all"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all shadow-sm",
                                                r.status === 'SENT' || r.status === 'SYSTEM' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-muted-foreground/40'
                                            )}>
                                                {r.status === 'SYSTEM' ? <Shield size={18} strokeWidth={2.5} /> : <Zap size={18} strokeWidth={2.5} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <Typography variant="h4" className="text-sm font-bold tracking-tight text-foreground">{r.title}</Typography>
                                                    <span className={cn(
                                                        "text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest",
                                                        r.status === 'SENT' || r.status === 'SYSTEM' ? "bg-success/5 text-success border-success/10" : "bg-secondary text-muted-foreground/40 border-border"
                                                    )}>{r.status}</span>
                                                </div>
                                                <Typography variant="p" className="text-xs font-medium text-muted-foreground/60 line-clamp-1 max-w-md">{r.message}</Typography>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:flex-row md:items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
                                            <div className="text-right flex flex-col items-end">
                                                <span className="text-[10px] font-bold tabular-nums text-foreground uppercase tracking-tight">
                                                    {new Date(r.schedule).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-muted-foreground/30 text-[9px] font-bold uppercase tracking-widest">
                                                    <Clock size={10} />
                                                    <span>{new Date(r.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => setDeleteId(r.id)} className="p-2.5 bg-destructive/5 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-all border border-destructive/10 opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* SYNC RESULT MODAL */}
            <AnimatePresence>
                {syncResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <Card className="max-w-md w-full p-10 space-y-8 bg-white border border-border shadow-elevated text-center" padding="none">
                                <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mx-auto border border-success/10">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="space-y-2">
                                    <Typography variant="h3" className="text-2xl font-bold tracking-tight">Sinkronisasi Berhasil</Typography>
                                    <Typography variant="p" className="text-sm font-medium text-muted-foreground leading-relaxed px-4">
                                        Sebanyak <span className="text-foreground font-bold">{syncResult.count}</span> aktivitas audit telah disinkronkan dengan presisi.
                                    </Typography>
                                </div>
                                <Button onClick={() => setSyncResult(null)} className="w-full h-12 rounded-xl shadow-modern font-bold uppercase tracking-widest text-[10px]">Lanjutkan Registry</Button>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* REVOKE MODAL */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title={ADMIN_COPY.user_audit.revoke_modal.title}>
                <div className="space-y-6 pt-6">
                    <Typography variant="p" className="text-sm text-muted-foreground leading-relaxed">
                        {ADMIN_COPY.user_audit.revoke_modal.desc}
                    </Typography>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1 h-12 rounded-xl border border-border font-bold">
                            {ADMIN_COPY.user_audit.revoke_modal.btn_cancel}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} className="flex-1 h-12 rounded-xl shadow-md font-bold">
                            {ADMIN_COPY.user_audit.revoke_modal.btn_confirm}
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}

function AuditKPI({ label, value, icon, status, isSuccess, onClick }: AuditKPIProps & { isSuccess?: boolean }) {
    return (
        <Card onClick={onClick} className={cn(
            "p-8 border border-border bg-white hover:border-accent/40 transition-all group h-full flex flex-col justify-between min-h-[220px] shadow-subtle rounded-2xl relative overflow-hidden",
            onClick && "cursor-pointer active:scale-[0.98]"
        )} padding="none">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-accent">
                {icon}
            </div>
            <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground/60 border border-border group-hover:bg-accent group-hover:text-white transition-all">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest",
                    isSuccess ? "bg-success/5 text-success border-success/10" : "bg-secondary text-muted-foreground/40 border-border"
                )}>
                    {status}
                </div>
            </div>
            <div className="space-y-1 relative z-10 text-left">
                <Typography variant="small" className="font-bold text-muted-foreground/30 uppercase tracking-widest text-[9px]">{label}</Typography>
                <Typography variant="h3" className="text-xl font-bold tracking-tight truncate leading-tight">{value}</Typography>
            </div>
        </Card>
    );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} className={cn(
            "h-9 px-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg",
            active ? "bg-white text-primary shadow-subtle border border-border" : "bg-transparent text-muted-foreground/40 hover:text-muted-foreground"
        )}>
            {label}
        </button>
    );
}