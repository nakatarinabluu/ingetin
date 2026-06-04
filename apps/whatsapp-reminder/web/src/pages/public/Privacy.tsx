import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_COPY } from '@/shared/config/copy';
import { Lock, ArrowRight } from 'lucide-react';

export default function Privacy() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Kebijakan Privasi — Ingetin WhatsApp Assistant`;
    }, []);

    return (
        <div className="min-h-screen bg-white pt-24 pb-32">
            <div className="max-w-3xl mx-auto px-6">
                
                {/* ─── Header ─── */}
                <header className="mb-12 border-b border-wa-border pb-8 pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wa-bg text-wa-green mb-6">
                        <Lock size={14} />
                        <span className="text-xs font-semibold">{LEGAL_COPY.privacy.badge}</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-bold text-wa-dark mb-3">
                        {LEGAL_COPY.privacy.title.replace('. ', ' ')}
                    </h1>
                    <p className="text-sm text-wa-icon font-medium">
                        {LEGAL_COPY.privacy.version}
                    </p>
                </header>

                {/* ─── Content ─── */}
                <article className="space-y-10 text-left">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-wa-dark">1. Komitmen Dasar</h2>
                        <p className="text-wa-icon leading-relaxed">
                          Ingetin dibangun di atas filosofi di mana privasi adalah hal yang mutlak. Kami memahami bahwa percakapan profesional dan catatan keuangan Anda adalah hal yang sensitif. Oleh karena itu, kami berkomitmen untuk tidak pernah mengomersialkan data pribadi Anda melalui iklan atau pemasaran pihak ketiga.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-wa-dark">2. Pengolahan Informasi</h2>
                        <p className="text-wa-icon leading-relaxed">
                          Kami hanya mengambil data esensial yang diperlukan untuk menjalankan asisten digital Anda:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-wa-bg border border-wa-border space-y-2">
                                <h3 className="text-[15px] font-bold text-wa-dark">Identitas</h3>
                                <p className="text-sm text-wa-icon leading-relaxed">Nomor telepon Anda digunakan secara eksklusif untuk autentikasi akun dan pengiriman pesan notifikasi di WhatsApp pribadi Anda.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-wa-bg border border-wa-border space-y-2">
                                <h3 className="text-[15px] font-bold text-wa-dark">Pesan / Log</h3>
                                <p className="text-sm text-wa-icon leading-relaxed">Kami hanya memproses pesan spesifik yang Anda kirimkan ke nomor resmi asisten kami untuk mengekstrak informasi secara sistematis sesuai perintah yang Anda berikan.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-wa-dark">3. Integritas Data & Keamanan</h2>
                        <p className="text-wa-icon leading-relaxed">
                          Setiap data yang melewati sistem dilindungi oleh arsitektur standar keamanan terbaik kami. Kami diintegrasikan secara profesional ke antarmuka aplikasi pesan untuk memastikan keamanan koneksi dan kerahasiaan.
                        </p>
                    </section>

                    <div className="pt-10 border-t border-wa-border flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-xs text-wa-muted font-medium">{LEGAL_COPY.privacy.last_update}</p>
                        <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-wa-green hover:bg-wa-green-dark text-white font-semibold rounded-xl transition-colors">
                            Kembali ke Registrasi <ArrowRight size={18} />
                        </Link>
                    </div>
                </article>

            </div>
        </div>
    );
}
