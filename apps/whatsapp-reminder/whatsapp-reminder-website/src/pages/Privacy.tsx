import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, ShieldCheck, Lock, Eye, Globe, Database } from 'lucide-react';

export default function Privacy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-[#0F172A] selection:bg-[#25D366]/20 flex flex-col">
            
            {/* --- TOP BRAND BAR --- */}
            <nav className="h-16 border-b border-slate-100 flex items-center px-6 lg:px-12 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#25D366] rounded-lg flex items-center justify-center text-white">
                        <MessageCircle size={16} fill="currentColor" />
                    </div>
                    <span className="text-[14px] font-bold tracking-tight">Ingetin</span>
                </Link>
            </nav>

            <main className="flex-1 max-w-3xl mx-auto px-6 py-20 space-y-16">
                <header className="space-y-4 text-center">
                    <div className="inline-flex p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[#075E54] mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-[40px] font-bold tracking-tight text-[#0F172A]">Privacy Standards</h1>
                </header>

                <div className="space-y-12">
                    <PrivacySection 
                        icon={<Eye size={18} />}
                        title="Data Collection"
                        content="We collect minimal identification data required to maintain your automation node, including your name, encrypted recovery email, and node username. We do not index the content of your transmissions."
                    />

                    <PrivacySection 
                        icon={<Database size={18} />}
                        title="Encryption at Rest"
                        content="All sensitive credentials, including Meta Access Tokens and Google OAuth data, are stored using industry-standard AES-256 encryption. Your keys are decrypted only during active transmission handshakes."
                    />

                    <PrivacySection 
                        icon={<Lock size={18} />}
                        title="Isolated Environments"
                        content="Your data resides in isolated containerized environments. This architectural isolation ensures that your automation logs and schedule parameters are never accessible to other network participants."
                    />

                    <PrivacySection 
                        icon={<Globe size={18} />}
                        title="Third-Party Handshakes"
                        content="Transmission requests are routed directly to Meta and Google APIs. We do not share, sell, or trade your identification data with any fourth-party entities or marketing networks."
                    />
                </div>

                <div className="pt-16 border-t border-slate-100 text-center">
                    <p className="text-[13px] text-slate-400 italic">
                        Please close this tab and return to the registration window to continue.
                    </p>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-100 bg-white text-center">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em]">© 2026 Ingetin Automation. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

function PrivacySection({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#075E54]">
                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                    {icon}
                </div>
                <h2 className="text-[20px] font-bold tracking-tight">{title}</h2>
            </div>
            <p className="text-[15px] text-slate-500 leading-relaxed pl-11">
                {content}
            </p>
        </section>
    );
}
