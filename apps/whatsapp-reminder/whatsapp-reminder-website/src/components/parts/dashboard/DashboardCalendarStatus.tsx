import React from 'react';
import { CalendarDays } from 'lucide-react';

interface CalendarEvent {
    id: string;
    title: string;
    schedule: string;
}

interface DashboardCalendarStatusProps {
    events: CalendarEvent[];
}

export const DashboardCalendarStatus: React.FC<DashboardCalendarStatusProps> = ({ events }) => {
    return (
        <div className="bg-[#25D366] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group shadow-slate-900/20">
            <div className="absolute inset-0 wa-chat-pattern opacity-5" />
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                        <CalendarDays size={16} />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">Google Calendar Status</span>
                </div>
                
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <p className="text-[12px] text-white/70 italic font-medium">No Google events found.</p>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="flex items-start gap-3 group/event">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white group-hover/event:scale-125 transition-transform" />
                                <div>
                                    <p className="text-[13px] font-bold text-white line-clamp-1">{event.title}</p>
                                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                                        {new Date(event.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-[11px] text-white/80 font-medium leading-relaxed text-center">
                        Your calendar is automatically synced every minute.
                    </p>
                </div>
            </div>
        </div>
    );
};
