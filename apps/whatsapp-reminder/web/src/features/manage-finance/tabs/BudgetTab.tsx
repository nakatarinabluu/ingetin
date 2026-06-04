import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { CategoryIcon } from '@/shared/ui/CategoryIcon';
import { cn } from '@/shared/lib/tw.utils';

interface BudgetCategory {
    id: number;
    category: string;
    limit: number;
    spent: number;
    icon: string;
}

interface BudgetTabProps {
    categories: BudgetCategory[];
    onEdit: () => void;
}

export function BudgetTab({ categories, onEdit }: BudgetTabProps) {
    return (
        <motion.div
            key="budget"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <Card className="rounded-2xl border-wa-border shadow-wa bg-white overflow-hidden text-left">
                <div className="p-6 border-b border-wa-border">
                    <h3 className="text-[16px] font-bold text-wa-dark">Batas Pengeluaran Kategori</h3>
                    <p className="text-xs text-wa-icon mt-1">Tentukan plafon maksimal untuk tiap kategori belanja.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-wa-icon bg-wa-bg/50 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Batas (Rp)</th>
                                <th className="px-6 py-4">Terpakai</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-wa-border">
                            {categories.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fcfcfc] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-wa-bg rounded-xl flex items-center justify-center shadow-sm">
                                                <CategoryIcon name={item.icon} className="group-hover:text-wa-green" />
                                            </div>
                                            <span className="font-semibold text-wa-dark">{item.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-wa-dark">{item.limit.toLocaleString("id-ID")}</td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1.5 w-32">
                                            <div className="flex justify-between text-[10px] font-bold text-wa-muted">
                                                <span>{Math.round((item.spent / item.limit) * 100)}%</span>
                                                <span>Rp {item.spent.toLocaleString("id-ID")}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-wa-bg rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        item.spent / item.limit > 0.9 ? "bg-red-500" : "bg-wa-green"
                                                    )}
                                                    style={{ width: `${Math.min((item.spent / item.limit) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {item.spent / item.limit > 0.9 ? (
                                            <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold uppercase">
                                                Overlimit
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md bg-wa-green-light text-wa-teal text-[10px] font-bold uppercase">
                                                Aman
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={onEdit}
                                            className="w-8 h-8 rounded-lg bg-white border border-wa-border text-wa-icon hover:text-wa-green hover:bg-wa-bg transition-all inline-flex items-center justify-center cursor-pointer"
                                        >
                                            <Edit2 size={14} />
                                        </button>
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
