import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FEATURES_COPY } from '@/shared/config/copy';
import { MessageCircle, Calendar, Shield, ArrowRight, CheckCheck } from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';

export default function Features() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Fitur — Ingetin WhatsApp Assistant`;
    }, []);

    const ICONS = [MessageCircle, Calendar, Shield];

    // Per-feature mock chat previews
    const MOCK_CHATS = [
        [
            { from: 'user', text: 'Ingatkan aku besok jam 9 pagi untuk rapat dengan klien.' },
            { from: 'bot',  text: '✅ Siap! Pengingat "Rapat dengan klien" sudah disimpan untuk besok pukul 09.00.' },
            { from: 'user', text: 'Tambah juga pengingat mingguan setiap Senin jam 8.' },
            { from: 'bot',  text: '🔁 Pengingat mingguan aktif. Kamu akan diingatkan setiap Senin pukul 08.00.' },
        ],
        [
            { from: 'user', text: 'Catat pengeluaran makan siang 45rb.' },
            { from: 'bot',  text: '💰 Tersimpan: Makan siang Rp 45.000. Total pengeluaran hari ini: Rp 120.000.' },
            { from: 'user', text: 'Berapa total pengeluaran minggu ini?' },
            { from: 'bot',  text: '📊 Minggu ini: Rp 890.000. Kamu masih dalam batas anggaran bulananmu.' },
        ],
        [
            { from: 'user', text: 'Apakah data saya aman?' },
            { from: 'bot',  text: '🔐 Tenang! Seluruh data kamu dienkripsi end-to-end. Tidak ada pihak ketiga yang dapat mengakses.' },
            { from: 'user', text: 'Oke, aku mau daftar.' },
            { from: 'bot',  text: '🎉 Selamat datang! Akun kamu sudah aktif dan siap digunakan.' },
        ],
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">

            {/* Hero */}
            <section className="bg-wa-bg border-b border-wa-border py-16 md:py-20">
                <div className="wa-container text-center space-y-4">
                    <span className="text-xs font-semibold text-wa-green uppercase tracking-widest">
                        {FEATURES_COPY.hero.badge}
                    </span>
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-wa-dark leading-tight tracking-tight"
                    >
                        {FEATURES_COPY.hero.title}
                    </motion.h1>
                    <p className="text-base md:text-lg text-wa-icon max-w-2xl mx-auto leading-relaxed">
                        {FEATURES_COPY.hero.desc}
                    </p>
                </div>
            </section>

            {/* Feature list */}
            <main className="wa-container py-16 md:py-24 space-y-16 md:space-y-24">
                {FEATURES_COPY.items.map((item, i) => {
                    const Icon = ICONS[i];
                    const chats = MOCK_CHATS[i] || [];
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
                                <div className="w-11 h-11 rounded-xl bg-wa-green/8 flex items-center justify-center">
                                    <Icon size={22} className="text-wa-green" strokeWidth={2} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-wa-dark leading-snug tracking-tight">
                                    {item.title}
                                </h2>
                                <p className="text-base text-wa-icon leading-relaxed max-w-md">
                                    {item.desc}
                                </p>

                                {/* Example message */}
                                <div className="p-4 rounded-2xl bg-wa-bg border border-wa-border max-w-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-wa-green flex items-center justify-center shrink-0">
                                            <MessageCircle size={16} className="text-white" />
                                        </div>
                                        <p className="text-sm text-wa-dark italic leading-relaxed">
                                            "{item.mock}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Bubble Mockup */}
                            <div className="flex-1 w-full">
                                <FeatureMockup chats={chats} />
                            </div>
                        </motion.div>
                    );
                })}
            </main>

            {/* Security */}
            <section className="py-16 bg-wa-bg border-y border-wa-border">
                <div className="wa-container text-center space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 text-wa-green font-semibold text-sm px-4 py-1.5 rounded-full bg-white border border-wa-border shadow-wa">
                        <Shield size={15} strokeWidth={2} />
                        Privasi Terjamin
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-wa-dark">
                        Data Anda tetap menjadi milik Anda.
                    </h2>
                    <p className="text-wa-icon leading-relaxed">
                        Ingetin menggunakan teknologi keamanan standar perbankan untuk memastikan
                        bahwa seluruh catatan Anda tidak pernah bocor atau disalahgunakan.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-wa-green">
                <div className="wa-container text-center space-y-5">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{FEATURES_COPY.cta.title}</h2>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 h-12 px-7 bg-white text-wa-green text-[15px] font-semibold rounded-xl hover:bg-wa-bg transition-colors shadow-sm"
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

/* ── WhatsApp-style chat mockup for each feature ── */
function FeatureMockup({ chats }: { chats: { from: string; text: string }[] }) {
    return (
        <div className="w-full bg-[#e5ddd5] rounded-3xl border border-[#d1ccc0] overflow-hidden shadow-wa-md">
            {/* Chat header */}
            <div className="bg-wa-teal px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle size={16} className="text-white" />
                </div>
                <div>
                    <p className="text-white text-sm font-semibold leading-none">Ingetin Asisten</p>
                    <p className="text-white/70 text-[11px] mt-0.5">online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="px-4 py-4 space-y-2.5 min-h-[200px]">
                {chats.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={cn(
                            'max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed shadow-sm',
                            msg.from === 'user'
                                ? 'bg-wa-green-light text-wa-dark rounded-tr-sm'
                                : 'bg-white text-wa-dark rounded-tl-sm'
                        )}>
                            {msg.text}
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[9px] text-wa-muted">
                                    {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.from === 'user' && (
                                    <CheckCheck size={12} className="text-wa-green" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input bar */}
            <div className="bg-wa-bg px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 h-9 bg-white rounded-full px-4 flex items-center">
                    <span className="text-[12px] text-wa-muted">Ketik pesan...</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-wa-green flex items-center justify-center">
                    <MessageCircle size={15} className="text-white" />
                </div>
            </div>
        </div>
    );
}
