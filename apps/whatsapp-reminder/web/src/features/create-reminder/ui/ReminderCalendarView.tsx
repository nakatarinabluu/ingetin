import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ArrowRight, X, MessageCircle, Clock, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/tw.utils';
import { ReminderDTO } from '@ingetin/types';

interface ReminderCalendarViewProps {
    reminders: ReminderDTO[];
    onEdit: (reminder: ReminderDTO) => void;
    onAdd: () => void;
}

export function ReminderCalendarView({ reminders, onEdit, onAdd }: ReminderCalendarViewProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDay, setSelectedDay] = useState<{ day: number; reminders: ReminderDTO[] } | null>(null);

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = currentMonth.getDay(); 
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    // 🚀 PERFORMANCE OPTIMIZATION: Pre-calculate reminders for each day
    const remindersByDay = useMemo(() => {
        const map: Record<number, ReminderDTO[]> = {};
        reminders.forEach(r => {
            const d = new Date(r.schedule);
            if (d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(r);
            }
        });
        return map;
    }, [reminders, currentMonth]);

    return (
        <motion.div 
            key="calendar-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
        >
            <Card className="rounded-2xl border-wa-border shadow-wa bg-white overflow-hidden p-5 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-wa-green/8 rounded-xl flex items-center justify-center text-wa-green">
                            <Calendar size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold text-wa-dark">
                            {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                        </h3>
                    </div>
                    <div className="flex bg-wa-bg p-1 rounded-xl border border-wa-border">
                        <button 
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-wa-icon transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-4 text-[10px] font-black uppercase tracking-widest text-wa-green hover:text-wa-green-dark"
                        >
                            Hari Ini
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-wa-icon transition-all"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-wa-border border border-wa-border rounded-xl overflow-hidden shadow-sm">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                        <div key={day} className="bg-[#fcfcfc] text-center text-[10px] font-black text-wa-muted uppercase py-3 tracking-widest">{day}</div>
                    ))}
                    
                    {paddingDays.map(d => (
                        <div key={`p-${d}`} className="h-24 md:h-32 bg-[#f9f9f9]/50" />
                    ))}
                    
                    {calendarDays.map(day => {
                        const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                        const dayReminders = remindersByDay[day] || [];

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "h-24 md:h-32 bg-white p-2 md:p-3 flex flex-col justify-between transition-colors group relative",
                                    isToday && "bg-wa-green-light/20",
                                    dayReminders.length > 0 && "cursor-pointer hover:bg-wa-bg/60"
                                )}
                                onClick={() => {
                                    if (dayReminders.length > 0)
                                        setSelectedDay({ day, reminders: dayReminders });
                                }}
                            >
                                <span className={cn(
                                    "text-xs md:text-sm font-bold",
                                    isToday ? "text-wa-green" : "text-wa-dark"
                                )}>{day}</span>

                                <div className="space-y-1 overflow-y-auto no-scrollbar max-h-[60%]">
                                    {dayReminders.slice(0, 3).map((r) => (
                                        <div key={r.id} className="h-1.5 md:h-5 w-full bg-wa-green/10 border-l-2 border-wa-green rounded-sm px-1.5 flex items-center">
                                            <span className="hidden md:block text-[9px] font-bold text-wa-green truncate">{r.title}</span>
                                        </div>
                                    ))}
                                    {dayReminders.length > 3 && (
                                        <div className="text-[8px] font-bold text-wa-muted pl-1">+{dayReminders.length - 3} lagi</div>
                                    )}
                                </div>

                                {isToday && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-wa-green rounded-full animate-ping" />}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* ─── Calendar Day Detail Popup ─── */}
            <AnimatePresence>
                {selectedDay && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                            onClick={() => setSelectedDay(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-wa-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-wa-green/10 flex items-center justify-center">
                                        <Calendar size={16} className="text-wa-green" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-wa-dark">
                                            {selectedDay.day} {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-[11px] text-wa-icon">{selectedDay.reminders.length} agenda</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-wa-icon hover:bg-wa-bg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="divide-y divide-wa-border max-h-72 overflow-y-auto">
                                {selectedDay.reminders.map((r) => {
                                    const t = new Date(r.schedule);
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => { onEdit(r); setSelectedDay(null); }}
                                            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-wa-bg transition-colors text-left"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-wa-green/8 flex items-center justify-center shrink-0">
                                                <MessageCircle size={16} className="text-wa-green" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-wa-dark truncate">{r.title}</p>
                                                <p className="text-[11px] text-wa-icon flex items-center gap-1 mt-0.5">
                                                    <Clock size={10} /> {t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                                r.status === 'SENT' ? 'bg-wa-green-light text-wa-teal' : 'bg-wa-bg text-wa-icon'
                                            )}>
                                                {r.status === 'SENT' ? 'Terkirim' : 'Aktif'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="px-5 py-4 bg-wa-bg/50 border-t border-wa-border">
                                <button
                                    onClick={() => { onAdd(); setSelectedDay(null); }}
                                    className="w-full h-10 bg-wa-green text-white text-sm font-semibold rounded-xl hover:bg-wa-green-dark transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Tambah Agenda
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
