import { Plus, MessageCircle, AlertTriangle } from 'lucide-react';
import { REMINDERS_COPY } from '@/shared/config/copy';

export function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-wa-border">
            <div className="w-16 h-16 rounded-2xl bg-wa-bg flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-wa-icon" />
            </div>
            <h3 className="text-base font-bold text-wa-dark mb-1">{REMINDERS_COPY.empty.title}</h3>
            <p className="text-sm text-wa-icon mb-5 max-w-xs mx-auto">{REMINDERS_COPY.empty.desc}</p>
            <button 
                onClick={onAdd} 
                className="h-10 px-5 bg-wa-green text-white text-sm font-bold rounded-xl hover:bg-wa-green-dark transition-all flex items-center gap-2 mx-auto"
            >
                <Plus size={16} /> Mulai Sekarang
            </button>
        </div>
    );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-red-200">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-wa-dark mb-1">Gagal Memuat Data</h3>
            <p className="text-sm text-wa-icon mb-5 max-w-xs mx-auto">
                Terjadi kesalahan saat memuat agenda Anda. Silakan coba lagi.
            </p>
            <button 
                onClick={onRetry} 
                className="h-10 px-5 bg-white border border-wa-border text-wa-dark text-sm font-bold rounded-xl hover:bg-wa-bg transition-all flex items-center gap-2 mx-auto"
            >
                Coba Lagi
            </button>
        </div>
    );
}

export function SkeletonCard() {
    return <div className="h-[180px] rounded-2xl bg-wa-bg animate-pulse border border-wa-border" />;
}
