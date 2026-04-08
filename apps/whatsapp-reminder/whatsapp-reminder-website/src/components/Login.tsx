import React, { useState } from 'react';
import { Smartphone, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';

interface LoginProps {
    onLogin: (token: string, role: 'ADMIN' | 'USER') => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [adminCreds, setAdminCreds] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post(`/whatsapp/otp/send`, { phone });
            setStep(2);
        } catch (err) {
            alert('Failed to send OTP. Check phone format (+xx...)');
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiClient.post(`/whatsapp/otp/verify`, { phone, code: otp });
            onLogin(res.data.token, res.data.user?.rank === 'Staff' ? 'ADMIN' : 'USER');
        } catch (err) {
            alert('Invalid OTP');
        }
        setLoading(false);
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiClient.post(`/auth/login`, adminCreds);
            onLogin(res.data.token, 'ADMIN');
        } catch (err) {
            alert('Invalid Admin Credentials');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] p-4">
            <div className="w-full max-w-md bg-[#1F2833] border border-[#45A29E]/30 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-[#0B0C10] rounded-full text-[#45A29E] mb-4">
                        <Smartphone size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">WA Command Center</h1>
                    <p className="text-[#45A29E] text-sm mt-1">Authentication Required</p>
                </div>

                <div className="flex bg-[#0B0C10] p-1 rounded-lg mb-8">
                    <button 
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isAdmin ? 'bg-[#45A29E] text-[#0B0C10]' : 'text-[#45A29E]'}`}
                        onClick={() => setIsAdmin(false)}
                    >
                        User Login
                    </button>
                    <button 
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isAdmin ? 'bg-[#45A29E] text-[#0B0C10]' : 'text-[#45A29E]'}`}
                        onClick={() => setIsAdmin(true)}
                    >
                        Admin Portal
                    </button>
                </div>

                {isAdmin ? (
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs text-[#45A29E] uppercase mb-2">Username</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-3 text-[#45A29E]/50" size={18} />
                                <input 
                                    type="text"
                                    className="w-full bg-[#0B0C10] border border-[#45A29E]/30 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#66FCF1]"
                                    value={adminCreds.username}
                                    onChange={e => setAdminCreds({...adminCreds, username: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-[#45A29E] uppercase mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-[#45A29E]/50" size={18} />
                                <input 
                                    type="password"
                                    className="w-full bg-[#0B0C10] border border-[#45A29E]/30 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#66FCF1]"
                                    value={adminCreds.password}
                                    onChange={e => setAdminCreds({...adminCreds, password: e.target.value})}
                                />
                            </div>
                        </div>
                        <button 
                            className="w-full bg-[#45A29E] hover:bg-[#66FCF1] text-[#0B0C10] font-bold py-3 rounded-lg transition-colors mt-4 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Login to Console'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        {step === 1 ? (
                            <form onSubmit={handleRequestOTP} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-[#45A29E] uppercase mb-2">Phone Number</label>
                                    <input 
                                        type="text"
                                        placeholder="+62..."
                                        className="w-full bg-[#0B0C10] border border-[#45A29E]/30 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-[#66FCF1]"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="w-full bg-[#45A29E] hover:bg-[#66FCF1] text-[#0B0C10] font-bold py-3 rounded-lg transition-colors mt-4"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending OTP...' : 'Request OTP Code'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-white">We sent a code to <span className="text-[#66FCF1]">{phone}</span></p>
                                    <button onClick={() => setStep(1)} className="text-xs text-[#45A29E] underline mt-1">Change number</button>
                                </div>
                                <div>
                                    <label className="block text-xs text-[#45A29E] uppercase mb-2">6-Digit Code</label>
                                    <input 
                                        type="text"
                                        maxLength={6}
                                        className="w-full bg-[#0B0C10] border border-[#45A29E]/30 rounded-lg py-3 px-4 text-white text-center tracking-widest text-xl focus:outline-none focus:border-[#66FCF1]"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="w-full bg-[#45A29E] hover:bg-[#66FCF1] text-[#0B0C10] font-bold py-3 rounded-lg transition-colors mt-4"
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify & Enter'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
