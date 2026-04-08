import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export default function Button({ 
    children, 
    variant = 'primary', 
    isLoading, 
    icon, 
    className = '', 
    ...props 
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center gap-3 px-8 py-5 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 disabled:opacity-30 disabled:pointer-events-none italic";
    
    const variants = {
        primary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 border-none",
        secondary: "bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 shadow-sm",
        ghost: "bg-transparent text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-none shadow-none"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${className}`} 
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    {icon && <span className="transition-transform group-hover:rotate-12">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
