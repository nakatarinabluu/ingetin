import React from 'react';
import { ShieldCheck, ShieldAlert, Zap, Edit3 } from 'lucide-react';

interface ProfileHeaderProps {
    user: any;
    isAdmin: boolean;
    memberSince: string;
    formMode: string;
}

export function ProfileHeader({ user, isAdmin, memberSince, formMode }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-slate-100">
            <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-slate-50 group transition-all duration-500 hover:scale-105">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(user?.username || 'ingetin').toLowerCase()}`} 
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#25D366] rounded-lg border-2 border-white flex items-center justify-center text-white shadow-lg">
                    {isAdmin ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                </div>
            </div>

            <div className="text-center md:text-left space-y-1 flex-1">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 ${isAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-green-50 text-[#25D366] border border-green-100'} text-[8px] font-bold uppercase tracking-widest rounded-full mb-1`}>
                    <Zap size={10} fill="currentColor" /> {isAdmin ? 'System Root' : 'Verified Member'}
                </div>
                <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A] leading-tight">{user?.fullName}</h1>
                <p className="text-[12px] text-slate-400 font-medium">@{user?.username} • {isAdmin ? 'System access active since' : 'Member since'} {memberSince}</p>
            </div>
        </div>
    );
}
