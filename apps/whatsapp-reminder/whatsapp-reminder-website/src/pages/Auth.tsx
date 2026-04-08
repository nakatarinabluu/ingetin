import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthAPI } from '../api/services';
import { LoginInput, RegisterInput } from '@ingetin/types';
import { Modal } from '../components/ui';
import { LoginForm } from '../components/features/auth/LoginForm';
import { RegisterForm } from '../components/features/auth/RegisterForm';
import { 
  ArrowRight, 
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Database,
  Globe
} from 'lucide-react';

type PolicyType = 'TERMS' | 'PRIVACY';

export default function Auth() {
    const { login, user } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'register') setIsLogin(false);
        else setIsLogin(true);
    }, [location]);

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    const handleLogin = async (data: LoginInput) => {
        setLoading(true);
        setError('');
        try {
            const response = await AuthAPI.login(data);
            if (response.data.success) {
                const { user: userData, token } = response.data.data;
                login({ ...userData, token });
                navigate('/dashboard');
            } else {
                setError(response.data.error.message || 'Something went wrong');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Could not log in.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data: RegisterInput) => {
        setLoading(true);
        setError('');
        try {
            const response = await AuthAPI.register(data);
            if (response.data.success) {
                const { user: userData, token } = response.data.data;
                login({ ...userData, token });
                navigate('/activate');
            } else {
                setError(response.data.error.message || 'Something went wrong');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Could not create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-[#0F172A] selection:bg-[#25D366]/20 flex flex-col">
            <nav className="h-16 border-b border-slate-100 flex items-center px-6 lg:px-12">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#25D366] rounded-lg flex items-center justify-center text-white">
                        <MessageCircle size={16} fill="currentColor" />
                    </div>
                    <span className="text-[14px] font-bold tracking-tight">Ingetin</span>
                </Link>
            </nav>

            <main className="flex-1 flex items-center justify-center p-6 bg-slate-50/50 relative overflow-hidden">
                <div className="absolute inset-0 wa-chat-pattern opacity-[0.03] pointer-events-none" />
                
                <div className="w-full max-w-[420px] space-y-8 relative z-10">
                    <div className="text-center space-y-2">
                        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
                            {isLogin ? 'Welcome back' : 'Create account'}
                        </h1>
                        <p className="text-[14px] text-slate-500">
                            {isLogin ? 'Welcome back! Please sign in to your account' : 'Join us! Create your account to get started'}
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
                        {error && (
                            <div className={`mb-5 p-3 rounded-lg flex items-center gap-3 text-[12px] font-medium border ${error.includes('created') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {isLogin ? (
                            <LoginForm onLogin={handleLogin} loading={loading} />
                        ) : (
                            <RegisterForm 
                                onRegister={handleRegister} 
                                loading={loading} 
                                setActivePolicy={setActivePolicy} 
                            />
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 text-center">
                            <button 
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-[13px] font-semibold text-[#25D366] hover:text-[#1eb956] transition-colors"
                            >
                                {isLogin ? "Need a new account? Create one" : "Already have an account? Log in"}
                            </button>
                            <Link 
                                to="/" 
                                className="text-[12px] font-bold text-slate-400 hover:text-[#0F172A] transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                <ArrowRight size={14} className="rotate-180" />
                                Back to home
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="flex flex-col items-center gap-2 text-center p-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Safe Data</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center p-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Database size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Saved History</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center p-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Globe size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Easy Access</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Policy Modals */}
            <Modal isOpen={activePolicy === 'TERMS'} onClose={() => setActivePolicy(null)} title="Terms of Service">
                <div className="space-y-4 text-slate-600 text-[14px] leading-relaxed">
                    <p>Welcome to Ingetin. By using our service, you agree to these terms.</p>
                    <h4 className="font-bold text-[#0F172A]">1. Usage Policy</h4>
                    <p>You agree not to use this service for spamming, harassment, or any illegal activities via WhatsApp.</p>
                    <h4 className="font-bold text-[#0F172A]">2. Account Security</h4>
                    <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
                </div>
            </Modal>

            <Modal isOpen={activePolicy === 'PRIVACY'} onClose={() => setActivePolicy(null)} title="Privacy Policy">
                <div className="space-y-4 text-slate-600 text-[14px] leading-relaxed">
                    <p>Your privacy is important to us. Here is how we handle your data.</p>
                    <h4 className="font-bold text-[#0F172A]">1. Data Collection</h4>
                    <p>We collect your username, email, and WhatsApp activity logs to provide our services.</p>
                    <h4 className="font-bold text-[#0F172A]">2. Data Protection</h4>
                    <p>We use industry-standard encryption to protect your information and never share it with third parties without consent.</p>
                </div>
            </Modal>
        </div>
    );
}
