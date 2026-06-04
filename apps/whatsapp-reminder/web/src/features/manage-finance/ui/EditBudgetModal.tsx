import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Target, Save } from 'lucide-react';
import { toast } from 'sonner';

import { formatIDR } from '@/shared/lib/format';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit: number;
  onSave: (newLimit: number) => void;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  currentLimit, 
  onSave 
}) => {
  const [value, setValue] = useState(currentLimit.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("Jumlah tidak valid");
      return;
    }

    setIsSaving(true);
    // Mock API call
    await new Promise(r => setTimeout(r, 1000));
    onSave(numValue);
    setIsSaving(false);
    toast.success("Batas Anggaran Diperbarui", {
        description: `Anggaran bulanan Anda sekarang Rp ${formatIDR(numValue)}`
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Batas Anggaran"
      subtitle="Tetapkan batas pengeluaran bulanan Anda untuk pengawasan asisten."
      icon={<Target size={20} className="text-wa-green" />}
      maxWidth="max-w-[400px]"
    >
      <div className="space-y-6 pt-2 text-left">
        <Input 
            type="number"
            label="Total Plafon Bulanan (Rp)"
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
            className="text-2xl font-bold tabular-nums"
            hint="Asisten akan memberi peringatan jika pengeluaran mendekati angka ini."
        />

        <div className="pt-6 mt-4 border-t border-wa-border flex items-center justify-end gap-3">
            <button 
                onClick={onClose}
                className="h-10 px-5 text-sm font-semibold text-wa-icon hover:bg-wa-bg rounded-full transition-colors cursor-pointer"
            >
                Batal
            </button>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 px-6 bg-wa-green hover:bg-wa-green-dark text-white text-sm font-semibold rounded-full shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
            >
                {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : <Save size={16} />}
                Simpan Anggaran
            </button>
        </div>
      </div>
    </Modal>
  );
};
