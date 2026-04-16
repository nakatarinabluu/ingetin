import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Wallet, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { FINANCE_COPY } from '../../../constants/copy';
import { cn } from '../../../utils/tw.utils';

const transactionSchema = z.object({
  title: z.string().min(1, "Keterangan wajib diisi"),
  amount: z.coerce.number().min(1, "Jumlah minimal Rp 1"),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, "Kategori wajib diisi"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE TRANSACTION MODAL
 */
export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      category: 'Umum'
    }
  });

  const activeType = watch('type');

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('New Transaction:', data);
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Keuangan"
      icon={<Wallet size={20} className="text-[#00a884]" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-4">
        
        {/* TYPE SELECTOR */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-[#f0f2f5] rounded-full">
            <button 
                type="button"
                onClick={() => setValue('type', 'EXPENSE')}
                className={cn(
                    "flex items-center justify-center gap-2 h-10 rounded-full text-xs font-bold transition-all",
                    activeType === 'EXPENSE' ? "bg-white text-red-500 shadow-sm" : "text-gray-500"
                )}
            >
                <ArrowUpRight size={14} /> Pengeluaran
            </button>
            <button 
                type="button"
                onClick={() => setValue('type', 'INCOME')}
                className={cn(
                    "flex items-center justify-center gap-2 h-10 rounded-full text-xs font-bold transition-all",
                    activeType === 'INCOME' ? "bg-[#00a884] text-white shadow-sm" : "text-gray-500"
                )}
            >
                <ArrowDownLeft size={14} /> Pemasukan
            </button>
        </div>

        <div className="space-y-5">
            <Controller
                name="title"
                control={control}
                render={({ field }) => (
                    <Input {...field} label="Keterangan Transaksi" placeholder="Contoh: Makan siang, Gaji bulanan" error={errors.title?.message} />
                )}
            />

            <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                    <Input {...field} type="number" label="Jumlah Nominal (IDR)" placeholder="100000" error={errors.amount?.message} />
                )}
            />

            <Controller
                name="category"
                control={control}
                render={({ field }) => (
                    <Input {...field} label="Kategori" placeholder="Umum" error={errors.category?.message} />
                )}
            />
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Button 
                type="submit" 
                isLoading={isSubmitting}
                className="wa-btn-primary w-full h-14 text-base"
            >
                Simpan Transaksi
            </Button>
            
            <button 
                type="button"
                onClick={onClose}
                className="w-full h-12 text-[13px] font-bold text-gray-400 hover:text-[#111b21] transition-colors uppercase tracking-widest"
            >
                Batal
            </button>

            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60 pt-2">
                Data akan diproses ke laporan keuangan resmi Anda.
            </p>
        </div>
      </form>
    </Modal>
  );
};
