import React from 'react';
import { cn } from '@/shared/lib/tw.utils';
import { FINANCE_CATEGORIES } from '@/shared/config/constants';
import { FINANCE_COPY } from '@/shared/config/copy/app';

interface TransactionCategorySelectorProps {
  activeType: 'INCOME' | 'EXPENSE';
  activeCategory: string;
  onChange: (category: string) => void;
}

export const TransactionCategorySelector: React.FC<TransactionCategorySelectorProps> = ({ activeType, activeCategory, onChange }) => {
  const categories = activeType === 'INCOME' ? FINANCE_CATEGORIES.INCOME : FINANCE_CATEGORIES.EXPENSE;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 flex flex-col justify-end">
        <label className="text-[14px] font-medium text-wa-dark ml-1">{FINANCE_COPY.modal.input_category}</label>
        <select 
          value={activeCategory}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 bg-white border border-wa-border rounded-lg px-3 text-[15px] font-normal text-wa-dark focus:border-wa-green focus:ring-3 focus:ring-wa-green/10 transition-all duration-150 outline-none"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {categories.map(cat => (
          <button 
            key={cat} type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-all border",
              activeCategory === cat 
                ? "bg-wa-dark text-white border-wa-dark" 
                : "bg-white text-wa-muted border-wa-border hover:border-wa-green hover:text-wa-green"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
