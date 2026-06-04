import { useState } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Plus,
    Key,
    ShieldCheck,
    SearchX,
    Copy,
    Lock
} from 'lucide-react';
import { useLicenseRegistry } from '@/entities/admin/model/hooks';
import { Card, KPICard, Skeleton } from '@/shared/ui';
import { cn } from '@/shared/lib/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ADMIN_COPY } from '@/shared/config/copy';
import { LicenseDTO } from '@ingetin/types';

/**
 * AdminLicenseManager — WhatsApp Official Style
 */
export default function AdminLicenseManager() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVAILABLE' | 'USED'>('ALL');

    const { data: licenseData, isLoading } = useLicenseRegistry(true, {
        page,
        limit: 10,
        search: searchTerm,
        status: activeFilter === 'ALL' ? undefined : activeFilter
    });
    
    const licenses = licenseData?.items || [];
    const pagination = licenseData?.pagination || { totalPages: 1, total: 0 };

    const handleCreateLicense = () => {
        toast.promise(new Promise(res => setTimeout(res, 1500)), {
            loading: 'Membuat lisensi baru...',
            success: 'Lisensi berhasil dibuat.',
            error: 'Gagal membuat lisensi.',
        });
    };

    return (
        <div className="w-full space-y-6 text-left pb-24">

            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wa-border">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                        <Lock size={13} strokeWidth={2} />
                        {ADMIN_COPY.license_manager.badge}
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">{ADMIN_COPY.license_manager.title}</h1>
                    <p className="text-sm text-wa-icon mt-0.5">{ADMIN_COPY.license_manager.desc}</p>
                </div>
                <button
                    onClick={handleCreateLicense}
                    className="shrink-0 h-10 px-5 bg-wa-green text-white text-sm font-semibold rounded-xl hover:bg-wa-green-dark transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                    <Plus size={17} strokeWidth={2.5} />
                    {ADMIN_COPY.license_manager.btn_generate}
                </button>
            </header>

            {/* ─── Stats ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard title="Total Lisensi" value={pagination.total} color="#00a884" icon={Key} />
                <KPICard title="Tersedia" value={licenses.filter(l => l.status === 'AVAILABLE').length} color="#128C7E" icon={ShieldCheck} />
                <KPICard title="Terpakai" value={licenses.filter(l => l.status === 'USED').length} color="#667781" icon={Key} />
                <KPICard title="Halaman" value={`${page} / ${pagination.totalPages}`} color="#25D366" icon={Key} />
            </div>

            {/* ─── Filter + Search ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-1 bg-wa-bg p-1 rounded-xl border border-wa-border">
                    {(['ALL', 'AVAILABLE', 'USED'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => { setActiveFilter(f); setPage(1); }}
                            className={cn(
                                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                                activeFilter === f
                                    ? 'bg-white text-wa-dark shadow-wa border border-wa-border'
                                    : 'text-wa-icon hover:text-wa-dark'
                            )}
                        >
                            {ADMIN_COPY.license_manager.filters[f.toLowerCase() as 'all' | 'available' | 'consumed'] || f}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 w-full sm:max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wa-icon" />
                    <input
                        type="text"
                        placeholder="Cari kunci lisensi..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full h-10 pl-9 pr-4 bg-white border border-wa-border rounded-xl text-sm text-wa-dark placeholder:text-wa-muted focus:outline-none focus:border-wa-green focus:ring-2 focus:ring-wa-green/10 transition-all"
                    />
                </div>
            </div>

            {/* ─── License Grid ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-2xl border border-wa-border" />
                        ))
                    ) : licenses.length > 0 ? licenses.map((item: LicenseDTO, idx: number) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            <LicenseCard item={item} />
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-dashed border-wa-border">
                            <div className="w-16 h-16 bg-wa-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <SearchX size={28} className="text-wa-icon" />
                            </div>
                            <p className="text-sm font-semibold text-wa-icon">{ADMIN_COPY.license_manager.empty}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Pagination ─── */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-wa-border">
                    <span className="text-xs font-medium text-wa-muted">
                        Halaman {page} dari {pagination.totalPages} · {pagination.total} lisensi
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-9 px-4 rounded-xl border border-wa-border bg-white text-wa-icon text-xs font-semibold hover:bg-wa-bg disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Sebelum
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= pagination.totalPages}
                            className="h-9 px-4 rounded-xl border border-wa-border bg-white text-wa-icon text-xs font-semibold hover:bg-wa-bg disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                            Berikutnya <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── License Card ── */
function LicenseCard({ item }: { item: LicenseDTO }) {
    const isAvailable = item.status === 'AVAILABLE';

    const handleCopy = () => {
        navigator.clipboard.writeText(item.key);
        toast.success('Kunci disalin!');
    };

    return (
        <Card className="p-5 border-wa-border shadow-wa bg-white rounded-2xl flex flex-col gap-4 hover:shadow-md transition-all">
            {/* Status + Duration */}
            <div className="flex items-center justify-between">
                <span className={cn(
                    'text-[10px] font-bold px-2.5 py-1 rounded-full border',
                    isAvailable
                        ? 'bg-wa-green-light text-wa-teal border-[#c0eab9]'
                        : 'bg-wa-bg text-wa-icon border-wa-border'
                )}>
                    {isAvailable ? 'Tersedia' : 'Terpakai'}
                </span>
                <span className="text-[11px] font-semibold text-wa-icon">
                    {item.durationMonths} bulan
                </span>
            </div>

            {/* Key */}
            <div className="flex items-center gap-2 bg-wa-bg rounded-xl px-3 py-2 border border-wa-border">
                <Key size={14} className="text-wa-icon shrink-0" />
                <span className="text-[13px] font-mono font-bold text-wa-dark truncate flex-1">{item.key}</span>
                <button onClick={handleCopy} className="shrink-0 text-wa-icon hover:text-wa-green transition-colors">
                    <Copy size={13} />
                </button>
            </div>

            {/* Consumed by */}
            {item.consumedBy ? (
                <div className="flex items-center gap-3 pt-1 border-t border-wa-border">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-wa-border bg-wa-bg shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.consumedBy}`} alt="Avatar" />
                    </div>
                    <div>
                        <p className="text-[11px] text-wa-icon">Dipakai oleh</p>
                        <p className="text-[13px] font-semibold text-wa-dark">@{item.consumedBy}</p>
                    </div>
                </div>
            ) : (
                <div className="pt-1 border-t border-wa-border">
                    <div className="flex items-center gap-2 text-wa-green">
                        <ShieldCheck size={13} strokeWidth={2} />
                        <span className="text-[11px] font-semibold">Menunggu aktivasi</span>
                    </div>
                </div>
            )}
        </Card>
    );
}
