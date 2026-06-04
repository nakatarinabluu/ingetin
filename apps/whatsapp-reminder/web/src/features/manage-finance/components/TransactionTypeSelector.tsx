import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';
import { FINANCE_COPY } from '@/shared/config/copy/app';

interface TransactionTypeSelectorProps {
  activeType: 'INCOME' | 'EXPENSE';
  onChange: (type: 'INCOME' | 'EXPENSE') => void;
}

export const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({ activeType, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-wa-bg rounded-xl border border-wa-border">
      <button 
        type="button"
        onClick={() => onChange('EXPENSE')}
        className={cn(
          "flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
          activeType === 'EXPENSE' ? "bg-white text-red-500 shadow-sm border border-red-100" : "text-wa-icon hover:text-wa-dark"
        )}
      >
        <ArrowUpRight size={14} /> {FINANCE_COPY.modal.type_expense}
      </button>
      <button 
        type="button"
        onClick={() => onChange('INCOME')}
        className={cn(
          "flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
          activeType === 'INCOME' ? "bg-white text-wa-green shadow-sm border border-[#c0eab9]" : "text-wa-icon hover:text-wa-dark"
        )}
      >
        <ArrowDownLeft size={14} /> {FINANCE_COPY.modal.type_income}
      </button>
    </div>
  );
};
