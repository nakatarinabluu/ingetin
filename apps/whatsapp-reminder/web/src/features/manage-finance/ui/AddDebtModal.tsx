import React, { useState } from 'react';
import { Users, ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/tw.utils';

interface AddDebtModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * 🤝 MODAL TAMBAH HUTANG PIUTANG
 * Flow: User Input -> Record Balance Impact -> Ability to Remind via WA.
 */
export const AddDebtModal: React.FC<AddDebtModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'HUTANG' | 'PIUTANG'>('PIUTANG');
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        await new Promise(r => setTimeout(r, 1000));
        
        setIsSaving(false);
        toast.success(`Catatan ${type} Berhasil`, {
            description: `${name} telah terdaftar dalam registry hutang piutang.`
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hutang & Piutang"
            subtitle="Manajemen pinjaman dan catatan saldo dengan relasi."
            icon={<Users size={20} className="text-wa-dark" />}
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSave} className="p-0 space-y-6 pt-2">
                {/* Toggle Tipe */}
                <div className="flex p-1 bg-wa-bg rounded-xl border border-wa-border">
                    <button 
                        type="button" onClick={() => setType('PIUTANG')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            type === 'PIUTANG' ? "bg-white text-wa-green shadow-sm border border-wa-border" : "text-wa-icon"
                        )}
                    >
                        <ArrowUpRight size={14} /> Piutang
                    </button>
                    <button 
                        type="button" onClick={() => setType('HUTANG')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            type === 'HUTANG' ? "bg-white text-red-500 shadow-sm border border-wa-border" : "text-wa-icon"
                        )}
                    >
                        <ArrowDownLeft size={14} /> Hutang
                    </button>
                </div>

                <Input 
                    required 
                    label="Nama Relasi"
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Budi, Toko Maju Jaya"
                />

                <Input 
                    required 
                    type="number" 
                    label="Nominal (Rp)"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="font-black text-[15px]"
                />

                <Textarea 
                    label="Keterangan / Catatan"
                    value={note} 
                    onChange={e => setNote(e.target.value)}
                    placeholder="Contoh: Pinjam buat bayar kos, Piutang sisa makan siang"
                    className="h-24"
                />

                <div className="pt-4 flex items-center justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="h-11 px-6 text-sm font-semibold text-wa-icon hover:bg-wa-bg rounded-xl transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className={cn(
                            "h-11 px-8 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer",
                            type === 'PIUTANG' ? "bg-wa-green hover:bg-wa-green-dark" : "bg-wa-dark hover:bg-black"
                        )}
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Check size={18} strokeWidth={2.5} /> Simpan Catatan</>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
