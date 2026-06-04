import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    RefreshCw, 
    Trash2, 
    Shield, 
    Zap, 
    ArrowLeft,
    Database,
    Activity,
    Mail, 
    Smartphone, 
    CheckCircle2,
    Terminal
} from 'lucide-react';
import { useUserReminders, useDeepSyncCalendar } from '@/entities/reminder/model/hooks';
import { useUserDetails } from '@/entities/admin/model/hooks';
// Fix [TS-04]: ChatAPI was imported but never used
import { ReminderAPI } from '@/entities/reminder/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Modal } from '@/shared/ui/Modal';
import { cn } from '@/shared/lib/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type FilterType = 'PENDING' | 'SUCCESS' | 'CANCELLED' | 'PAST';

interface ActivityEvent {
    id: string;
    title: string;
    message: string;
    schedule: string | Date;
    status: string;
    type: string;
}

/**
 * 🚀 ADMIN USER AUDIT — WHATSAPP OFFICIAL STYLE
 * Concept: Clinical, Minimal, Stable.
 */
export default function AdminUserAudit() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [page] = useState(1);
    const [activeFilter, setActiveFilter] = useState<FilterType>('PENDING');
    const [syncResult, setSyncResult] = useState<{ count: number } | null>(null);
    
    // Fix [L-02]: use null instead of '' so that `enabled: !!userId` guard works
    const { data: user } = useUserDetails(username ?? null);
    const userId = user?.id ?? null;

    // Fix [L-03]: same as above for useUserReminders
    const { data: remindersData, isLoading: remindersLoading, refetch } = useUserReminders(userId, {
        page,
        limit: 30
    });
    const allReminders = remindersData?.items || [];
    
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const combinedActivity = useMemo(() => {
        const systemEvents: ActivityEvent[] = [];
        if (user?.phoneHistory) {
            user.phoneHistory.forEach((h) => systemEvents.push({
                id: `phone-${h.at}`,
                title: h.action === 'UNLINK_WHATSAPP' ? 'WA Terputus' : 'WA Terhubung',
                // Fix: h.old/h.new are optional in HistoryEntry — use ?? fallback
                message: h.action === 'UNLINK_WHATSAPP' ? `Lama: ${h.old ?? '-'}` : `Baru: ${h.new ?? '-'}`,
                schedule: h.at,
                status: 'SYSTEM',
                type: 'WHATSAPP'
            }));
        }
        
        // Map reminders to ActivityEvent format
        const reminderEvents: ActivityEvent[] = allReminders.map(r => ({
            id: r.id,
            title: r.title,
            message: r.message,
            schedule: r.schedule,
            status: r.status,
            type: 'REMINDER'
        }));

        return [...reminderEvents, ...systemEvents].sort((a, b) => 
            new Date(b.schedule).getTime() - new Date(a.schedule).getTime()
        );
    }, [allReminders, user?.phoneHistory]);

    const filteredData = useMemo(() => combinedActivity.filter((r) => {
        if (activeFilter === 'PENDING') return r.status === 'PENDING' || r.status === 'QUEUED';
        if (activeFilter === 'SUCCESS') return r.status === 'SENT' || r.status === 'SYSTEM';
        if (activeFilter === 'CANCELLED') return r.status === 'CANCELLED';
        if (activeFilter === 'PAST') return r.status === 'PAST';
        return true;
    }), [combinedActivity, activeFilter]);

    const { mutate: triggerDeepSync, isPending: isSyncing } = useDeepSyncCalendar();

    const handleDeepSync = () => {
        if (!userId) return;
        triggerDeepSync(userId, {
            onSuccess: (res) => {
                // res is { synced: number } from UserAPI.deepSync
                const count = res?.synced ?? 0;
                setSyncResult({ count });
                toast.success('Audit disinkronkan');
                refetch();
            }
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        // Fix [L-04]: was missing try/catch — API failure would leave UI broken
        try {
            await ReminderAPI.deleteReminder(deleteId);
            refetch();
            toast.success('Tugas dicabut');
        } catch {
            toast.error('Gagal mencabut tugas. Coba lagi.');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="w-full space-y-6 text-left">
            
            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wa-border">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                        <Terminal size={13} />
                        Audit Aktivitas Identitas
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">
                        Log Audit: <span className="text-wa-green">@{username}</span>
                    </h1>
                    <p className="text-sm text-wa-icon">Analisis riwayat transmisi dan perubahan profil operasional.</p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <button 
                        onClick={() => navigate('/admin-users')}
                        className="h-10 px-4 bg-white border border-wa-border text-wa-icon text-sm font-semibold rounded-xl hover:bg-wa-bg transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Registry
                    </button>
                    <button 
                        onClick={handleDeepSync}
                        disabled={isSyncing}
                        className="h-10 px-4 bg-wa-green text-white text-sm font-semibold rounded-xl hover:bg-wa-green-dark transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={cn(isSyncing && "animate-spin")} />
                        Sinkron Audit
                    </button>
                </div>
            </header>

            {/* ─── Info Grid ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard title="Email Akun" value={user?.email || '...'} icon={Mail} color="#00a884" />
                <KPICard title="WhatsApp" value={user?.phoneNumber ? `+${user.phoneNumber}` : 'None'} icon={Smartphone} color="#128C7E" />
                <KPICard title="Total Tugas" value={allReminders.length} icon={Database} color="#667781" />
                <KPICard title="Aktivitas Log" value={filteredData.length} icon={Activity} color="#25D366" />
            </div>

            {/* ─── Logs Section ─── */}
            <Card className="rounded-2xl border-wa-border shadow-wa overflow-hidden bg-white">
                <CardHeader className="p-5 md:p-6 border-b border-wa-border flex-row items-center justify-between mb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-wa-green/8 flex items-center justify-center">
                            <Activity size={18} className="text-wa-green" />
                        </div>
                        <CardTitle className="text-[15px] font-semibold text-wa-dark">Aliran Operasional</CardTitle>
                    </div>
                    <div className="flex bg-wa-bg p-1 rounded-lg border border-wa-border gap-1">
                        <FilterBtn label="Pending" active={activeFilter === 'PENDING'} onClick={() => setActiveFilter('PENDING')} />
                        <FilterBtn label="Selesai" active={activeFilter === 'SUCCESS'} onClick={() => setActiveFilter('SUCCESS')} />
                        <FilterBtn label="Riwayat" active={activeFilter === 'PAST'} onClick={() => setActiveFilter('PAST')} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-wa-border">
                        <AnimatePresence mode="wait">
                            {remindersLoading ? (
                                <div className="py-20 text-center"><RefreshCw className="mx-auto w-6 h-6 text-wa-green animate-spin" /></div>
                            ) : filteredData.length === 0 ? (
                                <div className="py-20 text-center text-sm font-semibold text-wa-muted">Log audit kosong</div>
                            ) : (
                                filteredData.map((r) => (
                                    <motion.div 
                                        key={r.id} 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-5 flex items-center justify-between hover:bg-[#fcfcfc] transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                                                r.status === 'SENT' || r.status === 'SYSTEM' ? 'bg-wa-dark text-white' : 'bg-wa-bg text-[#94a3b8]'
                                            )}>
                                                {r.status === 'SYSTEM' ? <Shield size={16} /> : <Zap size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-[13px] font-bold text-wa-dark truncate">{r.title}</p>
                                                    <span className={cn(
                                                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border",
                                                        r.status === 'SENT' || r.status === 'SYSTEM' ? "bg-wa-green-light text-wa-teal border-[#c0eab9]" : "bg-wa-bg text-[#94a3b8] border-wa-border"
                                                    )}>{r.status}</span>
                                                </div>
                                                <p className="text-[11px] text-wa-muted truncate max-w-md">{r.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 shrink-0">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-wa-dark uppercase">{new Date(r.schedule).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                                <p className="text-[9px] text-[#94a3b8] font-bold">{new Date(r.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <button onClick={() => setDeleteId(r.id)} className="p-2 text-wa-muted hover:text-red-500 transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* Sync Result Modal */}
            <AnimatePresence>
                {syncResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <Card className="w-full max-w-sm p-8 text-center rounded-3xl shadow-xl bg-white border border-wa-border">
                            <div className="w-14 h-14 bg-wa-green-light text-wa-green rounded-2xl flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={28} /></div>
                            <h3 className="text-lg font-bold text-wa-dark mb-2">Sinkronisasi Berhasil</h3>
                            <p className="text-sm text-wa-muted mb-6">Sebanyak {syncResult.count} aktivitas audit telah diperbarui.</p>
                            <button onClick={() => setSyncResult(null)} className="w-full h-11 bg-wa-dark text-white font-bold rounded-xl text-xs uppercase tracking-widest">Tutup</button>
                        </Card>
                    </div>
                )}
            </AnimatePresence>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Revoke">
                <div className="space-y-4 pt-4">
                    <p className="text-sm text-wa-muted">Apakah Anda yakin ingin membatalkan tugas operasional ini secara permanen?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteId(null)} className="flex-1 h-11 bg-wa-bg text-wa-icon font-bold rounded-xl text-xs">Batal</button>
                        <button onClick={handleDeleteConfirm} className="flex-1 h-11 bg-red-500 text-white font-bold rounded-xl text-xs">Ya, Revoke</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string; }) {
    return (
        <div className="bg-white border border-wa-border rounded-xl p-4 shadow-wa text-left">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${color}12` }}><Icon size={18} style={{ color }} /></div>
            <div className="text-xl font-bold text-wa-dark leading-none truncate">{value}</div>
            <div className="text-[10px] text-wa-icon mt-1 font-semibold uppercase tracking-wider">{title}</div>
        </div>
    );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} className={cn(
            "h-8 px-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md",
            active ? "bg-white text-wa-dark shadow-sm border border-wa-border" : "text-[#94a3b8] hover:text-wa-dark"
        )}>{label}</button>
    );
}
