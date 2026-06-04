import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';
import { User, ShieldAlert, Edit3, AtSign } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { useProfile, useUpdateProfile } from '@/entities/user/model/hooks';
import { cn } from '@/shared/lib/tw.utils';

import { PROFILE_COPY } from '@/shared/config/copy';

const accountSchema = z.object({
  firstName: z.string().min(2, PROFILE_COPY.validation.first_name_min),
  lastName: z.string().min(2, PROFILE_COPY.validation.last_name_min),
  email: z.string().email(PROFILE_COPY.validation.email_invalid),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export const AccountDetailsForm: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '', 
    }
  });

  // Sync form with profile data when it loads or modal opens
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
      });
    }
  }, [profile, reset, isModalOpen]);

  const onSubmit = async (data: AccountFormValues) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      toast.success("Identitas Diperbarui", {
          description: "Perubahan profil Anda telah berhasil disimpan."
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Gagal memperbarui profil", {
        description: error.message || "Terjadi kesalahan sistem."
      });
    }
  };

  const isSubmitting = updateProfileMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-wa-icon">Informasi Akun</h3>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-wa-green hover:underline transition-all"
        >
            <Edit3 size={14} />
            Ubah Profil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="Nama Depan" value={profile?.firstName || '-'} />
        <InfoField label="Nama Belakang" value={profile?.lastName || '-'} />
        <InfoField label="Alamat Email" value={profile?.email || '-'} />
        <InfoField label="Username" value={`@${profile?.username || 'user'}`} isLocked />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profil"
        subtitle="Perbarui data identitas personal Anda."
        icon={<User className="text-wa-green" />}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-4">
                <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} label="Nama Depan" error={errors.firstName?.message} className="rounded-xl" />
                    )}
                />
                <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} label="Nama Belakang" error={errors.lastName?.message} className="rounded-xl" />
                    )}
                />
            </div>
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <Input {...field} label="Alamat Email" error={errors.email?.message} className="rounded-xl" />
                )}
            />
            <div className="p-4 bg-wa-bg rounded-xl flex gap-3">
                <ShieldAlert size={18} className="text-wa-muted shrink-0 mt-0.5" />
                <p className="text-[11px] text-wa-icon leading-relaxed">
                    Username adalah identitas sistem permanen yang tidak dapat diubah secara mandiri.
                </p>
            </div>
            <div className="pt-4 flex flex-col gap-3">
                <Button type="submit" isLoading={isSubmitting} className="w-full h-12 rounded-xl bg-wa-green text-white font-bold">
                    Simpan Perubahan
                </Button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full h-11 text-sm font-semibold text-wa-icon">
                    Batalkan
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

function InfoField({ label, value, isLocked }: { label: string, value: string, isLocked?: boolean }) {
    return (
        <div className={cn(
            "p-4 rounded-xl border border-wa-border transition-all",
            isLocked ? "bg-[#fcfcfc]" : "bg-white"
        )}>
            <span className="text-xs font-medium text-wa-icon block mb-1">{label}</span>
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-wa-dark">{value}</span>
                {isLocked && <AtSign size={12} className="text-wa-muted/30" />}
            </div>
        </div>
    );
}
