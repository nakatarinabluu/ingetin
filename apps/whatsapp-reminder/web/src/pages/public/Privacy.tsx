import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { LEGAL_COPY } from '../../constants/copy';
import { motion } from 'framer-motion';
import { FADE_IN, SLIDE_UP } from '../../utils/motion';
import { Shield, ArrowRight, Lock } from 'lucide-react';

/**
 * 🚀 THE OFFICIAL WHATSAPP PRIVACY PAGE
 */
export default function Privacy() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Kebijakan Privasi — Ingetin WhatsApp Assistant`;
    }, []);

    return (
        <div className="relative min-h-screen bg-white selection:bg-[#25D366]/10 selection:text-[#00a884] overflow-x-hidden pt-24 pb-32">
            <div className="max-w-4xl mx-auto px-6">
                {/* 01. HEADER SECTION */}
                <header className="mb-16 border-b border-gray-100 pb-12 text-center md:text-left">
                    <motion.div {...SLIDE_UP} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f2f5] border border-[#00a884]/20 text-[#00a884] mb-8">
                        <Lock size={14} />
                        <Typography variant="small" className="font-bold tracking-widest text-[10px] uppercase text-[#00a884]">{LEGAL_COPY.privacy.badge}</Typography>
                    </motion.div>
                    
                    <motion.div {...SLIDE_UP} transition={{ delay: 0.1 }} className="space-y-4">
                        <Typography variant="h1" className="text-4xl md:text-6xl font-bold text-[#111b21] tracking-tight">
                            {LEGAL_COPY.privacy.title.replace('. ', ' ')}
                        </Typography>
                        <Typography variant="p" className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{LEGAL_COPY.privacy.version}</Typography>
                    </motion.div>
                </header>

                {/* 02. CONTENT SECTION */}
                <article className="space-y-16 text-left">
                    <section className="space-y-6">
                        <Typography variant="h2" className="text-2xl font-bold text-[#111b21]">01. Komitmen Dasar</Typography>
                        <Typography variant="p" className="text-gray-600 font-medium leading-relaxed">
                          Ingetin dibangun di atas filosofi di mana privasi adalah hal yang mutlak. Kami memahami bahwa percakapan profesional dan catatan keuangan Anda adalah hal yang sensitif. Oleh karena itu, kami berkomitmen untuk tidak pernah mengomersialkan data pribadi Anda melalui iklan atau pemasaran pihak ketiga.
                        </Typography>
                    </section>

                    <section className="space-y-6">
                        <Typography variant="h2" className="text-2xl font-bold text-[#111b21]">02. Pengolahan Informasi</Typography>
                        <Typography variant="p" className="text-gray-600 font-medium leading-relaxed">
                          Kami hanya mengambil data esensial yang diperlukan untuk menjalankan asisten digital Anda:
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-2xl bg-[#f0f2f5] border border-gray-100 space-y-4">
                                <Typography variant="h3" className="text-sm font-bold uppercase tracking-widest text-[#00a884]">Identitas</Typography>
                                <Typography variant="p" className="text-sm text-gray-500 font-medium leading-relaxed">Nomor telepon Anda digunakan secara eksklusif untuk autentikasi akun dan pengiriman notifikasi jadwal melalui WhatsApp.</Typography>
                            </div>
                            <div className="p-8 rounded-2xl bg-[#f0f2f5] border border-gray-100 space-y-4">
                                <Typography variant="h3" className="text-sm font-bold uppercase tracking-widest text-[#00a884]">Pesan</Typography>
                                <Typography variant="p" className="text-sm text-gray-500 font-medium leading-relaxed">Kami hanya memproses pesan spesifik yang Anda kirimkan ke nomor resmi asisten kami untuk mengekstrak informasi jadwal sesuai permintaan Anda.</Typography>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <Typography variant="h2" className="text-2xl font-bold text-[#111b21]">03. Integritas Data</Typography>
                        <Typography variant="p" className="text-gray-600 font-medium leading-relaxed">
                          Semua data yang melewati sistem kami dilindungi oleh protokol enkripsi standar industri. Kami menggunakan WhatsApp Business API resmi untuk memastikan bahwa pengaturan jadwal profesional Anda tetap aman dan pribadi di setiap tahapannya.
                        </Typography>
                    </section>

                    <div className="pt-16 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <Typography variant="small" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{LEGAL_COPY.privacy.last_update}</Typography>
                        <Button asChild className="rounded-full px-10 bg-[#00a884] hover:bg-[#008f72] text-white font-bold h-12 shadow-sm">
                            <Link to="/register" className="flex items-center gap-2">Mulai Sekarang <ArrowRight size={18} /></Link>
                        </Button>
                    </div>
                </article>
            </div>
        </div>
    );
}
