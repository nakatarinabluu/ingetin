import React, { useState } from 'react';
import { 
    Settings, 
    Bell, 
    Shield, 
    Clock, 
    Save, 
    Smartphone, 
    Zap, 
    ShieldCheck, 
    Orbit,
    ChevronRight
} from 'lucide-react';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useProfile } from '../../hooks/useUserHooks';
import { SETTINGS_COPY, BRAND_COPY } from '../../constants/copy';
import { motion, AnimatePresence } from 'framer-motion';
import { FADE_IN } from '../../utils/motion';
import { cn } from '../../utils/tw.utils';
import { toast } from 'sonner';

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE SETTINGS
 */
/**
 * 🚀 THE MODREN PRO SETTINGS - v9.0 "Ozone Control"
 */
export default function UserSettings() {
    const [digestTime, setDigestTime] = useState('07:00');
    const { isLoading } = useProfile();

    const handleSaveDigest = () => {
        toast.success("Protokol Disimpan", {
            description: `Asisten akan mengirimkan laporan harian pada pukul ${digestTime}.`
        });
    };

    return (
        <div className="flex flex-col space-y-12 text-left w-full pb-20">
            
            {/* 01. PREMIUM PAGE HEADER */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-gray-100/50">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                        <Settings size={14} className="animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{SETTINGS_COPY.header.badge}</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-[#111b21] tracking-tighter leading-none italic uppercase">{SETTINGS_COPY.header.title}</h1>
                        <p className="text-xl text-gray-400 font-bold max-w-xl leading-relaxed">{SETTINGS_COPY.header.desc}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-subtle group">
                    <Orbit size={18} className="text-accent group-hover:rotate-180 transition-transform duration-1000" />
                    <span className="text-[11px] font-black text-[#111b21] uppercase tracking-[0.2em]">{SETTINGS_COPY.header.mode_value}</span>
                </div>
            </header>

            <Tabs defaultValue="digest" className="w-full">
                {/* 02. LIQUID TABS LIST */}
                <TabsList className="bg-white/40 backdrop-blur-xl p-1.5 rounded-full mb-12 inline-flex w-full md:w-auto border border-white/60 shadow-subtle">
                    <TabsTrigger value="digest" className={cn(
                        "flex items-center gap-3 px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                        "data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-modern"
                    )}>
                        <Bell size={16} /> {SETTINGS_COPY.tabs.digest}
                    </TabsTrigger>
                    <TabsTrigger value="security" className={cn(
                        "flex items-center gap-3 px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                        "data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-modern"
                    )}>
                        <ShieldCheck size={16} /> {SETTINGS_COPY.tabs.security}
                    </TabsTrigger>
                </TabsList>

                <div className="min-h-[550px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <div className="w-full h-[400px] bg-gray-50/50 animate-pulse rounded-[3rem] border border-gray-100" />
                        ) : (
                            <motion.div key="content" {...FADE_IN} className="w-full">
                                
                                {/* --- 03. DAILY DIGEST (PREMIUM BENTO) --- */}
                                <TabsContent value="digest" className="mt-0 focus-visible:ring-0">
                                    <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-modern overflow-hidden">
                                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100/50">
                                            {/* Info Side */}
                                            <div className="flex-1 p-10 md:p-16 space-y-10 relative">
                                                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                                
                                                <div className="space-y-6 relative z-10">
                                                    <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-gray-100 flex items-center justify-center text-accent shadow-modern group">
                                                        <Clock size={32} className="group-hover:rotate-12 transition-transform" />
                                                    </div>
                                                    <h2 className="text-3xl md:text-5xl font-black text-[#111b21] tracking-tighter italic uppercase">{SETTINGS_COPY.digest.title}</h2>
                                                    <p className="text-xl text-gray-400 font-bold leading-relaxed max-w-md">
                                                        {SETTINGS_COPY.digest.desc}
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                                    <div className="flex items-center gap-3 p-5 bg-white shadow-subtle border border-gray-100 rounded-2xl">
                                                        <div className="w-2 h-2 rounded-full bg-[#00a884] shadow-[0_0_8px_#00a884]" />
                                                        <span className="text-[10px] font-black text-[#111b21] uppercase tracking-widest leading-none">{SETTINGS_COPY.digest.sync_badge}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-5 bg-white shadow-subtle border border-gray-100 rounded-2xl">
                                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                                        <span className="text-[10px] font-black text-[#111b21] uppercase tracking-widest leading-none">{SETTINGS_COPY.digest.encryption_badge}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Control Side */}
                                            <div className="w-full lg:w-[480px] p-10 md:p-16 flex flex-col justify-center gap-12 bg-white/30 backdrop-blur-md">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-2 ml-1">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{SETTINGS_COPY.digest.time_label}</span>
                                                        <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute inset-0 bg-accent/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                                        <input 
                                                            type="time" 
                                                            value={digestTime}
                                                            onChange={e => setDigestTime(e.target.value)}
                                                            className="w-full bg-white border border-gray-100 focus:border-accent focus:ring-4 focus:ring-accent/5 rounded-[2.5rem] p-10 text-6xl font-black text-[#111b21] text-center outline-none transition-all shadow-modern group-hover:shadow-xl tabular-nums tracking-tighter cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                                <Button className="wa-btn-primary h-16 w-full text-[12px] font-black uppercase tracking-[0.2em] shadow-modern" onClick={handleSaveDigest}>
                                                    <Save size={20} className="mr-3" />
                                                    {SETTINGS_COPY.digest.btn_save}
                                                </Button>
                                                <div className="flex items-center justify-center gap-2 opacity-30">
                                                    <Shield size={10} />
                                                    <Typography variant="small" className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">{SETTINGS_COPY.digest.footer_secured}</Typography>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* --- 04. SECURITY (PREMIUM GRID) --- */}
                                <TabsContent value="security" className="mt-0 focus-visible:ring-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ActionCard 
                                            icon={<ShieldCheck size={28} />}
                                            title={SETTINGS_COPY.security.password_title} 
                                            desc={SETTINGS_COPY.security.password_desc}
                                            actionText={SETTINGS_COPY.security.password_btn}
                                        />
                                        <ActionCard 
                                            icon={<Smartphone size={28} />}
                                            title={SETTINGS_COPY.security.sessions_title} 
                                            desc={SETTINGS_COPY.security.sessions_desc}
                                            actionText={SETTINGS_COPY.security.sessions_btn}
                                        />
                                    </div>
                                    
                                    <div className="mt-12 p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-subtle flex items-start gap-6 group hover:shadow-modern transition-all duration-500">
                                         <div className="p-4 bg-white rounded-2xl border border-gray-100 text-[#00a884] shadow-modern shrink-0 group-hover:scale-110 transition-transform">
                                            <Shield size={24} />
                                         </div>
                                         <div className="space-y-2">
                                            <h4 className="text-[13px] font-black text-[#111b21] uppercase tracking-[0.2em] italic">{SETTINGS_COPY.security.integrity_title}</h4>
                                            <p className="text-[15px] text-gray-400 font-bold leading-relaxed max-w-2xl">
                                                {SETTINGS_COPY.security.integrity_desc}
                                            </p>
                                         </div>
                                    </div>
                                </TabsContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Tabs>
        </div>
    );
}

function ActionCard({ icon, title, desc, actionText }: { icon: React.ReactNode; title: string; desc: string; actionText: string; }) {
    return (
        <Card className="rounded-[2.5rem] border border-white p-10 bg-white/80 shadow-modern hover:shadow-2xl hover:border-accent/10 transition-all duration-500 group text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-8 -mt-8" />
            
            <div className="space-y-10 relative z-10">
                <div className="w-16 h-16 bg-secondary/80 rounded-[1.5rem] flex items-center justify-center text-[#111b21] border border-gray-100 shadow-inner group-hover:bg-accent group-hover:text-white group-hover:rotate-6 transition-all duration-700">
                    {icon}
                </div>

                <div className="space-y-2">
                    <h4 className="text-2xl font-black text-[#111b21] uppercase italic tracking-tighter">{title}</h4>
                    <p className="text-gray-400 text-[15px] font-bold leading-relaxed">{desc}</p>
                </div>

                <div className="pt-6 border-t border-gray-100/50">
                    <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-accent hover:text-[#00a884] transition-all group/btn">
                        {actionText} 
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover/btn:bg-accent group-hover/btn:text-white transition-all">
                            <ChevronRight size={16} /> 
                        </div>
                    </button>
                </div>
            </div>
        </Card>
    );
}
