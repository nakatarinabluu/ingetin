import React from 'react';
import { CheckCircle2, Circle, Smartphone, Calendar, ArrowRight, ShieldCheck, Zap, Link } from 'lucide-react';

interface SetupChecklistProps {
    hasPhone: boolean;
    hasGoogle: boolean;
    onConnectGoogle: () => void;
    customClass?: string;
}

export default function SetupChecklist({ hasPhone, hasGoogle, onConnectGoogle, customClass = '' }: SetupChecklistProps) {
    const isComplete = hasPhone && hasGoogle;

    const baseClass = customClass || 'p-6 rounded-2xl border border-slate-200 shadow-sm';

    if (isComplete) {
        return (
            <div className={`${baseClass} bg-[#25D366] text-white border-0 flex items-center justify-between group overflow-hidden relative shadow-xl shadow-green-500/10`}>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-700">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold tracking-tight leading-none mb-1">Protocols Active</h3>
                        <p className="text-white/80 text-[11px] font-medium">All systems are synchronized and ready.</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-4 text-white/5 pointer-events-none">
                    <ShieldCheck size={180} />
                </div>
            </div>
        );
    }

    return (
        <div className={`${baseClass} relative overflow-hidden bg-white border border-slate-200`}>
            <header className="mb-6 relative z-10">
                <div className="flex items-center gap-3 mb-1.5">
                     <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-[#25D366] border border-slate-100">
                        <Zap size={16} fill="currentColor" />
                     </div>
                     <h3 className="text-[16px] font-bold text-[#0F172A] tracking-tight">System Integration</h3>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-12">Initialize communication streams</p>
            </header>

            <div className="space-y-4 relative z-10 ml-1">
                {/* STEP 1: WHATSAPP */}
                <div className={`p-4 rounded-xl border transition-all duration-500 ${hasPhone ? 'bg-green-50/30 border-green-100' : 'bg-white border-slate-100 group'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${hasPhone ? 'bg-[#25D366] text-white shadow-lg shadow-green-500/20' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#0F172A] text-[13px] tracking-tight mb-0.5">WhatsApp Account</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{hasPhone ? 'Linked & Verified' : 'Awaiting Connection'}</p>
                            </div>
                        </div>
                        {hasPhone ? (
                            <CheckCircle2 className="text-[#25D366]" size={18} />
                        ) : (
                            <Circle className="text-slate-100 animate-pulse" size={18} />
                        )}
                    </div>
                </div>

                {/* STEP 2: GOOGLE CALENDAR */}
                <button 
                    onClick={!hasGoogle ? onConnectGoogle : undefined}
                    disabled={hasGoogle}
                    className={`w-full p-4 rounded-xl border transition-all duration-500 text-left ${hasGoogle ? 'bg-green-50/30 border-green-100 cursor-default' : 'bg-white border-slate-100 hover:border-[#25D366]/30 hover:shadow-lg hover:shadow-slate-200/50 group/btn'}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-700 ${hasGoogle ? 'bg-[#25D366] text-white shadow-lg shadow-green-500/20' : 'bg-slate-50 text-slate-300 border border-slate-100 group-hover/btn:text-[#25D366] group-hover/btn:bg-[#25D366]/5 group-hover/btn:rotate-12'}`}>
                                <Calendar size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#0F172A] text-[13px] tracking-tight mb-0.5">Google Calendar</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{hasGoogle ? 'Stream Synchronized' : 'Connect Calendar'}</p>
                            </div>
                        </div>
                        {hasGoogle ? (
                            <CheckCircle2 className="text-[#25D366]" size={18} />
                        ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center group-hover/btn:text-[#25D366] group-hover/btn:bg-[#25D366]/10 transition-colors">
                                <Link size={14} />
                            </div>
                        )}
                    </div>
                </button>
            </div>
            
            <div className="absolute top-0 right-0 p-6 text-slate-50 pointer-events-none">
                <ShieldCheck size={140} />
            </div>
        </div>
    );
}
