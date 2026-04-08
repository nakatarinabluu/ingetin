import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ConnectionStatusBadgeProps {
    isConnected: boolean;
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ 
    isConnected, 
    label, 
    subLabel, 
    icon 
}) => {
    return (
        <div className="flex items-center gap-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500 ${
                isConnected ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'
            }`}>
                {icon || (isConnected ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />)}
            </div>
            <div>
                <p className="font-bold text-[18px] text-slate-900 tracking-tight leading-none">{label}</p>
                {subLabel && (
                    <p className={`${isConnected ? 'text-emerald-600/60' : 'text-slate-400/60'} text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5`}>
                        {subLabel}
                    </p>
                )}
            </div>
        </div>
    );
};
