import React from 'react';
import { Save, ShieldAlert } from 'lucide-react';
import { FormMode } from '../../../hooks/useProfileAction';

interface ProfileConfirmModalProps {
    show: boolean;
    formMode: FormMode;
    isAdmin: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ProfileConfirmModal({ show, formMode, isAdmin, onConfirm, onCancel }: ProfileConfirmModalProps) {
    if (!show) return null;

    const isPasswordMode = formMode === 'password';

    return (
        <div className="fixed inset-0 z-[100] backdrop-blur-sm bg-slate-900/40 flex items-center justify-center p-6">
            <div className="bg-white max-w-sm w-full p-8 text-center rounded-2xl shadow-2xl border border-slate-100">
                <div className="w-16 h-16 bg-[#25D366] rounded-xl flex items-center justify-center text-white shadow-xl mx-auto mb-6">
                    {isPasswordMode && isAdmin ? <ShieldAlert size={28} /> : <Save size={28} />}
                </div>
                <h2 className="text-[20px] font-bold text-[#0F172A] mb-2 tracking-tight">
                    {isPasswordMode ? (isAdmin ? 'Reset System Key?' : 'Change Password?') : 'Confirm Update'}
                </h2>
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-8">
                    {isPasswordMode 
                        ? (isAdmin ? 'This will update your root key and require immediate re-authentication.' : 'Are you sure you want to change your password?')
                        : (isAdmin ? 'Apply changes to administrative registry?' : 'Update your personal profile information?')}
                </p>
                <div className="space-y-2">
                    <button 
                        onClick={onConfirm}
                        className="bg-[#25D366] hover:bg-[#1eb956] text-white w-full py-3.5 rounded-lg font-bold text-[13px] shadow-lg transition-all active:scale-[0.98]"
                    >
                        {isPasswordMode && isAdmin ? 'Authorize Change' : 'Confirm & Save'}
                    </button>
                    <button 
                        onClick={onCancel}
                        className="bg-white border border-slate-200 text-slate-500 w-full py-3.5 rounded-lg font-bold text-[13px] hover:bg-slate-50 transition-all"
                    >
                        Cancel Request
                    </button>
                </div>
            </div>
        </div>
    );
}
