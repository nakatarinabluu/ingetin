import React from 'react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

export default function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button 
            onClick={onClick} 
            className={`flex items-center gap-4 px-8 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 w-full italic group relative overflow-hidden ${
                active 
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/10' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100'
            }`}
        >
            <span className={`transition-all duration-500 ${active ? 'text-emerald-500 scale-110' : 'text-slate-300 group-hover:text-slate-500'}`}>{icon}</span>
            <span className="relative z-10">{label}</span>
            {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-500 rounded-full" />}
        </button>
    );
}
