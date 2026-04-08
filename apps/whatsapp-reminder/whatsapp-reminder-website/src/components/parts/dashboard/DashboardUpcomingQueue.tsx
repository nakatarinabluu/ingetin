import React from 'react';
import { ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReminderList from '../../features/whatsapp/ReminderList';

interface DashboardUpcomingQueueProps {
    reminders: any[];
    onUpdate: () => void;
}

export const DashboardUpcomingQueue: React.FC<DashboardUpcomingQueueProps> = ({ reminders, onUpdate }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full min-h-[600px]">
            <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <ListTodo size={16} className="text-[#25D366]" />
                    <span className="text-[14px] font-bold text-[#0F172A] tracking-tight">Upcoming Transmissions</span>
                </div>
                <Link to="/reminders" className="text-[10px] font-bold text-[#25D366] uppercase tracking-widest hover:underline">
                    View Full Registry →
                </Link>
            </header>
            <div className="flex-1 overflow-y-auto">
                <ReminderList 
                    reminders={reminders} 
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
};
