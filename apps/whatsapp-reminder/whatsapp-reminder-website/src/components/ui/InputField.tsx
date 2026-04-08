import React from 'react';

interface InputFieldProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    icon?: React.ReactNode;
}

export default function InputField({ 
    label, 
    placeholder, 
    value, 
    onChange, 
    type = "text", 
    required = true,
    icon
}: InputFieldProps) {
    return (
        <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-1 italic">
                {label}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors transition-all duration-500 group-focus-within:rotate-12">
                        {icon}
                    </div>
                )}
                <input 
                    required={required}
                    type={type} 
                    className={`w-full bg-white border border-slate-100 rounded-[20px] py-5 font-black text-sm text-slate-900 focus:outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-slate-200 placeholder:italic ${icon ? 'pl-16' : 'px-8'}`} 
                    placeholder={placeholder} 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                />
            </div>
        </div>
    );
}
