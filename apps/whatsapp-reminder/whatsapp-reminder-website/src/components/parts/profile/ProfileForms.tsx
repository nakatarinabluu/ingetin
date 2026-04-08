import React from 'react';
import { X, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { FormMode } from '../../../hooks/useProfileAction';

interface ProfileFormsProps {
    formMode: FormMode;
    message: string;
    isAdmin: boolean;
    firstName: string;
    setFirstName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    confirmPassword: string;
    setConfirmPassword: (val: string) => void;
    isUpdating: boolean;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

function InputField({ label, value, onChange, type = "text", placeholder }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                type={type} 
                value={value} 
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] transition-all text-[13px] font-bold text-[#0F172A] outline-none shadow-sm placeholder:text-slate-300"
            />
        </div>
    );
}

export function ProfileForms({ 
    formMode, message, isAdmin, 
    firstName, setFirstName, 
    lastName, setLastName, 
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isUpdating, onCancel, onSubmit
}: ProfileFormsProps) {
    if (formMode === 'none') return null;

    const isPasswordMode = formMode === 'password';

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                    <h3 className="text-[16px] font-bold text-[#0F172A]">
                        {isPasswordMode 
                            ? (isAdmin ? 'Authorize Password Reset' : 'Change Password') 
                            : (isAdmin ? 'Update Admin Account' : 'Edit My Details')}
                    </h3>
                    <button type="button" onClick={onCancel} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {message && (
                    <div className={`p-3.5 rounded-lg flex items-center gap-2.5 text-[12px] font-bold border ${
                        message.includes('successfully') ? 'bg-green-50 text-[#25D366] border-green-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                        {message.includes('successfully') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <p>{message}</p>
                    </div>
                )}

                {isPasswordMode && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-[11px] text-amber-700 font-bold uppercase tracking-tight leading-relaxed">
                            {isAdmin ? 'Warning: Full system root access will be reset using this new administrative key.' : 'Ensure your new password is at least 8 characters long with uppercase and numbers.'}
                        </p>
                    </div>
                )}

                {isPasswordMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label={isAdmin ? "New Admin Key" : "New Password"} value={password} onChange={setPassword} type="password" placeholder="••••••••" />
                        <InputField label={isAdmin ? "Confirm Key" : "Confirm New Password"} value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="••••••••" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="Enter first name" />
                            <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Enter last name" />
                        </div>
                        <InputField label="Email Address" value={email} onChange={setEmail} type="email" />
                    </>
                )}

                <div className="flex items-center gap-3 pt-4">
                    <button 
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 py-3.5 bg-[#25D366] hover:bg-[#1eb956] text-white rounded-xl font-bold text-[13px] shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isUpdating ? 'Saving...' : (isPasswordMode ? 'Update Password' : 'Save Changes')}
                        {!isUpdating && <Save size={16} />}
                    </button>
                    <button type="button" onClick={onCancel} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-all">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
