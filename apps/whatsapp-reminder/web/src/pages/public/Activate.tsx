import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthAPI } from '../../api/auth.api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { AuthBranding } from '../../components/features/auth/AuthBranding';
import { FADE_IN, SCALE_IN, SLIDE_UP } from '../../utils/motion';
import { AxiosError } from 'axios';
import { AUTH_COPY, BRAND_COPY, COMMON_COPY } from '../../constants/copy';

/**
 * 🚀 THE OFFICIAL WHATSAPP WEB STYLE ACTIVATE
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
        <div className="min-h-screen bg-[#f0f2f5] relative flex flex-col items-center justify-center p-4">
            {/* WHATSAPP GREEN STRIP */}
            <div className="wa-header-strip" />

            <div className="w-full max-w-[1000px] bg-white shadow-wa rounded-sm flex flex-col lg:flex-row min-h-[500px] lg:min-h-[700px] relative z-10">
                <div className="lg:w-[400px] border-r border-gray-100 hidden lg:block">
                    <AuthBranding activeTab="login" />
                </div>

                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-md mx-auto lg:mx-0 w-full space-y-12">
                        <motion.div {...SLIDE_UP} className="space-y-3">
                            <Typography variant="h1" className="text-3xl font-light text-[#41525d]">{AUTH_COPY.activate.title}</Typography>
                            <Typography variant="p" className="text-[#667781] font-medium">{AUTH_COPY.activate.desc}</Typography>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div 
                                    key="success"
                                    {...SCALE_IN}
                                    className="p-10 rounded-2xl bg-[#dcf8c6] border border-[#00a884]/10 flex flex-col items-center text-center gap-6 py-16"
                                >
                                    <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center text-white">
                                        <Sparkles size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <Typography variant="h2" className="text-2xl font-bold text-[#111b21]">{AUTH_COPY.activate.success_title}</Typography>
                                        <Typography variant="p" className="text-[#667781] text-xs font-bold uppercase tracking-widest leading-relaxed">
                                            {AUTH_COPY.activate.success_desc}
                                        </Typography>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleActivate} className="space-y-12">
                                    {errorMessage && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3">
                                            <ShieldAlert size={18} className="shrink-0" />
                                            <span>{errorMessage}</span>
                                        </motion.div>
                                    )}

                                    <div className="space-y-3 text-center lg:text-left">
                                        <input 
                                            required 
                                            autoFocus 
                                            type="text" 
                                            placeholder={AUTH_COPY.activate.input_placeholder} 
                                            value={code} 
                                            onChange={e => setCode(e.target.value.toUpperCase())}
                                            className="w-full bg-[#f0f2f5] border border-gray-200 focus:border-[#00a884] focus:bg-white text-center text-3xl font-bold tracking-[0.2em] text-[#111b21] placeholder:text-gray-300 py-10 outline-none transition-all uppercase rounded-lg"
                                        />
                                        <Typography variant="small" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{AUTH_COPY.activate.input_footer}</Typography>
                                    </div>

                                    <div className="space-y-6">
                                        <Button 
                                            type="submit" 
                                            isLoading={loading} 
                                            className="w-full h-14 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold text-lg"
                                        >
                                            {AUTH_COPY.activate.submit}
                                        </Button>
                                        <button 
                                            type="button" 
                                            onClick={logout} 
                                            className="w-full flex items-center justify-center gap-2.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                                        >
                                            <LogOut size={14} /> {AUTH_COPY.activate.logout}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
