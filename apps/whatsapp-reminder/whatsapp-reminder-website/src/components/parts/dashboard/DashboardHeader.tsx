import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
    firstName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ firstName }) => {
    const navigate = useNavigate();
    
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
                    Hello, {firstName}! 👋
                </h1>
                <p className="text-slate-500 text-[13px] font-medium">Your account is ready and active today.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/reminders?mode=create')}
                    className="bg-[#25D366] hover:bg-[#1eb956] text-white px-6 py-2.5 rounded-xl font-bold text-[12px] shadow-lg shadow-[#25D366]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 group whitespace-nowrap"
                >
                    <Plus size={16} />
                    Create New Reminder
                </button>
            </div>
        </div>
    );
};
