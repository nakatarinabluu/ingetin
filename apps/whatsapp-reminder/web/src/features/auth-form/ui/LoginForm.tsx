import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { AUTH_COPY } from '@/shared/config/copy';

import { LoginSchema } from '@ingetin/types';
import type { LoginInput } from '@ingetin/types';

interface LoginFormProps {
    onLogin: (data: LoginInput) => Promise<void>;
    loading: boolean;
}

/**
 * LoginForm — WhatsApp Official Style
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        await onLogin(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <div className="space-y-6">
                <Input 
                    label="Nama Pengguna" 
                    placeholder="Masukkan username Anda"
                    error={errors.username?.message}
                    {...register('username')}
                    leftIcon={<User className="text-[#aebac1]" />}
                />
                
                <div className="space-y-3">
                    <Input 
                        label="Kata Sandi" 
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register('password')}
                        leftIcon={<Lock className="text-[#aebac1]" />}
                    />
                    <div className="flex justify-end pt-1">
                        <Link 
                            to="/forgot-password"
                            className="text-[13px] font-semibold text-wa-green hover:text-wa-green-dark hover:underline transition-colors"
                        >
                            {AUTH_COPY.login.forgot}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <Button 
                    type="submit"
                    isLoading={loading}
                    className="w-full h-[48px] bg-wa-green hover:bg-wa-green-dark text-white rounded-xl font-semibold text-[15px]"
                >
                    {AUTH_COPY.login.tab_auth}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-wa-icon">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-wa-green font-semibold hover:underline">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
};
