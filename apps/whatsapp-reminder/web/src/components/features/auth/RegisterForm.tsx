import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, XCircle, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthAPI } from '../../../api/auth.api';
import { type RegisterInput } from '@ingetin/types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AUTH_COPY } from '../../../constants/copy';
import { cn } from '../../../utils/tw.utils';

interface RegisterFormProps {
    onRegister: (data: RegisterInput) => Promise<void>;
    loading: boolean;
    setActivePolicy: (type: 'TERMS' | 'PRIVACY') => void;
}

const RegisterFormSchema = z.object({
    firstName: z.string().min(2, "Nama depan minimal 2 karakter"),
    lastName: z.string().min(2, "Nama belakang wajib diisi"),
    username: z.string()
        .min(3, "Nama pengguna minimal 3 karakter")
        .max(20, "Nama pengguna maksimal 20 karakter")
        .regex(/^[a-zA-Z0-9_]+$/, "Hanya boleh huruf, angka, dan underscore (_)"),
    email: z.string().email("Format email tidak valid"),
    password: z.string()
        .min(8, "Kata sandi minimal 8 karakter")
        .regex(/[A-Z]/, "Harus mengandung minimal satu huruf besar")
        .regex(/[0-9]/, "Harus mengandung minimal satu angka")
        .regex(/^\S*$/, "Tidak boleh mengandung spasi"),
    confirmPassword: z.string(),
    agreed: z.boolean().refine(val => val === true, "Anda harus menyetujui syarat dan ketentuan")
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof RegisterFormSchema>;

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE REGISTER FORM
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, loading, setActivePolicy }) => {
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

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
                const isAvailable = res.data.success ? res.data.data.available : false;
                setUsernameAvailable(isAvailable);
            } catch (err) {
                setUsernameAvailable(null);
            } finally {
                setIsCheckingUsername(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [username]);

    const handleNoSpace = (e: React.FormEvent<HTMLInputElement>, fieldName: keyof RegisterFormData) => {
        const value = e.currentTarget.value.replace(/\s/g, '');
        setValue(fieldName, value as any, { shouldValidate: true });
    };

    const onSubmit = async (data: RegisterFormData) => {
        if (usernameAvailable !== true) return;
        const { confirmPassword, agreed, ...apiData } = data;
        await onRegister(apiData as RegisterInput);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="Nama Depan" placeholder="Budi" error={errors.firstName?.message} {...register('firstName')} />
                    <Input label="Nama Belakang" placeholder="Satria" error={errors.lastName?.message} {...register('lastName')} />
                </div>

                <Input 
                    label="Nama Pengguna" 
                    placeholder="budisatria"
                    leftIcon={<User className="text-gray-400" />}
                    rightIcon={
                        isCheckingUsername ? (
                            <Loader2 className="animate-spin text-[#00a884]" size={16} />
                        ) : usernameAvailable === true ? (
                            <CheckCircle2 className="text-[#00a884]" size={16} />
                        ) : usernameAvailable === false ? (
                            <XCircle className="text-red-500" size={16} />
                        ) : null
                    }
                    error={errors.username?.message || (usernameAvailable === false ? 'Username sudah digunakan' : '')}
                    {...register('username', { onChange: (e) => handleNoSpace(e, 'username') })}
                />

                <Input 
                    label="Alamat Email" 
                    type="email" 
                    placeholder="budi@email.com" 
                    leftIcon={<Mail className="text-gray-400" />}
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
                        leftIcon={<Lock className="text-gray-400" />}
                    />
                    <div className="flex flex-wrap gap-2 pl-1">
                        <PasswordHint active={(password || "").length >= 8} text="Min. 8 Karakter" />
                        <PasswordHint active={/[A-Z]/.test(password || "") && /[0-9]/.test(password || "")} text="Huruf & Angka" />
                    </div>
                </div>

                <Input 
                    label="Konfirmasi Kata Sandi" 
                    type="password" 
                    placeholder="••••••••" 
                    error={errors.confirmPassword?.message} 
                    {...register('confirmPassword', { onChange: (e) => handleNoSpace(e, 'confirmPassword') })} 
                    leftIcon={<ShieldCheck className="text-gray-400" />}
                />
            </div>

            <div className="flex items-start gap-3 px-4 py-4 bg-[#f0f2f5] rounded-xl border border-gray-100">
                <input 
                    type="checkbox" id="agreed" {...register('agreed')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#00a884] focus:ring-[#00a884]/20 transition-all cursor-pointer" 
                />
                <label htmlFor="agreed" className="text-[13px] text-gray-500 font-medium leading-relaxed cursor-pointer select-none">
                    Saya setuju pada <button type="button" onClick={() => setActivePolicy('TERMS')} className="text-[#00a884] font-bold hover:underline">Ketentuan Layanan</button> dan <button type="button" onClick={() => setActivePolicy('PRIVACY')} className="text-[#00a884] font-bold hover:underline">Kebijakan Privasi</button>.
                </label>
            </div>

            <div className="space-y-6 pt-2">
                <Button 
                    type="submit"
                    isLoading={loading}
                    disabled={!isValid || usernameAvailable !== true || !agreed}
                    className="w-full h-14 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold text-lg shadow-sm"
                >
                    Daftar Sekarang
                </Button>

                <div className="text-center">
                    <p className="text-[15px] text-gray-500 font-medium">
                        Sudah memiliki akun?{' '}
                        <Link to="/login" className="text-[#00a884] font-bold hover:underline">
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
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all duration-300",
          active ? "bg-[#dcf8c6] text-[#00a884] border-[#00a884]/20" : "bg-gray-50 text-gray-300 border-gray-100"
        )}>
            <CheckCircle2 size={10} strokeWidth={3} className={cn("transition-all", active ? "opacity-100" : "opacity-30")} />
            <span className="uppercase tracking-wider">{text}</span>
        </div>
    )
}
