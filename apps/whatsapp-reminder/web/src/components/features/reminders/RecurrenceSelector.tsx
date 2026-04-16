import React from 'react';
import { 
  Check, 
  Repeat, 
  RotateCcw, 
  CalendarRange, 
  Star,
  Zap
} from 'lucide-react';
import { cn } from '../../../utils/tw.utils';
import { Typography } from '../../ui/Typography';

export type RecurrenceType = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

interface RecurrenceSelectorProps {
  value: RecurrenceType;
  onChange: (v: RecurrenceType) => void;
  selectedDays: number[];
  onDayToggle: (day: number) => void;
}

const RECURRENCE_OPTIONS = [
  { val: 'ONCE', label: 'Sekali', icon: Check },
  { val: 'DAILY', label: 'Harian', icon: Repeat },
  { val: 'WEEKLY', label: 'Mingguan', icon: RotateCcw },
  { val: 'MONTHLY', label: 'Bulanan', icon: CalendarRange },
  { val: 'YEARLY', label: 'Tahunan', icon: Star },
] as const;

const DAYS = [
  { label: 'Min', val: 0 }, { label: 'Sen', val: 1 }, { label: 'Sel', val: 2 },
  { label: 'Rab', val: 3 }, { label: 'Kam', val: 4 }, { label: 'Jum', val: 5 }, { label: 'Sab', val: 6 }
];

/**
 * 🚀 THE MODREN PRO RECURRENCE SELECTOR - v9.0 "Phase Control"
 */
export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({ 
  value, 
  onChange, 
  selectedDays, 
  onDayToggle 
}) => {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-700">
      <div className="flex items-center gap-2 mb-1">
        <Typography variant="small" className="font-black text-gray-400 uppercase tracking-[0.3em] text-[9px] ml-1">
          POLA TRANSMISI / RECURRENCE
        </Typography>
        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {RECURRENCE_OPTIONS.map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val as RecurrenceType)}
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-5 rounded-[1.5rem] border transition-all duration-500 relative group overflow-hidden",
              value === opt.val 
                ? "bg-white border-accent shadow-modern text-accent ring-4 ring-accent/5" 
                : "bg-white/40 backdrop-blur-md border-white/60 text-gray-300 hover:bg-white hover:border-accent/30 hover:shadow-subtle"
            )}
          >
            {value === opt.val && (
              <motion.div layoutId="active-dot" className="absolute top-3 right-3">
                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_#6366f1]" />
              </motion.div>
            )}
            <div className={cn(
              "w-10 h-10 rounded-[1rem] flex items-center justify-center transition-all duration-700", 
              value === opt.val 
                ? "bg-accent text-white shadow-modern rotate-0" 
                : "bg-white border border-gray-100 group-hover:scale-110 group-hover:rotate-6 shadow-subtle text-gray-400"
            )}>
              <opt.icon size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Weekly Days Selector */}
      <AnimatePresence>
        {value === 'WEEKLY' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 overflow-hidden"
          >
            <div className="grid grid-cols-7 gap-3 w-full">
              {DAYS.map((day) => (
                <button
                  key={day.val}
                  type="button"
                  onClick={() => onDayToggle(day.val)}
                  className={cn(
                    "h-12 flex items-center justify-center rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all border",
                    selectedDays.includes(day.val) 
                      ? "bg-[#111b21] border-[#111b21] text-white shadow-modern scale-105" 
                      : "bg-white/60 backdrop-blur-sm border-white/60 text-gray-300 hover:border-accent/40 hover:text-accent"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
