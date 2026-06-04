import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { ArrowUpRight, ArrowDownLeft, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { formatIDR } from '@/shared/lib/format';
import { FINANCE_COPY } from '@/shared/config/copy/app';
import { TransactionTypeSelector } from '../components/TransactionTypeSelector';
import { TransactionCategorySelector } from '../components/TransactionCategorySelector';

const transactionSchema = z.object({
  title: z.string().min(1, FINANCE_COPY.modal.validation.title_required),
  amount: z.coerce.number().min(1, FINANCE_COPY.modal.validation.amount_min),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, FINANCE_COPY.modal.validation.category_required),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      category: 'Makanan'
    }
  });

  const activeType = watch('type');
  const activeCategory = watch('category');

  // Switch default category when type changes
  useEffect(() => {
    if (activeType === 'INCOME') {
      setValue('category', 'Gaji');
    } else {
      setValue('category', 'Makanan');
    }
  }, [activeType, setValue]);

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      toast.success(FINANCE_COPY.modal.toast.success_title(data.type), {
        description: FINANCE_COPY.modal.toast.success_desc(data.title, formatIDR(data.amount))
      });
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      toast.error(FINANCE_COPY.modal.toast.error_title, {
        description: error.message || FINANCE_COPY.modal.toast.error_desc
      });
    }
  };

  const isIncome = activeType === 'INCOME';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isIncome ? FINANCE_COPY.modal.title_income : FINANCE_COPY.modal.title_expense}
      subtitle={isIncome ? FINANCE_COPY.modal.subtitle_income : FINANCE_COPY.modal.subtitle_expense}
      icon={isIncome ? <ArrowDownLeft size={20} className="text-wa-green" /> : <ArrowUpRight size={20} className="text-red-500" />}
      maxWidth="max-w-[480px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2 text-left">
        
        <TransactionTypeSelector 
          activeType={activeType} 
          onChange={(type: 'INCOME' | 'EXPENSE') => setValue('type', type)} 
        />

        <div className="space-y-4">
            <Controller
                name="title"
                control={control}
                render={({ field }) => (
                    <Input 
                        {...field}
                        label={FINANCE_COPY.modal.input_title}
                        placeholder={FINANCE_COPY.modal.placeholder_title} 
                        error={errors.title?.message}
                        className="font-bold"
                    />
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                        <Input 
                            {...field}
                            type="number"
                            label={FINANCE_COPY.modal.input_amount}
                            placeholder="0" 
                            error={errors.amount?.message}
                            className="font-black"
                        />
                    )}
                />

                <TransactionCategorySelector 
                  activeType={activeType}
                  activeCategory={activeCategory}
                  onChange={(cat: string) => setValue('category', cat)}
                />
            </div>
        </div>

        <div className="pt-6 mt-4 border-t border-wa-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-wa-green">
                <Sparkles size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{FINANCE_COPY.modal.sync_wa}</span>
            </div>
            <div className="flex gap-2">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose}
                >
                    {FINANCE_COPY.modal.btn_cancel}
                </Button>
                <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    className={isIncome ? "bg-wa-green hover:bg-wa-green-dark text-white" : "bg-wa-dark hover:bg-black text-white"}
                    leftIcon={!isSubmitting ? <Check size={16} strokeWidth={3} /> : undefined}
                >
                    {isIncome ? FINANCE_COPY.modal.btn_submit_income : FINANCE_COPY.modal.btn_submit_expense}
                </Button>
            </div>
        </div>
      </form>
    </Modal>
  );
};
