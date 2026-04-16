import React, { useState } from 'react';
import { Smartphone, MessageSquare, Calendar, ChevronRight, Hash, ShieldCheck, ArrowRight, X, Orbit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Modal } from '../../ui/Modal';
import { Typography } from '../../ui/Typography';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { WhatsAppAPI } from '../../../api/whatsapp.api';
import { Session } from '../../../context/AuthContext';
import { cn } from '../../../utils/tw.utils';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

type Step = 'OVERVIEW' | 'WA_PHONE' | 'WA_OTP';

/**
 * 🚀 THE MODERN PRO CONNECT MODAL - v9.0
 * Service Integration & Authority Linkage.
 */
export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({ isOpen, onClose, session }) => {
  const [step, setStep] = useState<Step>('OVERVIEW');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.startsWith('+')) {
      toast.error("Format Identitas Telepon Salah", { description: "Gunakan format internasional (misal: +62...)" });
      return;
    }

    setIsLoading(true);
    try {
      await WhatsAppAPI.sendOTP({ phone });
      setStep('WA_OTP');
      toast.success("Otorisasi Terkirim", { description: `Kredensial OTP telah dikirim ke terminal ${phone}` });
    } catch (err) {
      toast.error("Kegagalan Transmisi OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await WhatsAppAPI.verifyOTP({ phone, code: otp });
      toast.success("Service Linked: WhatsApp Terhubung!");
      onClose();
      // Reset protocol
      setTimeout(() => {
        setStep('OVERVIEW');
        setPhone('');
        setOtp('');
      }, 500);
    } catch (err) {
      toast.error("Kredensial OTP Tidak Valid");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Protokol Integrasi" 
      subtitle="Manajemen tautan layanan asisten otomatis Anda." 
      icon={<Orbit className="text-accent" />}
    >
      <div className="py-4 text-left">
        <AnimatePresence mode="wait">
          {step === 'OVERVIEW' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <ConnectionItem 
                icon={<MessageSquare size={20} strokeWidth={2.5} />} 
                label="WhatsApp Assistant" 
                value={session?.username ? "Linked & Active" : "Unlinked"} 
                onAction={() => setStep('WA_PHONE')} 
                actionLabel={session?.username ? "Switch Identity" : "Authorize"}
              />
              <ConnectionItem 
                icon={<Calendar size={20} strokeWidth={2.5} />} 
                label="Google Auth Protocol" 
                value="Secure Connection" 
                onAction={() => toast.info("Protokol pemutusan sedang dienkripsi")} 
                actionLabel="Detach"
                actionVariant="secondary"
              />
              
              <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 flex items-start gap-4">
                 <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
                 <Typography variant="p" className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed">
                    Setiap perubahan nomor WhatsApp akan memicu sinkronisasi ulang pada seluruh agenda aktif Anda untuk menjamin pengiriman transmisi.
                 </Typography>
              </div>
            </motion.div>
          )}

          {step === 'WA_PHONE' && (
            <motion.div key="wa-phone" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <Smartphone size={18} className="text-accent" />
                    <Typography variant="h4" className="text-lg font-bold tracking-tight">Identifikasi Endpoint</Typography>
                </div>
                
                <Typography variant="p" className="text-sm text-muted-foreground font-medium">Definisikan nomor WhatsApp target untuk asisten virtual Anda.</Typography>
                
                <form onSubmit={handleRequestOTP} className="space-y-8">
                  <Input 
                    label="Nomor Terminal (WhatsApp)" 
                    placeholder="+62 8xxx xxxx" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                    className="rounded-xl bg-secondary/30 focus:bg-white h-14 text-lg font-bold tabular-nums"
                  />
                  <div className="flex gap-4">
                    <Button type="button" variant="ghost" className="flex-1 font-bold h-12 uppercase tracking-widest text-[10px]" onClick={() => setStep('OVERVIEW')}>Anulir</Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 h-12 shadow-modern font-bold uppercase tracking-widest text-[10px]" rightIcon={<ArrowRight size={14} />}>Request OTP</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'WA_OTP' && (
            <motion.div key="wa-otp" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
              <div className="space-y-6 text-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-accent/5 rounded-2xl border border-accent/10 flex items-center justify-center text-accent shadow-sm animate-pulse">
                        <Hash size={32} strokeWidth={2.5} />
                    </div>
                    <Typography variant="h4" className="text-xl font-bold tracking-tight">Verifikasi Mandat</Typography>
                    <Typography variant="p" className="text-sm text-muted-foreground/60 leading-relaxed">Masukkan 6-digit kode otorisasi yang telah dikirim ke endpoint <br/><b className="text-foreground">{phone}</b></Typography>
                </div>
                
                <form onSubmit={handleVerifyOTP} className="space-y-10">
                  <Input 
                    label="Kode Otorisasi (OTP)" 
                    placeholder="— — — — — —" 
                    className="text-center text-3xl font-black tracking-[0.6em] h-16 bg-secondary/50 rounded-2xl border-2 focus:border-accent" 
                    maxLength={6} 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)} 
                    required 
                  />
                  <div className="space-y-4">
                      <Button type="submit" isLoading={isLoading} className="w-full h-14 rounded-xl shadow-modern font-bold uppercase tracking-widest text-[11px]">Validasi & Hubungkan</Button>
                      <button 
                        type="button" 
                        onClick={() => setStep('WA_PHONE')} 
                        className="text-[10px] font-bold text-muted-foreground/40 hover:text-destructive uppercase tracking-[0.3em] transition-colors w-full"
                      >
                        Anulir Terminal Telepon
                      </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

function ConnectionItem({ icon, label, value, onAction, actionLabel, actionVariant = 'outline' }: Record<string, any>) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border group hover:border-accent/30 transition-all duration-300 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-5 text-left">
        <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all duration-500 border border-border/50 shadow-inner group-hover:shadow-md">{icon}</div>
        <div className="text-left space-y-1">
          <Typography variant="small" className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{label}</Typography>
          <Typography variant="h4" className={cn("text-sm font-bold tracking-tight", value.includes('Unlinked') ? "text-destructive" : "text-foreground")}>{value}</Typography>
        </div>
      </div>
      <Button 
        size="sm" 
        variant={actionVariant} 
        className={cn(
            "rounded-xl px-5 font-bold uppercase tracking-widest text-[9px]",
            actionLabel === 'Detach' ? "border-destructive/20 text-destructive hover:bg-destructive/5" : "bg-zinc-950 text-white border-zinc-900"
        )} 
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
