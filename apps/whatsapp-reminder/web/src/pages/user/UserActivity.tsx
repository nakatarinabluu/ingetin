import React from 'react';
import { 
  Activity, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Sparkles,
  Search,
  ChevronRight,
  Filter,
  ShieldCheck,
  Signal
} from 'lucide-react';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/tw.utils';
import { useAuth } from '../../context/AuthContext';
import { useUserReminders } from '../../hooks/useReminderHooks';
import { SLIDE_UP, STAGGER_CONTAINER, FADE_IN } from '../../utils/motion';
import { ACTIVITY_COPY, BRAND_COPY } from '../../constants/copy';
import { ReminderDTO } from '../../types';

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE ACTIVITY LOG
 */
/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE ACTIVITY LOG - v9.0 "Liquid Glass"
 */
export default function UserActivity() {
    const { session } = useAuth();
    const { data: remindersData, isLoading } = useUserReminders(session?.id || null, { limit: 20 });
    const activities = remindersData?.items || [];

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="flex flex-col min-h-full space-y-12 pb-24 max-w-6xl mx-auto"
        >
            {/* 01. INTEGRATED COMMAND HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-gray-100/50 text-left">
                <div className="space-y-6">
                    <motion.div variants={SLIDE_UP} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-gray-200/50 text-[#00a884] backdrop-blur-sm">
                        <Activity size={12} className="text-[#00a884]" />
                        <Typography variant="small" className="font-bold tracking-widest text-[10px] uppercase text-[#00a884]">{ACTIVITY_COPY.header.badge}</Typography>
                    </motion.div>
                    
                    <div className="space-y-3">
                        <motion.div variants={SLIDE_UP}>
                            <Typography variant="h1" className="text-4xl md:text-6xl font-bold text-[#111b21] tracking-tighter italic">Registry Sinyal</Typography>
                        </motion.div>
                        <motion.div variants={FADE_IN}>
                            <Typography variant="p" className="text-lg text-gray-400 font-medium max-w-xl leading-relaxed">
                                {ACTIVITY_COPY.header.desc}
                            </Typography>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={SLIDE_UP} className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00a884] transition-all" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari dalam memori..."
                            className="h-14 pl-12 pr-6 bg-secondary/30 border border-transparent rounded-2xl text-[15px] font-medium focus:outline-none focus:border-[#00a884]/30 focus:bg-white focus:shadow-modern transition-all w-full"
                        />
                    </div>
                    <button className="w-14 h-14 rounded-2xl border border-gray-200/50 bg-white flex items-center justify-center text-gray-400 hover:text-accent hover:border-accent/20 hover:shadow-subtle transition-all shrink-0">
                        <Filter size={18} />
                    </button>
                </motion.div>
            </header>

            {/* 02. ACTIVITY FEED - PREMIUM GLASS TIMELINE */}
            <div className="relative space-y-8 min-h-[600px] text-left">
                {/* Timeline Axis Line */}
                <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-gray-100 via-gray-100 to-transparent hidden md:block" />

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-gray-50/50 animate-pulse rounded-[2rem] border border-gray-100/50" />
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {activities.map((item: ReminderDTO, idx: number) => (
                                <motion.div 
                                    key={item.id}
                                    variants={SLIDE_UP}
                                    className="relative flex items-start gap-10 group"
                                >
                                    {/* Timeline Indicator */}
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-modern hidden md:flex",
                                        item.status === 'SENT' || item.status === 'DELIVERED' || item.status === 'READ' 
                                            ? "bg-white border-[#00a884]/20 text-[#00a884]" 
                                            : "bg-white border-red-100 text-red-400"
                                    )}>
                                        <Signal size={22} strokeWidth={2.5} />
                                    </div>

                                    {/* Glass Card */}
                                    <div className="flex-1 bg-white border border-gray-100/80 rounded-[2.5rem] p-8 md:p-10 hover:shadow-2xl transition-all duration-700 relative overflow-hidden group/card hover:border-[#00a884]/10">
                                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] group-hover/card:bg-secondary/20 transition-all duration-700" />
                                        
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                            <div className="space-y-3 min-w-0">
                                                <div className="flex items-center gap-4">
                                                    <Typography variant="h4" className="text-xl font-bold text-[#111b21] tracking-tight truncate">{item.title}</Typography>
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest leading-none",
                                                        item.status === 'SENT' || item.status === 'DELIVERED' || item.status === 'READ' 
                                                            ? "bg-[#00a884]/5 text-[#00a884] border-[#00a884]/10" 
                                                            : "bg-red-50 text-red-500 border-red-100"
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <Typography variant="p" className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-2xl line-clamp-2">
                                                    {item.message}
                                                </Typography>
                                            </div>

                                            <div className="flex items-center gap-8 shrink-0 lg:pl-10 lg:border-l border-gray-100/50">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2 text-[#111b21] font-bold text-sm tracking-tighter tabular-nums">
                                                        <Clock size={14} className="text-gray-300" /> 
                                                        <span>{new Date(item.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <Typography variant="small" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                        {new Date(item.schedule).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </Typography>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center text-gray-300 group-hover:text-[#00a884] group-hover:bg-accent/10 transition-all">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="py-40 text-center flex flex-col items-center gap-8 bg-secondary/20 rounded-[3rem] border border-dashed border-gray-200/50">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-modern rotate-12">
                                <Sparkles size={40} className="text-accent/20" />
                            </div>
                            <div className="space-y-3">
                                <Typography variant="h3" className="text-2xl font-bold text-[#111b21] tracking-tight">{ACTIVITY_COPY.empty.title}</Typography>
                                <Typography variant="p" className="text-gray-400 font-medium max-w-xs mx-auto">{ACTIVITY_COPY.empty.desc}</Typography>
                            </div>
                            <Button asChild onClick={() => window.location.href='/dashboard'} className="wa-btn-primary h-14 px-12 text-sm rounded-2xl shadow-modern">
                                <Link to="/dashboard">Kembali ke Dashboard</Link>
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* FOOTER - INTEGRATED TELEMETRY */}
            <footer className="pt-12 border-t border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/30 border border-gray-200/30">
                    <ShieldCheck size={16} className="text-[#00a884]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{ACTIVITY_COPY.footer.secured}</span>
                </div>
                <div className="flex items-center gap-6">
                    <button className="text-[10px] font-bold text-[#00a884] hover:text-[#008f72] uppercase tracking-[0.2em] transition-all">
                        {ACTIVITY_COPY.footer.sync}
                    </button>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                </div>
            </footer>
        </motion.div>
    );
}
        </motion.div>
    );
}
