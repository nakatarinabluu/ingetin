import React, { useState } from 'react';
import {
    CheckCircle2,
    MessageSquare,
    Calendar,
    Sparkles,
    ChevronRight,
    LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/tw.utils';

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

    const steps: OnboardingStep[] = [
        {
            id: 'wa',
            title: 'Hubungkan WhatsApp',
            description: 'Verifikasi nomor WhatsApp untuk mengaktifkan asisten pengingat kamu.',
            icon: MessageSquare,
            completed: initialSteps?.find(s => s.id === 'wa')?.completed || false,
            actionLabel: 'Verifikasi sekarang',
            onClick: () => window.location.href = '/settings',
        },
        {
            id: 'first',
            title: 'Buat agenda pertama',
            description: 'Coba buat satu pengingat untuk merasakan kemudahan asisten kami.',
            icon: Sparkles,
            completed: initialSteps?.find(s => s.id === 'first')?.completed || false,
            actionLabel: 'Buat agenda',
            onClick: () => window.location.href = '/reminders?action=new',
        },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const allDone = completedCount === steps.length;

    // Hide if everything done
    if (allDone) return null;

    return (
        <div className="bg-white border border-[#e9edef] rounded-2xl overflow-hidden shadow-wa">
            {/* Header */}
            <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f0f2f5]/50 transition-colors text-left"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#e9edef] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#00a884]">{completedCount}/{steps.length}</span>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-[#111b21]">Mulai dengan Ingetin</span>
                        <p className="text-xs text-[#54656f]">Selesaikan langkah berikut untuk memulai</p>
                    </div>
                </div>
                <ChevronRight
                    size={18}
                    className={cn("text-[#54656f] transition-transform", isExpanded ? "rotate-90" : "")}
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
                        <div className="px-5 pb-4 border-t border-[#e9edef] divide-y divide-[#f0f2f5]">
                            {steps.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className="py-4 flex items-start gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                            step.completed ? "bg-[#00a884]" : "border-2 border-[#e9edef] bg-white"
                                        )}>
                                            {step.completed
                                                ? <CheckCircle2 size={16} className="text-white" />
                                                : <Icon size={14} className="text-[#54656f]" strokeWidth={2} />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn(
                                                "text-sm font-semibold",
                                                step.completed ? "line-through text-[#54656f]" : "text-[#111b21]"
                                            )}>
                                                {step.title}
                                            </h4>
                                            <p className="text-xs text-[#667781] mt-0.5 leading-relaxed">
                                                {step.description}
                                            </p>
                                            {!step.completed && (
                                                <button
                                                    onClick={step.onClick}
                                                    className="mt-2 text-xs font-semibold text-[#00a884] hover:text-[#008069] flex items-center gap-1 transition-colors"
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
