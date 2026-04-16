import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthAPI } from '../../api/auth.api';
import { LoginInput } from '@ingetin/types';
import { LoginForm } from '../../components/features/auth/LoginForm';
import { AuthBranding } from '../../components/features/auth/AuthBranding';
import { AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { AUTH_COPY, COMMON_COPY, BRAND_COPY } from '../../constants/copy';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';

/**
 * Login — WhatsApp Official Style
 */
export default function Login() {
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (data: LoginInput) => {
        setLoading(true);
        setError('');
        try {
            const res = await AuthAPI.login(data);
            if (res.data.success) {
                login(res.data.data.user);
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ error: string }>;
            setError(error.response?.data?.error || AUTH_COPY.errors.login_failed);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-5">

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[900px] bg-white rounded-2xl border border-[#e9edef] shadow-wa-md flex flex-col lg:flex-row overflow-hidden min-h-[560px]"
            >
                {/* Left branding panel — desktop only */}
                <div className="hidden lg:block lg:w-[360px] shrink-0">
                    <AuthBranding activeTab="login" />
                </div>

                {/* Right — Form */}
                <div className="flex-1 flex flex-col justify-center p-8 md:p-12">

                    {/* Mobile brand header */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-[#00a884] flex items-center justify-center">
                            <MessageCircle size={17} className="text-white" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[16px] text-[#111b21]">{BRAND_COPY.name}</span>
                    </div>

                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-[#111b21] mb-1.5">{AUTH_COPY.login.title}</h1>
                        <p className="text-sm text-[#54656f]">{AUTH_COPY.login.desc}</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-3"
                        >
                            <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-400" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <LoginForm onLogin={handleLogin} loading={loading} />

                    <div className="mt-6 pt-6 border-t border-[#e9edef] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-[#00a884] hover:text-[#008069] font-medium transition-colors"
                        >
                            {AUTH_COPY.login.forgot}
                        </Link>
                        <p className="text-sm text-[#54656f]">
                            Belum punya akun?{' '}
                            <Link to="/register" className="text-[#00a884] font-semibold hover:text-[#008069] transition-colors">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Footer note */}
            <p className="mt-6 text-xs text-[#667781] text-center">
                {AUTH_COPY.branding.footer}
            </p>
        </div>
    );
}
