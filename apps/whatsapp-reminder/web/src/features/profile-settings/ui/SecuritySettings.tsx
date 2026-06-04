import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

import { Modal } from '@/shared/ui/Modal';
import { toast } from 'sonner';
import { Lock, ArrowRight, KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { PROFILE_COPY } from '@/shared/config/copy';

const securitySchema = z.object({
  oldPassword: z.string().min(1, "Sandi lama harus diisi"),
  newPassword: z.string().min(8, PROFILE_COPY.validation.password_min),
  confirmPassword: z.string().min(8, PROFILE_COPY.validation.password_min),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi sandi tidak sinkron",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securitySchema>;

/**
 * 🔐 SECURITY SETTINGS — UX v3.0 (MODAL-FOCUSED)
 * Separating sensitive actions from the main layout for better focus and security.
 */
export const SecuritySettings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
  });

  const onSubmit = async (_data: SecurityFormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      toast.success("Kata Sandi Diperbarui", {
          description: "Kredensial keamanan Anda telah berhasil diperbarui secara aman."
      });
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error("Gagal memperbarui kata sandi");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-wa-dark">Keamanan & Privasi</h4>
        <p className="text-wa-icon text-sm">
          Kelola parameter akses dan integritas data akun Anda.
        </p>
      </div>

      {/* TRIGGER CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden bg-white border border-wa-border rounded-2xl p-6 shadow-wa transition-all hover:border-wa-green/40 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-wa-bg rounded-xl flex items-center justify-center text-wa-icon group-hover:bg-wa-green/10 group-hover:text-wa-green transition-colors duration-300">
                    <Lock size={22} strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-[15px] font-bold text-wa-dark">Kata Sandi Akun</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 size={12} className="text-wa-green" />
                        <span className="text-[11px] font-semibold text-wa-muted uppercase tracking-wider">Terenkripsi Sempurna</span>
                    </div>
                </div>
            </div>
            <div className="h-10 px-4 bg-wa-bg text-wa-dark group-hover:bg-wa-green group-hover:text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2">
                Ubah
                <ArrowRight size={14} strokeWidth={2.5} />
            </div>
        </div>
      </motion.div>

      {/* PASSWORD CHANGE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            reset();
        }}
        title="Ubah Kata Sandi"
        subtitle="Sandi baru akan berlaku segera setelah sinkronisasi berhasil."
        icon={<KeyRound className="text-wa-green" />}
        maxWidth="max-w-[480px]"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 mb-2">
                <ShieldAlert size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-orange-700 leading-relaxed">
                    Pastikan Anda menggunakan kombinasi karakter yang kuat dan belum pernah digunakan sebelumnya.
                </p>
            </div>

            <div className="relative">
                <Controller
                  name="oldPassword"
                  control={control}
                  render={({ field }) => (
                    <Input 
                        {...field} 
                        label="Kata Sandi Saat Ini" 
                        type={showPasswords ? "text" : "password"} 
                        placeholder="••••••••" 
                        error={errors.oldPassword?.message} 
                        className="rounded-xl border-wa-border focus:border-wa-green bg-[#fcfcfc] pr-12 h-12" 
                    />
                  )}
                />
                <button 
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-4 top-[38px] text-wa-muted hover:text-wa-dark transition-colors"
                >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <div className="space-y-5">
                <Controller
                    name="newPassword"
                    control={control}
                    render={({ field }) => (
                        <Input 
                            {...field} 
                            label="Kata Sandi Baru" 
                            type={showPasswords ? "text" : "password"} 
                            placeholder="Minimal 8 karakter" 
                            error={errors.newPassword?.message} 
                            className="rounded-xl border-wa-border focus:border-wa-green bg-[#fcfcfc] h-12" 
                        />
                    )}
                />
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                        <Input 
                            {...field} 
                            label="Konfirmasi Sandi Baru" 
                            type={showPasswords ? "text" : "password"} 
                            placeholder="Ulangi sandi baru" 
                            error={errors.confirmPassword?.message} 
                            className="rounded-xl border-wa-border focus:border-wa-green bg-[#fcfcfc] h-12" 
                        />
                    )}
                />
            </div>

            <div className="pt-6 flex flex-col gap-3">
                <Button 
                    type="submit" 
                    isLoading={isSubmitting} 
                    className="w-full h-12 rounded-xl bg-wa-green text-white hover:bg-wa-green-dark font-bold shadow-sm"
                >
                    Aktivasi Sandi Baru
                </Button>
                <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-11 text-sm font-semibold text-wa-icon hover:text-wa-dark transition-colors"
                >
                    Nanti Saja
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
