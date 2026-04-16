import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthBranding } from '../../components/features/auth/AuthBranding';
import { ArrowLeft, Mail, MessageCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/tw.utils';

type RecoveryStep = 'IDENTIFY' | 'VERIFY' | 'SUCCESS';
type RecoveryMethod = 'EMAIL' | 'WHATSAPP';

/**
 * 🚀 THE OFFICIAL WHATSAPP WEB STYLE FORGOT PASSWORD
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
        <div className="min-h-screen bg-[#f0f2f5] relative flex flex-col items-center justify-center p-4">
            {/* WHATSAPP GREEN STRIP */}
            <div className="wa-header-strip" />

            <div className="w-full max-w-[1000px] bg-white shadow-wa rounded-sm flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px] relative z-10">
                {/* BRANDING SIDE */}
                <div className="lg:w-[400px] border-r border-gray-100 hidden lg:block">
                    <AuthBranding activeTab="forgot-password" />
                </div>

                {/* FORM SIDE */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00a884] transition-colors font-semibold text-sm">
                            <ArrowLeft size={16} />
                            Kembali
                        </Link>
                    </div>

                    <div className="max-w-md mx-auto lg:mx-0 w-full text-left">
                        <AnimatePresence mode="wait">
                            
                            {step === 'IDENTIFY' && (
                                <motion.div key="identify" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                                    <div className="space-y-3">
                                        <Typography variant="h1" className="text-3xl font-light text-[#41525d]">Lupa Kata Sandi?</Typography>
                                        <Typography variant="p" className="text-[#667781] font-medium">Kami akan membantu Anda mendapatkan kembali akses ke akun Anda.</Typography>
                                    </div>
                                    <form onSubmit={handleIdentify} className="space-y-8">
                                        <Input 
                                            label="Nama Pengguna" 
                                            placeholder="Masukkan username Anda" 
                                            leftIcon={<Mail className="text-gray-400" />}
                                            value={username} 
                                            onChange={e => setUsername(e.target.value)} 
                                            required 
                                        />
                                        <Button type="submit" isLoading={loading} className="w-full h-12 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold">
                                            Lanjutkan
                                        </Button>
                                    </form>
                                </motion.div>
                            )}

                            {step === 'VERIFY' && (
                                <motion.div key="verify" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                                    <div className="space-y-3">
                                        <Typography variant="h1" className="text-3xl font-light text-[#41525d]">Pilih Metode</Typography>
                                        <Typography variant="p" className="text-[#667781] font-medium">Halo, @{username}. Pilih ke mana kami harus mengirimkan instruksi pemulihan.</Typography>
                                    </div>

                                    <form onSubmit={handleFinalVerify} className="space-y-8">
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-[#f0f2f5] rounded-lg">
                                            <button 
                                                type="button" 
                                                onClick={() => { setMethod('EMAIL'); setVerificationValue(''); }} 
                                                className={cn("px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-2", method === 'EMAIL' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500 hover:text-gray-700')}
                                            >
                                                <Mail size={14} /> Email
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { setMethod('WHATSAPP'); setVerificationValue(''); }} 
                                                className={cn("px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-2", method === 'WHATSAPP' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500 hover:text-gray-700')}
                                            >
                                                <MessageCircle size={14} /> WhatsApp
                                            </button>
                                        </div>
                                        <Input 
                                            label={method === 'EMAIL' ? "Alamat Email Terdaftar" : "Nomor WhatsApp Terdaftar"} 
                                            placeholder={method === 'EMAIL' ? "email@domain.com" : "+62 8..."} 
                                            value={verificationValue} 
                                            onChange={e => setVerificationValue(e.target.value)} 
                                            required 
                                            autoFocus 
                                        />
                                        <div className="space-y-6">
                                            <Button type="submit" isLoading={loading} className="w-full h-12 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold">
                                                Kirim Instruksi
                                            </Button>
                                            <button type="button" onClick={() => setStep('IDENTIFY')} className="w-full text-center text-xs font-semibold text-gray-400 hover:text-[#00a884] transition-colors uppercase tracking-widest">
                                                Ini bukan akun saya
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 'SUCCESS' && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-6">
                                    <div className="w-16 h-16 bg-[#dcf8c6] text-[#00a884] rounded-full flex items-center justify-center mx-auto shadow-sm">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div className="space-y-3">
                                        <Typography variant="h2" className="text-2xl font-light text-[#41525d]">Instruksi Terkirim</Typography>
                                        <Typography variant="p" className="text-[#667781] font-medium leading-relaxed">Permintaan Anda sedang diproses. Silakan periksa pesan masuk Anda untuk langkah selanjutnya.</Typography>
                                    </div>
                                    <div className="pt-4">
                                      <Button asChild className="h-12 px-10 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold">
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
