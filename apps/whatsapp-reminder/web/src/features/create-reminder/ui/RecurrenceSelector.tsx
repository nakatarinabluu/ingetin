import React from 'react';
import { Check, Repeat, RotateCcw, CalendarRange, Star } from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';

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

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({ 
  value, 
  onChange, 
  selectedDays, 
  onDayToggle 
}) => {
  return (
    <div className="space-y-3 text-left">
      <label className="text-sm font-semibold text-wa-dark block">
        Perulangan
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {RECURRENCE_OPTIONS.map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val as RecurrenceType)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer",
              value === opt.val 
                ? "bg-wa-green/10 border-wa-green text-wa-green" 
                : "bg-white border-wa-border text-wa-icon hover:bg-wa-bg"
            )}
          >
            <opt.icon size={18} strokeWidth={2.5} />
            <span className="text-[12px] font-semibold">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Weekly Days Selector */}
      {value === 'WEEKLY' && (
        <div className="pt-3">
          <label className="text-sm font-medium text-wa-icon block mb-2">
            Pilih Hari
          </label>
          <div className="grid grid-cols-7 gap-2 w-full">
            {DAYS.map((day) => (
              <button
                key={day.val}
                type="button"
                onClick={() => onDayToggle(day.val)}
                className={cn(
                  "h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all border cursor-pointer",
                  selectedDays.includes(day.val) 
                    ? "bg-wa-green border-wa-green text-white" 
                    : "bg-white border-wa-border text-wa-icon hover:bg-wa-bg"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
