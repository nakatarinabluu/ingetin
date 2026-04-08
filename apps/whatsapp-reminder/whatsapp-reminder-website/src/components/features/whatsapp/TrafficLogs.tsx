import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Activity, ChevronLeft, ChevronRight, Inbox, Hash } from 'lucide-react';

interface MessagesProps {
    messages: any[];
    pagination?: any;
    onPageChange?: (page: number) => void;
}

export default function TrafficLogs({ messages, pagination, onPageChange }: MessagesProps) {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                {!Array.isArray(messages) || messages.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 lumina-panel rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner bg-slate-50/50">
                            <Inbox size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Buffer Stream Empty</p>
                    </div>
                ) : (
                    messages.map((msg: any) => (
                        <div key={msg.id} className="p-6 flex items-start gap-5 group hover:bg-slate-50/30 transition-all duration-500 relative">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border transition-all duration-700 group-hover:scale-105 ${
                                msg.direction === 'INBOUND' 
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                    : 'bg-white border-slate-100 text-emerald-500'
                            }`}>
                                {msg.direction === 'INBOUND' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <header className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                            msg.direction === 'INBOUND' 
                                                ? 'border-emerald-200 text-emerald-600 bg-emerald-50' 
                                                : 'border-slate-200 text-slate-500 bg-white shadow-sm'
                                        }`}>
                                            {msg.direction}
                                        </span>
                                        <span className="text-[12px] text-slate-900 font-bold tracking-tight truncate">
                                            {msg.sender?.name || msg.sender?.phoneNumber || 'Unknown Unit'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                                        {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </header>
                                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 group-hover:border-emerald-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-emerald-500/5 transition-all duration-500">
                                    <p className="text-slate-700 text-[13px] leading-relaxed font-medium tracking-tight break-words">{msg.body}</p>
                                </div>
                            </div>
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-emerald-500 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-center" />
                        </div>
                    ))
                )}
            </div>

            {/* TRAFFIC NAVIGATION */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <Hash size={14} className="text-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             Vector <span className="text-emerald-600">{Math.min(pagination.total, (pagination.page - 1) * pagination.limit + 1)}</span> to {Math.min(pagination.total, pagination.page * pagination.limit)} of {pagination.total}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-20 transition-all text-slate-400 shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-20 transition-all text-emerald-500 shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
