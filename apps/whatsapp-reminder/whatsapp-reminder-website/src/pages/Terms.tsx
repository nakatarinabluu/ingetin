import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Scale, ShieldCheck, Zap, Globe, Lock } from 'lucide-react';

export default function Terms() {
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
                        <Scale size={32} />
                    </div>
                    <h1 className="text-[40px] font-bold tracking-tight text-[#0F172A]">Service Protocol</h1>
                </header>

                <div className="space-y-12">
                    <TermSection 
                        icon={<Zap size={18} />}
                        title="1. Node Provisioning"
                        content="By initializing an account with Ingetin, you are provisioned a private automation node. This node is intended for scheduling and transmitting reminders via the WhatsApp platform. You agree to provide accurate identification data during deployment."
                    />

                    <TermSection 
                        icon={<Globe size={18} />}
                        title="2. Transmission Policy"
                        content="You are strictly prohibited from using the Ingetin infrastructure for the transmission of unsolicited bulk messages (Spam), phishing, or any content that violates local or international laws. We maintain a zero-tolerance policy for network abuse."
                    />

                    <TermSection 
                        icon={<ShieldCheck size={18} />}
                        title="3. Third-Party Ecosystems"
                        content="Ingetin operates as an integration layer for the Meta (WhatsApp Graph API) and Google (Calendar API) ecosystems. Your usage is concurrently subject to the Terms of Service of Meta Platforms, Inc. and Google LLC. Failure to comply with their standards may result in node suspension."
                    />

                    <TermSection 
                        icon={<Lock size={18} />}
                        title="4. Data Sovereignty & Security"
                        content="Your communication data is processed through isolated node environments. While we employ AES-256 encryption at rest, you are solely responsible for the security of your Access Keys. Ingetin personnel will never request your credentials."
                    />

                    <TermSection 
                        icon={<Scale size={18} />}
                        title="5. Limitation of Liability"
                        content="Ingetin provides high-availability infrastructure (aiming for 99.9% uptime). However, we are not liable for transmission delays or failures caused by outages in the Meta/WhatsApp global network or your local internet service provider."
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

function TermSection({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
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
