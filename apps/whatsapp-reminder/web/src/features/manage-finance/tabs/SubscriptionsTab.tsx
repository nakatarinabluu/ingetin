import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';

interface Subscription {
    id: number;
    name: string;
    amount: number;
    date: string;
    icon: string;
    category: string;
}

interface SubscriptionsTabProps {
    subscriptions: Subscription[];
    onAdd: () => void;
    onDelete: (name: string) => void;
}

export function SubscriptionsTab({ subscriptions, onAdd, onDelete }: SubscriptionsTabProps) {
    return (
        <motion.div
            key="subscriptions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {subscriptions.map((sub) => (
                    <Card
                        key={sub.id}
                        className="p-5 border-wa-border shadow-wa bg-white rounded-2xl space-y-4 group hover:shadow-modern hover:border-wa-green/30 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-wa-bg rounded-2xl flex items-center justify-center shadow-sm">
                                <CategoryIcon name={sub.icon} className="group-hover:text-wa-green" />
                            </div>
                            <button
                                onClick={() => onDelete(sub.name)}
                                className="p-2 text-wa-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[15px] font-bold text-wa-dark">{sub.name}</h4>
                            <p className="text-sm font-black text-wa-green">Rp {sub.amount.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="pt-4 border-t border-wa-border flex items-center justify-between">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-wa-muted uppercase tracking-[0.1em] mb-0.5">Jatuh Tempo</p>
                                <p className="text-xs font-bold text-wa-dark">Tgl {sub.date}</p>
                            </div>
                            <button
                                onClick={onAdd}
                                className="h-8 px-3 bg-wa-bg text-wa-dark text-[10px] font-bold rounded-lg hover:bg-wa-border transition-colors cursor-pointer"
                            >
                                Ubah Jadwal
                            </button>
                        </div>
                    </Card>
                ))}
                <button
                    onClick={onAdd}
                    className="h-[210px] border-2 border-dashed border-wa-border rounded-2xl flex flex-col items-center justify-center gap-2 text-wa-muted hover:border-wa-green hover:text-wa-green transition-all group cursor-pointer"
                >
                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Tambah Tagihan Rutin</span>
                </button>
            </div>
        </motion.div>
    );
}
