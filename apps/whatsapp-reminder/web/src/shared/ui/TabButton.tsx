import React from 'react';
import { cn } from '@/shared/lib/tw.utils';


/**
 * 🚀 THE MODERN PRO TAB BUTTON - v9.0
 * Performance-driven navigation atom.
 */
interface TabButtonProps {
    label: string;
    icon: React.ElementType;
    active: boolean;
    onClick: () => void;
    count?: number;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, icon: Icon, active, onClick, count }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center justify-between w-full p-4 transition-all duration-300 group rounded-xl",
                active 
                    ? 'bg-primary text-primary-foreground shadow-modern' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border'
            )}
        >
            <div className="flex items-center gap-4">
                <Icon 
                    size={18} 
                    strokeWidth={active ? 2.5 : 2}
                    className={cn(active ? 'text-primary-foreground' : 'text-muted-foreground/40 group-hover:text-primary')} 
                />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  active ? "text-primary-foreground" : "text-muted-foreground/60"
                )}>{label}</span>
            </div>
            
            {count !== undefined && (
                <span className={cn(
                  "text-[10px] font-bold tabular-nums",
                  active ? "text-primary-foreground/40" : "text-muted-foreground/20"
                )}>
                  {count}
                </span>
            )}
            
            {active && (
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full shadow-sm" />
            )}
        </button>
    );
};
