import React from 'react';

interface ProfileAnalyticsProps {
    totalSchedules: number;
    successRate: number;
}

export function ProfileAnalytics({ totalSchedules, successRate }: ProfileAnalyticsProps) {
    return (
        <div className="pt-6 border-t border-slate-50 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Analytics Overview</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl text-center group hover:bg-[#25D366]/5 transition-colors border border-transparent hover:border-[#25D366]/10">
                    <p className="text-[18px] font-bold text-[#0F172A]">{totalSchedules}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Schedules</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center group hover:bg-[#25D366]/5 transition-colors border border-transparent hover:border-[#25D366]/10">
                    <p className="text-[18px] font-bold text-[#25D366]">{successRate}%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Success</p>
                </div>
            </div>
        </div>
    );
}
