import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AuthInputFieldProps {
    label: string;
    type?: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    children?: React.ReactNode;
    isValid?: boolean | null;
    error?: string;
}

export const AuthInputField: React.FC<AuthInputFieldProps> = ({ 
    label, 
    type = "text", 
    value, 
    onChange, 
    placeholder, 
    children, 
    isValid, 
    error 
}) => {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                {error && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{error}</span>}
            </div>
            <div className="relative">
                <input 
                    type={type}
                    required
                    placeholder={placeholder}
                    className={`w-full bg-white border ${isValid === true ? 'border-emerald-500' : isValid === false ? 'border-rose-500' : 'border-slate-200'} rounded-lg px-4 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-[#25D366] transition-all placeholder:text-slate-300 shadow-sm`}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isValid === true && <CheckCircle2 size={16} className="text-[#25D366]" />}
                    {isValid === false && <XCircle size={16} className="text-rose-500" />}
                    {children}
                </div>
            </div>
        </div>
    );
};
