import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useUserHooks';
import { Typography } from '../../components/ui/Typography';
import { DASHBOARD_COPY, BRAND_COPY, PROFILE_COPY } from '../../constants/copy';
import { SLIDE_UP, STAGGER_CONTAINER, FADE_IN } from '../../utils/motion';
import { Shield, Info, Activity, UserCircle } from 'lucide-react';

// --- MODULAR COMPONENTS ---
import { ProfileHeader } from '../../components/features/profile/ProfileHeader';
import { AccountDetailsForm } from '../../components/features/profile/AccountDetailsForm';
import { SecuritySettings } from '../../components/features/profile/SecuritySettings';

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE PROFILE
 */
/**
 * 🚀 THE MODREN PRO PROFILE - v9.0 "Ozone Identity"
 */
export default function UserProfile() {
    const { session } = useAuth();
    const { data: profileData, isLoading } = useProfile();

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="flex flex-col min-h-full space-y-12 pb-20 w-full text-left"
        >
            {/* 01. PREMIUM PAGE HEADER */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-gray-100/50 relative overflow-hidden group">
                {/* Dynamic Header Orbs */}
                <div className="absolute top-0 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/50 border border-gray-100 text-accent">
                        <UserCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{PROFILE_COPY.header.badge}</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-[#111b21] tracking-tighter leading-none italic uppercase">
                            {DASHBOARD_COPY.sidebar.profile}
                        </h1>
                        <p className="text-xl text-gray-400 font-bold max-w-xl">
                            {PROFILE_COPY.header.desc}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-subtle">
                    <div className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse shadow-[0_0_8px_#00a884]" />
                    <span className="text-[11px] font-black text-[#111b21] uppercase tracking-[0.2em]">{PROFILE_COPY.header.status_value}</span>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7 h-[500px] bg-gray-50/50 animate-pulse rounded-[3rem] border border-gray-100 shadow-sm" />
                        <div className="lg:col-span-5 h-[400px] bg-gray-50/50 animate-pulse rounded-[2.5rem] border border-gray-100 shadow-sm" />
                    </div>
                ) : (
                    <motion.div key="content" variants={STAGGER_CONTAINER} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* 02. ACCOUNT COMMAND CONSOLE */}
                        <div className="lg:col-span-7 space-y-10">
                            <motion.div variants={SLIDE_UP}>
                                <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] p-10 md:p-14 space-y-12 shadow-modern relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                     <div className="relative z-10">
                                        <ProfileHeader session={session} />
                                     </div>
                                     <div className="pt-10 border-t border-gray-100/50 relative z-10">
                                        <AccountDetailsForm session={session} />
                                     </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* 03. SECURITY & TELEMETRY */}
                        <div className="lg:col-span-5 space-y-10">
                            {/* Security Control Console */}
                            <motion.div variants={SLIDE_UP} className="bg-white/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/60 shadow-modern space-y-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-24 h-24 bg-[#00a884]/5 rounded-full blur-2xl -ml-12 -mt-12 pointer-events-none" />
                                
                                <div className="flex items-center gap-4 pb-6 border-b border-gray-100/50 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-accent shadow-subtle group-hover:rotate-12 transition-transform">
                                        <Shield size={20} />
                                    </div>
                                    <h3 className="font-black text-[#111b21] uppercase tracking-[0.2em] text-[11px] italic">{PROFILE_COPY.security_card.badge}</h3>
                                </div>
                                <div className="relative z-10">
                                    <SecuritySettings />
                                </div>
                            </motion.div>

                            {/* System Infra Monitor Card */}
                            <motion.div variants={SLIDE_UP} className="p-10 rounded-[2.5rem] bg-[#111b21] text-white space-y-8 shadow-modern relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
                                    <Shield size={160} strokeWidth={1} />
                                </div>
                                
                                <div className="flex items-center gap-3 text-accent relative z-10">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{PROFILE_COPY.system_meta.badge}</span>
                                </div>
                                
                                <p className="text-sm text-gray-400 font-bold leading-relaxed relative z-10 max-w-sm">
                                    {PROFILE_COPY.system_meta.desc}
                                </p>

                                <div className="pt-8 border-t border-white/5 flex flex-col gap-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest tabular-nums">
                                            DEVICE_REG_ID: {session?.id.slice(0, 12).toUpperCase()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                             <div className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                                             <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{PROFILE_COPY.system_meta.status_label}</span>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2, ease: "easeInOut" }}
                                            className="h-full bg-accent" 
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
