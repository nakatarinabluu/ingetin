import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';
import { AuthBranding } from '../../components/features/auth/AuthBranding';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { FADE_IN } from '../../utils/motion';
import { cn } from '../../utils/tw.utils';

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
 * 🚀 THE OFFICIAL WHATSAPP WEB STYLE RESET PASSWORD
 */
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Ingetin — Atur Ulang Kata Sandi";
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
        setValue(fieldName, value as any, { shouldValidate: true });
    };

    const onSubmit = async (data: ResetFormData) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Berhasil", {
            description: "Kata sandi Anda telah diperbarui. Silakan masuk kembali."
        });
        setLoading(false);
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] relative flex flex-col items-center justify-center p-4">
            {/* WHATSAPP GREEN STRIP */}
            <div className="wa-header-strip" />

            <motion.div 
                {...FADE_IN} 
                className="w-full max-w-[1000px] bg-white shadow-wa rounded-sm flex flex-col lg:flex-row min-h-[500px] lg:min-h-[650px] relative z-10"
            >
                {/* BRANDING */}
                <div className="lg:w-[400px] border-r border-gray-100 hidden lg:block">
                    <AuthBranding activeTab="forgot-password" />
                </div>

                {/* FORM AREA */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="mb-8 text-left">
                        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00a884] transition-colors font-bold text-sm">
                            <ArrowLeft size={16} />
                            Batal
                        </Link>
                    </div>

                    <div className="max-w-md mx-auto lg:mx-0 w-full space-y-10 text-left">
                        <div className="space-y-3">
                            <Typography variant="h1" className="text-3xl font-light text-[#41525d]">Buat Sandi Baru</Typography>
                            <Typography variant="p" className="text-[#667781] font-medium leading-relaxed">
                                Pastikan kata sandi baru Anda aman dan mudah Anda ingat.
                            </Typography>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Input 
                                        label="Kata Sandi Baru" 
                                        type="password"
                                        placeholder="••••••••"
                                        error={errors.password?.message}
                                        {...register('password', { onChange: (e) => handleNoSpace(e, 'password') })}
                                        leftIcon={<Lock size={18} className="text-gray-400" />}
                                    />
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                                        <ValidationHint active={(password || "").length >= 8} text="Min. 8 Karakter" />
                                        <ValidationHint active={/[A-Z]/.test(password || "") && /[0-9]/.test(password || "")} text="Huruf & Angka" />
                                    </div>
                                </div>

                                <Input 
                                    label="Konfirmasi Kata Sandi" 
                                    type="password" 
                                    placeholder="••••••••"
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword', { onChange: (e) => handleNoSpace(e, 'confirmPassword') })}
                                    leftIcon={<ShieldCheck size={18} className="text-gray-400" />}
                                />
                            </div>

                            <Button 
                                type="submit"
                                isLoading={loading}
                                disabled={!isValid}
                                className="w-full h-14 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold text-lg shadow-sm"
                            >
                                Perbarui Kata Sandi
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ValidationHint({ active, text }: { active: boolean, text: string }) {
    return (
        <div className={cn(
            "flex items-center gap-2 text-[11px] font-bold tracking-tight transition-all duration-300",
            active ? 'text-[#00a884]' : 'text-gray-300'
        )}>
            <ShieldCheck size={12} className={cn(active ? "opacity-100" : "opacity-30")} />
            <span className="uppercase tracking-wider">{text}</span>
        </div>
    )
}
