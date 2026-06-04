import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AuthBranding } from '@/features/auth-form/ui/AuthBranding';
import { ShieldCheck, Lock, ArrowLeft, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/tw.utils';
import { BRAND_COPY } from '@/shared/config/copy';

const ResetSchema = z.object({
    password: z.string()
        .min(8, "Kata sandi minimal 8 karakter")
        .regex(/[A-Z]/, "Harus mengandung minimal satu huruf besar")
        .regex(/[0-9]/, "Harus mengandung minimal satu angka")
        .regex(/^\S*$/, "Tidak boleh mengandung spasi"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"]
});

type ResetFormData = z.infer<typeof ResetSchema>;

/**
 * ResetPassword — WhatsApp Official Style
 */
export default function ResetPassword() {
    useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        document.title = "Atur Ulang Kata Sandi — Ingetin";
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<ResetFormData>({
        resolver: zodResolver(ResetSchema),
        mode: 'onChange',
    });

    const password = watch('password');

    const handleNoSpace = (e: React.FormEvent<HTMLInputElement>, fieldName: keyof ResetFormData) => {
        const value = e.currentTarget.value.replace(/\s/g, '');
        setValue(fieldName, value, { shouldValidate: true });
    };

    const onSubmit = async (_data: ResetFormData) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Berhasil", {
            description: "Kata sandi Anda telah diperbarui. Silakan masuk kembali."
        });
        setLoading(false);
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-wa-bg flex flex-col items-center justify-center p-5">

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[900px] bg-white rounded-2xl border border-wa-border shadow-wa-md flex flex-col lg:flex-row overflow-hidden min-h-[540px]"
            >
                {/* Left branding — desktop only */}
                <div className="hidden lg:block lg:w-[360px] shrink-0">
                    <AuthBranding activeTab="forgot-password" />
                </div>

                {/* Right — Form */}
                <div className="flex-1 flex flex-col justify-center p-8 md:p-12">

                    {/* Mobile brand header */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-wa-green flex items-center justify-center">
                            <MessageCircle size={17} className="text-white" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[16px] text-wa-dark">{BRAND_COPY.name}</span>
                    </div>

                    {/* Back link */}
                    <div className="mb-7">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-wa-icon hover:text-wa-green transition-colors"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                            Kembali ke Masuk
                        </Link>
                    </div>

                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-wa-dark mb-1.5">Buat Kata Sandi Baru</h1>
                        <p className="text-sm text-wa-icon">
                            Pastikan kata sandi baru Anda aman dan mudah diingat.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-wa-dark">Kata Sandi Baru</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wa-icon">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={cn(
                                        "w-full h-11 bg-wa-bg border rounded-xl pl-10 pr-10 text-sm text-wa-dark placeholder:text-[#adb5bd] focus:outline-none focus:bg-white focus:ring-2 transition-all",
                                        errors.password
                                            ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                                            : "border-wa-border focus:border-wa-green focus:ring-wa-green/10"
                                    )}
                                    {...register('password', { onChange: (e) => handleNoSpace(e, 'password') })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wa-icon hover:text-wa-dark"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                            )}
                            {/* Hints */}
                            <div className="flex gap-4 pt-1">
                                <ValidationHint active={(password || '').length >= 8} text="Min. 8 Karakter" />
                                <ValidationHint active={/[A-Z]/.test(password || '') && /[0-9]/.test(password || '')} text="Huruf & Angka" />
                            </div>
                        </div>

                        {/* Confirm Password field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-wa-dark">Konfirmasi Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wa-icon">
                                    <ShieldCheck size={16} />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={cn(
                                        "w-full h-11 bg-wa-bg border rounded-xl pl-10 pr-10 text-sm text-wa-dark placeholder:text-[#adb5bd] focus:outline-none focus:bg-white focus:ring-2 transition-all",
                                        errors.confirmPassword
                                            ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                                            : "border-wa-border focus:border-wa-green focus:ring-wa-green/10"
                                    )}
                                    {...register('confirmPassword', { onChange: (e) => handleNoSpace(e, 'confirmPassword') })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wa-icon hover:text-wa-dark"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={!isValid || loading}
                                className="w-full h-12 bg-wa-green hover:bg-wa-green-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-[15px]"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Perbarui Kata Sandi'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>

            <p className="mt-6 text-xs text-wa-muted text-center">
                Setelah berhasil, Anda akan diarahkan ke halaman masuk.
            </p>
        </div>
    );
}

function ValidationHint({ active, text }: { active: boolean; text: string }) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-300",
            active ? 'text-wa-green' : 'text-[#adb5bd]'
        )}>
            <ShieldCheck size={12} className={cn(active ? "opacity-100" : "opacity-40")} />
            <span>{text}</span>
        </div>
    );
}
