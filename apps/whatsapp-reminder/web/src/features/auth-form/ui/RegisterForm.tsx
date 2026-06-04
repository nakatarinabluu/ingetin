import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, XCircle, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthAPI } from '@/entities/user/api';
import { type RegisterInput } from '@ingetin/types';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/lib/tw.utils';

import { RegisterSchema } from '@ingetin/types';

interface RegisterFormProps {
    onRegister: (data: RegisterInput) => Promise<void>;
    loading: boolean;
    setActivePolicy: (type: 'TERMS' | 'PRIVACY') => void;
}

// Extend base schema for form-specific validation (confirmation and checkbox)
const RegisterFormSchema = RegisterSchema.extend({
    confirmPassword: z.string(),
    agreed: z.boolean().refine(val => val === true, "Anda harus menyetujui syarat dan ketentuan")
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof RegisterFormSchema>;

/**
 * RegisterForm — WhatsApp Official Style
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, loading, setActivePolicy }) => {
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const isMounted = React.useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterFormSchema),
        mode: 'onChange',
    });

    const username = watch('username');
    const password = watch('password');
    const agreed = watch('agreed');

    useEffect(() => {
        if (!username || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingUsername(true);
            try {
                const res = await AuthAPI.checkUsername(username);
                const isAvailable = res.data.success ? res.data.data?.available : false;
                if (isMounted.current) {
                    setUsernameAvailable(isAvailable);
                }
            } catch (err) {
                if (isMounted.current) {
                    setUsernameAvailable(null);
                }
            } finally {
                if (isMounted.current) {
                    setIsCheckingUsername(false);
                }
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [username]);

    const handleNoSpace = (e: React.FormEvent<HTMLInputElement>, fieldName: keyof RegisterFormData) => {
        const value = e.currentTarget.value.replace(/\s/g, '');
        setValue(fieldName, value, { shouldValidate: true });
    };

    const onSubmit = async (data: RegisterFormData) => {
        if (usernameAvailable !== true) return;
        const { confirmPassword: _, agreed: __, ...apiData } = data;
        await onRegister(apiData as RegisterInput);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="Nama Depan" placeholder="Budi" error={errors.firstName?.message} {...register('firstName')} />
                    <Input label="Nama Belakang" placeholder="Satria" error={errors.lastName?.message} {...register('lastName')} />
                </div>

                <Input 
                    label="Nama Pengguna" 
                    placeholder="budisatria"
                    leftIcon={<User className="text-[#aebac1]" />}
                    rightIcon={
                        isCheckingUsername ? (
                            <Loader2 className="animate-spin text-wa-green" size={16} />
                        ) : usernameAvailable === true ? (
                            <CheckCircle2 className="text-wa-green" size={16} />
                        ) : usernameAvailable === false ? (
                            <XCircle className="text-[#ea1d2c]" size={16} />
                        ) : null
                    }
                    error={errors.username?.message || (usernameAvailable === false ? 'Username sudah digunakan' : '')}
                    {...register('username', { onChange: (e) => handleNoSpace(e, 'username') })}
                />

                <Input 
                    label="Alamat Email" 
                    type="email" 
                    placeholder="budi@email.com" 
                    leftIcon={<Mail className="text-[#aebac1]" />}
                    error={errors.email?.message}
                    {...register('email', { onChange: (e) => handleNoSpace(e, 'email') })}
                />

                <div className="space-y-3">
                    <Input 
                        label="Kata Sandi Baru" 
                        type="password" 
                        placeholder="••••••••" 
                        error={errors.password?.message} 
                        {...register('password', { onChange: (e) => handleNoSpace(e, 'password') })} 
                        leftIcon={<Lock className="text-[#aebac1]" />}
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                        <PasswordHint active={(password || "").length >= 8} text="Min 8 Karakter" />
                        <PasswordHint active={/[A-Z]/.test(password || "") && /[0-9]/.test(password || "")} text="Huruf & Angka" />
                    </div>
                </div>

                <Input 
                    label="Konfirmasi Kata Sandi" 
                    type="password" 
                    placeholder="••••••••" 
                    error={errors.confirmPassword?.message} 
                    {...register('confirmPassword', { onChange: (e) => handleNoSpace(e, 'confirmPassword') })} 
                    leftIcon={<ShieldCheck className="text-[#aebac1]" />}
                />
            </div>

            <div className="flex items-start gap-3 p-4 bg-wa-bg rounded-xl border border-wa-border">
                <input 
                    type="checkbox" id="agreed" {...register('agreed')}
                    className="mt-0.5 h-4 w-4 rounded border-wa-border text-wa-green focus:ring-wa-green/20 transition-all cursor-pointer bg-white" 
                />
                <label htmlFor="agreed" className="text-[13px] text-wa-icon leading-relaxed cursor-pointer select-none">
                    Saya menyetujui <button type="button" onClick={() => setActivePolicy('TERMS')} className="text-wa-green font-semibold hover:underline">Ketentuan Layanan</button> & <button type="button" onClick={() => setActivePolicy('PRIVACY')} className="text-wa-green font-semibold hover:underline">Kebijakan Privasi</button>.
                </label>
            </div>

            <div className="space-y-4 pt-2">
                <Button 
                    type="submit"
                    isLoading={loading}
                    disabled={!isValid || usernameAvailable !== true || !agreed}
                    className="w-full h-[48px] bg-wa-green hover:bg-wa-green-dark text-white rounded-xl font-semibold text-[15px]"
                >
                    Daftar Sekarang
                </Button>

                <div className="text-center">
                    <p className="text-sm text-wa-icon">
                        Sudah memiliki akun?{' '}
                        <Link to="/login" className="text-wa-green font-semibold hover:underline">
                            Masuk Sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
};

function PasswordHint({ active, text }: { active: boolean, text: string }) {
    return (
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
          active ? "bg-wa-green-light text-wa-green" : "bg-wa-bg text-[#8696a0]"
        )}>
            <CheckCircle2 size={12} strokeWidth={2.5} className={cn(active ? "opacity-100" : "opacity-0")} />
            <span>{text}</span>
        </div>
    )
}
