import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  MoreVertical,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { FinanceTransactionDTO } from '@ingetin/types';
import { cn } from '@/shared/lib/tw.utils';

import { formatIDR } from '@/shared/lib/format';

/**
  * 🚀 SMART TRANSACTION LOG — WHATSAPP STYLE
  * Featured: Type Filtering & Cashflow Summary to avoid clutter.
  */
export const TransactionHistory: React.FC<{ transactions: FinanceTransactionDTO[], hideFilter?: boolean }> = ({ transactions }) => {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  const itemsPerPage = 8;
  
  // Filter logic
  const filteredTransactions = transactions.filter(t => {
      if (filterType === 'ALL') return true;
      return t.type === filterType;
  });

  // Calculate quick summary for the filtered list
  const totalIn = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 text-left">
      
      {/* 01. QUICK CASHFLOW SUMMARY (To give context before the list) */}
      <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="p-3 bg-wa-green-light/40 border border-[#c0eab9] rounded-2xl flex flex-col">
              <div className="flex items-center gap-1.5 text-wa-teal mb-1">
                  <TrendingUp size={12} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Total Masuk</span>
              </div>
              <p className="text-sm font-black text-wa-dark">Rp {formatIDR(totalIn)}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex flex-col">
              <div className="flex items-center gap-1.5 text-red-500 mb-1">
                  <TrendingDown size={12} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Total Keluar</span>
              </div>
              <p className="text-sm font-black text-wa-dark">Rp {formatIDR(totalOut)}</p>
          </div>
      </div>

      {/* 02. TYPE FILTERS (The 'anti-clutter' mechanism) */}
      <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-1 bg-wa-bg p-1 rounded-xl border border-wa-border">
              <FilterButton label="Semua" active={filterType === 'ALL'} onClick={() => setFilterType('ALL')} />
              <FilterButton label="Pemasukan" active={filterType === 'INCOME'} onClick={() => setFilterType('INCOME')} />
              <FilterButton label="Pengeluaran" active={filterType === 'EXPENSE'} onClick={() => setFilterType('EXPENSE')} />
          </div>
          <div className="text-[10px] font-bold text-wa-muted uppercase tracking-widest px-2">
              {filteredTransactions.length} Data
          </div>
      </div>

      {/* 03. TRANSACTION LIST */}
      <div className="space-y-1">
        <AnimatePresence mode="wait">
            {filteredTransactions.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center space-y-4 bg-[#fcfcfc] rounded-2xl border border-dashed border-wa-border">
                    <p className="text-sm font-medium text-wa-muted">Tidak ada transaksi kategori ini.</p>
                    <button className="h-9 px-4 bg-wa-green text-white text-xs font-semibold rounded-lg hover:bg-wa-green-dark transition-colors mt-2">
                        + Catat Transaksi
                    </button>
                </motion.div>
            ) : (
                <div className="divide-y divide-wa-bg">
                    {paginatedTransactions.map((item) => (
                        <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group flex items-center justify-between py-4 hover:bg-[#fcfcfc] transition-all px-2 rounded-xl"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                                    item.type === 'INCOME' 
                                    ? "bg-wa-green-light text-wa-teal border-[#c0eab9]" 
                                    : "bg-wa-bg text-wa-icon border-wa-border"
                                )}>
                                    {item.type === 'INCOME' ? <ArrowDownLeft size={18} strokeWidth={2.5} /> : <ArrowUpRight size={18} strokeWidth={2.5} />}
                                </div>
                                
                                <div className="min-w-0">
                                    <h4 className="text-[14px] font-bold text-wa-dark truncate group-hover:text-wa-green transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-wa-muted uppercase tracking-wider">{item.category}</span>
                                        <span className="text-wa-border">•</span>
                                        <span className="text-[10px] font-bold text-[#94a3b8] tabular-nums">{new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right">
                                    <div className={cn(
                                        "text-[15px] font-black tabular-nums",
                                        item.type === 'INCOME' ? "text-wa-green" : "text-wa-dark"
                                    )}>
                                        {item.type === 'INCOME' ? '+' : '-'} Rp {formatIDR(item.amount)}
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        <span className={cn(
                                            "text-[8px] font-black px-1 py-0.5 rounded border",
                                            item.status === 'SUCCESS' ? "bg-wa-green-light text-wa-teal border-[#c0eab9]" : "bg-wa-bg text-[#94a3b8] border-wa-border"
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-2 text-wa-border hover:text-wa-icon transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
      </div>

      {/* 04. FOOTER & PAGINATION */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-wa-bg flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Halaman {page} dari {totalPages}</span>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 px-4 rounded-lg bg-white border border-wa-border text-wa-dark text-xs font-bold disabled:opacity-50 hover:bg-wa-bg transition-colors"
                >
                    Prev
                </button>
                <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 px-4 rounded-lg bg-white border border-wa-border text-wa-dark text-xs font-bold disabled:opacity-50 hover:bg-wa-bg transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                active 
                    ? "bg-white text-wa-dark shadow-sm border border-wa-border" 
                    : "text-wa-muted hover:text-wa-dark"
            )}
        >
            {label}
        </button>
    );
}
