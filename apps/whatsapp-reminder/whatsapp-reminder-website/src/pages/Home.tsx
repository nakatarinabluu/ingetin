import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    MessageCircle, 
    ShieldCheck, 
    ArrowRight,
    Zap,
    Activity,
    Layers,
    Lock,
    Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function HomeCapabilityItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="space-y-4">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[#25D366]">
                {icon}
            </div>
            <h4 className="text-[16px] font-bold text-[#0F172A]">{title}</h4>
            <p className="text-[14px] text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}

function SecurityItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="space-y-3">
            <div className="w-10 h-10 bg-[#F0F2F5] rounded-full flex items-center justify-center text-[#075E54]">
                {icon}
            </div>
            <h4 className="text-[15px] font-bold text-[#0F172A]">{title}</h4>
            <p className="text-[13px] text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-white font-sans text-[#0F172A] selection:bg-[#25D366]/20">
            
            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center text-white">
                            <MessageCircle size={18} fill="currentColor" />
                        </div>
                        <span className="text-[15px] font-bold tracking-tight">Ingetin</span>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-slate-500">
                            <a href="#features" className="hover:text-[#25D366] transition-colors">Features</a>
                            <a href="#security" className="hover:text-[#25D366] transition-colors">Security</a>
                        </div>
                        <div className="h-4 w-px bg-slate-200 hidden md:block" />
                        <div className="flex items-center gap-4">
                            <Link to="/auth" className="text-[13px] font-semibold hover:text-[#25D366] transition-colors">Login</Link>
                            <Link 
                                to="/auth?mode=register" 
                                className="bg-[#25D366] hover:bg-[#1eb956] text-white px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all shadow-sm"
                            >
                                Create account
                            </Link>
                        </div>

                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Now in Private Beta</span>
                    </div>

                    <h1 className="text-[48px] md:text-[72px] font-bold tracking-[-0.04em] leading-[1.05] text-[#0F172A]">
                        Easy scheduling <br className="hidden md:block" /> 
                        for <span className="text-[#25D366]">WhatsApp.</span>
                    </h1>
                    
                    <p className="text-[18px] md:text-[20px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        The simple way to send automated WhatsApp reminders. 
                        Reliable, secure, and built for your team.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link 
                            to="/auth?mode=register" 
                            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1eb956] text-white px-8 py-3.5 rounded-xl font-bold text-[15px] shadow-lg shadow-green-500/10 transition-all active:scale-[0.98]"
                        >
                            Create account
                        </Link>
                        <Link 
                            to="/auth" 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 rounded-xl font-bold text-[15px] hover:bg-slate-50 transition-all"
                        >
                            View demo <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* VISUAL STAGE */}
                <div className="max-w-5xl mx-auto mt-24 relative">
                    <div className="absolute inset-0 bg-[#25D366]/5 blur-[120px] rounded-full pointer-events-none" />
                    <div className="relative bg-white rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">
                        <div className="h-12 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                            </div>
                        </div>
                        <div className="flex h-[500px]">
                            <div className="w-[60px] border-r border-slate-100 bg-white p-3 flex flex-col items-center gap-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
                                <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
                            </div>
                            <div className="w-[280px] border-r border-slate-100 bg-white">
                                <div className="p-4 space-y-4">
                                    <div className="h-8 bg-slate-50 rounded-lg border border-slate-100" />
                                    {[1,2,3].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50" />
                                            <div className="flex-1 py-1 space-y-2">
                                                <div className="h-2 w-2/3 bg-slate-100 rounded" />
                                                <div className="h-2 w-full bg-slate-50 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-50 relative">
                                <div className="absolute inset-0 wa-chat-pattern opacity-5" />
                                <div className="p-8 flex flex-col gap-4 relative z-10">
                                    <div className="self-start bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-[12px] border border-slate-100 max-w-[70%]">
                                        Hello Sarah! This is an automated reminder for your appointment with **Ingetin Design** today at 3:00 PM.
                                    </div>
                                    <div className="self-end bg-[#D9FDD3] p-3 rounded-lg rounded-tr-none shadow-sm text-[12px] border border-[#c7e9b4] max-w-[70%]">
                                        Thanks for the reminder! I'll be there on time.
                                    </div>
                                    <div className="self-start bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-[12px] border border-slate-100 max-w-[70%]">
                                        Great! We look forward to seeing you. Type **HELP** if you need to reschedule.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- INFRASTRUCTURE --- */}
            <section id="features" className="py-32 border-t border-slate-100 bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-[32px] font-bold tracking-tight">Grows with you.</h2>
                            <p className="text-slate-500 text-[16px] leading-relaxed">
                                Our system is designed to handle all your reminders quickly and smoothly.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <HomeCapabilityItem icon={<Activity size={20} />} title="Live updates" description="See exactly when your messages are delivered." />
                            <HomeCapabilityItem icon={<Zap size={20} />} title="Instant sync" description="Syncs perfectly with your Google Calendar." />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECURITY --- */}
            <section id="security" className="py-32 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
                        <h2 className="text-[32px] font-bold tracking-tight text-[#075E54]">Bank-level security.</h2>
                        <p className="text-slate-500">
                            We use multiple layers of protection to ensure your data 
                            stays completely private and secure.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <SecurityItem 
                            icon={<ShieldCheck size={20} />} 
                            title="End-to-End Encryption" 
                            description="Messages are encrypted before sending, so only the intended person can read them." 
                        />
                        <SecurityItem 
                            icon={<Layers size={20} />} 
                            title="Private Workspaces" 
                            description="Your data is kept completely separate and secure from everyone else." 
                        />
                        <SecurityItem 
                            icon={<Lock size={20} />} 
                            title="Secure Login via WhatsApp" 
                            description="Every login is protected by a secure code sent straight to your phone." 
                        />
                        <SecurityItem 
                            icon={<Activity size={20} />} 
                            title="Verified Connections" 
                            description="We verify all connections to keep your account safe from fakes." 
                        />
                        <SecurityItem 
                            icon={<Shield size={20} />} 
                            title="Encrypted Storage" 
                            description="Your sensitive information is locked up tight with industry-standard encryption." 
                        />
                        <SecurityItem 
                            icon={<Zap size={20} />} 
                            title="Safe Sessions" 
                            description="Your login sessions are secure and protected against tampering." 
                        />
                    </div>
                </div>
            </section>


            {/* --- CTA --- */}
            <section className="py-32 bg-[#F8FAFC]">
                <div className="max-w-3xl mx-auto text-center px-6 space-y-10">
                    <h2 className="text-[32px] md:text-[48px] font-bold tracking-tight">Ready to get started?</h2>
                    <Link 
                        to="/auth?mode=register" 
                        className="inline-block bg-[#25D366] hover:bg-[#1eb956] text-white px-10 py-4 rounded-xl font-bold text-[16px] transition-all transform hover:-translate-y-1"
                    >
                        Create account
                    </Link>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-16 border-t border-slate-100 bg-white">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#25D366] rounded flex items-center justify-center text-white">
                            <MessageCircle size={14} fill="currentColor" />
                        </div>
                        <span className="text-[14px] font-bold">Ingetin</span>
                    </div>
                    <p className="text-[12px] text-slate-400">© 2026 Ingetin. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
