import React from 'react';

interface MonitorCardProps {
    label: string;
    value: number | string;
    color: 'indigo' | 'emerald' | 'amber' | 'cyan';
}

export default function MonitorCard({ label, value, color }: MonitorCardProps) {
    const colorClasses = {
        indigo: 'text-slate-900',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        cyan: 'text-cyan-600'
    };

    const selectedStyle = colorClasses[color] || colorClasses.indigo;

    return (
        <div className="bg-white border border-slate-100 p-12 rounded-[48px] shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-700">
            <div className={`absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-[0.03] transition-all duration-1000 group-hover:scale-150 group-hover:opacity-[0.06] ${color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-900'}`}></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 italic">{label}</p>
            <p className={`text-7xl font-black tracking-tighter ${selectedStyle} relative z-10 italic leading-none`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <div className={`absolute bottom-0 left-12 right-12 h-1.5 rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center ${color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-900'}`} />
        </div>
    );
}
