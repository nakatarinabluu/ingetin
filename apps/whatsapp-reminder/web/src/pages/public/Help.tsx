import { useEffect, useState } from 'react';
import { Search, ChevronDown, MessageCircle, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HELP_COPY } from '@/shared/config/copy';
import { cn } from '@/shared/lib/tw.utils';

/**
 * Help Center — WhatsApp Official Style
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
            a: "Buat akun Anda, masuk ke dashboard, dan ikuti instruksi untuk memverifikasi nomor WhatsApp. Kode OTP akan dikirimkan melalui chat WhatsApp resmi kami." 
        },
        { 
            q: "Bagaimana cara membuat agenda atau pengeluaran?", 
            a: "Cukup kirimkan pesan ke nomor WhatsApp Ingetin seperti layaknya chat dengan teman. Contoh: 'Makan siang 50rb' atau 'Ingatkan meeting besok jam 10 pagi'. Sistem akan memproses otomatis." 
        },
        { 
            q: "Apakah layanan ini gratis?", 
            a: "Fitur pencatatan dan pengingat dasar tersedia gratis. Pembaruan untuk fitur tingkat lanjut (seperti kolaborasi tim) akan segera hadir dalam paket premium." 
        },
        { 
            q: "Apakah pesan WhatsApp saya aman?", 
            a: "Tentu. Ingetin hanya merespons dan membaca pesan yang Anda kirim ke nomor WhatsApp resmi kami. Kami berpedoman pada enkripsi dan standar privasi resmi." 
        },
        { 
            q: "Bagaimana cara menghapus atau mengedit data saya?", 
            a: "Anda dapat mengatur seluruh agenda dan ringkasan pengeluaran melalui dashboard web ini. Buka halaman terkait untuk mengubah atau menghapusnya." 
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            
            {/* ─── Hero ─── */}
            <section className="bg-wa-bg py-16 md:py-24 px-6 border-b border-wa-border">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-wa-green text-white rounded-full mx-auto shadow-sm">
                        <LifeBuoy size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-wa-dark mb-3">
                            Pusat Bantuan Ingetin
                        </h1>
                        <p className="text-wa-icon text-lg">
                            Ada yang bisa kami bantu hari ini?
                        </p>
                    </div>
                    
                    <div className="relative max-w-xl mx-auto mt-6">
                        <div className="absolute inset-y-0 left-4 flex items-center text-wa-icon pointer-events-none">
                            <Search size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder={HELP_COPY.hero.placeholder} 
                            className="w-full h-14 bg-white border border-wa-border pl-12 pr-6 text-[15px] font-medium focus:outline-none focus:border-wa-green focus:ring-4 focus:ring-wa-green/10 transition-all rounded-full shadow-sm"
                        />
                    </div>
                </div>
            </section>

            {/* ─── FAQs ─── */}
            <section className="py-16 md:py-24 px-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-wa-dark mb-1">{HELP_COPY.list.title}</h2>
                        <p className="text-wa-icon">Topik yang paling sering ditanyakan oleh pengguna kami.</p>
                    </div>
                    
                    <div className="divide-y divide-wa-border border-t border-wa-border">
                        {faqs.map((faq, index) => (
                            <div key={index} className="py-5">
                                <button 
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between text-left group"
                                >
                                    <h3 className="text-[16px] font-semibold text-wa-dark group-hover:text-wa-green transition-colors pr-6">
                                        {faq.q}
                                    </h3>
                                    <ChevronDown 
                                        size={20} 
                                        className={cn(
                                            "text-wa-icon transition-transform duration-300 shrink-0",
                                            openIndex === index && "rotate-180 text-wa-green"
                                        )} 
                                    />
                                </button>
                                
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pt-3 text-wa-icon text-sm leading-relaxed pr-8">
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Contact ─── */}
            <section className="bg-wa-bg py-20 px-6 border-t border-wa-border text-center">
                <div className="max-w-xl mx-auto space-y-5">
                    <div className="w-16 h-16 bg-wa-teal text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                        <MessageCircle size={32} strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-bold text-wa-dark">
                        Masih butuh bantuan?
                    </h2>
                    <p className="text-wa-icon leading-relaxed">
                        Tim dukungan kami siap membantu Anda menyelesaikan masalah apa pun. Hubungi kami langsung melalui WhatsApp untuk respon tercepat.
                    </p>
                    <div className="pt-4">
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-2 h-12 px-8 bg-wa-green text-white font-semibold rounded-full hover:bg-wa-green-dark transition-colors shadow-sm"
                        >
                            Hubungi Dukungan CS
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
