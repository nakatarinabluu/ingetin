import React from 'react';
import { Lock, Edit3 } from 'lucide-react';

interface ProfileInfoDisplayProps {
    user: any;
    isAdmin: boolean;
    lastSeen: string;
    onStartEditDetails: () => void;
    onStartEditPassword: () => void;
}

function DisplayField({ label, value, className = "" }: any) {
    return (
        <div className={`space-y-1 ${className}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">{label}</p>
            <p className="text-[14px] font-bold text-[#0F172A]">{value || '---'}</p>
        </div>
    );
}

export function ProfileInfoDisplay({ user, isAdmin, lastSeen, onStartEditDetails, onStartEditPassword }: ProfileInfoDisplayProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-10">
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {isAdmin ? 'Administrative Profile' : 'Basic Information'}
                    </h3>
                    <button 
                        onClick={onStartEditDetails}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-[#25D366] hover:text-[#1da851] transition-colors uppercase tracking-widest"
                    >
                        <Edit3 size={12} />
                        Edit Details
                    </button>
                </div>
                <div className="space-y-8">
                    <DisplayField label={isAdmin ? "Account Identity" : "Full Registered Name"} value={user?.fullName} className="md:col-span-2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DisplayField label={isAdmin ? "System Handle" : "Login Username"} value={user?.username} />
                        <DisplayField label="Primary Email" value={user?.email} />
                    </div>
                </div>
            </div>

            <div className="pt-10 border-t border-slate-50 space-y-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Account Security</h3>
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#25D366] shadow-sm">
                            <Lock size={18} />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-[#0F172A]">{isAdmin ? 'Admin Key Protected' : 'Secure Password'}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{isAdmin ? 'Registry update' : 'Last session'}: {lastSeen}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onStartEditPassword}
                        className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-[#0F172A] hover:bg-slate-50 transition-all shadow-sm"
                    >
                        {isAdmin ? 'Reset Root Key' : 'Change Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}
