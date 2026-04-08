import React, { useState } from 'react';
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
    Search,
    ChevronRight,
    X,
    ShieldAlert,
    ShieldCheck,
    History as HistoryIcon
} from 'lucide-react';
import { UserDTO } from '@ingetin/types';
import { useUserReminders, useDeepSyncCalendar, useUserDetails } from '../../../hooks/useWhatsApp';
import { WhatsAppAPI } from '../../../api/services';
import MainAppLayout from '../../../layouts/MainAppLayout';

interface UserEventAuditProps {
    user: UserDTO;
    onBack: () => void;
}

type FilterType = 'ALL' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export default function UserEventAudit({ user, onBack }: UserEventAuditProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [activeHistoryModal, setActiveHistoryModal] = useState<'PHONE' | 'EMAIL' | null>(null);
    
    const { data: remindersData, isLoading: remindersLoading, refetch } = useUserReminders(user.id, {
        page: 1,
        limit: 500
    });
    const { data: userDetailsResponse } = useUserDetails(user.id);
    const detailedUser = userDetailsResponse || user;
    const allReminders = remindersData?.reminders || [];
    
    const filteredData = (allReminders as any[]).filter((r) => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'PENDING') return r.status === 'PENDING' || r.status === 'QUEUED';
        if (activeFilter === 'SUCCESS') return r.status === 'SENT';
        if (activeFilter === 'FAILED') return r.status === 'FAILED';
        if (activeFilter === 'CANCELLED') return r.status === 'CANCELLED';
        return true;
    });

    const { mutate: triggerDeepSync, isPending: isSyncing } = useDeepSyncCalendar();

    const handleDeepSync = () => {
        if (!confirm('Execute full historical synchronization for this account?')) return;
        triggerDeepSync(user.id, {
            onSuccess: (data: any) => {
                alert(`Sync Complete: Found ${data.count} events.`);
                refetch();
            },
            onError: () => alert('Sync Failed')
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this activity record?')) return;
        try {
            await WhatsAppAPI.deleteReminder(id);
            refetch();
        } catch (err) {
            alert('Action failed.');
        }
    };


    return (
        <MainAppLayout 
            title="Account Activity" 
            subtitle={`Investigating @${user.username}`}
        >
            <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 pb-20">
                
                {/* --- COMMAND BAR --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ArrowLeft size={14} />
                            Back to Registry
                        </button>
                        <div className="h-6 w-px bg-slate-200 hidden md:block" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(user.username || 'ingetin').toLowerCase()}`} alt="Avatar" crossOrigin="anonymous" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold text-slate-700 leading-none mb-1">{user.fullName}</p>
                                <p className="text-[12px] text-slate-400 font-medium">@{user.username}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => refetch()}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#25D366] transition-all shadow-sm"
                        >
                            <RefreshCw size={18} className={remindersLoading ? 'animate-spin' : ''} />
                        </button>
                        <button 
                            onClick={handleDeepSync}
                            disabled={isSyncing}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-[#25D366] hover:bg-[#1eb956] text-white rounded-xl text-[12px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <HistoryIcon size={14} className={isSyncing ? 'animate-spin' : ''} />
                            Synchronize
                        </button>
                    </div>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AuditKPI label="Account Email" value={detailedUser?.email || '...'} icon={<Mail size={18} />} status={detailedUser?.email ? 'LINKED' : 'PENDING'} onClick={() => setActiveHistoryModal('EMAIL')} />
                    <AuditKPI label="WhatsApp Link" value={detailedUser?.phoneNumber ? `+${detailedUser.phoneNumber}` : 'No Link'} icon={<Smartphone size={18} />} status={detailedUser?.phoneNumber ? 'CONNECTED' : 'WAITING'} onClick={() => setActiveHistoryModal('PHONE')} />
                    <AuditKPI label="Success Rate" value={allReminders.length > 0 ? `${Math.round((allReminders.filter((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => r.status === 'SENT').length / allReminders.length) * 100)}%` : '100%'} icon={<CheckCircle2 size={18} />} status="STABLE" />
                    <AuditKPI label="Signal Load" value={allReminders.length} icon={<Database size={18} />} status="LOADED" />
                </div>

                {/* --- ACTIVITY REGISTRY --- */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Activity size={18} className="text-[#25D366]" />
                            <h3 className="text-[15px] font-bold text-slate-700 tracking-tight">Account Activity Registry</h3>
                        </div>
                        <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-lg overflow-x-auto w-full md:w-auto">
                            <FilterBtn label="All" active={activeFilter === 'ALL'} onClick={() => setActiveFilter('ALL')} count={allReminders.length} />
                            <FilterBtn label="Success" active={activeFilter === 'SUCCESS'} onClick={() => setActiveFilter('SUCCESS')} count={allReminders.filter((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => r.status === 'SENT').length} />
                            <FilterBtn label="Failed" active={activeFilter === 'FAILED'} onClick={() => setActiveFilter('FAILED')} count={allReminders.filter((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => r.status === 'FAILED').length} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
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
                                {filteredData.map((r: { status?: string, id?: string, title?: string, schedule?: string, at?: string, message?: string, changedAt?: string, old?: string, new?: string }) => (
                                    <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg transition-all group border border-transparent hover:border-slate-100">
                                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                                            r.status === 'SENT' ? 'bg-green-50 border-green-100 text-[#25D366]' :
                                            r.status === 'FAILED' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                            'bg-slate-50 border-slate-100 text-slate-400'
                                        }`}>
                                            {r.status === 'SENT' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[13px] font-bold text-slate-700 truncate">{r.title}</span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                                    r.status === 'SENT' ? 'bg-green-50 text-[#25D366] border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>{r.status}</span>
                                            </div>
                                            <p className="text-[12px] text-slate-400 truncate">{r.message}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-medium text-slate-400 tabular-nums">{new Date(r.schedule).toLocaleString()}</span>
                                            <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- HISTORY MODAL --- */}
            {activeHistoryModal && (
                <HistoryModal 
                    type={activeHistoryModal}
                    data={activeHistoryModal === 'PHONE' ? detailedUser?.phoneHistory : detailedUser?.emailHistory}
                    onClose={() => setActiveHistoryModal(null)}
                />
            )}
        </MainAppLayout>
    );
}

function AuditKPI({ label, value, icon, status, onClick }: any) {
    const isOk = ['CONNECTED', 'LINKED', 'STABLE'].includes(status);
    return (
        <div onClick={onClick} className={`bg-white p-6 border border-slate-200 rounded-xl shadow-sm hover:border-[#25D366] transition-all group ${onClick ? 'cursor-pointer active:scale-95' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-slate-300 group-hover:text-[#25D366] transition-colors">{icon}</div>
                {onClick && <div className="text-[9px] font-bold text-[#25D366] bg-green-50 px-2 py-0.5 rounded uppercase">Logs</div>}
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-[16px] font-bold text-slate-700 truncate">{value}</p>
                <div className="flex items-center gap-1.5 pt-1">
                    <div className={`w-1 h-1 rounded-full ${isOk ? 'bg-[#25D366]' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{status}</span>
                </div>
            </div>
        </div>
    );
}

function FilterBtn({ label, active, onClick, count }: any) {
    return (
        <button onClick={onClick} className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-2 ${active ? 'bg-white border border-[#25D366] text-[#25D366] shadow-sm' : 'border border-transparent text-slate-500 hover:bg-slate-50'}`}>
            {label}
            <span className={`px-1 rounded ${active ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
        </button>
    );
}

function HistoryModal({ type, data, onClose }: any) {
    const history = Array.isArray(data) ? data : [];
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-1">
                        <h3 className="text-[18px] font-bold text-slate-700 tracking-tight">{type === 'PHONE' ? 'Number Registry' : 'Email Protocol'}</h3>
                        <p className="text-[12px] text-slate-400">Historical Change Log</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar space-y-4">
                    {history.length === 0 ? (
                        <div className="py-20 text-center opacity-20"><Activity size={32} className="mx-auto" /></div>
                    ) : history.map((item: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">{new Date(item.at || item.changedAt).toLocaleString()}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] text-slate-400 line-through truncate">{item.old || '---'}</span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="text-[13px] font-bold text-[#25D366] truncate">{item.new}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">Close</button>
                </div>
            </div>
        </div>
    );
}
