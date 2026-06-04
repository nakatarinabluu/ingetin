import { useState } from 'react';
import {
    Plus,
    Search,
    Calendar,
    Bell,
    List,
} from 'lucide-react';
import { ReminderCard } from '@/entities/reminder/ui/ReminderCard';
import { EmptyState, ErrorState, SkeletonCard } from '@/entities/reminder/ui/ReminderStates';
import { ReminderCalendarView } from '@/features/create-reminder/ui/ReminderCalendarView';
import { CreateReminderModal } from '@/features/create-reminder/ui/CreateReminderModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useReminders, useDeleteReminder } from '@/entities/reminder/model/hooks';
import { REMINDERS_COPY } from '@/shared/config/copy/app';
import { cn } from '@/shared/lib/tw.utils';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { useDebounce } from '@/shared/lib/use-debounce';
import { toast } from 'sonner';
import { ReminderDTO } from '@ingetin/types';

type StatusFilter = 'all' | 'PENDING' | 'SENT';

/**
 * UserReminders — WhatsApp Official Style
 * Featured: List View & Calendar View Dispatcher
 */
export default function UserReminders() {
    const [searchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    
    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get('action') === 'new');
    const [editTarget, setEditTarget] = useState<ReminderDTO | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    const deleteMutation = useDeleteReminder();

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            const successTitle = REMINDERS_COPY.create_modal.toast?.delete_success || "Agenda Dihapus";
            const successDesc = typeof REMINDERS_COPY.create_modal.toast?.delete_desc === 'function' 
                ? REMINDERS_COPY.create_modal.toast.delete_desc(deleteTarget.title)
                : `Agenda "${deleteTarget.title}" telah dihapus.`;

            toast.success(successTitle, {
                description: successDesc
            });
            setDeleteTarget(null);
        } catch (err) {
            toast.error(REMINDERS_COPY.create_modal.toast?.error_delete || "Gagal Menghapus", {
                description: "Terjadi kesalahan saat menghapus agenda."
            });
        }
    };

    const isDeleting = deleteMutation.isPending;

    const { data: remindersRes, isLoading, isError, refetch } = useReminders({
        page,
        limit: viewMode === 'calendar' ? 100 : 8,
        search: debouncedSearch,
        // Fix [UX-03]: 'all' is a UI-only value — omit it so API receives no filter
        status: filterStatus === 'all' ? undefined : filterStatus
    });

    const handleEdit = (reminder: ReminderDTO) => {
        setEditTarget(reminder);
        setIsCreateModalOpen(true);
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setEditTarget(null);
        refetch();
    };

    return (
        <div className="w-full space-y-5 pb-24 text-left">

            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wa-border">
                <div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                        <Bell size={13} strokeWidth={2} />
                        {REMINDERS_COPY.header.badge}
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">Agenda Saya</h1>
                    <p className="text-sm text-wa-icon mt-0.5">
                        {REMINDERS_COPY.header.desc_addon}
                    </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex bg-wa-bg p-1 rounded-xl border border-wa-border mr-2">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-white text-wa-dark shadow-sm" : "text-wa-icon hover:text-wa-dark"
                            )}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('calendar')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'calendar' ? "bg-white text-wa-dark shadow-sm" : "text-wa-icon hover:text-wa-dark"
                            )}
                        >
                            <Calendar size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="shrink-0 h-10 px-5 bg-wa-green text-white text-sm font-semibold rounded-xl hover:bg-wa-green-dark transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={17} strokeWidth={2.5} />
                        Tambah Agenda
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {viewMode === 'list' ? (
                    <motion.div 
                        key="list-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                    >
                        {/* Search bar */}
                        <div className="relative">
                            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wa-icon" strokeWidth={2} />
                            <input
                                type="text"
                                placeholder={REMINDERS_COPY.search_placeholder}
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="w-full h-11 bg-white border border-wa-border rounded-xl pl-10 pr-4 text-[15px] text-wa-dark placeholder:text-wa-muted focus:outline-none focus:border-wa-green focus:ring-2 focus:ring-wa-green/10 transition-all shadow-sm"
                            />
                        </div>

                        {/* Status Tabs */}
                        <div className="flex items-center gap-1 bg-wa-bg p-1 rounded-xl w-fit border border-wa-border">
                            {([
                                { id: 'all',     label: 'Semua' },
                                { id: 'PENDING', label: 'Aktif' },
                                { id: 'SENT',    label: 'Terkirim' },
                            ] as { id: StatusFilter; label: string }[]).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setFilterStatus(tab.id); setPage(1); }}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                                        filterStatus === tab.id
                                            ? 'bg-white text-wa-dark shadow-wa border border-wa-border'
                                            : 'text-wa-icon hover:text-wa-dark'
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Reminder Grid */}
                        <div className="relative border border-wa-border rounded-2xl bg-[#fcfcfc] p-3 md:p-5">
                            <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4 min-h-[300px]">
                                {(() => {
                                    if (isError) return <ErrorState onRetry={refetch} />;
                                    const items = remindersRes?.items || [];
                                    if (isLoading) return [...Array(4)].map((_, i) => <SkeletonCard key={i} />);
                                    if (items.length === 0) return <EmptyState onAdd={() => setIsCreateModalOpen(true)} />;
                                    return items.map((reminder: ReminderDTO, idx: number) => (
                                        <motion.div
                                            key={reminder.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                        >
                                            <ReminderCard
                                                item={reminder}
                                                onEdit={() => handleEdit(reminder)}
                                                onDelete={() => setDeleteTarget({ id: reminder.id, title: reminder.title })}
                                            />
                                        </motion.div>
                                    ));
                                })()}
                            </main>

                            {/* Pagination */}
                            {remindersRes?.pagination?.totalPages && remindersRes.pagination.totalPages > 1 && (
                                <div className="pt-4 mt-1 border-t border-wa-border flex items-center justify-between">
                                    <span className="text-xs text-wa-icon font-medium pl-1">Halaman {page}</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="h-8 px-3 rounded-lg text-xs font-semibold bg-white border border-wa-border text-wa-dark hover:bg-wa-bg disabled:opacity-50 transition-colors"
                                        >
                                            Sebelum
                                        </button>
                                        <button 
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page >= remindersRes.pagination.totalPages}
                                            className="h-8 px-3 rounded-lg text-xs font-semibold bg-white border border-wa-border text-wa-dark hover:bg-wa-bg disabled:opacity-50 transition-colors"
                                        >
                                            Berikutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <ReminderCalendarView 
                        reminders={remindersRes?.items || []} 
                        onEdit={handleEdit} 
                        onAdd={() => setIsCreateModalOpen(true)} 
                    />
                )}
            </AnimatePresence>

            {/* Create / Edit Modal */}
            <CreateReminderModal 
                isOpen={isCreateModalOpen} 
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditTarget(null);
                }} 
                onSuccess={handleCreateSuccess} 
                initialData={editTarget}
            />

            {/* Delete Modal */}
            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Agenda?"
                description={`Agenda "${deleteTarget?.title}" akan dihapus secara permanen.`}
                confirmText="Hapus"
                cancelText="Batal"
                isLoading={isDeleting}
                type="danger"
            />
        </div>
    );
}
