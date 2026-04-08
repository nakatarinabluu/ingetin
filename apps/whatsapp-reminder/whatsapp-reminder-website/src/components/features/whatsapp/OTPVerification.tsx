import React, { useState } from 'react';
import { Shield, Smartphone, ArrowRight, Hash, CheckCircle2, AlertTriangle } from 'lucide-react';
import { WhatsAppAPI, AuthAPI } from '../../../api/services';
import { Modal } from '../../ui';
import { ConnectionStatusBadge } from '../../atoms/ConnectionStatusBadge';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

interface OTPVerificationProps {
    phoneNumber?: string | null;
    onSuccess: () => void;
    customClass?: string;
    headless?: boolean;
}

export default function OTPVerification({ phoneNumber, onSuccess, customClass = '', headless = false }: OTPVerificationProps) {
    const { refreshUser } = useAuth();
    const [step, setStep] = useState(() => {
        return Number(localStorage.getItem('wa_otp_step')) || 1;
    });
    const [phone, setPhone] = useState(() => {
        return localStorage.getItem('wa_otp_phone') || '';
    });
    const [otp, setOtp] = useState('');
    const [busy, setBusy] = useState(false);
    const [cooldown, setCooldown] = useState(() => {
        const savedExpiry = Number(localStorage.getItem('wa_otp_cooldown_expiry'));
        if (!savedExpiry) return 0;
        const remaining = Math.ceil((savedExpiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    });
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

    // Silicon Valley DX: Persist state to localStorage
    React.useEffect(() => {
        localStorage.setItem('wa_otp_step', step.toString());
        localStorage.setItem('wa_otp_phone', phone);
    }, [step, phone]);

    // Handle countdown and persistence
    React.useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            localStorage.removeItem('wa_otp_cooldown_expiry');
        }
    }, [cooldown]);

    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (cooldown > 0) return;
        
        setBusy(true);
        try {
            await WhatsAppAPI.sendOTP({ phone });
            setStep(2);
            
            const expiry = Date.now() + 60000;
            localStorage.setItem('wa_otp_cooldown_expiry', expiry.toString());
            setCooldown(60);
            toast.success('Verification code sent to WhatsApp');
        } catch (err: any) {
            if (err.response?.status === 429) {
                const msg = err.response?.data?.error;
                const match = msg?.match(/\d+/);
                const seconds = match ? parseInt(match[0]) : 60;
                setCooldown(seconds);
                localStorage.setItem('wa_otp_cooldown_expiry', (Date.now() + seconds * 1000).toString());
                setStep(2);
                toast.error(`Please wait ${seconds}s before resending`);
            } else {
                toast.error(err.response?.data?.error || 'Transmission failure');
            }
        }
        setBusy(false);
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        try {
            await WhatsAppAPI.verifyOTP({ phone, code: otp });
            toast.success('WhatsApp Connected Successfully!');
            
            // Sync local auth state
            refreshUser({ phoneNumber: phone } as any);
            
            localStorage.removeItem('wa_otp_step');
            localStorage.removeItem('wa_otp_phone');
            localStorage.removeItem('wa_otp_cooldown_expiry');
            
            onSuccess();
            setStep(1);
            setPhone('');
            setOtp('');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Verification rejected. Please check your code.';
            toast.error(msg);
        }
        setBusy(false);
    };

    const handleReset = async () => {
        setBusy(true);
        try {
            await AuthAPI.unlinkPhone();
            setShowUnlinkConfirm(false);
            onSuccess();
            toast.success('WhatsApp connection removed');
        } catch (err) {
            toast.error('Reset failed');
        }
        setBusy(false);
    };

    const baseClass = headless ? '' : (customClass || 'lumina-card p-10');

    if (phoneNumber) {
        return (
            <div className={`${baseClass} relative overflow-hidden flex items-center group ${!headless && 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center justify-between w-full relative z-10">
                    <ConnectionStatusBadge 
                        isConnected={true} 
                        label="Identity Linked" 
                        subLabel={`Active Node: +${phoneNumber}`} 
                    />
                    <button 
                        onClick={() => setShowUnlinkConfirm(true)} 
                        disabled={busy} 
                        className="px-6 py-2.5 lumina-panel border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all disabled:opacity-50 shadow-sm"
                    >
                        {busy ? 'SYNCING...' : 'ROTATE NODE'}
                    </button>
                </div>
                {!headless && (
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 pointer-events-none">
                        <Shield size={160} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`${baseClass} relative overflow-hidden flex flex-col justify-center ${!headless && 'min-h-[350px] bg-white border-slate-100 shadow-sm'}`}>
            {step === 1 ? (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                    {!headless && (
                        <header className="mb-8">
                            <div className="flex items-center gap-4 mb-2.5">
                                <div className="w-9 h-9 lumina-panel flex items-center justify-center text-emerald-600 bg-emerald-50 rounded-xl">
                                    <Smartphone size={18} />
                                </div>
                                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Handshake Protocol</h2>
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-13 opacity-70">Initialize cellular communication node</p>
                         </header>
                    )}
                    <form 
                        id="otp-handshake-form"
                        onSubmit={handleSendOTP} 
                        className={`space-y-6 ${!headless && 'ml-13'}`}
                    >
                        <div className="relative group">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input 
                                required 
                                type="tel" 
                                inputMode="tel"
                                placeholder="+62..." 
                                className="lumina-input w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] transition-all text-[14px] font-bold text-slate-700 outline-none shadow-sm placeholder:text-slate-300" 
                                value={phone} 
                                onChange={e => {
                                    const val = e.target.value;
                                    const sanitized = val.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
                                    setPhone(sanitized);
                                }} 
                            />
                        </div>
                        {!headless && (
                            <button 
                                disabled={busy || cooldown > 0}
                                type="submit"
                                className="primary-button w-full py-3.5 flex items-center justify-center gap-3 text-[13px] font-bold rounded-xl disabled:opacity-50 disabled:grayscale"
                            >
                                {busy ? 'TRANSMITTING...' : cooldown > 0 ? `RETRY IN ${cooldown}S` : 'Initialize Link'}
                                <ArrowRight size={18} />
                            </button>
                        )}
                        {headless && (
                            <button type="submit" className="hidden" />
                        )}
                    </form>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                    <form 
                        id="otp-handshake-form"
                        onSubmit={handleVerify} 
                        className={`space-y-8 ${!headless && 'max-w-sm mx-auto'}`}
                    >
                        <div className="relative group">
                             <input 
                                required 
                                maxLength={6} 
                                type="text" 
                                inputMode="numeric"
                                placeholder="XXXXXX" 
                                className="lumina-input w-full py-5 bg-slate-50 text-center text-3xl tracking-[0.2em] pr-[0.2em] font-bold text-slate-700 border border-slate-200 rounded-xl focus:bg-white focus:border-[#25D366] outline-none shadow-sm placeholder:text-slate-100" 
                                value={otp} 
                                onChange={e => {
                                    const val = e.target.value;
                                    const sanitized = val.replace(/\D/g, '');
                                    setOtp(sanitized);
                                }} 
                            />
                        </div>
                        {!headless && (
                            <div className="grid grid-cols-2 gap-6">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)} 
                                    className="secondary-button py-4 font-black text-[10px] uppercase tracking-widest"
                                >
                                    BACK
                                </button>
                                <button 
                                    disabled={busy}
                                    type="submit"
                                    className="primary-button py-4 flex items-center justify-center gap-3 font-black text-[10px]"
                                >
                                    {busy ? 'SYNCING...' : 'VERIFY'}
                                    <CheckCircle2 size={16} />
                                </button>
                            </div>
                        )}
                        {!headless && cooldown === 0 && (
                            <div className="mt-6 text-center">
                                <button 
                                    type="button"
                                    onClick={() => handleSendOTP()}
                                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest"
                                >
                                    Didn't get a code? Resend
                                </button>
                            </div>
                        )}
                        {headless && (
                            <button type="submit" className="hidden" />
                        )}
                    </form>
                </div>
            )}
            {!headless && (
                <div className="absolute top-0 right-0 p-10 text-slate-100/10 pointer-events-none">
                    <Hash size={200} />
                </div>
            )}

            <Modal
                isOpen={showUnlinkConfirm}
                onClose={() => setShowUnlinkConfirm(false)}
                title="Disconnect Node"
                subtitle="Terminate the current cellular link."
                icon={<AlertTriangle />}
                footer={
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowUnlinkConfirm(false)}
                            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleReset}
                            disabled={busy}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold text-[13px] shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {busy ? 'Disconnecting...' : 'Confirm Rotation'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                        <p className="text-[12px] text-rose-700 font-bold uppercase tracking-tight leading-relaxed">
                            Warning: This will terminate the active bridge for +{phoneNumber}. Reminders will not be sent until a new node is initialized.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
