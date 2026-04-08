import React from 'react';

interface StatusBadgeProps {
    status: 'SENT' | 'FAILED' | 'PENDING' | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        SENT: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        FAILED: 'bg-rose-50 text-rose-600 border-rose-100',
        PENDING: 'bg-slate-50 text-slate-500 border-slate-100',
        USED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        PAUSED: 'bg-amber-50 text-amber-600 border-amber-100',
        REVOKED: 'bg-rose-50 text-rose-600 border-rose-100',
        AVAILABLE: 'bg-white text-slate-400 border-slate-100'
    };

    const currentStyle = styles[status] || styles.AVAILABLE;

    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border italic ${currentStyle} shadow-sm transition-all duration-300`}>
            {status === 'SENT' || status === 'DELIVERED' ? 'Handshake Succeeded' : 
             status === 'USED' ? 'Active Matrix' :
             status === 'AVAILABLE' ? 'Pulse Standby' :
             status === 'PAUSED' ? 'Signal Halted' :
             status === 'REVOKED' ? 'Registry Revoked' : status}
        </span>
    );
}
