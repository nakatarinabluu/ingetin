import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, Sparkles, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { AuthAPI } from '@/entities/user/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthBranding } from '@/features/auth-form/ui/AuthBranding';
import { AxiosError } from 'axios';
import { AUTH_COPY, BRAND_COPY } from '@/shared/config/copy';

/**
 * Activate — WhatsApp Official Style
 */
export default function Activate() {
    const { session, logout, updateSession } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (session?.isActivated && !success) {
            navigate('/dashboard', { replace: true });
        }
    }, [session, navigate, success]);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 4 || loading || success) return;

        setLoading(true);
        setErrorMessage('');

        try {
            await AuthAPI.activate({ code: code.toUpperCase() });
            setSuccess(true);
            updateSession({ isActivated: true });
            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate('/dashboard', { replace: true });
        } catch (err: unknown) {
            const error = err as AxiosError<{ error: string }>;
            setErrorMessage(error.response?.data?.error || AUTH_COPY.errors.activate_failed);
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

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center gap-5 py-8"
                            >
                                <div className="w-16 h-16 bg-wa-green-light rounded-2xl flex items-center justify-center text-wa-green">
                                    <Sparkles size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-wa-dark">{AUTH_COPY.activate.success_title}</h2>
                                    <p className="text-sm text-wa-icon">{AUTH_COPY.activate.success_desc}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-7 w-full max-w-md"
                            >
                                <div>
                                    <h1 className="text-2xl font-bold text-wa-dark mb-1.5">{AUTH_COPY.activate.title}</h1>
                                    <p className="text-sm text-wa-icon">{AUTH_COPY.activate.desc}</p>
                                </div>

                                {errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-3"
                                    >
                                        <ShieldAlert size={17} className="shrink-0 mt-0.5 text-red-400" />
                                        <span>{errorMessage}</span>
                                    </motion.div>
                                )}

                                <form onSubmit={handleActivate} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-wa-dark">
                                            {AUTH_COPY.activate.input_placeholder}
                                        </label>
                                        <input
                                            required
                                            autoFocus
                                            type="text"
                                            placeholder="XXXX"
                                            value={code}
                                            onChange={e => setCode(e.target.value.toUpperCase())}
                                            className="w-full bg-wa-bg border border-wa-border focus:border-wa-green focus:bg-white focus:ring-2 focus:ring-wa-green/10 text-center text-3xl font-bold tracking-[0.25em] text-wa-dark placeholder:text-wa-border py-6 outline-none transition-all uppercase rounded-xl"
                                            maxLength={8}
                                        />
                                        <p className="text-xs text-wa-muted text-center">{AUTH_COPY.activate.input_footer}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            disabled={loading || code.length < 4}
                                            className="w-full h-12 bg-wa-green hover:bg-wa-green-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                AUTH_COPY.activate.submit
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-wa-muted hover:text-red-500 transition-colors"
                                        >
                                            <LogOut size={14} />
                                            {AUTH_COPY.activate.logout}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <p className="mt-6 text-xs text-wa-muted text-center">
                {AUTH_COPY.branding.footer}
            </p>
        </div>
    );
}
