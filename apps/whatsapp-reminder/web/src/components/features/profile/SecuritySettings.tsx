import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Typography } from '../../ui/Typography';
import { toast } from 'sonner';
import { ShieldCheck, Lock, ArrowRight, X, KeyRound, ShieldAlert } from 'lucide-react';
import { cn } from '../../../utils/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';

const securitySchema = z.object({
  oldPassword: z.string().min(1, "Sandi lama harus diisi"),
  newPassword: z.string().min(8, "Sandi baru minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Konfirmasi sandi minimal 8 karakter"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi sandi tidak sinkron",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securitySchema>;

/**
 * 🚀 THE MODERN PRO SECURITY - v9.0
 * Authority & Cyber-Integritiy Module.
 */
export const SecuritySettings: React.FC = () => {
  const [isChanging, setIsChanging] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
  });

  const onSubmit = async (data: SecurityFormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Clinical simulation
      toast.success("Otoritas Akses Diperbarui", {
          description: "Parameter kredensial Anda telah berhasil didefinisikan ulang."
      });
      setIsChanging(false);
      reset();
    } catch (err) {
      toast.error("Kegagalan Protokol: Update kredensial dibatalkan");
    }
  };

  return (
    <div className="space-y-10 text-left">
      <div className="space-y-3">
        <Typography variant="h4" className="text-xl font-bold tracking-tight">Otoritas & Kredensial</Typography>
        <Typography variant="p" className="text-muted-foreground/60 text-sm font-medium leading-relaxed">
          Manajemen parameter akses untuk menjaga integritas dan kerahasiaan direktori operasional Anda.
        </Typography>
      </div>

      <AnimatePresence mode="wait">
        {!isChanging ? (
          <motion.button 
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setIsChanging(true)}
            className="w-full flex items-center justify-between p-6 bg-secondary/30 rounded-2xl border border-border group hover:border-accent/40 hover:bg-white transition-all duration-300 shadow-sm"
          >
            <div className="flex items-center gap-5">
                <div className="p-3 bg-white rounded-xl border border-border group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-500 shadow-sm">
                    <KeyRound size={20} strokeWidth={2.5} />
                </div>
                <div className="text-left space-y-1">
                  <Typography variant="small" className="font-bold text-muted-foreground/30 uppercase tracking-[0.2em] text-[8px] block">Kredensial Aktif</Typography>
                  <Typography variant="h4" className="text-sm font-bold tracking-widest text-foreground group-hover:text-accent transition-colors">••••••••••••</Typography>
                </div>
            </div>
            <div className="flex items-center gap-2 text-accent bg-accent/5 px-4 py-2 rounded-xl border border-accent/10 group-hover:bg-accent group-hover:text-white transition-all">
                <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-6 text-left bg-secondary/10 p-8 rounded-2xl border border-border shadow-subtle relative"
          >
            <div className="absolute top-4 right-4">
                <button 
                  type="button" 
                  onClick={() => setIsChanging(false)} 
                  className="p-2 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
            </div>

            <div className="space-y-6">
                <Controller
                  name="oldPassword"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Kredensial Lama" type="password" placeholder="••••••••" error={errors.oldPassword?.message} className="rounded-xl shadow-sm bg-white" />
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <Controller
                    name="newPassword"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} label="Parameter Baru" type="password" placeholder="••••••••" error={errors.newPassword?.message} className="rounded-xl shadow-sm bg-white" />
                    )}
                    />
                    <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} label="Konfirmasi Parameter" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} className="rounded-xl shadow-sm bg-white" />
                    )}
                    />
                </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full h-14 rounded-xl shadow-modern font-bold uppercase tracking-widest text-[11px] mt-4">
              Aktivasi Kredensial Baru
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 03. PROTECTION PROTOCOL STATUS */}
      <div className="pt-8 border-t border-border mt-2">
        <div className="flex items-center justify-between p-5 rounded-2xl bg-success/5 border border-success/10 group">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-success/20 flex items-center justify-center text-success shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left space-y-1">
                <Typography variant="small" className="font-bold text-success/40 uppercase tracking-widest text-[9px] block">Integritas Transmisi</Typography>
                <Typography variant="h4" className="text-xs font-black text-success uppercase tracking-[0.2em]">Protocol Secured</Typography>
              </div>
          </div>
          <div className="flex flex-col items-end gap-1 px-4">
             <div className="flex items-center gap-2">
                <Typography variant="small" className="text-[9px] font-bold text-success uppercase tracking-widest">Active</Typography>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
             </div>
             <Typography variant="small" className="text-[7px] font-bold text-success/30 uppercase tracking-[0.3em]">Encrypted End-to-End</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
