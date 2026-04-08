import React from 'react';

export function TelemetryCard({ title, value, icon, trend, isText = false }: { title: string, value: any, icon: React.ReactNode, trend: string, isText?: boolean }) {
    return (
        <div className="lumina-card p-8 group cursor-default hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-14 h-14 lumina-panel flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-xl group-hover:shadow-emerald-500/20 transition-all duration-500 border-slate-100">
                    {icon}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Telemetry</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{trend}</span>
                </div>
            </div>
            <h4 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2 relative z-10">{title}</h4>
            <div className="flex items-end gap-3 relative z-10">
                <span className={`${isText ? 'text-2xl' : 'text-4xl'} font-black text-slate-900 tracking-tighter italic uppercase`}>{value}</span>
            </div>
            {/* BACKGROUND DECOR */}
            <div className="absolute -right-6 -bottom-6 text-slate-100/50 group-hover:text-emerald-500/10 transition-colors duration-500 pointer-events-none transform scale-150 rotate-12">
                {icon}
            </div>
        </div>
    );
}

export function SimpleMetric({ label, percentage, color }: { label: string, percentage: number, color: string }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                <span>{label}</span>
                <span className="text-slate-900">{percentage}%</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/50 shadow-inner">
                <div 
                    className={`h-full ${color === 'bg-crystal-indigo' ? 'bg-emerald-500' : color} transition-all duration-1000 shadow-sm rounded-full`} 
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
