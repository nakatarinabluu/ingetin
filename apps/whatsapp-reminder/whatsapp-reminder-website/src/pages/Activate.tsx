import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LogOut, Lock, CheckCircle2, Zap, ShieldAlert, Key, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAPI, AuthAPI } from '../api/services';

export default function Activate() {
    const { user, logout, refreshUser } = useAuth();
    const token = user?.token;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // --- REDIRECT IF ALREADY ACTIVATED ---
    React.useEffect(() => {
        const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
        if (isAdmin || user?.isActivated) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || loading) return;

        setLoading(true);
        setMessage('');
        
        try {
            const res = await AuthAPI.activate({ code });
            
            // Activation success:
            // 1. Show success message
            setMessage('Account verified successfully!');
            
            // 2. Wait a small beat for the browser to settle the new cookie
            await new Promise(resolve => setTimeout(resolve, 800));

            // 3. Update local user state
            // Note: activationData from backend contains the rest of the user data
            refreshUser({ isActivated: true });
            
            // 4. Navigate to dashboard (The useEffect above will also catch this)
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 500);

        } catch (err: any) {
            setMessage(err.response?.data?.error || 'That code didn\'t work.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            
            {/* --- BACKGROUND AMBIENCE (Indigo Sky Style) --- */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#25D366]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0F172A]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 wa-chat-pattern opacity-[0.02] pointer-events-none" />

            {/* --- TOP LOGO --- */}
            <div className="absolute top-10 left-10 hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white shadow-lg">
                    <MessageCircle size={20} fill="currentColor" />
                </div>
                <span className="text-[14px] font-bold text-[#0F172A] tracking-tight">Ingetin <span className="text-slate-400 font-medium">Account</span></span>
            </div>

            <div className="w-full max-w-[440px] z-10 space-y-8">
                
                {/* --- HEADER --- */}
                <div className="text-center space-y-5">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-slate-200 border border-slate-100">
                        <Lock size={24} className="text-[#25D366]" fill="currentColor" />
                    </div>
                    
                    <div className="space-y-1">
                        <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Verify Your Account</h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Please enter your verification code</p>
                    </div>
                </div>

                {/* --- FORM CARD --- */}
                <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
                    
                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 text-[12px] font-bold border ${
                            message.includes('successfully') 
                                ? 'bg-green-50 text-[#25D366] border-green-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                            {message.includes('successfully') ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                            <p className="leading-tight">{message}</p>
                        </div>
                    )}

                    <form onSubmit={handleActivate} className="space-y-8">
                        <div className="space-y-5 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-300">
                                <Key size={12} />
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Verification Code</label>
                            </div>
                            
                            <input 
                                required
                                autoFocus
                                type="text"
                                maxLength={48}
                                className="w-full py-4 text-center text-[16px] font-bold tracking-tight text-[#0F172A] uppercase placeholder:text-slate-100 bg-slate-50/50 rounded-xl border-2 border-transparent outline-none focus:border-[#25D366] focus:bg-white transition-all shadow-sm"
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <button 
                                disabled={loading}
                                className="w-full bg-[#25D366] hover:bg-[#1eb956] text-white py-4 rounded-xl text-[13px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 group transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Account'}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
                            </button>

                            <button 
                                type="button"
                                onClick={logout}
                                className="w-full py-3 text-[10px] font-bold text-slate-400 hover:text-rose-500 rounded-lg uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- FOOTER --- */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                        <div className="w-1 h-1 rounded-full bg-[#25D366] animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Connection</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                        Need help? Contact support at <span className="text-[#0F172A] font-bold">@ingetin</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
