import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  MoreVertical
} from 'lucide-react';
import { Transaction } from '../../../types';
import { FINANCE_COPY } from '../../../constants/copy';
import { cn } from '../../../utils/tw.utils';

/**
  * 🚀 THE OFFICIAL WHATSAPP STYLE TRANSACTION HISTORY
  */
export const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  return (
    <div className="space-y-6 text-left">
      
      {/* 01. SECTION HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
         <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{FINANCE_COPY.history.badge_log}</span>
            <div className="px-2 py-0.5 bg-[#f0f2f5] border border-gray-200 rounded-full">
                <span className="text-[#00a884] text-[10px] font-black tabular-nums">{transactions.length} Catatan</span>
            </div>
         </div>
      </div>

      {/* 02. TRANSACTION LIST */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm font-medium text-gray-400">Belum ada riwayat transaksi.</p>
            </div>
        ) : (
            transactions.map((item, idx) => (
                <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
                            item.type === 'INCOME' 
                            ? "bg-[#dcf8c6] text-[#00a884] border-[#00a884]/10" 
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        )}>
                            {item.type === 'INCOME' ? <ArrowDownLeft size={18} strokeWidth={2.5} /> : <ArrowUpRight size={18} strokeWidth={2.5} />}
                        </div>
                        
                        <div className="min-w-0">
                            <h4 className="text-[15px] font-bold text-[#111b21] truncate">{item.title}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                                <span className="text-gray-200">•</span>
                                <span className="text-[10px] font-medium text-gray-400 tabular-nums">{item.date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                            <div className={cn(
                                "text-[15px] font-bold tabular-nums",
                                item.type === 'INCOME' ? "text-[#00a884]" : "text-[#111b21]"
                            )}>
                                {item.type === 'INCOME' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                {item.status === 'SUCCESS' ? (
                                    <div className="flex items-center gap-1 text-[9px] font-black text-[#25D366] uppercase">
                                        <ShieldCheck size={10} />
                                        BERHASIL
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-gray-300 uppercase">
                                        <Clock size={10} />
                                        PROSES
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="p-1.5 text-gray-300 hover:text-[#111b21] transition-colors">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </motion.div>
            ))
        )}
      </div>

      {/* 03. FOOTER */}
      <div className="pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-gray-300">
         <ShieldCheck size={12} />
         <span className="text-[10px] font-bold uppercase tracking-widest">Data Transaksi Terenkripsi</span>
      </div>
    </div>
  );
};
