import { motion } from 'framer-motion';
import { MessageCircle, Trash2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { cn } from '@/shared/lib/tw.utils';

interface Debt {
    id: number;
    name: string;
    amount: number;
    type: string;
    note: string;
    date: string;
}

interface DebtsTabProps {
    debts: Debt[];
    onAdd: () => void;
    onDelete: (name: string) => void;
}

export function DebtsTab({ debts, onAdd, onDelete }: DebtsTabProps) {
    return (
        <motion.div
            key="debts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <Card className="rounded-2xl border-wa-border shadow-wa bg-white overflow-hidden text-left">
                <div className="p-6 border-b border-wa-border flex justify-between items-center">
                    <div>
                        <h3 className="text-[16px] font-bold text-wa-dark">Hutang & Piutang</h3>
                        <p className="text-xs text-wa-icon mt-1">Pantau pinjaman dan kirim tagihan via WhatsApp.</p>
                    </div>
                    <button
                        onClick={onAdd}
                        className="h-9 px-4 bg-wa-dark text-white text-xs font-bold rounded-xl hover:bg-black transition-colors cursor-pointer"
                    >
                        Tambah Catatan
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[11px] text-wa-icon bg-wa-bg/50 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Nominal</th>
                                <th className="px-6 py-4">Tipe</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-wa-border">
                            {debts.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fcfcfc] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full overflow-hidden bg-wa-bg border border-wa-border shrink-0">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} alt="Avatar" />
                                            </div>
                                            <span className="font-bold text-wa-dark">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-black text-wa-dark">Rp {item.amount.toLocaleString("id-ID")}</td>
                                    <td className="px-6 py-5">
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase border",
                                                item.type === "PIUTANG"
                                                    ? "bg-wa-green-light text-wa-teal border-[#c0eab9]"
                                                    : "bg-red-50 text-red-600 border-red-100"
                                            )}
                                        >
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-wa-icon text-xs truncate max-w-[150px]">{item.note}</td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    window.open(
                                                        `https://wa.me/?text=Halo ${
                                                            item.name
                                                        }, mengingatkan kembali terkait ${item.note} sebesar Rp ${item.amount.toLocaleString(
                                                            "id-ID"
                                                        )}. Terima kasih!`
                                                    )
                                                }
                                                className="h-8 px-3 rounded-lg bg-wa-green text-white text-[10px] font-bold hover:bg-wa-green-dark transition-colors flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <MessageCircle size={12} fill="white" /> Tagih
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.name)}
                                                className="p-2 text-wa-muted hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
}
