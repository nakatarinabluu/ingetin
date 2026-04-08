import React from 'react';
import { Smartphone, CalendarCheck, Zap, UserCircle, Key } from 'lucide-react';

interface ProfileAccountSummaryProps {
    user: any;
    isAdmin: boolean;
}

function SimpleStatus({ label, active, icon, text }: { label: string, active: boolean, icon: React.ReactNode, text?: string }) {
    return (
        <div className="flex items-center justify-between group/status">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-green-50 text-[#25D366]' : 'bg-slate-50 text-slate-400'}`}>
                    {icon}
                </div>
                <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-[#0F172A]">{label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{text || (active ? 'Connected' : 'Disconnected')}</p>
                </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#25D366] shadow-[0_0_8px_rgba(37,211,102,0.5)]' : 'bg-slate-200'}`}></div>
        </div>
    );
}

export function ProfileAccountSummary({ user, isAdmin }: ProfileAccountSummaryProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
            {isAdmin ? (
                <div className="space-y-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Access</h3>
                    <div className="space-y-5">
                        <SimpleStatus label="System Tools" active={true} icon={<Zap size={16} />} text="Full Access" />
                        <SimpleStatus label="User Management" active={true} icon={<UserCircle size={16} />} text="Active" />
                        <SimpleStatus label="License Manager" active={true} icon={<Key size={16} />} text="Active" />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Connected Accounts</h3>
                    <div className="space-y-5">
                        <SimpleStatus label="WhatsApp Account" active={!!user?.phoneNumber} icon={<Smartphone size={16} />} />
                        <SimpleStatus label="Google Calendar" active={!!user?.googleRefreshToken} icon={<CalendarCheck size={16} />} />
                    </div>
                </div>
            )}
        </div>
    );
}
