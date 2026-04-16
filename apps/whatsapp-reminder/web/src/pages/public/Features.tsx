import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FEATURES_COPY } from '../../constants/copy';
import { MessageCircle, Calendar, Shield, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/tw.utils';

export default function Features() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Fitur — Ingetin WhatsApp Assistant`;
    }, []);

    const ICONS = [MessageCircle, Calendar, Shield];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">

            {/* Hero */}
            <section className="bg-[#f0f2f5] border-b border-[#e9edef] py-16 md:py-20">
                <div className="wa-container text-center space-y-4">
                    <span className="text-xs font-semibold text-[#00a884] uppercase tracking-widest">
                        {FEATURES_COPY.hero.badge}
                    </span>
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-[#111b21] leading-tight tracking-tight"
                    >
                        {FEATURES_COPY.hero.title}
                    </motion.h1>
                    <p className="text-base md:text-lg text-[#54656f] max-w-2xl mx-auto leading-relaxed">
                        {FEATURES_COPY.hero.desc}
                    </p>
                </div>
            </section>

            {/* Feature list */}
            <main className="wa-container py-16 md:py-24 space-y-16 md:space-y-24">
                {FEATURES_COPY.items.map((item, i) => {
                    const Icon = ICONS[i];
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: 0.05 }}
                            className={cn(
                                "flex flex-col md:flex-row items-center gap-10 lg:gap-16",
                                i % 2 !== 0 ? "md:flex-row-reverse" : ""
                            )}
                        >
                            <div className="flex-1 space-y-5">
                                <div className="w-11 h-11 rounded-xl bg-[#00a884]/8 flex items-center justify-center">
                                    <Icon size={22} className="text-[#00a884]" strokeWidth={2} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-[#111b21] leading-snug tracking-tight">
                                    {item.title}
                                </h2>
                                <p className="text-base text-[#54656f] leading-relaxed max-w-md">
                                    {item.desc}
                                </p>

                                {/* Example message */}
                                <div className="p-4 rounded-2xl bg-[#f0f2f5] border border-[#e9edef] max-w-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
                                            <MessageCircle size={16} className="text-white" />
                                        </div>
                                        <p className="text-sm text-[#111b21] italic leading-relaxed">
                                            "{item.mock}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full aspect-video bg-[#f0f2f5] rounded-3xl border border-[#e9edef] flex items-center justify-center">
                                <Icon size={80} className="text-[#00a884]/15" strokeWidth={1} />
                            </div>
                        </motion.div>
                    );
                })}
            </main>

            {/* Security */}
            <section className="py-16 bg-[#f0f2f5] border-y border-[#e9edef]">
                <div className="wa-container text-center space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 text-[#00a884] font-semibold text-sm px-4 py-1.5 rounded-full bg-white border border-[#e9edef] shadow-wa">
                        <Shield size={15} strokeWidth={2} />
                        Privasi Terjamin
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#111b21]">
                        Data Anda tetap menjadi milik Anda.
                    </h2>
                    <p className="text-[#54656f] leading-relaxed">
                        Ingetin menggunakan teknologi keamanan standar perbankan untuk memastikan
                        bahwa seluruh catatan Anda tidak pernah bocor atau disalahgunakan.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#00a884]">
                <div className="wa-container text-center space-y-5">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{FEATURES_COPY.cta.title}</h2>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 h-12 px-7 bg-white text-[#00a884] text-[15px] font-semibold rounded-xl hover:bg-[#f0f2f5] transition-colors shadow-sm"
                    >
                        {FEATURES_COPY.cta.button}
                        <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>
                    <p className="text-white/60 text-xs">{FEATURES_COPY.cta.footnote}</p>
                </div>
            </section>
        </div>
    );
}
