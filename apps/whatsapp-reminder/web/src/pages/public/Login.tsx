import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { AuthAPI } from '@/entities/user/api';
import { LoginInput } from '@ingetin/types';
import { LoginForm } from '@/features/auth-form/ui/LoginForm';
import { AuthBranding } from '@/features/auth-form/ui/AuthBranding';
import { AlertCircle, MessageCircle } from 'lucide-react';
import { AUTH_COPY, BRAND_COPY } from '@/shared/config/copy';
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
                // Pass the whole user object and the token
                login({
                    ...res.data.data.user,
                    token: res.data.data.token
                });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ error: string }>;
            setError(error.response?.data?.error || AUTH_COPY.errors.login_failed);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-wa-bg flex flex-col items-center justify-center p-5">

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[900px] bg-white rounded-2xl border border-wa-border shadow-wa-md flex flex-col lg:flex-row overflow-hidden min-h-[560px]"
            >
                {/* Left branding panel — desktop only */}
                <div className="hidden lg:block lg:w-[360px] shrink-0">
                    <AuthBranding activeTab="login" />
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

                    <div className="mb-7">
                        <h1 className="text-2xl font-bold text-wa-dark mb-1.5">{AUTH_COPY.login.title}</h1>
                        <p className="text-sm text-wa-icon">{AUTH_COPY.login.desc}</p>
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

                </div>
            </motion.div>

            {/* Footer note */}
            <p className="mt-6 text-xs text-wa-muted text-center">
                {AUTH_COPY.branding.footer}
            </p>
        </div>
    );
}
