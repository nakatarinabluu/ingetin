import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import { useProfile, useUnlinkPhone } from '@/entities/user/model/hooks';
import { Card } from '@/shared/ui/Card';
import { ProfileHeader } from '@/features/profile-settings/ui/ProfileHeader';
import { AccountDetailsForm } from '@/features/profile-settings/ui/AccountDetailsForm';
import { SecuritySettings } from '@/features/profile-settings/ui/SecuritySettings';
import { MessageCircle, PhoneCall, ShieldCheck, Lock, User, Palette, Loader2 } from 'lucide-react';
import { useAppStore } from '@/app/store/useAppStore';
import { cn } from '@/shared/lib/tw.utils';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { useState } from 'react';

/**
 * UserProfile — Mobile-First Layout
 * Order: Avatar → WA Status → Info Akun → Keamanan
 * Lebar penuh satu kolom di mobile, dua kolom di desktop.
 */
export default function UserProfile() {
    const { session, updateSession } = useAuth();
    const { data: profile } = useProfile();
    const unlinkMutation = useUnlinkPhone();

    // Fix [P-03]: hooks must be at component level, not inside .map()
    const currentTheme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);

    // Fix [Q-04]: replace window.confirm with proper modal
    const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);

    const handleUnlink = async () => {
        try {
            await unlinkMutation.mutateAsync();
            updateSession({ isActivated: false });
            toast.success('Koneksi Diputuskan', {
                description: 'Bot Ingetin telah dinonaktifkan dari perangkat ini.',
            });
        } catch {
            toast.error('Gagal memutuskan koneksi');
        } finally {
            setIsUnlinkConfirmOpen(false);
        }
    };

    const handleChangePhone = () => {
        toast.info("Fitur Segera Hadir", {
            description: "Silakan hubungi admin untuk perubahan nomor manual."
        });
    };

    return (
        <div className="w-full space-y-4 pb-24 text-left">

            {/* ─── Header ─── */}
            <header className="pb-4 border-b border-wa-border">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-wa-green mb-2">
                    <User size={13} strokeWidth={2} />
                    Otoritas Akun
                </div>
                <h1 className="text-2xl font-bold text-wa-dark">Profil Saya</h1>
                <p className="text-sm text-wa-icon mt-0.5">
                    Identitas, keamanan, dan koneksi WhatsApp Anda.
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                {/* ─── 1. Avatar & Identity (Always First on Mobile) ─── */}
                <Card className="rounded-2xl border-wa-border shadow-wa bg-white overflow-hidden p-0">
                    <ProfileHeader profile={profile || null} />
                </Card>

                {/* ─── 2. WhatsApp Status (Critical Info, High Up) - Hidden for Admin ─── */}
                {session?.role !== 'ADMIN' && (
                    <Card className="p-4 rounded-2xl border-wa-border shadow-wa bg-white">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-wa-green/10 rounded-xl flex items-center justify-center shrink-0">
                                <MessageCircle size={16} className="text-wa-green" strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-wa-dark">Koneksi WhatsApp</h3>
                                <p className="text-xs text-wa-icon">
                                    {session?.isActivated ? 'Perangkat terhubung & aktif' : 'Belum dihubungkan'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`w-2 h-2 rounded-full ${session?.isActivated ? 'bg-wa-green animate-pulse' : 'bg-gray-300'}`} />
                                <span className={`text-xs font-semibold ${session?.isActivated ? 'text-wa-green' : 'text-wa-muted'}`}>
                                    {session?.isActivated ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {session?.isActivated && (
                            <div className="grid grid-cols-2 gap-2 pt-1 mb-4">
                                <button 
                                    onClick={handleChangePhone}
                                    className="h-9 rounded-lg bg-wa-bg hover:bg-wa-border text-wa-dark text-[11px] font-bold transition-colors border border-wa-border"
                                >
                                    Ubah Nomor
                                </button>
                                <button 
                                    onClick={() => setIsUnlinkConfirmOpen(true)}
                                    disabled={unlinkMutation.isPending}
                                    className="h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-[11px] font-bold transition-colors border border-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {unlinkMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                                    Putuskan Sesi
                                </button>
                            </div>
                        )}

                        <div className="rounded-xl bg-wa-bg p-3.5 flex items-center gap-3">
                            <PhoneCall size={18} className={session?.isActivated ? 'text-wa-green' : 'text-wa-muted'} strokeWidth={2} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-wa-dark truncate">
                                    {profile?.phoneNumber ? `+${profile.phoneNumber}` : 'Nomor belum diatur'}
                                </p>
                                <p className="text-xs text-wa-icon">Nomor WhatsApp terdaftar</p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5 text-xs text-wa-muted">
                            <ShieldCheck size={11} className="text-wa-green" />
                            End-to-end enkripsi aktif
                        </div>
                    </Card>
                )}

                {/* ─── Desktop: Two Column / Mobile: Single Column Stack ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* 3. Account Details */}
                    <div className="lg:col-span-7">
                        <Card className="rounded-2xl border-wa-border shadow-wa bg-white p-5 md:p-6">
                            <AccountDetailsForm />
                        </Card>
                    </div>

                    {/* 4. Security */}
                    <div className="lg:col-span-5">
                        <Card className="p-5 md:p-6 rounded-2xl border-wa-border shadow-wa bg-white">
                            <SecuritySettings />
                        </Card>
                    </div>
                </div>

                {/* ─── 5. Theme Selection ─── */}
                <div className="grid grid-cols-1 gap-4">
                    <Card className="p-5 md:p-6 rounded-2xl border-wa-border shadow-wa bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 bg-wa-green/10 rounded-xl flex items-center justify-center shrink-0">
                                <Palette size={18} className="text-wa-green" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-wa-dark">Versi Style Ingetin</h3>
                                <p className="text-xs text-wa-icon mt-0.5">Pilih versi desain yang paling nyaman untuk Anda.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'official-wa', label: 'WhatsApp Official', desc: 'Klasik & Familiar', color: 'bg-[#00a884]' },
                                { id: 'modern-dark', label: 'Modern Dark', desc: 'Elegan & Fokus', color: 'bg-[#0b141a]' },
                                { id: 'glassmorphism', label: 'Glassmorphism', desc: 'Premium & Transparan', color: 'bg-gradient-to-br from-blue-100 to-indigo-100' },
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setTheme(v.id as 'official-wa' | 'modern-dark' | 'glassmorphism')}
                                    className={cn(
                                        "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left",
                                        currentTheme === v.id 
                                            ? "border-wa-green bg-wa-green/5 ring-4 ring-wa-green/5" 
                                            : "border-wa-border bg-white hover:border-wa-icon/20"
                                    )}
                                >
                                    <div className={cn("w-10 h-6 rounded-md mb-3 shadow-sm", v.color)} />
                                    <span className="text-sm font-bold text-wa-dark block">{v.label}</span>
                                    <span className="text-[11px] text-wa-icon mt-0.5">{v.desc}</span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* ─── Footer note ─── */}
                <div className="flex items-center justify-center gap-2 py-3">
                    <Lock size={12} className="text-wa-muted" strokeWidth={2} />
                    <span className="text-xs text-wa-muted">Data profil dijaga keamanannya oleh sistem enkripsi Ingetin.</span>
                </div>
            </motion.div>

            {/* ─── Confirmation Modal for Unlink ─── */}
            <ConfirmationModal
                isOpen={isUnlinkConfirmOpen}
                onClose={() => setIsUnlinkConfirmOpen(false)}
                onConfirm={handleUnlink}
                title="Putuskan Koneksi WhatsApp?"
                description="Agenda Anda tidak akan terkirim setelah koneksi diputuskan. Tindakan ini dapat dibatalkan dengan menghubungkan kembali."
                confirmText="Putuskan"
                cancelText="Batal"
                isLoading={unlinkMutation.isPending}
                type="danger"
            />
        </div>
    );
}
