import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/tw.utils';
import { Typography } from './Typography';

interface ConnectionStatusBadgeProps {
    isConnected: boolean;
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
    className?: string;
}

/**
 * 🚀 THE MODERN PRO CONNECTION BADGE - v9.0
 */
export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ 
    isConnected, 
    label, 
    subLabel, 
    icon,
    className
}) => {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-subtle transition-all duration-500 border",
                isConnected 
                    ? 'bg-success/5 text-success border-success/10' 
                    : 'bg-secondary text-muted-foreground border-border'
            )}>
                {icon || (isConnected ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />)}
            </div>
            <div className="min-w-0">
                <Typography variant="h4" className="text-sm font-bold tracking-tight truncate leading-tight">
                    {label}
                </Typography>
                {subLabel && (
                    <Typography variant="small" className={cn(
                        "text-[10px] font-bold mt-1 truncate uppercase tracking-widest",
                        isConnected ? 'text-success' : 'text-muted-foreground/60'
                    )}>
                        {subLabel}
                    </Typography>
                )}
            </div>
        </div>
    );
};
