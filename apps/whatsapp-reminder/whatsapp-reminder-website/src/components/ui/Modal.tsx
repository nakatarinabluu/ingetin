import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    footer,
    maxWidth = 'max-w-md'
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`bg-white w-full ${maxWidth} rounded-2xl shadow-2xl border border-slate-200 p-8 relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="space-y-1 text-left">
                        <h3 className="text-[18px] font-bold text-slate-700 tracking-tight">{title}</h3>
                        {subtitle && <p className="text-[12px] text-slate-400">{subtitle}</p>}
                    </div>
                    {icon && (
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[#25D366]">
                            {React.isValidElement(icon) 
                                ? React.cloneElement(icon as React.ReactElement<any>, { size: 20, fill: 'currentColor' })
                                : icon
                            }
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Optional Footer */}
                {footer && (
                    <div className="pt-6 mt-6 border-t border-slate-50 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
