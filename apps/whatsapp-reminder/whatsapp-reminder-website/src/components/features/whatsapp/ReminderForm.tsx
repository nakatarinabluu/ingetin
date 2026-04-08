import React, { useState } from 'react';
import { Send, Calendar, MessageSquare, Plus, Zap, Clock, Info, RefreshCw, Smartphone, X } from 'lucide-react';
import { WhatsAppAPI } from '../../../api/services';
import DatePicker from 'react-datepicker';

interface ReminderFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
    hasPhone: boolean;
}

export default function ReminderForm({ onSuccess, onCancel, hasPhone }: ReminderFormProps) {
    const [form, setForm] = useState({ 
        title: '', 
        message: '', 
        date: new Date(), 
        time: '09:00', // 24h string
        repeat: 'NONE' 
    });
    const [busy, setBusy] = useState(false);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 4) val = val.substring(0, 4);
        
        if (val.length >= 3) {
            val = val.substring(0, 2) + ':' + val.substring(2);
        }
        setForm({ ...form, time: val });
    };

    const handleTimeBlur = () => {
        // Validation and formatting on leave
        let [h, m] = form.time.split(':');
        if (!h) h = '00';
        if (!m) m = '00';
        
        let hh = parseInt(h);
        let mm = parseInt(m);
        
        if (isNaN(hh) || hh > 23) hh = 0;
        if (isNaN(mm) || mm > 59) mm = 0;
        
        setForm({ 
            ...form, 
            time: `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}` 
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasPhone) return alert('Link your phone node first!');
        
        setBusy(true);
        try {
            const [hours, minutes] = form.time.split(':').map(Number);
            const combinedDate = new Date(form.date);
            combinedDate.setHours(hours, minutes, 0, 0);

            await WhatsAppAPI.createReminder({ 
                title: form.title,
                message: form.message,
                repeat: form.repeat as any,
                schedule: combinedDate.toISOString(),
                daysOfWeek: []
            });
            setForm({ 
                title: '', 
                message: '', 
                date: new Date(), 
                time: '09:00',
                repeat: 'NONE' 
            });
            onSuccess();
        } catch (err) {
            alert('Failed to schedule reminder.');
        }
        setBusy(false);
    };

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* --- Title --- */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reminder Title</label>
                        <input 
                            placeholder="E.g., Weekly Team Sync..." 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] transition-all text-[14px] font-bold text-[#0F172A] outline-none shadow-sm placeholder:text-slate-300"
                            value={form.title} 
                            onChange={e => setForm({ ...form, title: e.target.value })} 
                            required
                        />
                    </div>
                
                    {/* --- Date --- */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Scheduled Date</label>
                        <div className="relative">
                            <DatePicker
                                selected={form.date}
                                onChange={(date: Date | null) => date && setForm({ ...form, date })}
                                dateFormat="MMMM d, yyyy"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] transition-all text-[13px] font-bold text-[#0F172A] outline-none shadow-sm cursor-pointer"
                                placeholderText="Select date"
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Calendar size={16} />
                            </div>
                        </div>
                    </div>

                    {/* --- Time (Typing 24h) --- */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Scheduled Time (24h Format)</label>
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="HH:MM (e.g. 22:30)"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] transition-all text-[13px] font-bold text-[#0F172A] outline-none shadow-sm"
                                value={form.time}
                                onChange={handleTimeChange}
                                onBlur={handleTimeBlur}
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Clock size={16} />
                            </div>
                        </div>
                    </div>

                    {/* --- Repeat --- */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Repeat Frequency</label>
                        <div className="relative">
                            <select 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] transition-all text-[13px] font-bold text-[#0F172A] outline-none shadow-sm appearance-none cursor-pointer"
                                value={form.repeat}
                                onChange={e => setForm({ ...form, repeat: e.target.value })}
                            >
                                <option value="NONE">Once Only</option>
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <RefreshCw size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Message --- */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                    <textarea 
                        required 
                        className="w-full min-h-[150px] px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] transition-all text-[14px] font-medium text-slate-700 outline-none shadow-sm placeholder:text-slate-300 resize-none" 
                        placeholder="Write your WhatsApp message here..." 
                        value={form.message} 
                        onChange={e => setForm({ ...form, message: e.target.value })} 
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    <button 
                        type="submit"
                        disabled={busy}
                        className="w-full sm:flex-1 py-3 bg-[#25D366] hover:bg-[#1eb956] text-white rounded-xl font-bold text-[13px] shadow-lg shadow-[#25D366]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                    >
                        {busy ? 'Saving...' : 'Create Reminder'}
                        <Send size={16} />
                    </button>
                    {onCancel && (
                        <button 
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
