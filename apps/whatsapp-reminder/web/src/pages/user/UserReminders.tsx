import React, { useState } from 'react';
import {
    Plus,
    Search,
    Calendar,
    MessageCircle,
    Clock,
    MoreVertical,
    CheckCheck,
    Bell,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { CreateReminderModal } from '../../components/features/reminders/CreateReminderModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useReminders } from '../../hooks/useReminderHooks';
import { REMINDERS_COPY } from '../../constants/copy';
import { cn } from '../../utils/tw.utils';

/**
 * UserReminders — WhatsApp Official Style
 */
export default function UserReminders() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get('action') === 'new');

    const { data: remindersRes, isLoading, refetch } = useReminders({
        page,
        limit: 8,
        search
    });

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        if (searchParams.get('action') === 'new') {
            setSearchParams({});
        }
    };

    const handleCreateSuccess = () => {
        refetch();
        closeCreateModal();
    };

    return (
        <div className="w-full space-y-5 pb-24 text-left">

            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e9edef]">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#00a884] mb-2">
                        <Bell size={13} strokeWidth={2} />
                        {REMINDERS_COPY.header.badge}
                    </div>
                    <h1 className="text-2xl font-bold text-[#111b21]">Agenda Saya</h1>
                    <p className="text-sm text-[#54656f] mt-0.5">
                        {REMINDERS_COPY.header.desc_addon}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="shrink-0 h-10 px-5 bg-[#00a884] text-white text-sm font-semibold rounded-xl hover:bg-[#008069] transition-colors inline-flex items-center gap-2"
                >
                    <Plus size={17} strokeWidth={2.5} />
                    Tambah Agenda
                </button>
            </header>

            {/* ─── Search bar ─── */}
            <div className="relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#54656f]" strokeWidth={2} />
                <input
                    type="text"
                    placeholder={REMINDERS_COPY.search_placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 bg-white border border-[#e9edef] rounded-xl pl-10 pr-4 text-[15px] text-[#111b21] placeholder:text-[#667781] focus:outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/10 transition-all"
                />
            </div>

            {/* ─── Reminder Grid ─── */}
            <main className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    ) : remindersRes?.items.length === 0 ? (
                        <div className="col-span-full py-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#f0f2f5] flex items-center justify-center mx-auto mb-4">
                                <MessageCircle size={28} className="text-[#54656f]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[16px] font-semibold text-[#111b21] mb-1.5">
                                {REMINDERS_COPY.empty.title}
                            </h3>
                            <p className="text-sm text-[#54656f] mb-5 max-w-xs mx-auto">
                                {REMINDERS_COPY.empty.desc}
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-10 px-5 bg-[#00a884] text-white text-sm font-semibold rounded-xl hover:bg-[#008069] transition-colors inline-flex items-center gap-2"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                {REMINDERS_COPY.empty.btn_init}
                            </button>
                        </div>
                    ) : (
                        remindersRes?.items.map((reminder, idx) => {
                            const date = new Date(reminder.schedule);
                            const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                            const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <motion.div
                                    key={reminder.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                                >
                                    <Card className="p-5 border-[#e9edef] shadow-wa hover:shadow-wa-md transition-shadow rounded-2xl bg-white flex flex-col gap-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-[#00a884]/8 flex items-center justify-center shrink-0">
                                                    <MessageCircle size={18} className="text-[#00a884]" strokeWidth={2} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-[15px] font-semibold text-[#111b21] truncate leading-snug">{reminder.title}</h3>
                                                    <span className="text-xs text-[#667781]">#{reminder.id.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <button className="w-8 h-8 flex items-center justify-center text-[#54656f] hover:text-[#111b21] hover:bg-[#f0f2f5] rounded-lg transition-colors shrink-0">
                                                <MoreVertical size={17} strokeWidth={2} />
                                            </button>
                                        </div>

                                        {/* Message bubble */}
                                        <div className="bg-[#f0f2f5] rounded-2xl rounded-tl-sm px-4 py-3 relative">
                                            <p className="text-sm text-[#111b21] leading-relaxed pr-12">
                                                {reminder.message}
                                            </p>
                                            <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[#667781]">
                                                <span className="text-[10px] tabular-nums">{formattedTime}</span>
                                                <CheckCheck size={13} className={cn(
                                                    reminder.status === 'SENT' ? "text-[#00a884]" : "text-[#667781]/50"
                                                )} />
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-[#667781]">
                                                    <Calendar size={13} strokeWidth={2} />
                                                    {formattedDate}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-[#667781]">
                                                    <Clock size={13} strokeWidth={2} />
                                                    {formattedTime}
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                reminder.status === 'SENT'
                                                    ? "bg-[#128C7E]/8 text-[#128C7E]"
                                                    : "bg-[#00a884]/8 text-[#00a884]"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    reminder.status === 'SENT' ? "bg-[#128C7E]" : "bg-[#00a884] animate-pulse"
                                                )} />
                                                {reminder.status === 'SENT' ? 'Terkirim' : 'Aktif'}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </main>

            {/* Footer note */}
            <p className="text-xs text-[#667781] text-center pt-2">
                {REMINDERS_COPY.footer.secured}
            </p>

            <CreateReminderModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="h-[180px] rounded-2xl bg-[#f0f2f5] animate-pulse border border-[#e9edef]" />
    );
}
