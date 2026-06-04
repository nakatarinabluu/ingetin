import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { AuthBranding } from '@/features/auth-form/ui/AuthBranding';
import { ArrowLeft, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/tw.utils';

type RecoveryStep = 'IDENTIFY' | 'VERIFY' | 'SUCCESS';
type RecoveryMethod = 'EMAIL' | 'WHATSAPP';

/**
 * ForgotPassword — WhatsApp Official Style
 */
export default function ForgotPassword() {
    const [step, setStep] = useState<RecoveryStep>('IDENTIFY');
    const [username, setUsername] = useState('');
    const [method, setMethod] = useState<RecoveryMethod>('EMAIL');
    const [verificationValue, setVerificationValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleIdentify = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setStep('VERIFY');
            setLoading(false);
        }, 800);
    };

    const handleFinalVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep('SUCCESS');
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-wa-bg flex items-center justify-center p-4">
            <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-wa overflow-hidden flex flex-col md:flex-row min-h-[550px]">
                {/* Branding Side */}
                <div className="md:w-[400px] bg-wa-teal hidden md:block shrink-0">
                    <AuthBranding activeTab="forgot-password" />
                </div>

                {/* Form Side */}
                <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center">
                    <div className="absolute top-8 left-8">
                        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-wa-icon hover:text-wa-green transition-colors">
                            <ArrowLeft size={16} strokeWidth={2.5} />
                            Kembali
                        </Link>
                    </div>

                    <div className="max-w-sm mx-auto w-full mt-8 md:mt-0">
                        <AnimatePresence mode="wait">
                            
                            {step === 'IDENTIFY' && (
                                <motion.div key="identify" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                                    <div className="space-y-2 text-center md:text-left">
                                        <h1 className="text-2xl font-bold text-wa-dark">Lupa Kata Sandi?</h1>
                                        <p className="text-sm text-wa-icon leading-relaxed">
                                            Masukkan username Anda, kami akan membantu memulihkan akses ke akun Anda.
                                        </p>
                                    </div>
                                    <form onSubmit={handleIdentify} className="space-y-5">
                                        <Input 
                                            label="Nama Pengguna / Username" 
                                            placeholder="Cth: budi123" 
                                            value={username} 
                                            onChange={e => setUsername(e.target.value)} 
                                            required 
                                        />
                                        <div className="pt-2">
                                            <Button type="submit" isLoading={loading} className="w-full text-[15px] font-semibold h-[48px] rounded-xl">
                                                Lanjutkan
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 'VERIFY' && (
                                <motion.div key="verify" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                                    <div className="space-y-2 text-center md:text-left">
                                        <h1 className="text-2xl font-bold text-wa-dark">Pilih Metode</h1>
                                        <p className="text-sm text-wa-icon leading-relaxed">
                                            Pilih ke mana instruksi pemulihan harus dikirimkan untuk akun <strong>@{username}</strong>.
                                        </p>
                                    </div>

                                    <form onSubmit={handleFinalVerify} className="space-y-5">
                                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-wa-bg rounded-xl border border-wa-border">
                                            <button 
                                                type="button" 
                                                onClick={() => { setMethod('EMAIL'); setVerificationValue(''); }} 
                                                className={cn("px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2", 
                                                    method === 'EMAIL' ? 'bg-white text-wa-dark shadow-sm border border-wa-border' : 'text-wa-icon hover:text-wa-dark')}
                                            >
                                                <Mail size={16} /> Email
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { setMethod('WHATSAPP'); setVerificationValue(''); }} 
                                                className={cn("px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2", 
                                                    method === 'WHATSAPP' ? 'bg-white text-wa-dark shadow-sm border border-wa-border' : 'text-wa-icon hover:text-wa-dark')}
                                            >
                                                <MessageCircle size={16} /> WhatsApp
                                            </button>
                                        </div>
                                        
                                        <Input 
                                            label={method === 'EMAIL' ? "Alamat Email Terdaftar" : "Nomor WhatsApp Terdaftar"} 
                                            placeholder={method === 'EMAIL' ? "email@domain.com" : "0812..."} 
                                            value={verificationValue} 
                                            onChange={e => setVerificationValue(e.target.value)} 
                                            required 
                                            autoFocus 
                                        />
                                        
                                        <div className="space-y-4 pt-2">
                                            <Button type="submit" isLoading={loading} className="w-full text-[15px] font-semibold h-[48px] rounded-xl">
                                                Kirim Instruksi
                                            </Button>
                                            <button 
                                                type="button" 
                                                onClick={() => setStep('IDENTIFY')} 
                                                className="w-full text-center text-sm font-semibold text-wa-green hover:text-wa-green-dark transition-colors"
                                            >
                                                Bukan akun ini? Ganti Username
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 'SUCCESS' && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                                    <div className="w-16 h-16 bg-wa-green-light text-wa-green rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-wa-dark">Instruksi Terkirim!</h1>
                                    <p className="text-sm text-wa-icon leading-relaxed max-w-xs mx-auto">
                                        Periksa kotak masuk pesan Anda untuk langkah selanjutnya memulihkan kata sandi.
                                    </p>
                                    <div className="pt-6">
                                        <Button asChild className="w-full text-[15px] font-semibold h-[48px] rounded-xl">
                                            <Link to="/login">Kembali ke Masuk</Link>
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
