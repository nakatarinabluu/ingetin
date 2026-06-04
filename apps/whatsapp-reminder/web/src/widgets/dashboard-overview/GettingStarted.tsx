import { useState } from 'react';
import {
    CheckCircle2,
    MessageSquare,
    Sparkles,
    ChevronRight,
    LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/tw.utils';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    completed: boolean;
    actionLabel: string;
    onClick: () => void;
}

export function GettingStarted({ steps: initialSteps }: { steps?: Partial<OnboardingStep>[] }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const navigate = useNavigate();

    const steps: OnboardingStep[] = [
        {
            id: 'wa',
            title: 'Hubungkan WhatsApp',
            description: 'Verifikasi nomor WhatsApp untuk mengaktifkan asisten pengingat kamu.',
            icon: MessageSquare,
            completed: initialSteps?.find(s => s.id === 'wa')?.completed || false,
            actionLabel: 'Verifikasi sekarang',
            onClick: () => navigate('/profile'),
        },
        {
            id: 'first',
            title: 'Buat agenda pertama',
            description: 'Coba buat satu pengingat untuk merasakan kemudahan asisten kami.',
            icon: Sparkles,
            completed: initialSteps?.find(s => s.id === 'first')?.completed || false,
            actionLabel: 'Buat agenda',
            onClick: () => navigate('/reminders?action=new'),
        },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const allDone = completedCount === steps.length;

    // Hide if everything done
    if (allDone) return null;

    return (
        <div className="bg-white border border-wa-border rounded-2xl overflow-hidden shadow-wa">
            {/* Header */}
            <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-wa-bg/50 transition-colors text-left"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-wa-border flex items-center justify-center">
                        <span className="text-xs font-bold text-wa-green">{completedCount}/{steps.length}</span>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-wa-dark">Mulai dengan Ingetin</span>
                        <p className="text-xs text-wa-icon">Selesaikan langkah berikut untuk memulai</p>
                    </div>
                </div>
                <ChevronRight
                    size={18}
                    className={cn("text-wa-icon transition-transform", isExpanded ? "rotate-90" : "")}
                    strokeWidth={2}
                />
            </button>

            {/* Steps */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-4 border-t border-wa-border divide-y divide-wa-bg">
                            {steps.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className="py-4 flex items-start gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                            step.completed ? "bg-wa-green" : "border-2 border-wa-border bg-white"
                                        )}>
                                            {step.completed
                                                ? <CheckCircle2 size={16} className="text-white" />
                                                : <Icon size={14} className="text-wa-icon" strokeWidth={2} />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn(
                                                "text-sm font-semibold",
                                                step.completed ? "line-through text-wa-icon" : "text-wa-dark"
                                            )}>
                                                {step.title}
                                            </h4>
                                            <p className="text-xs text-wa-muted mt-0.5 leading-relaxed">
                                                {step.description}
                                            </p>
                                            {!step.completed && (
                                                <button
                                                    onClick={step.onClick}
                                                    className="mt-2 text-xs font-semibold text-wa-green hover:text-wa-green-dark flex items-center gap-1 transition-colors"
                                                >
                                                    {step.actionLabel}
                                                    <ChevronRight size={12} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
