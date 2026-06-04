import React, { useState } from 'react';
import { Calendar, Bell, Check } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { toast } from 'sonner';

interface AddSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * 📺 MODAL TAMBAH TAGIHAN RUTIN
 * Flow: User Input -> Auto-schedule WhatsApp Reminder -> Save to Finance Log.
 */
export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('1');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Simulasi Proses:
        // 1. Catat ke Database Keuangan
        // 2. Buat Jadwal Reminder Otomatis di WhatsApp
        await new Promise(r => setTimeout(r, 1000));
        
        setIsSaving(false);
        toast.success("Tagihan Rutin Berhasil Dibuat", {
            description: `Asisten WA akan mengingatkan kamu setiap tanggal ${date} untuk bayar ${name}.`
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tagihan Rutin Baru"
            subtitle="Otomatisasi WhatsApp untuk tagihan bulanan Anda."
            icon={<Calendar size={20} className="text-wa-green" />}
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSave} className="space-y-6 pt-2">
                <Input 
                    required 
                    label="Nama Layanan / Tagihan"
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Netflix, Listrik, Kos"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        required 
                        type="number" 
                        label="Nominal (Rp)"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className="font-bold"
                    />
                    <Input 
                        required 
                        type="number" 
                        min="1" 
                        max="31" 
                        label="Tanggal (1-31)"
                        value={date} 
                        onChange={e => setDate(e.target.value)}
                        className="font-bold"
                    />
                </div>

                {/* Logic Info */}
                <div className="p-4 bg-wa-bg rounded-2xl border border-wa-border flex gap-3">
                    <Bell size={18} className="text-wa-icon shrink-0 mt-0.5" />
                    <p className="text-[12px] text-wa-icon leading-relaxed font-medium">
                        Sistem akan mengirimkan pengingat WhatsApp <span className="font-bold text-wa-dark">H-1</span> sebelum jatuh tempo dan otomatis mencatat pengeluaran saat kamu konfirmasi di chat.
                    </p>
                </div>

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
                        className="h-11 px-8 bg-wa-green hover:bg-wa-green-dark text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Check size={18} strokeWidth={2.5} /> Simpan Tagihan</>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
