import React, { useState } from 'react';
import { 
    Search, 
    MoreVertical, 
    Shield, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    SearchX,
    Activity,
    Users,
    UserPlus,
    UserCheck,
    Filter,
    ShieldAlert,
    ExternalLink,
    Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAllUsers } from '../../hooks/useUserHooks';
import { UserAPI } from '../../api/user.api';
import { UserDTO, Role } from '@ingetin/types';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SLIDE_UP, STAGGER_CONTAINER, FADE_IN } from '../../utils/motion';

/**
 * 🚀 THE MODERN PRO ADMIN REGISTRY - v9.0
 * Concept: Clinical Authority & Intelligence.
 */
export default function AdminUserManager() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const { data: userData, isLoading, refetch } = useAllUsers(true, { 
        page, 
        limit: 10,
        search: searchTerm 
    });

    const users = userData?.items || [];

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="relative min-h-full pb-20 space-y-12 max-w-7xl mx-auto"
        >
            {/* 01. INTEGRATED HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-border">
                <div className="space-y-6 text-left">
                    <motion.div variants={SLIDE_UP} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-primary">
                        <Shield size={12} className="text-accent" />
                        <Typography variant="small" className="font-bold tracking-widest text-[10px] uppercase">Pusat Otoritas Identitas</Typography>
                    </motion.div>
                    
                    <div className="space-y-3">
                        <motion.div variants={SLIDE_UP}>
                            <Typography variant="h1" className="text-4xl md:text-6xl font-bold tracking-tighter">Manajemen Pengguna</Typography>
                        </motion.div>
                        <motion.div variants={FADE_IN}>
                            <Typography variant="p" className="max-w-xl text-muted-foreground font-medium">
                                Direktori komprehensif untuk pengawasan identitas aktif dan protokol operasional dalam ekosistem.
                            </Typography>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={SLIDE_UP} className="relative w-full max-w-sm">
                    <Input 
                        placeholder="Cari Identitas..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        leftIcon={<Search size={18} />}
                        className="rounded-xl shadow-sm"
                    />
                </motion.div>
            </header>

            {/* 02. CORE METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RegistryKPI title="Identitas Terdaftar" value={userData?.pagination?.total || 0} desc="Entitas divalidasi" icon={<Users />} />
                <RegistryKPI title="Sinyal Aktif" value="142" desc="Transmisi hari ini" icon={<Activity />} />
                <RegistryKPI title="Lansiran Audit" value="3" desc="Membutuhkan atensi" icon={<ShieldAlert />} />
            </div>

            {/* 03. IDENTITY TABLE SECTION */}
            <section className="space-y-8 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                        <Typography variant="h2" className="text-2xl font-bold tracking-tight">Catat Verifikasi</Typography>
                    </div>
                    <Typography variant="small" className="font-bold text-muted-foreground/40 uppercase tracking-widest text-[9px]">
                        Halaman {page} dari {userData?.pagination?.totalPages || 1}
                    </Typography>
                </div>

                <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-subtle">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/50 border-b border-border">
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 w-[40%]">Identitas Pengguna</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Protokol Kontak</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Otoritas</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <SkeletonRows key="loading" />
                                    ) : users.length > 0 ? users.map((user: UserDTO, idx: number) => (
                                        <motion.tr 
                                            key={user.id} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-secondary/20 transition-all group"
                                        >
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary border border-border shadow-sm shrink-0">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}&backgroundColor=F1F5F9`} alt="Avatar" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Typography variant="h4" className="text-sm font-bold tracking-tight mb-0.5 truncate">{user.fullName}</Typography>
                                                        <Typography variant="small" className="text-[10px] font-bold text-muted-foreground/40 lowercase tracking-widest truncate">@{user.username}</Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="space-y-1">
                                                    <Typography variant="p" className="text-xs font-bold text-foreground truncate">{user.email}</Typography>
                                                    {user.phoneNumber && <Typography variant="small" className="tabular-nums text-[10px] font-bold text-muted-foreground/40">+{user.phoneNumber}</Typography>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <span className={cn(
                                                    "text-[9px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest",
                                                    user.role === Role.ADMIN 
                                                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                                        : "bg-secondary border-border text-muted-foreground/60"
                                                )}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={cn("w-2 h-2 rounded-full", user.isActivated ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-orange-400")} />
                                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", user.isActivated ? "text-success" : "text-orange-400")}>
                                                        {user.isActivated ? 'Secured' : 'Awaiting'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary"
                                                        onClick={() => navigate(`/admin-user/${user.username}/audit`)}
                                                        className="h-9 px-4 rounded-lg text-[10px] font-bold"
                                                        leftIcon={<ExternalLink size={14} />}
                                                    >
                                                        Audit
                                                    </Button>
                                                    <button className="p-2.5 bg-destructive/5 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-all border border-destructive/10">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr key="empty">
                                            <td colSpan={5} className="px-8 py-32 text-center bg-secondary/10">
                                                <SearchX className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                                                <Typography variant="small" className="font-bold opacity-30 text-center uppercase tracking-[0.4em]">Registry Kosong</Typography>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINATION */}
                {userData?.pagination?.totalPages && userData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6">
                        <Typography variant="small" className="font-bold text-muted-foreground/30 uppercase tracking-widest text-[10px]">Navigasi Sekuensial</Typography>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                                className="rounded-xl px-6"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Prev
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                disabled={page >= (userData?.pagination?.totalPages || 1)} 
                                onClick={() => setPage(p => p + 1)}
                                className="rounded-xl px-6"
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </section>
        </motion.div>
    );
}

function RegistryKPI({ title, value, desc, icon }: { title: string; value: string | number; desc: string; icon: React.ReactNode; }) {
    return (
        <Card className="p-8 border border-border bg-white hover:border-accent/40 transition-all group h-full flex flex-col justify-between min-h-[200px] shadow-subtle rounded-2xl overflow-hidden relative" padding="none">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 text-accent">
                {icon}
            </div>
            <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground/60 group-hover:bg-accent group-hover:text-white transition-all border border-border">
                    {icon}
                </div>
                <Lock size={14} className="text-muted-foreground/20" />
            </div>
            <div className="space-y-1 relative z-10">
                <Typography variant="small" className="font-bold text-muted-foreground/40 uppercase tracking-widest text-[9px]">{title}</Typography>
                <Typography variant="h3" className="text-4xl font-bold tracking-tighter tabular-nums">{value}</Typography>
                <Typography variant="p" className="text-[11px] font-medium text-muted-foreground/60 leading-tight">{desc}</Typography>
            </div>
        </Card>
    );
}

function SkeletonRows() {
    return (
        <>
            {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                    <td colSpan={5} className="px-8 py-10">
                        <div className="h-6 w-full bg-secondary animate-pulse rounded-xl" />
                    </td>
                </tr>
            ))}
        </>
    );
}
