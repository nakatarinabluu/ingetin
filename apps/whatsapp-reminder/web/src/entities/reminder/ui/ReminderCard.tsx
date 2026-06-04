import React from 'react';
import { Clock, Trash2, Edit3, MessageSquare, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { ReminderDTO } from '@ingetin/types';
import { formatDate, formatTime } from '@/shared/lib/format';

import { motion } from 'framer-motion';

interface ReminderCardProps {
  item: ReminderDTO;
  onDelete: (id: string) => void;
  onEdit?: (item: ReminderDTO) => void;
}

/**
 * 🚀 THE MODERN PRO REMINDER CARD - v9.0
 * Clinical, Precise, and Trustworthy.
 */
export const ReminderCard: React.FC<ReminderCardProps> = ({ item, onDelete, onEdit }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white border border-border rounded-2xl p-6 hover:shadow-modern hover:border-accent/40 transition-all duration-300 flex flex-col gap-6 overflow-hidden"
    >
      
      {/* 01. HEADER: IDENTITAS JADWAL */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex flex-col items-center justify-center text-foreground shadow-sm group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-500">
            <span className="text-[10px] font-bold uppercase leading-none opacity-40 group-hover:opacity-60">
              {formatDate(item.schedule, { month: 'short' })}
            </span>
            <h4 className="text-base font-bold leading-none mt-1">
              {formatDate(item.schedule, { day: '2-digit' })}
            </h4>
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-bold tracking-tight mb-0.5 truncate group-hover:text-accent transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground/40">
                <Clock size={11} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tabular-nums tracking-widest uppercase">
                  {formatTime(item.schedule)}
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5 text-muted-foreground/40">
                <Bell size={11} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Pemberitahuan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
              className="p-2.5 rounded-xl text-muted-foreground/20 hover:text-accent hover:bg-accent/5 border border-transparent hover:border-accent/10 transition-all duration-300"
              aria-label="Edit Jadwal"
            >
              <Edit3 size={16} strokeWidth={2.5} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
            className="p-2.5 rounded-xl text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/10 transition-all duration-300"
            aria-label="Hapus Jadwal"
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 02. PESAN TRANSMISI */}
      <div className="bg-secondary/50 rounded-xl p-4 border border-border/40 group-hover:bg-accent/[0.03] group-hover:border-accent/10 transition-colors relative">
        <div className="flex gap-3">
          <MessageSquare size={16} strokeWidth={2.5} className="text-accent/30 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-foreground/70 leading-relaxed line-clamp-2">
            {item.message}
          </p>
        </div>
      </div>

      {/* 03. FOOTER STATUS */}
      <div className="flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-border shadow-sm">
          <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Sinyal Aktif</span>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tight">ID: {item.id.substring(0, 8)}</span>
            <div className="w-6 h-6 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm border border-white/20">
              <span className="text-[10px] font-bold">i</span>
            </div>
        </div>
      </div>

      {/* Status Accent Line */}
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
          <CalendarIcon size={64} />
      </div>
    </motion.div>
  );
};
