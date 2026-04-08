import React from 'react';
import { Bell, TrendingUp, ShieldCheck } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    label: string;
    isGreen?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, label, isGreen }) => (
    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm hover:border-[#25D366] transition-all group">
        <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-inner transition-colors ${
                isGreen ? 'bg-green-50 text-[#25D366]' : 'bg-slate-50 text-slate-400 group-hover:text-[#25D366] group-hover:bg-green-50'
            }`}>
                {icon}
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${isGreen ? 'bg-[#25D366]' : 'bg-slate-200 group-hover:bg-[#25D366]'}`} />
        </div>
        <div className="space-y-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">{title}</p>
            <p className="text-xl font-bold tracking-tight text-[#0F172A]">{value}</p>
            <p className="text-[11px] text-slate-400 font-medium ml-0.5">{label}</p>
        </div>
    </div>
);

interface DashboardStatsGridProps {
    totalReminders: number;
    successRate: number;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ totalReminders, successRate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard 
                title="My Reminders" 
                value={totalReminders} 
                icon={<Bell size={18} />} 
                label="Total scheduled" 
            />
            <KPICard 
                title="Success Rate" 
                value={`${successRate}%`} 
                icon={<TrendingUp size={18} />} 
                label="Delivery accuracy" 
                isGreen 
            />
            <KPICard 
                title="Account Security" 
                value="Protected" 
                icon={<ShieldCheck size={18} />} 
                label="Your data is safe" 
                isGreen 
            />
        </div>
    );
};
