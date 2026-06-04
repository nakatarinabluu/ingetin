import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';
import React from 'react';

interface KPICardProps {
    title: string;
    value: React.ReactNode;
    icon: LucideIcon;
    color: string;
    path?: string;
    className?: string;
    desc?: string;
}

/**
 * 📊 KPICard — Standardized Dashboard Metric Card
 * Consistent with WhatsApp Official Aesthetic.
 */
export function KPICard({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    className,
    desc
}: KPICardProps) {
    return (
        <div className={cn(
            "bg-white border border-wa-border rounded-xl p-4 shadow-wa hover:shadow-wa-md transition-all",
            className
        )}>
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${color}12` }}
            >
                <Icon size={18} strokeWidth={2} style={{ color }} />
            </div>
            <div className="text-xl font-bold text-wa-dark leading-none">{value}</div>
            <div className="text-xs text-wa-icon mt-1 font-medium">{title}</div>
            {desc && <div className="text-[10px] text-[#94a3b8] mt-1 uppercase tracking-widest font-bold">{desc}</div>}
        </div>
    );
}
