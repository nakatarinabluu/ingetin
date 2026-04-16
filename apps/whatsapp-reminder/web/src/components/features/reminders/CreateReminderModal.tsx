import React from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  ShieldCheck, 
  CalendarPlus, 
  Clock, 
  Zap, 
  Info 
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Typography } from '../../ui/Typography';
import { cn } from '../../../utils/tw.utils';
import { REMINDERS_COPY } from '../../../constants/copy';
import { RecurrenceSelector } from './RecurrenceSelector';

const reminderSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  message: z.string().min(5, "Pesan minimal 5 karakter"),
  date: z.string().optional(),
  time: z.string().min(1, "Jam harus diisi"),
  recurrence: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  selectedDays: z.array(z.number()).default([]),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ReminderFormValues) => void;
}

/**
 * 🚀 THE MODREN PRO CREATE MODAL - v9.0 "Mission Control"
 */
export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      recurrence: 'ONCE',
      selectedDays: [],
    }
  });

  const recurrence = watch('recurrence');
  const selectedDays = watch('selectedDays');

  const onSubmit = async (data: ReminderFormValues) => {
    try {
      // Simulation of API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess(data);
      toast.success("Protokol Berhasil Dideploy", {
        description: "Jadwal transmisi kini telah aktif di infrastruktur asisten."
      });
      onClose();
    } catch (err) {
      toast.error("Gagal Menginisialisasi Jadwal");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={REMINDERS_COPY.create_modal.title} 
      subtitle={REMINDERS_COPY.create_modal.subtitle || "Inisialisasi protokol komunikasi baru untuk asisten WhatsApp Anda."}
      icon={<Zap className="text-accent" />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 pt-4 text-left">
        
        {/* 01. COMMAND INPUTS */}
        <div className="space-y-10">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">{REMINDERS_COPY.create_modal.input_title}</label>
                <div className="relative group">
                    <div className="absolute inset-0 bg-accent/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input 
                        {...field}
                        placeholder={REMINDERS_COPY.create_modal.placeholder_title} 
                        className={cn(
                            "w-full bg-white/50 border border-gray-100 focus:border-accent focus:ring-4 focus:ring-accent/5 rounded-[1.5rem] p-6 text-xl font-black text-[#111b21] outline-none transition-all placeholder:text-gray-200 relative z-10",
                            errors.title && "border-red-200 focus:border-red-400 focus:ring-red-50"
                        )}
                    />
                </div>
                {errors.title && <p className="text-[10px] text-red-500 font-black ml-1 uppercase tracking-widest">{errors.title.message}</p>}
              </div>
            )}
          />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">
                  {REMINDERS_COPY.create_modal.label_message}
                </label>
                <div className="w-1.5 h-1.5 rounded-full bg-accent/20" />
            </div>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <div className="relative group">
                    <div className="absolute inset-0 bg-accent/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <textarea 
                        {...field}
                        className={cn(
                            "w-full bg-white/50 border border-gray-100 focus:border-accent focus:ring-4 focus:ring-accent/5 rounded-[1.5rem] p-6 text-xl font-bold text-[#111b21] outline-none transition-all placeholder:text-gray-200 resize-none min-h-[160px] relative z-10",
                            errors.message && "border-red-200 focus:border-red-400 focus:ring-red-50"
                        )}
                        placeholder={REMINDERS_COPY.create_modal.placeholder_message}
                    />
                </div>
              )}
            />
            {errors.message && <p className="text-[10px] text-red-500 font-black ml-1 uppercase tracking-widest">{errors.message.message}</p>}
          </div>

          <div className="pt-4">
            <Controller
                name="recurrence"
                control={control}
                render={({ field }) => (
                <RecurrenceSelector 
                    value={field.value} 
                    onChange={field.onChange}
                    selectedDays={selectedDays}
                    onDayToggle={(day) => {
                    const newDays = selectedDays.includes(day)
                        ? selectedDays.filter(d => d !== day)
                        : [...selectedDays, day];
                    setValue('selectedDays', newDays);
                    }}
                />
                )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {(recurrence === 'ONCE' || recurrence === 'MONTHLY' || recurrence === 'YEARLY') && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">
                     {recurrence === 'ONCE' ? REMINDERS_COPY.create_modal.label_date_once : REMINDERS_COPY.create_modal.label_date_recur} 
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <input 
                      {...field}
                      type="date" 
                      className="w-full bg-white/50 border border-gray-100 focus:border-accent focus:ring-4 focus:ring-accent/5 rounded-2xl p-5 text-sm font-black text-[#111b21] outline-none transition-all"
                    />
                  )}
                />
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">
                  {REMINDERS_COPY.create_modal.label_time} 
              </label>
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <input 
                    {...field}
                    type="time" 
                    className="w-full bg-white/50 border border-gray-100 focus:border-accent focus:ring-4 focus:ring-accent/5 rounded-2xl p-5 text-sm font-black text-[#111b21] outline-none transition-all"
                  />
                )}
              />
              {errors.time && <p className="text-[10px] text-red-500 font-black ml-1 uppercase tracking-widest">{errors.time.message}</p>}
            </div>
          </div>
        </div>

        {/* 04. DEPLOY ACTION */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <button 
                type="button"
                onClick={onClose}
                className="h-14 px-8 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
                PULANG / BATAL
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="wa-btn-primary h-16 px-12 text-[12px] font-black uppercase tracking-[0.3em] shadow-modern disabled:opacity-50 flex items-center gap-4 active:scale-95 transition-all w-full sm:w-auto"
            >
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <Zap size={20} className="fill-current" />
                )}
                {REMINDERS_COPY.create_modal.btn_submit}
            </button>
        </div>

        <div className="flex items-center justify-center gap-3 opacity-30 pt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00a884] shadow-[0_0_8px_#00a884]" />
            <Typography variant="small" className="font-black text-[9px] uppercase tracking-[0.2em] text-gray-400">{REMINDERS_COPY.create_modal.footer_note}</Typography>
        </div>
      </form>
    </Modal>
  );
};
