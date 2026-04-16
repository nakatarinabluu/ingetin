import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCheck, ChevronRight, CalendarDays, MessageCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReminderDTO } from '@ingetin/types';
import { cn } from '../../../utils/tw.utils';

interface UpcomingRemindersListProps {
  reminders: ReminderDTO[];
  isLoading: boolean;
}

/**
 * UpcomingRemindersList — WhatsApp Official Style
 */
export const UpcomingRemindersList: React.FC<UpcomingRemindersListProps> = ({ reminders, isLoading }) => {
  return (
    <div className="text-left">
      <div className="divide-y divide-[#f0f2f5]">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <SkeletonReminder key={i} />)
        ) : reminders.length > 0 ? (
          reminders.slice(0, 5).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
            >
              <MiniReminderCard item={item} />
            </motion.div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

function MiniReminderCard({ item }: { item: ReminderDTO }) {
  const scheduleDate = new Date(item.schedule);

  return (
    <div className="flex items-start gap-4 px-5 md:px-6 py-4 hover:bg-[#f0f2f5]/50 transition-colors group">
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-[#00a884]/8 flex items-center justify-center shrink-0 mt-0.5">
        <MessageCircle size={17} className="text-[#00a884]" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[14px] font-semibold text-[#111b21] truncate leading-snug">
            {item.title}
          </h4>
          <div className="shrink-0 text-right">
            <div className="text-xs font-medium text-[#111b21]">
              {scheduleDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] text-[#667781]">
              {scheduleDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
            </div>
          </div>
        </div>
        <p className="text-xs text-[#54656f] mt-0.5 truncate leading-relaxed">
          {item.message}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1 text-[10px] text-[#667781]">
            <Clock size={11} strokeWidth={2} />
            {scheduleDate.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-medium",
            item.status === 'SENT' ? "text-[#128C7E]" : "text-[#00a884]"
          )}>
            <CheckCheck size={11} />
            {item.status === 'SENT' ? 'Terkirim' : 'Aktif'}
          </div>
        </div>
      </div>

      <ChevronRight size={15} className="text-[#e9edef] group-hover:text-[#54656f] transition-colors shrink-0 mt-1" strokeWidth={2} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-14 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-[#f0f2f5] border border-[#e9edef] flex items-center justify-center mx-auto mb-4">
        <CalendarDays size={24} className="text-[#54656f]" strokeWidth={1.5} />
      </div>
      <h4 className="text-[14px] font-semibold text-[#111b21] mb-1">Belum ada agenda</h4>
      <p className="text-xs text-[#54656f] max-w-[220px] mx-auto leading-relaxed mb-4">
        Buat pengingat pertama kamu dan mulai terorganisir dengan WhatsApp.
      </p>
      <Link
        to="/reminders?action=new"
        className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#00a884] text-white text-xs font-semibold rounded-lg hover:bg-[#008069] transition-colors"
      >
        <Plus size={14} strokeWidth={2.5} />
        Buat Agenda
      </Link>
    </div>
  );
}

function SkeletonReminder() {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="w-9 h-9 rounded-xl bg-[#f0f2f5] animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-[#f0f2f5] rounded-md animate-pulse w-3/4" />
        <div className="h-3 bg-[#f0f2f5] rounded-md animate-pulse w-1/2" />
      </div>
    </div>
  );
}
