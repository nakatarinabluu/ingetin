import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2, Clock, Calendar, ChevronLeft, ChevronRight, Hash, Signal, ListTodo } from 'lucide-react';
import { WhatsAppAPI } from '../../../api/services';
import { Modal } from '../../ui';

interface ReminderListProps {
    reminders: any[];
    pagination?: any;
    onPageChange?: (page: number) => void;
    onUpdate: () => void;
}

export default function ReminderList({ reminders, pagination, onPageChange, onUpdate }: ReminderListProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    const executeDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await WhatsAppAPI.deleteReminder(confirmDeleteId);
            onUpdate();
            setConfirmDeleteId(null);
        } catch (err) {
            alert('Failed to delete reminder.');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#25D366] shadow-sm">
                        <ListTodo size={18} />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-bold text-[#0F172A] tracking-tight">My Reminders</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upcoming messages</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 divide-y divide-slate-50 overflow-y-auto custom-scrollbar">
                {!Array.isArray(reminders) || reminders.length === 0 ? (
                    <div className="py-32 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                            <Clock size={36} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No pending reminders scheduled</p>
                    </div>
                ) : (
                    reminders.map(r => (
                        <div key={r.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/30 transition-all duration-300">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${ 
                                    r.status === 'SENT' ? 'bg-green-50 border-green-100 text-[#25D366]' :
                                    r.status === 'FAILED' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                    'bg-white border-slate-100 text-slate-400'
                                }`}>
                                    {r.status === 'SENT' ? <CheckCircle2 size={20} /> : 
                                     r.status === 'FAILED' ? <AlertCircle size={20} /> : 
                                     <Clock size={20} className="animate-pulse" />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-[14px] text-[#0F172A] tracking-tight group-hover:text-[#25D366] transition-colors line-clamp-1">
                                            {r.title} 
                                        </p>
                                        {r.repeat !== 'NONE' && (
                                            <span className="text-[8px] bg-[#0F172A] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                                {r.repeat}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-5 text-slate-400 text-[12px] font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-[#25D366]" /> 
                                        <span>{new Date(r.schedule).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, hourCycle: 'h23' })}</span>
                                    </div>

                                        {r.externalId?.startsWith('google_') && (
                                            <div className="flex items-center gap-1.5 text-[#25D366]/70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" /> 
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Google Sync</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${
                                    r.status === 'SENT' ? 'bg-green-50 text-[#25D366] border-green-100' :
                                    r.status === 'FAILED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                    {r.status === 'SENT' ? 'Sent' : r.status === 'FAILED' ? 'Issue' : 'Waiting'}
                                </span>
                                <button 
                                    onClick={() => handleDelete(r.id)} 
                                    className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <footer className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page <span className="text-[#0F172A]">{pagination.page}</span> of {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button 
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:border-[#25D366] hover:text-[#25D366] disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:border-[#25D366] hover:text-[#25D366] disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </footer>
            )}

            <Modal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                title="Delete Reminder"
                subtitle="Are you sure you want to permanently remove this scheduled reminder?"
                icon={<Trash2 className="text-rose-500" />}
                footer={
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            Keep Reminder
                        </button>
                        <button 
                            onClick={executeDelete}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold text-[13px] shadow-lg transition-all active:scale-[0.98]"
                        >
                            Yes, Delete
                        </button>
                    </div>
                }
            >
                <div />
            </Modal>
        </div>
    );
}