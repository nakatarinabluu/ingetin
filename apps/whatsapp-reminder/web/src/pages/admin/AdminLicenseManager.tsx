import React, { useState } from 'react';
import { 
    Search, 
    ChevronLeft, 
    Plus,
    Key,
    RefreshCw,
    ShieldCheck,
    ArrowRight,
    Lock,
    SearchX
} from 'lucide-react';
import { useLicenseRegistry } from '../../hooks/useAdminHooks';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SLIDE_UP, STAGGER_CONTAINER, FADE_IN } from '../../utils/motion';
import { ADMIN_COPY } from '../../constants/copy';

interface License {
    id: string;
    key: string;
    status: 'AVAILABLE' | 'CONSUMED';
    durationMonths: number;
    consumedBy?: string;
}

/**
 * 🚀 THE MODERN PRO LICENSE MANAGER - v9.0
 * Authority persistence & subscription gateway management.
 */
export default function AdminLicenseManager() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVAILABLE' | 'CONSUMED'>('ALL');

    const { data: licenseData, isLoading } = useLicenseRegistry(true, { 
        page, 
        limit: 10,
        search: searchTerm,
        status: activeFilter === 'ALL' ? undefined : activeFilter
    });

    const licenses = (licenseData?.items as unknown as License[]) || [];
    const pagination = licenseData?.pagination || { totalPages: 1, total: 0 };

    const handleCreateLicense = () => {
        toast.promise(new Promise(res => setTimeout(res, 1500)), {
            loading: 'Menghasilkan Kunci Otorisasi...',
            success: 'Lisensi Berhasil Dibuat.',
            error: 'Gagal Menghasilkan Lisensi.',
        });
    };

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="relative min-h-full pb-20 space-y-12 max-w-7xl mx-auto text-left"
        >
            {/* 01. INTEGRATED COMMAND HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-border">
                <div className="space-y-6 text-left">
                    <motion.div variants={SLIDE_UP} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-primary">
                        <Lock size={12} className="text-accent" />
                        <Typography variant="small" className="font-bold tracking-widest text-[10px] uppercase">{ADMIN_COPY.license_manager.badge}</Typography>
                    </motion.div>
                    
                    <div className="space-y-3">
                        <motion.div variants={SLIDE_UP}>
                            <Typography variant="h1" className="text-4xl md:text-6xl font-bold tracking-tighter">{ADMIN_COPY.license_manager.title}</Typography>
                        </motion.div>
                        <motion.div variants={FADE_IN}>
                            <Typography variant="p" className="max-w-xl text-muted-foreground font-medium">
                                {ADMIN_COPY.license_manager.desc}
                            </Typography>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={SLIDE_UP} className="flex items-center gap-3">
                    <Button 
                        onClick={handleCreateLicense}
                        className="rounded-xl shadow-modern font-bold px-10 h-14"
                        leftIcon={<Plus size={18} />}
                    >
                        {ADMIN_COPY.license_manager.btn_generate}
                    </Button>
                </motion.div>
            </header>

            {/* 02. DASHBOARD FILTERS & SEARCH */}
            <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
                <div className="flex bg-secondary p-1.5 rounded-xl border border-border shadow-sm">
                    <FilterBtn active={activeFilter === 'ALL'} onClick={() => { setActiveFilter('ALL'); setPage(1); }} label={ADMIN_COPY.license_manager.filters.all} />
                    <FilterBtn active={activeFilter === 'AVAILABLE'} onClick={() => { setActiveFilter('AVAILABLE'); setPage(1); }} label={ADMIN_COPY.license_manager.filters.available} />
                    <FilterBtn active={activeFilter === 'CONSUMED'} onClick={() => { setActiveFilter('CONSUMED'); setPage(1); }} label={ADMIN_COPY.license_manager.filters.consumed} />
                </div>

                <div className="relative w-full max-w-sm">
                    <Input 
                        placeholder="Cari kunci registry..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        leftIcon={<Search size={18} />}
                        className="rounded-xl shadow-sm h-14"
                    />
                </div>
            </div>

            {/* 03. KEY DIRECTORY GRID */}
            <section className="space-y-8 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                        <Typography variant="h2" className="text-2xl font-bold tracking-tight">{ADMIN_COPY.license_manager.directory_title}</Typography>
                    </div>
                    <Typography variant="small" className="font-bold text-muted-foreground/40 uppercase tracking-widest text-[9px]">
                        {ADMIN_COPY.license_manager.op_log}: {pagination.total} {ADMIN_COPY.license_manager.keys_detected}
                    </Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : licenses.length > 0 ? licenses.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <LicenseCard item={item} />
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-40 text-center flex flex-col items-center gap-6 bg-secondary/20 rounded-2xl border border-dashed border-border px-12">
                                <SearchX className="w-12 h-12 text-muted-foreground/20" />
                                <Typography variant="small" className="font-bold opacity-30 uppercase tracking-[0.4em]">{ADMIN_COPY.license_manager.empty}</Typography>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* PAGINATION */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-12">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="w-12 h-12 rounded-xl border border-border"
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <div className="px-8 py-3 bg-white border border-border text-foreground rounded-xl text-[10px] font-bold tracking-widest shadow-sm">
                            {page} / {pagination.totalPages}
                        </div>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            disabled={page >= pagination.totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="w-12 h-12 rounded-xl border border-border"
                        >
                            <ArrowRight size={18} />
                        </Button>
                    </div>
                )}
            </section>
        </motion.div>
    );
}

function LicenseCard({ item }: { item: License }) {
    const isAvailable = item.status === 'AVAILABLE';
    return (
        <Card className="p-8 border border-border bg-white hover:border-accent/40 transition-all group flex flex-col justify-between h-full min-h-[320px] shadow-subtle rounded-2xl relative overflow-hidden text-left" padding="none">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 text-accent">
                <Key size={64} />
            </div>
            
            <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                    <Typography variant="small" className="font-bold text-muted-foreground/40 uppercase tracking-widest text-[9px]">{ADMIN_COPY.license_manager.card.layer}</Typography>
                    <span className={cn(
                        "text-[9px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest shadow-sm",
                        isAvailable ? "bg-accent text-white border-accent" : "bg-secondary border-border text-muted-foreground/40"
                    )}>
                        {item.status}
                    </span>
                </div>
                
                <div className="space-y-2">
                    <Typography variant="h3" className="text-xl font-mono font-bold tracking-tight text-foreground truncate leading-none pt-4 group-hover:text-accent transition-colors">
                        {item.key}
                    </Typography>
                    <div className="flex items-center gap-2 text-muted-foreground/30">
                        <ShieldCheck size={12} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{ADMIN_COPY.license_manager.card.persistence}: {item.durationMonths} Bulan</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-border/60 space-y-5 relative z-10">
                {item.consumedBy ? (
                    <div className="space-y-3">
                        <Typography variant="small" className="font-bold text-muted-foreground/30 uppercase tracking-widest text-[8px]">{ADMIN_COPY.license_manager.card.identity}</Typography>
                        <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-border/50">
                            <div className="w-10 h-10 rounded-lg bg-white border border-border overflow-hidden shadow-sm">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.consumedBy}&backgroundColor=FFFFFF`} alt="User" />
                            </div>
                            <span className="text-xs font-bold text-foreground">@{item.consumedBy}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                       <Typography variant="small" className="font-bold text-muted-foreground/30 uppercase tracking-widest text-[8px]">Data Operasional</Typography>
                       <div className="bg-success/5 p-4 rounded-xl border border-success/10 border-dashed">
                          <span className="text-[10px] font-bold text-success/60 uppercase tracking-widest">{ADMIN_COPY.license_manager.card.waiting}</span>
                       </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string; }) {
    return (
        <button 
            onClick={onClick} 
            className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest shadow-sm", 
                active ? "bg-white text-primary border border-border" : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
        >
            {label}
        </button>
    );
}

function SkeletonCard() {
    return <div className="h-[320px] bg-secondary animate-pulse rounded-2xl border border-border" />;
}
