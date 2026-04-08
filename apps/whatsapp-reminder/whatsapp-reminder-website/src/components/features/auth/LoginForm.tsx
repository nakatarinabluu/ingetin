import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthInputField } from './AuthInputField';

interface LoginFormProps {
    onLogin: (data: any) => Promise<void>;
    loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
    const [username, setUsername] = useState(import.meta.env.DEV ? 'admin' : '');
    const [password, setPassword] = useState(import.meta.env.DEV ? 'Cloverid76' : '');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onLogin({ username: username.trim(), password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInputField 
                label="Username" 
                value={username} 
                onChange={(val) => setUsername(val.replace(/\s/g, ''))} 
                placeholder="aria.lunar"
            />
            
            <div className="space-y-1.5 relative">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-[#25D366] transition-all placeholder:text-slate-300 shadow-sm"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-300 hover:text-slate-500"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button 
                    disabled={loading || !username || !password}
                    className="w-full bg-[#25D366] hover:bg-[#1eb956] text-white py-3 rounded-xl font-bold text-[14px] shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </div>
        </form>
    );
};
