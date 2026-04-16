import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, MessageCircle, HelpCircle, ArrowRight, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { HELP_COPY } from '../../constants/copy';
import { SLIDE_UP, FADE_IN } from '../../utils/motion';
import { cn } from '../../utils/tw.utils';

/**
 * 🚀 THE OFFICIAL WHATSAPP HELP CENTER
 */
/**
 * 🚀 THE OFFICIAL WHATSAPP HELP CENTER - v9.0 "Liquid Glass"
 */
export default function Help() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Pusat Bantuan — Ingetin WhatsApp Assistant`;
    }, []);

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        { 
            q: "Bagaimana cara menghubungkan WhatsApp saya?", 
            a: "Buat akun Anda, masuk ke dashboard, dan ikuti instruksi untuk memverifikasi nomor WhatsApp Anda. Kode keamanan akan dikirimkan melalui chat WhatsApp untuk penyelesaian akhir." 
        },
        { 
            q: "Bagaimana prosedur pencatatan keuangan?", 
            a: "Cukup kirimkan pesan langsung ke asisten kami dengan format natural, seperti 'Makan siang 50rb'. Sistem kami akan mengategorikan dan mengarsipkannya secara instan ke dashboard keuangan Anda." 
        },
        { 
            q: "Apakah layanan ini berbayar?", 
            a: "Kami menyediakan fitur dasar secara gratis selamanya. Untuk kebutuhan yang lebih kompleks dan profesional, tersedia paket berlangganan dengan fitur manajemen tingkat lanjut." 
        },
        { 
            q: "Apakah asisten bisa membaca chat pribadi saya?", 
            a: "Sama sekali tidak. Ingetin hanya merespons pesan yang Anda kirimkan langsung ke nomor resmi asisten kami. Enkripsi end-to-end WhatsApp tetap menjamin privasi percakapan pribadi Anda." 
        },
        { 
            q: "Bagaimana cara menghapus pengingat yang sudah dibuat?", 
            a: "Anda dapat mengelola, mengubah, atau menghapus pengingat melalui dashboard utama di bagian 'Agenda Aktif' dengan navigasi yang intuitif." 
        }
    ];

    return (
        <div className="relative min-h-screen bg-white selection:bg-[#25D366]/10 selection:text-[#00a884] overflow-x-hidden text-left">
            
            {/* 01. INTEGRATED COMMAND HERO */}
            <section className="pt-24 pb-20 md:pt-40 md:pb-32 px-6 relative overflow-hidden bg-secondary/30">
                <div className="absolute top-0 right-0 p-20 opacity-[0.03] scale-150 -rotate-12">
                    <HelpCircle size={300} />
                </div>
                
                <div className="max-w-7xl mx-auto space-y-12 relative z-10 text-center md:text-left">
                    <motion.div variants={SLIDE_UP} initial="initial" animate="animate" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00a884]/20 text-[#00a884] shadow-modern backdrop-blur-sm">
                        <LifeBuoy size={14} className="animate-pulse" />
                        <Typography variant="small" className="font-bold tracking-[0.2em] text-[10px] uppercase text-[#00a884]">{HELP_COPY.hero.badge}</Typography>
                    </motion.div>

                    <div className="space-y-10">
                        <motion.div variants={SLIDE_UP} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
                            <Typography variant="h1" className="text-5xl md:text-7xl font-bold text-[#111b21] tracking-tighter leading-none">
                                Orbit <br className="hidden md:block" /> Dukungan
                            </Typography>
                        </motion.div>
                        
                        <motion.div variants={FADE_IN} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="max-w-2xl relative group mx-auto md:mx-0">
                            <div className="absolute inset-y-0 left-5 flex items-center text-gray-300 group-focus-within:text-[#00a884] transition-colors">
                                <Search size={22} strokeWidth={2.5} />
                            </div>
                            <input 
                                type="text" 
                                placeholder={HELP_COPY.hero.placeholder} 
                                className="w-full h-16 bg-white border border-gray-100 shadow-modern pl-14 pr-8 text-[17px] font-medium outline-none focus:border-[#00a884]/30 focus:shadow-2xl transition-all rounded-3xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 02. FAQ REGISTRY - PREMIUM TIMELINE */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto space-y-20">
                    <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100/50 pb-12 gap-8">
                        <div className="space-y-3">
                            <Typography variant="h2" className="text-4xl font-bold text-[#111b21] tracking-tight">{HELP_COPY.list.title}</Typography>
                            <Typography variant="p" className="text-gray-400 text-lg font-medium">Manifest Prosedur & Jawaban Teknis</Typography>
                        </div>
                    </header>
                    
                    <div className="divide-y divide-gray-100/50 border-t border-gray-100/50">
                        {faqs.map((faq, index) => (
                            <motion.div key={index} variants={SLIDE_UP} initial="initial" whileInView="animate" viewport={{ once: true }} className="py-10 group">
                                <button 
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between text-left transition-all"
                                >
                                    <div className="flex items-center gap-8">
                                      <Typography variant="p" className="text-[#00a884]/20 font-black tabular-nums text-2xl group-hover:text-[#00a884] transition-colors">0{index + 1}</Typography>
                                      <Typography variant="h3" className="text-xl font-bold text-[#111b21] group-hover:text-[#00a884] transition-colors tracking-tight">{faq.q}</Typography>
                                    </div>
                                    <div className={cn("shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100/50 transition-all duration-500", openIndex === index ? "bg-[#00a884] text-white rotate-180 border-transparent shadow-modern" : "text-gray-300 group-hover:bg-secondary group-hover:text-foreground")}>
                                        <ChevronDown size={20} strokeWidth={2.5} />
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-8 pl-16 max-w-3xl border-l-[3px] border-[#00a884]/10 ml-4">
                                                <Typography variant="p" className="text-gray-500 font-medium text-[17px] leading-relaxed italic">{faq.a}</Typography>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 03. COMMAND CONTACT */}
            <section className="py-32 px-6 relative overflow-hidden bg-[#111b21] text-white">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00a884]/20 via-transparent to-transparent opacity-50" />
                <div className="max-w-4xl mx-auto space-y-10 relative z-10 text-center">
                    <div className="w-20 h-20 bg-[#25D366] text-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-12 group hover:rotate-0 transition-transform duration-700">
                        <MessageCircle size={36} fill="white" strokeWidth={0} />
                    </div>
                    <Typography variant="h2" className="text-4xl md:text-6xl font-bold tracking-tighter leading-none">
                      Pusat Frekuensi <br /> Dukungan Personal
                    </Typography>
                    <Typography variant="lead" className="text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Tim teknis kami bersiaga 24/7 untuk memastikan aliran data dan asisten digital Anda tetap optimal.
                    </Typography>
                    <div className="pt-10">
                      <Button asChild size="lg" className="rounded-[1.5rem] px-14 bg-white text-[#111b21] hover:bg-[#00a884] hover:text-white font-black h-16 text-[15px] uppercase tracking-widest transition-all shadow-2xl">
                          <Link to="/">Hubungi Registry</Link>
                      </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
