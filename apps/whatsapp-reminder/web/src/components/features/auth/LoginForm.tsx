import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Typography } from '../../ui/Typography';
import type { LoginInput } from '@ingetin/types';
import { AUTH_COPY } from '../../../constants/copy';

interface LoginFormProps {
    onLogin: (data: LoginInput) => Promise<void>;
    loading: boolean;
}

const LoginFormSchema = z.object({
    username: z.string().min(1, "Nama pengguna wajib diisi"),
    password: z.string().min(1, "Kata sandi wajib diisi")
});

type LoginFormData = z.infer<typeof LoginFormSchema>;

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE LOGIN FORM
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(LoginFormSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        await onLogin(data as LoginInput);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
                <Input 
                    label="Nama Pengguna" 
                    placeholder="Masukkan username Anda"
                    error={errors.username?.message}
                    {...register('username')}
                    leftIcon={<User className="text-gray-400" />}
                />
                
                <div className="space-y-3">
                    <Input 
                        label="Kata Sandi" 
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password')}
                        leftIcon={<Lock className="text-gray-400" />}
                    />
                    <div className="flex justify-end px-1">
                        <Link 
                            to="/forgot-password"
                            className="text-sm font-semibold text-[#00a884] hover:underline"
                        >
                            {AUTH_COPY.login.forgot}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <Button 
                    type="submit"
                    isLoading={loading}
                    className="w-full h-14 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold text-lg shadow-sm"
                >
                    {AUTH_COPY.login.tab_auth}
                </Button>

                <div className="text-center">
                    <p className="text-[15px] text-gray-500 font-medium">
                        Belum memiliki akun?{' '}
                        <Link to="/register" className="text-[#00a884] font-bold hover:underline">
                            Daftar Sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
};
