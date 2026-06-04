import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageCircle, Bell, Wallet, Shield, CheckCircle,
    ArrowRight, ChevronRight, Smartphone, Clock, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import { HOME_COPY, BRAND_COPY } from '@/shared/config/copy';

/**
 * Home — WhatsApp Official Product Landing
 * Clean, professional, mobile-first.
 */
export default function Home() {
    const { isAuthenticated, session } = useAuth();

    useEffect(() => {
        document.title = `${BRAND_COPY.name} — Asisten Pengingat WhatsApp`;
    }, []);

    return (
        <div className="min-h-screen bg-white overflow-x-hidden text-left">

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden bg-white">
                {/* Subtle background */}
                <div className="absolute inset-0 wa-doodle-light pointer-events-none" />

                <div className="wa-container relative z-10 pt-16 pb-20 md:pt-24 md:pb-32">
                    <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

                        {/* Left — Text */}
                        <motion.div
                            className="flex-1 space-y-7 text-center lg:text-left"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Pill badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wa-green/8 border border-wa-green/20 text-wa-green text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-wa-green animate-pulse" />
                                {HOME_COPY.hero.badge}
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold text-wa-dark leading-[1.1] tracking-tight">
                                Semua pengingat penting, <br className="hidden sm:block" />
                                <span className="text-wa-green">langsung di WhatsApp</span> kamu.
                            </h1>

                            <p className="text-lg text-wa-icon leading-relaxed max-w-lg mx-auto lg:mx-0">
                                {HOME_COPY.hero.desc}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
                                <Link
                                    to={isAuthenticated ? (session?.role === 'ADMIN' ? "/admin-dashboard" : "/dashboard") : "/register"}
                                    className="w-full sm:w-auto h-12 px-7 bg-wa-green text-white text-[15px] font-semibold rounded-xl hover:bg-wa-green-dark transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {HOME_COPY.hero.cta}
                                    <ArrowRight size={17} strokeWidth={2.5} />
                                </Link>
                                <Link
                                    to="/features"
                                    className="w-full sm:w-auto h-12 px-7 bg-wa-bg text-wa-dark text-[15px] font-medium rounded-xl hover:bg-wa-border transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    Pelajari Fitur
                                    <ChevronRight size={16} strokeWidth={2} />
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex items-center gap-5 justify-center lg:justify-start pt-1">
                                {[
                                    { icon: CheckCircle, label: 'Gratis untuk mulai' },
                                    { icon: Shield, label: 'Terenkripsi' },
                                    { icon: Zap, label: 'Respon instan' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-1.5 text-xs text-wa-icon font-medium">
                                        <Icon size={14} className="text-wa-green" strokeWidth={2.5} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right — Phone Mockup */}
                        <motion.div
                            className="flex-shrink-0 flex justify-center items-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <PhoneMockup />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="py-20 md:py-28 bg-wa-bg">
                <div className="wa-container">
                    <div className="text-center mb-14">
                        <span className="text-xs font-semibold text-wa-green uppercase tracking-widest">Cara Kerja</span>
                        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-wa-dark tracking-tight">
                            Semudah mengirim pesan
                        </h2>
                        <p className="mt-3 text-wa-icon text-base max-w-md mx-auto leading-relaxed">
                            Tidak perlu aplikasi baru. Gunakan WhatsApp yang sudah ada.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                step: '01',
                                icon: MessageCircle,
                                title: 'Kirim pesan',
                                desc: 'Ketik pengingat atau catatan pengeluaran kamu ke nomor asisten Ingetin.',
                            },
                            {
                                step: '02',
                                icon: Clock,
                                title: 'Asisten memproses',
                                desc: 'AI kami membaca dan menyimpan data kamu secara otomatis — tidak perlu format khusus.',
                            },
                            {
                                step: '03',
                                icon: Bell,
                                title: 'Terima notifikasi',
                                desc: 'Pengingat dikirim tepat waktu langsung ke WhatsApp kamu.',
                            },
                        ].map(({ step, icon: Icon, title, desc }) => (
                            <div key={step} className="bg-white rounded-2xl p-7 border border-wa-border shadow-wa relative">
                                <div className="absolute top-5 right-5 text-[11px] font-bold text-wa-border select-none">
                                    {step}
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-wa-green/8 flex items-center justify-center mb-5">
                                    <Icon size={22} className="text-wa-green" strokeWidth={2} />
                                </div>
                                <h3 className="text-[16px] font-semibold text-wa-dark mb-2">{title}</h3>
                                <p className="text-sm text-wa-icon leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section className="py-20 md:py-28 bg-white">
                <div className="wa-container">
                    <div className="text-center mb-14">
                        <span className="text-xs font-semibold text-wa-green uppercase tracking-widest">Fitur Utama</span>
                        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-wa-dark tracking-tight">
                            Satu asisten, banyak kegunaan
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                icon: Bell,
                                title: 'Pengingat Terjadwal',
                                desc: 'Atur jadwal sekali atau berulang. Notifikasi tepat waktu ke WhatsApp kamu tanpa perlu buka aplikasi.',
                                color: '#00a884',
                            },
                            {
                                icon: Wallet,
                                title: 'Catatan Keuangan',
                                desc: 'Catat pengeluaran dengan bahasa natural. Lihat ringkasan bulanan langsung dari dashboard.',
                                color: '#128C7E',
                            },
                            {
                                icon: Shield,
                                title: 'Privasi Terjamin',
                                desc: 'Data kamu diproteksi dengan standar enkripsi industry. Kamu yang pegang kendali penuh.',
                                color: '#667781',
                            },
                        ].map(({ icon: Icon, title, desc, color }) => (
                            <div
                                key={title}
                                className="group bg-white rounded-2xl p-7 border border-wa-border shadow-wa hover:shadow-wa-md transition-shadow duration-200"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                    style={{ backgroundColor: `${color}12` }}
                                >
                                    <Icon size={24} strokeWidth={2} style={{ color }} />
                                </div>
                                <h3 className="text-[16px] font-semibold text-wa-dark mb-2">{title}</h3>
                                <p className="text-sm text-wa-icon leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── SOCIAL PROOF / TRUST ─── */}
            <section className="py-16 bg-wa-bg border-y border-wa-border">
                <div className="wa-container space-y-12">

                    {/* Stats row */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16">
                        {[
                            { value: '500+', label: 'Pengguna aktif' },
                            { value: '99.9%', label: 'Uptime layanan' },
                            { value: '<1 dtk', label: 'Respon asisten' },
                        ].map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <div className="text-3xl font-bold text-wa-dark">{value}</div>
                                <div className="text-sm text-wa-icon mt-1 font-medium">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial chat bubbles */}
                    <div>
                        <p className="text-center text-xs font-semibold text-wa-green uppercase tracking-widest mb-8">
                            Kata mereka yang sudah pakai
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    name: 'Rizky A.',
                                    role: 'Freelancer',
                                    avatar: 'R',
                                    color: '#00a884',
                                    chats: [
                                        { from: 'user', text: 'Ingatkan aku deadline klien besok jam 10 pagi.' },
                                        { from: 'bot',  text: '✅ Siap! Kamu akan diingatkan besok pukul 10.00.' },
                                    ],
                                },
                                {
                                    name: 'Sari W.',
                                    role: 'Ibu Rumah Tangga',
                                    avatar: 'S',
                                    color: '#128C7E',
                                    chats: [
                                        { from: 'user', text: 'Catat belanja hari ini 250rb.' },
                                        { from: 'bot',  text: '💰 Tersimpan! Total pengeluaran hari ini: Rp 370.000.' },
                                    ],
                                },
                                {
                                    name: 'Dion P.',
                                    role: 'Mahasiswa',
                                    avatar: 'D',
                                    color: '#667781',
                                    chats: [
                                        { from: 'user', text: 'Ingatkan tugas kuliah setiap Rabu jam 7 malam.' },
                                        { from: 'bot',  text: '🔁 Pengingat mingguan aktif setiap Rabu 19.00.' },
                                    ],
                                },
                            ].map((t) => (
                                <div key={t.name} className="bg-white rounded-2xl border border-wa-border shadow-wa overflow-hidden">
                                    {/* Mini chat header */}
                                    <div className="bg-wa-teal px-4 py-2.5 flex items-center gap-2.5">
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                                            style={{ backgroundColor: t.color }}
                                        >
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="text-white text-[12px] font-semibold leading-none">{t.name}</p>
                                            <p className="text-white/60 text-[10px]">{t.role}</p>
                                        </div>
                                    </div>
                                    {/* Chat bubbles */}
                                    <div className="bg-[#e5ddd5] px-3 py-3 space-y-2">
                                        {t.chats.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-[12px] leading-relaxed shadow-sm ${
                                                    msg.from === 'user'
                                                        ? 'bg-wa-green-light text-wa-dark rounded-tr-sm'
                                                        : 'bg-white text-wa-dark rounded-tl-sm'
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ─── CTA ─── */}
            <section className="py-20 md:py-28 bg-wa-green">
                <div className="wa-container text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6 max-w-xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            {HOME_COPY.cta_footer.title}
                        </h2>
                        <p className="text-white/75 text-base">
                            {HOME_COPY.cta_footer.footnote}
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 h-12 px-8 bg-white text-wa-green text-[15px] font-semibold rounded-xl hover:bg-wa-bg transition-colors shadow-sm"
                        >
                            {HOME_COPY.cta_footer.button}
                            <ArrowRight size={17} strokeWidth={2.5} />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

/**
 * Realistic WhatsApp-style phone mockup
 */
function PhoneMockup() {
    const [step, setStep] = useState(0);
    const messages = [
        { from: 'user', text: 'Ingatkan aku rapat besok jam 9 pagi' },
        { from: 'bot', text: '✅ Siap! Pengingat untuk "Rapat" sudah disimpan. Kamu akan mendapat notifikasi besok pukul 09.00.' },
        { from: 'user', text: 'Catat pengeluaran makan siang 35rb' },
        { from: 'bot', text: '💰 Catatan tersimpan: Makan siang Rp 35.000. Lihat ringkasan di dashboard kamu.' },
    ];

    useEffect(() => {
        const t = setTimeout(() => setStep(s => Math.min(s + 1, messages.length - 1)), 1800);
        return () => clearTimeout(t);
    }, [step]);

    const visibleMessages = messages.slice(0, step + 1);

    return (
        <div className="relative w-[300px] sm:w-[320px]">
            {/* Phone shell */}
            <div className="relative w-full aspect-[9/19] bg-wa-dark rounded-[3rem] p-[10px] shadow-[0_24px_60px_rgba(17,27,33,0.22),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
                {/* Dynamic island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-wa-dark rounded-b-2xl z-40" />

                {/* Screen */}
                <div className="w-full h-full rounded-[2.4rem] overflow-hidden flex flex-col bg-[#e5ddd5]">

                    {/* Chat header */}
                    <div className="bg-wa-teal pt-7 pb-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <MessageCircle size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-semibold">Ingetin Asisten</div>
                            <div className="text-white/70 text-[11px]">online</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 px-3 py-3 space-y-2 overflow-hidden">
                        {visibleMessages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[82%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed shadow-sm relative ${
                                        msg.from === 'user'
                                            ? 'bg-wa-green-light text-wa-dark rounded-tr-sm'
                                            : 'bg-white text-wa-dark rounded-tl-sm'
                                    }`}
                                >
                                    {msg.text}
                                    <div className="text-right text-[9px] text-wa-muted mt-1">
                                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        {msg.from === 'user' && ' ✓✓'}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Input bar */}
                    <div className="bg-wa-bg px-3 py-2 flex items-center gap-2">
                        <div className="flex-1 h-8 bg-white rounded-full px-3 flex items-center">
                            <span className="text-[11px] text-wa-muted">Ketik pesan...</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-wa-green flex items-center justify-center">
                            <Smartphone size={14} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating badge */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-5 top-1/3 bg-white rounded-2xl px-4 py-3 shadow-wa-md border border-wa-border hidden sm:block"
            >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-wa-green animate-pulse" />
                    <span className="text-[12px] font-semibold text-wa-dark">Asisten aktif</span>
                </div>
                <div className="text-[11px] text-wa-icon mt-0.5">Siap menerima pesan</div>
            </motion.div>
        </div>
    );
}
