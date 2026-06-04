import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_COPY } from '@/shared/config/copy';
import { Gavel, ArrowRight } from 'lucide-react';

export default function Terms() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Ketentuan Layanan — Ingetin WhatsApp Assistant`;
    }, []);

    return (
        <div className="min-h-screen bg-white pt-24 pb-32">
            <div className="max-w-3xl mx-auto px-6">
                
                {/* ─── Header ─── */}
                <header className="mb-12 border-b border-wa-border pb-8 pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wa-bg text-wa-green mb-6">
                        <Gavel size={14} />
                        <span className="text-xs font-semibold">{LEGAL_COPY.terms.badge}</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-bold text-wa-dark mb-3">
                        {LEGAL_COPY.terms.title.replace('. ', ' ')}
                    </h1>
                    <p className="text-sm text-wa-icon font-medium">
                        {LEGAL_COPY.terms.version}
                    </p>
                </header>

                {/* ─── Content ─── */}
                <article className="space-y-10 text-left">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-wa-dark">1. Penerimaan Ketentuan</h2>
                        <p className="text-wa-icon leading-relaxed">
                          Dengan mendaftarkan akun atau menggunakan layanan aplikasi ini, Anda menyatakan telah membaca, memahami, dan menyetujui Ketentuan Layanan ini. Anda dilarang menggunakan platform apabila ada keberatan terhadap poin-poin yang tercantum.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-wa-dark">2. Penggunaan yang Sah</h2>
                        <p className="text-wa-icon leading-relaxed">
                          Layanan kami dirancang sebagai asisten produktivitas personal. Menggunakan otomatisasi kami untuk span massal, pengerusakan layanan pihak ketiga, atau kegiatan melanggar hukum merupakan sebuah larangan. Kami berhak membatalkan akses layanan milik siapa pun yang melanggar dan menyebarkan malware tanpa peringatan administratif terlebih dahulu.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-wa-dark">3. Tanggung Jawab Akun</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-wa-bg border border-wa-border space-y-1.5">
                                <span className="text-xs font-semibold text-wa-green">Identifikasi</span>
                                <p className="text-sm text-wa-dark font-medium leading-relaxed">
                                    Kerahasiaan kata sandi web sepenuhnya berada di bawah kendali pengguna.
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-wa-bg border border-wa-border space-y-1.5">
                                <span className="text-xs font-semibold text-wa-green">Legalitas</span>
                                <p className="text-sm text-wa-dark font-medium leading-relaxed">
                                    Catatan, aktivitas, dan data keuangan terkait platform mutlak dipertanggungjawabkan kepada Anda.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="pt-10 border-t border-wa-border flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-xs text-wa-muted font-medium">{LEGAL_COPY.terms.last_update}</p>
                        <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-wa-green hover:bg-wa-green-dark text-white font-semibold rounded-xl transition-colors">
                            Kembali ke Registrasi <ArrowRight size={18} />
                        </Link>
                    </div>
                </article>

            </div>
        </div>
    );
}
