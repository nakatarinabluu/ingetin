import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Clock, 
    Calendar, 
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
    History as HistoryIcon
} from 'lucide-react';
import { useUserReminders, useDeepSyncCalendar, useUserDetails } from '../../hooks/useWhatsApp';
import { WhatsAppAPI } from '../../api/services';
import MainAppLayout from '../../layouts/MainAppLayout';

type FilterType = 'PENDING' | 'SUCCESS' | 'CANCELLED' | 'PAST';

export default function AdminUserAudit() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<FilterType>('PENDING');
    const [activeHistoryModal, setActiveHistoryModal] = useState<'PHONE' | 'EMAIL' | null>(null);
    const [syncResult, setSyncResult] = useState<{ count: number } | null>(null);
    
    const { data: userDetails, isLoading: userLoading } = useUserDetails(username || '');
    const user = userDetails;
    const userId = user?.id;

    const { data: remindersData, isLoading: remindersLoading, refetch } = useUserReminders(userId || '', {
        page,
        limit: 30
    });
    const allReminders = remindersData?.reminders || [];
    const pagination = remindersData?.pagination;
    
    // Combine reminders with system history events
    const systemEvents: any[] = [];
    if (user?.phoneHistory) {
        user.phoneHistory.forEach((h: any) => systemEvents.push({
            id: `phone-${h.at}`,
            title: h.action === 'UNLINK_WHATSAPP' ? 'WhatsApp Unlinked' : 'WhatsApp Linked',
            message: h.action === 'UNLINK_WHATSAPP' ? `Previous: ${h.old}` : `New: ${h.new}`,
            schedule: h.at,
            status: 'SYSTEM',
            type: 'WHATSAPP'
        }));
    }
    if (user?.emailHistory) {
        user.emailHistory.forEach((h: any) => systemEvents.push({
            id: `email-${h.at}`,
            title: h.action === 'UNLINK_GOOGLE' ? 'Google Unlinked' : 'Email Changed',
            message: h.action === 'UNLINK_GOOGLE' ? `Previous: ${h.old}` : `New: ${h.new}`,
            schedule: h.at,
            status: 'SYSTEM',
            type: 'GOOGLE'
        }));
    }

    const combinedActivity = [...allReminders, ...systemEvents].sort((a, b) => 
        new Date(b.schedule || b.at).getTime() - new Date(a.schedule || a.at).getTime()
    );

    const filteredData = combinedActivity.filter((r) => {
        if (activeFilter === 'PENDING') return r.status === 'PENDING' || r.status === 'QUEUED';
        if (activeFilter === 'SUCCESS') return r.status === 'SENT' || r.status === 'SYSTEM';
        if (activeFilter === 'CANCELLED') return r.status === 'CANCELLED';
        if (activeFilter === 'PAST') return r.status === 'PAST';
        return true;
    });

    const { mutate: triggerDeepSync, isPending: isSyncing } = useDeepSyncCalendar();

    // Reset to page 1 when filter changes
    const handleFilterChange = (f: FilterType) => {
        setActiveFilter(f);
        setPage(1);
    };

    const handleDeepSync = () => {
        if (!userId) return alert('User context not found.');
        triggerDeepSync(userId, {
            onSuccess: (data: any) => {
                setSyncResult({ count: data.count });
                refetch();
            },
            onError: () => alert('Sync Failed')
        });
    };

    const handleDelete = async (remId: string) => {
        if (!confirm('Permanently delete this activity record?')) return;
        try {
            await WhatsAppAPI.deleteReminder(remId);
            refetch();
        } catch (err) {
            alert('Action failed.');
        }
    };

    return (
        <MainAppLayout 
            title="Account Activity" 
            subtitle={`Investigating @${user?.username || 'user'}`}
        >
            <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8 pb-20">
                
                {/* --- COMMAND BAR --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => navigate('/admin-user')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ArrowLeft size={14} />
                            Back to Registry
                        </button>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(user?.username || 'ingetin').toLowerCase()}`} alt="Avatar" crossOrigin="anonymous" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] md:text-[14px] font-bold text-slate-700 leading-none mb-1 truncate">{user?.fullName || 'Loading...'}</p>
                                <p className="text-[11px] md:text-[12px] text-slate-400 font-medium">@{user?.username || 'username'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => refetch()}
                            title="Refresh UI Data"
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#25D366] transition-all shadow-sm flex items-center gap-2"
                        >
                            <RefreshCw size={18} className={remindersLoading ? 'animate-spin' : ''} />
                            <span className="text-[11px] font-bold text-slate-500 sm:hidden">Refresh</span>
                        </button>
                        <button 
                            onClick={handleDeepSync}
                            disabled={isSyncing}
                            title="Trigger Google Calendar Deep Sync"
                            className="flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-[#25D366] hover:bg-[#1eb956] text-white rounded-xl text-[11px] md:text-[12px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <HistoryIcon size={14} className={isSyncing ? 'animate-spin' : ''} />
                            <span className="whitespace-nowrap">Calendar Sync</span>
                        </button>
                    </div>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <AuditKPI label="Account Email" value={user?.email || '...'} icon={<Mail size={18} />} status={user?.email ? 'LINKED' : 'NOT LINKED'} onClick={() => setActiveHistoryModal('EMAIL')} />
                    <AuditKPI label="WhatsApp Connection" value={user?.phoneNumber ? `+${user.phoneNumber}` : 'No Link'} icon={<Smartphone size={18} />} status={user?.phoneNumber ? 'LINKED' : 'NOT LINKED'} onClick={() => setActiveHistoryModal('PHONE')} />
                    <AuditKPI label="Task Load" value={pagination?.total || 0} icon={<Database size={18} />} status="TOTAL TASKS" />
                    <AuditKPI label="Signal Load" value={pagination?.total || 0} icon={<Activity size={18} />} status="TOTAL ACTIVITY" />
                </div>

                {/* --- ACTIVITY REGISTRY --- */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[500px] md:min-h-[600px]">
                    <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-[#25D366]" />
                            <h3 className="text-[14px] md:text-[15px] font-bold text-slate-700 tracking-tight">Account Activity Registry</h3>
                        </div>
                        <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-lg overflow-x-auto w-full md:w-auto scrollbar-hide">
                            <FilterBtn label="Pending" active={activeFilter === 'PENDING'} onClick={() => handleFilterChange('PENDING')} count={allReminders.filter((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => r.status === 'PENDING' || r.status === 'QUEUED').length} />
                            <FilterBtn label="Success" active={activeFilter === 'SUCCESS'} onClick={() => handleFilterChange('SUCCESS')} count={allReminders.filter((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => r.status === 'SENT' || r.status === 'SYSTEM').length} />
                            <FilterBtn label="Deleted" active={activeFilter === 'CANCELLED'} onClick={() => handleFilterChange('CANCELLED')} count={allReminders.filter((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => r.status === 'CANCELLED').length} />
                            <FilterBtn label="Past" active={activeFilter === 'PAST'} onClick={() => handleFilterChange('PAST')} count={allReminders.filter((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => r.status === 'PAST').length} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1 md:p-2">
                        {remindersLoading ? (
                            <div className="h-full flex items-center justify-center p-20">
                                <div className="w-8 h-8 border-2 border-slate-100 border-t-[#25D366] rounded-full animate-spin" />
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="py-32 text-center opacity-20 space-y-3">
                                <ShieldAlert size={48} className="mx-auto" />
                                <p className="text-[11px] font-bold uppercase tracking-widest">No activity signals</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredData.map((r) => (
                                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:bg-slate-50 rounded-lg transition-all group border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                                                r.status === 'SENT' || r.status === 'PAST' ? 'bg-green-50 border-green-100 text-[#25D366]' :
                                                r.status === 'SYSTEM' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' :
                                                r.status === 'FAILED' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                                'bg-slate-50 border-slate-100 text-slate-400'
                                            }`}>
                                                {r.status === 'SENT' || r.status === 'PAST' ? <CheckCircle2 size={18} /> : 
                                                 r.status === 'SYSTEM' ? <Shield size={18} /> :
                                                 r.status === 'FAILED' ? <AlertCircle size={18} /> : <Clock size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0 sm:hidden">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[13px] font-bold text-slate-700 truncate">{r.title}</span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                                        r.status === 'SENT' || r.status === 'PAST' ? 'bg-green-50 text-[#25D366] border-green-100' :
                                                        r.status === 'SYSTEM' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        r.status === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                        'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}>{r.status === 'SYSTEM' ? 'Security' : r.status}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 tabular-nums">{new Date(r.schedule || r.at).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="hidden sm:flex items-center gap-2 mb-0.5">
                                                <span className="text-[13px] font-bold text-slate-700 truncate">{r.title}</span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                                    r.status === 'SENT' || r.status === 'PAST' ? 'bg-green-50 text-[#25D366] border-green-100' :
                                                    r.status === 'SYSTEM' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                    r.status === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                    'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>{r.status === 'SYSTEM' ? 'Security' : r.status}</span>
                                            </div>
                                            <p className="text-[12px] text-slate-400 line-clamp-2 sm:truncate">{r.message}</p>
                                        </div>

                                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t border-slate-50 sm:border-0">
                                            <span className="hidden sm:block text-[10px] font-medium text-slate-400 tabular-nums">{new Date(r.schedule || r.at).toLocaleString()}</span>
                                            <button 
                                                onClick={() => handleDelete(r.id)} 
                                                className="p-2 text-slate-300 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex items-center gap-2"
                                            >
                                                <span className="text-[10px] font-bold sm:hidden">Delete Record</span>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- PAGINATION --- */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="px-4 md:px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                    disabled={page === 1 || remindersLoading}
                                    onClick={() => { setPage(p => Math.max(1, p - 1)); }}
                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Previous
                                </button>
                                <button 
                                    disabled={page >= pagination.totalPages || remindersLoading}
                                    onClick={() => { setPage(p => p + 1); }}
                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-bold hover:bg-[#1eb956] disabled:opacity-30 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- HISTORY MODAL --- */}
            {activeHistoryModal && (
                <HistoryModal 
                    type={activeHistoryModal}
                    data={activeHistoryModal === 'PHONE' ? user?.phoneHistory : user?.emailHistory}
                    onClose={() => setActiveHistoryModal(null)}
                />
            )}

            {/* --- SYNC RESULT MODAL --- */}
            {syncResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#25D366] mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-[18px] font-black text-slate-700 tracking-tight">Sync Completed</h3>
                            <p className="text-[13px] text-slate-500 leading-relaxed">
                                Historical synchronization finished. We processed <span className="font-bold text-slate-700">{syncResult.count}</span> events from Google Calendar.
                            </p>
                            <button 
                                onClick={() => setSyncResult(null)}
                                className="w-full mt-6 py-3 bg-[#25D366] text-white rounded-xl text-[12px] font-bold shadow-lg shadow-green-100 hover:bg-[#1eb956] transition-all active:scale-95"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainAppLayout>
    );
}

function AuditKPI({ label, value, icon, status, onClick }: { label?: string, value?: string | number, icon?: React.ReactNode, status?: string, onClick?: () => void, active?: boolean, count?: number, type?: string, data?: any[], onClose?: () => void }) {
    const isOk = ['LINKED', 'STABLE'].includes(status);
    return (
        <div onClick={onClick} className={`bg-white p-5 md:p-6 border border-slate-200 rounded-xl shadow-sm hover:border-[#25D366] transition-all group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-slate-300 group-hover:text-[#25D366] transition-colors">{icon}</div>
                {onClick && <div className="text-[9px] font-bold text-[#25D366] bg-green-50 px-2 py-0.5 rounded uppercase">Logs</div>}
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-[15px] md:text-[16px] font-bold text-slate-700 truncate">{value}</p>
                <div className="flex items-center gap-1.5 pt-1">
                    <div className={`w-1 h-1 rounded-full ${isOk ? 'bg-[#25D366]' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{status}</span>
                </div>
            </div>
        </div>
    );
}

function FilterBtn({ label, active, onClick, count }: { label?: string, value?: string | number, icon?: React.ReactNode, status?: string, onClick?: () => void, active?: boolean, count?: number, type?: string, data?: any[], onClose?: () => void }) {
    return (
        <button onClick={onClick} className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-2 flex-shrink-0 ${active ? 'bg-white border border-[#25D366] text-[#25D366] shadow-sm' : 'border border-transparent text-slate-500 hover:bg-slate-50'}`}>
            {label}
            <span className={`px-1 rounded ${active ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
        </button>
    );
}

function HistoryModal({ type, data, onClose }: { label?: string, value?: string | number, icon?: React.ReactNode, status?: string, onClick?: () => void, active?: boolean, count?: number, type?: string, data?: any[], onClose?: () => void }) {
    const history = Array.isArray(data) ? data : [];
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-1">
                        <h3 className="text-[16px] md:text-[18px] font-bold text-slate-700 tracking-tight">{type === 'PHONE' ? 'Number Registry' : 'Email Protocol'}</h3>
                        <p className="text-[11px] md:text-[12px] text-slate-400">Historical Change Log</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-4 md:p-6 max-h-[400px] overflow-y-auto custom-scrollbar space-y-4">
                    {history.length === 0 ? (
                        <div className="py-20 text-center opacity-20"><HistoryIcon size={32} className="mx-auto" /></div>
                    ) : history.map((item: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{new Date((item as { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }).at || (item as { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }).changedAt).toLocaleString()}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] md:text-[12px] text-slate-400 line-through truncate">{(item as { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }).old || '---'}</span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="text-[12px] md:text-[13px] font-bold text-[#25D366] truncate">{(item as { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }).new}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 md:p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">Close Registry</button>
                </div>
            </div>
        </div>
    );
}