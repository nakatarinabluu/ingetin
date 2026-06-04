import React, { useState } from 'react';
import { Smartphone, MessageSquare, ShieldCheck, ArrowRight, Link, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/lib/tw.utils';
import { ChatAPI } from '@/entities/chat/api';
import { Session } from '@/app/providers/AuthContext';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

type Step = 'OVERVIEW' | 'WA_PHONE' | 'WA_OTP';

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({ isOpen, onClose, session }) => {
  const [step, setStep] = useState<Step>('OVERVIEW');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.startsWith('+')) {
      toast.error("Format Nomor Salah", { description: "Gunakan format internasional (contoh: +628...)" });
      return;
    }

    setIsLoading(true);
    try {
      await ChatAPI.sendOTP({ phone });
      setStep('WA_OTP');
      toast.success("Kode Terkirim", { description: `Kode OTP telah dikirim ke ${phone}` });
    } catch (err) {
      toast.error("Gagal mengirim OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ChatAPI.verifyOTP({ phone, code: otp });
      toast.success("Berhasil: WhatsApp Terhubung!");
      onClose();
      setTimeout(() => {
        setStep('OVERVIEW');
        setPhone('');
        setOtp('');
      }, 500);
    } catch (err) {
      toast.error("Kode OTP Tidak Valid");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Tautkan Perangkat" 
      subtitle="Kelola integrasi pengiriman pesan ke perangkat Anda." 
      icon={<Link size={20} className="text-wa-icon" />}
      maxWidth="max-w-[480px]"
    >
      <div className="py-2 text-left">
        <AnimatePresence mode="wait">
          {step === 'OVERVIEW' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <ConnectionItem 
                icon={<MessageSquare size={18} strokeWidth={2} />} 
                label="Asisten WhatsApp" 
                value={session?.username ? "Terhubung & Aktif" : "Belum Terhubung"} 
                onAction={() => setStep('WA_PHONE')} 
                actionLabel={session?.username ? "Ganti Nomor" : "Tautkan"}
                isActive={!!session?.username}
              />
              <ConnectionItem 
                icon={<Mail size={18} strokeWidth={2} />} 
                label="Akun Google" 
                value="Terhubung Aman" 
                onAction={() => toast.info("Fitur pemutusan akun sedang dinonaktifkan")} 
                actionLabel="Putuskan"
                isActive={true}
              />
              
              <div className="p-4 bg-wa-bg rounded-xl flex items-start gap-3 mt-4">
                 <ShieldCheck size={18} className="text-wa-green shrink-0 mt-0.5" />
                 <p className="text-[13px] font-medium text-wa-icon leading-relaxed">
                    Catatan: Mengganti nomor WhatsApp akan memindahkan semua target jadwal pengingat aktif Anda ke nomor yang baru untuk memastikan pesan tetap terkirim.
                 </p>
              </div>
            </motion.div>
          )}

          {step === 'WA_PHONE' && (
            <motion.div key="wa-phone" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
              <div className="text-left space-y-2 border-b border-wa-border pb-4">
                <div className="flex items-center gap-2">
                    <Smartphone size={20} className="text-wa-green" />
                    <h4 className="text-lg font-bold text-wa-dark">Nomor WhatsApp</h4>
                </div>
                <p className="text-sm text-wa-icon font-medium">Masukkan nomor WhatsApp yang aktif untuk menerima pesan dari asisten virtual Anda.</p>
              </div>
                
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <Input 
                    type="tel"
                    label="Nomor Ponsel"
                    placeholder="+62 8xxx xxxx" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                    className="text-lg font-bold"
                />
                <div className="flex gap-3 pt-2">
                  <button type="button" className="flex-1 h-12 rounded-xl text-sm font-semibold text-wa-icon bg-wa-bg hover:bg-wa-border transition-colors" onClick={() => setStep('OVERVIEW')}>
                    Batal
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 h-12 rounded-xl text-sm font-semibold text-white bg-wa-green shadow-sm hover:bg-wa-green-dark transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Kirim OTP <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'WA_OTP' && (
            <motion.div key="wa-otp" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-wa-green/10 rounded-2xl mx-auto flex items-center justify-center text-wa-green mb-2">
                    <MessageSquare size={24} strokeWidth={2} />
                </div>
                <h4 className="text-[18px] font-bold text-wa-dark">Verifikasi Nomor</h4>
                <p className="text-sm text-wa-icon leading-relaxed mx-auto max-w-xs">
                    Masukkan 6-digit kode OTP yang telah dikirimkan melalui pesan WhatsApp ke nomor <b className="text-wa-dark">{phone}</b>
                </p>
              </div>
                
              <form onSubmit={handleVerifyOTP} className="space-y-6 pt-2">
                <div className="flex justify-center">
                    <Input 
                        type="text"
                        placeholder="••••••" 
                        containerClassName="w-full max-w-[240px]"
                        className="text-center text-3xl font-black tracking-[0.4em]" 
                        maxLength={6} 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)} 
                        required 
                    />
                </div>
                <div className="space-y-3">
                    <button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-sm font-semibold text-white bg-wa-green shadow-sm hover:bg-wa-green-dark transition-colors flex justify-center items-center gap-2 disabled:opacity-70">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Verifikasi & Hubungkan"}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setStep('WA_PHONE')} 
                        className="w-full text-[13px] font-semibold text-wa-icon hover:text-wa-dark transition-colors py-2"
                    >
                        Ganti nomor telepon
                    </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

function ConnectionItem({ icon, label, value, onAction, actionLabel, isActive }: { icon: React.ReactNode, label: string, value: string, onAction: () => void, actionLabel: string, isActive: boolean }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-wa-border hover:border-wa-green/30 transition-all flex items-center justify-between">
      <div className="flex items-center gap-4 text-left">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all border border-transparent", isActive ? "bg-wa-green/10 text-wa-green" : "bg-wa-bg text-wa-icon")}>
            {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-[12px] font-medium text-wa-icon">{label}</p>
          <p className={cn("text-[14px] font-bold", !isActive ? "text-wa-icon" : "text-wa-dark")}>{value}</p>
        </div>
      </div>
      <button 
        className={cn(
            "h-9 px-4 rounded-lg text-sm font-semibold transition-colors",
            actionLabel === 'Putuskan' ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-white bg-wa-dark hover:bg-[#000000]"
        )} 
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}
