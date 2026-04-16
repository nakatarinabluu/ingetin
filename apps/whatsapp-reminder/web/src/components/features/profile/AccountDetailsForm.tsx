import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Session } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { User, Mail, AtSign, Save, ShieldAlert, BadgeCheck } from 'lucide-react';
import { Typography } from '../../ui/Typography';
import { cn } from '../../../utils/tw.utils';

const accountSchema = z.object({
  firstName: z.string().min(2, "Nama depan minimal 2 karakter"),
  lastName: z.string().min(2, "Nama belakang minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

/**
 * 🚀 THE MODERN PRO ACCOUNT FORM - v9.0
 * Precision Identity Input & Data Integrity.
 */
export const AccountDetailsForm: React.FC<{ session: Session | null }> = ({ session }) => {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: session?.username?.split(' ')[0] || '',
      lastName: session?.username?.split(' ')[1] || '',
      email: 'pro@ingetin.com', // Clinical placeholder
      username: session?.username || '',
    }
  });

  const onSubmit = async (data: AccountFormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Clinical simulation
      toast.success("Integritas Profil Diperbarui", {
          description: "Data identitas digital Anda telah disinkronisasi ke pusat kontrol."
      });
    } catch (err) {
      toast.error("Anomali Sinkronisasi: Gagal memperbarui profil");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pt-24 pb-12 text-left space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 01. PERSONAL IDENTITY CORE */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
             <User size={18} className="text-accent" />
             <Typography variant="h4" className="text-lg font-bold tracking-tight">Informasi Personal</Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
                <Input 
                    {...field} 
                    label="Nama Depan" 
                    placeholder="Misal: Budi" 
                    error={errors.firstName?.message} 
                    className="rounded-xl bg-secondary/30 focus:bg-white transition-all shadow-sm"
                />
            )}
            />
            <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
                <Input 
                    {...field} 
                    label="Nama Belakang" 
                    placeholder="Satria" 
                    error={errors.lastName?.message} 
                    className="rounded-xl bg-secondary/30 focus:bg-white transition-all shadow-sm"
                />
            )}
            />
        </div>
      </div>

      {/* 02. SYSTEM REGISTRY DATA (READ-ONLY) */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-border pb-4">
             <BadgeCheck size={18} className="text-accent" />
             <Typography variant="h4" className="text-lg font-bold tracking-tight">Registrasi Sistem</Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Controller
            name="email"
            control={control}
            render={({ field }) => (
                <Input 
                    {...field} 
                    label="Alamat Email Terverifikasi" 
                    leftIcon={<Mail size={16} />} 
                    disabled 
                    className="bg-secondary cursor-not-allowed border-dashed opacity-70 font-bold rounded-xl" 
                />
            )}
            />
            <Controller
            name="username"
            control={control}
            render={({ field }) => (
                <Input 
                    {...field} 
                    label="Username Registry" 
                    leftIcon={<AtSign size={16} />} 
                    disabled 
                    className="bg-secondary cursor-not-allowed border-dashed opacity-70 font-bold rounded-xl" 
                />
            )}
            />
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-accent/[0.03] border border-accent/10 rounded-xl">
            <ShieldAlert size={16} className="text-accent mt-0.5" />
            <Typography variant="p" className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed">
                Username dan Email adalah parameter identitas permanen. Hubungi tim otoritas Ingetin jika diperlukan penyesuaian pada kunci identitas sistem ini.
            </Typography>
        </div>
      </div>

      {/* 03. ACTION ANCHOR */}
      <div className="pt-10 border-t border-border flex justify-end">
        <Button 
          type="submit" 
          isLoading={isSubmitting} 
          className="rounded-xl px-12 h-14 shadow-modern font-bold uppercase tracking-widest text-[11px]"
          leftIcon={<Save size={18} />}
        >
          Komit Perubahan Profil
        </Button>
      </div>
    </form>
  );
};
