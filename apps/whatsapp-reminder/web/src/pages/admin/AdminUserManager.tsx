import { useState } from 'react';
import { 
    Search, 
    Shield, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    SearchX,
    Activity,
    Users,
    ShieldAlert,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAllUsers, useDashboardStats } from '@/entities/admin/model/hooks';
import { useDebounce } from '@/shared/lib/use-debounce';
import { UserDTO, Role } from '@ingetin/types';
import { Card, KPICard, Skeleton } from '@/shared/ui';
import { cn } from '@/shared/lib/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🚀 ADMIN USER MANAGER — WHATSAPP OFFICIAL STYLE
 * Concept: Clinical, Minimal, Stable.
 */
export default function AdminUserManager() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const navigate = useNavigate();

    const { data: userData, isLoading } = useAllUsers(true, { 
        page, 
        limit: 10,
        search: debouncedSearch 
    });

    const { data: stats } = useDashboardStats(true);

    const users = userData?.items || [];

    return (
        <div className="w-full space-y-6 text-left">
            
            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wa-border">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                        <Shield size={13} strokeWidth={2} />
                        Manajemen Identitas & Akses
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">Daftar Pengguna</h1>
                    <p className="text-sm text-wa-icon">Kelola akun, peran, dan status aktivitas seluruh anggota.</p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wa-icon" />
                    <input 
                        type="text"
                        placeholder="Cari pengguna..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full h-10 pl-9 pr-4 bg-white border border-wa-border rounded-xl text-sm focus:outline-none focus:border-wa-green transition-all"
                    />
                </div>
            </header>

            {/* ─── Stats Grid ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard title="Total Anggota" value={stats?.kpis?.users?.total ?? userData?.pagination?.total ?? 0} icon={Users} color="#00a884" />
                <KPICard title="Aktif Hari Ini" value={(stats?.kpis?.users as (typeof stats.kpis.users) & { active?: number })?.active ?? 0} icon={Activity} color="#128C7E" />
                <KPICard title="Lansiran Sistem" value={(stats?.systemHealth ?? 100) < 100 ? 1 : 0} icon={ShieldAlert} color="#667781" />
                <KPICard title="Admin (Halaman Ini)" value={users.filter(u => u.role === Role.ADMIN).length} icon={Shield} color="#25D366" />
            </div>

            {/* ─── Table Section ─── */}
            <Card className="rounded-2xl border-wa-border shadow-wa overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-wa-bg/50 border-b border-wa-border">
                                <th className="px-6 py-4 text-[11px] font-bold text-wa-icon uppercase tracking-wider">Pengguna</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-wa-icon uppercase tracking-wider">Kontak</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-wa-icon uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-wa-icon uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-wa-icon uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-wa-border">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <SkeletonRows />
                                ) : users.length > 0 ? users.map((user: UserDTO) => (
                                    <motion.tr 
                                        key={user.id} 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-[#fcfcfc] transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full overflow-hidden bg-wa-bg border border-wa-border shrink-0">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-wa-dark truncate">{user.fullName}</p>
                                                    <p className="text-[10px] font-medium text-wa-muted">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-wa-dark truncate">{user.email}</p>
                                                {user.phoneNumber && <p className="text-[10px] text-wa-muted tabular-nums">+{user.phoneNumber}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                                user.role === Role.ADMIN 
                                                    ? "bg-wa-dark text-white border-wa-dark" 
                                                    : "bg-wa-bg text-wa-icon border-wa-border"
                                            )}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", user.isActivated ? "bg-wa-green" : "bg-orange-400")} />
                                                <span className={cn("text-[11px] font-bold", user.isActivated ? "text-wa-green" : "text-orange-500")}>
                                                    {user.isActivated ? 'Aktif' : 'Menunggu'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/admin-user/${user.username}/audit`)}
                                                    className="h-8 px-3 rounded-lg bg-wa-bg text-wa-icon text-[10px] font-bold hover:bg-wa-border transition-colors flex items-center gap-1.5"
                                                >
                                                    <ExternalLink size={12} />
                                                    Audit
                                                </button>
                                                <button className="p-2 text-wa-muted hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <SearchX className="mx-auto mb-3 text-wa-border" size={40} />
                                            <p className="text-sm font-semibold text-wa-icon">Tidak ada pengguna ditemukan</p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {userData?.pagination?.totalPages && userData.pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-wa-border flex items-center justify-between bg-[#fcfcfc]">
                        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                            Halaman {page} dari {userData.pagination.totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 px-4 bg-white border border-wa-border rounded-lg text-[10px] font-bold disabled:opacity-50"
                            >
                                <ChevronLeft size={14} className="inline mr-1" /> Prev
                            </button>
                            <button 
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= userData.pagination.totalPages}
                                className="h-8 px-4 bg-white border border-wa-border rounded-lg text-[10px] font-bold disabled:opacity-50"
                            >
                                Next <ChevronRight size={14} className="inline ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

function SkeletonRows() {
    return (
        <>
            {[1, 2, 3].map(i => (
                <tr key={i}>
                    <td colSpan={5} className="px-6 py-6">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </td>
                </tr>
            ))}
        </>
    );
}

