import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { LEGAL_COPY } from '../../constants/copy';
import { motion } from 'framer-motion';
import { FADE_IN, SLIDE_UP } from '../../utils/motion';
import { FileText, ArrowRight, Gavel } from 'lucide-react';

/**
 * 🚀 THE OFFICIAL WHATSAPP TERMS PAGE
 */
export default function Terms() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Ketentuan Layanan — Ingetin WhatsApp Assistant`;
    }, []);

    return (
        <div className="relative min-h-screen bg-white selection:bg-[#25D366]/10 selection:text-[#00a884] overflow-x-hidden pt-24 pb-32">
            <div className="max-w-4xl mx-auto px-6">
                {/* 01. HEADER SECTION */}
                <header className="mb-16 border-b border-gray-100 pb-12 text-center md:text-left">
                    <motion.div {...SLIDE_UP} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f2f5] border border-[#00a884]/20 text-[#00a884] mb-8">
                        <Gavel size={14} />
                        <Typography variant="small" className="font-bold tracking-widest text-[10px] uppercase text-[#00a884]">{LEGAL_COPY.terms.badge}</Typography>
                    </motion.div>
                    
                    <motion.div {...SLIDE_UP} transition={{ delay: 0.1 }} className="space-y-4">
                        <Typography variant="h1" className="text-4xl md:text-6xl font-bold text-[#111b21] tracking-tight">
                            {LEGAL_COPY.terms.title.replace('. ', ' ')}
                        </Typography>
                        <Typography variant="p" className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{LEGAL_COPY.terms.version}</Typography>
                    </motion.div>
                </header>

                {/* 02. CONTENT SECTION */}
                <article className="space-y-16 text-left">
                    <section className="space-y-6">
                        <Typography variant="h2" className="text-2xl font-bold text-[#111b21]">01. Penerimaan Ketentuan</Typography>
                        <Typography variant="p" className="text-gray-600 font-medium leading-relaxed">
                          Dengan mendaftarkan akun atau menggunakan layanan Ingetin, Anda menyatakan bahwa Anda telah membaca, memahami, dan setuju untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, Anda dilarang menggunakan asisten digital kami.
                        </Typography>
                    </section>

                    <section className="space-y-6">
                        <Typography variant="h2" className="text-2xl font-bold text-[#111b21]">02. Penggunaan yang Sah</Typography>
                        <Typography variant="p" className="text-gray-600 font-medium leading-relaxed">
                          Anda setuju untuk menggunakan Ingetin hanya untuk tujuan produktivitas pribadi yang sah. Penggunaan untuk pengiriman pesan massal (spam), aktivitas ilegal, atau tindakan apa pun yang membahayakan stabilitas infrastruktur kami sangat dilarang dan akan mengakibatkan penghentian akses secara instan.
                        </Typography>
                    </section>

                    <section className="space-y-6">
                        <Typography variant="h2" className="text-2xl font-bold text-[#111b21]">03. Tanggung Jawab Akun</Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-2xl bg-[#f0f2f5] border border-gray-100 space-y-4">
                                <div className="text-[10px] font-bold text-[#00a884] uppercase tracking-widest opacity-60">Identifikasi</div>
                                <Typography variant="p" className="text-sm font-bold text-[#111b21]">
                                    Anda bertanggung jawab penuh atas kerahasiaan identitas akun Anda.
                                </Typography>
                            </div>
                            <div className="p-8 rounded-2xl bg-[#f0f2f5] border border-gray-100 space-y-4">
                                <div className="text-[10px] font-bold text-[#00a884] uppercase tracking-widest opacity-60">Legalitas</div>
                                <Typography variant="p" className="text-sm font-bold text-[#111b21]">
                                    Semua aktivitas yang dilakukan melalui akun Anda tetap menjadi tanggung jawab hukum pribadi Anda.
                                </Typography>
                            </div>
                        </div>
                    </section>

                    <div className="pt-16 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <Typography variant="small" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{LEGAL_COPY.terms.last_update}</Typography>
                        <Button asChild className="rounded-full px-10 bg-[#00a884] hover:bg-[#008f72] text-white font-bold h-12 shadow-sm">
                            <Link to="/register" className="flex items-center gap-2">Mulai Sekarang <ArrowRight size={18} /></Link>
                        </Button>
                    </div>
                </article>
            </div>
        </div>
    );
}
