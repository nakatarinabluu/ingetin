import React, { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { AuthInputField } from './AuthInputField';
import { AuthAPI } from '../../../api/services';

interface RegisterFormProps {
    onRegister: (data: any) => Promise<void>;
    loading: boolean;
    setActivePolicy: (type: 'TERMS' | 'PRIVACY') => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, loading, setActivePolicy }) => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [usernameError, setUsernameError] = useState('');

    // --- REAL-TIME USERNAME CHECK ---
    useEffect(() => {
        const normalized = username.trim().replace(/\s/g, '');
        if (normalized.length < 3) {
            setUsernameAvailable(null);
            setUsernameError(normalized.length > 0 ? 'Too short (min 3 chars)' : '');
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingUsername(true);
            try {
                const res = await AuthAPI.checkUsername(normalized);
                setUsernameAvailable(res.data.available);
                setUsernameError(res.data.available ? '' : 'Name taken');
            } catch (err: any) {
                setUsernameAvailable(null);
                setUsernameError('Something went wrong, please try again later');
            } finally {
                setIsCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username]);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password);
    const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;
    const isFormValid = usernameAvailable === true && isEmailValid && isPasswordValid && isConfirmValid && agreed && firstName && lastName;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        onRegister({ username, email, password, firstName, lastName });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <AuthInputField label="First Name" value={firstName} onChange={setFirstName} placeholder="Aria" />
                <AuthInputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Lunar" />
            </div>

            <AuthInputField 
                label="Username" 
                value={username} 
                onChange={(val) => setUsername(val.replace(/\s/g, ''))} 
                placeholder="aria.lunar"
                isValid={username.length >= 3 ? usernameAvailable : null}
                error={username.length > 0 ? usernameError : ''}
            >
                {isCheckingUsername && (
                    <div className="w-3.5 h-3.5 border-2 border-slate-100 border-t-[#25D366] rounded-full animate-spin" />
                )}
            </AuthInputField>

            <AuthInputField 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={setEmail} 
                placeholder="aria@gmail.com" 
                isValid={email.length > 0 ? isEmailValid : null}
                error={email.length > 0 && !isEmailValid ? 'Invalid email' : ''}
            />

            <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    {password.length > 0 && !isPasswordValid && (
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">At least 8 chars, 1 uppercase letter</span>
                    )}
                </div>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className={`w-full bg-white border ${password.length > 0 ? (isPasswordValid ? 'border-emerald-500' : 'border-rose-500') : 'border-slate-200'} rounded-lg px-4 py-2.5 text-[14px] text-[#0F172A] outline-none focus:border-[#25D366] transition-all placeholder:text-slate-300 shadow-sm`}
                        value={password}
                        onChange={e => setPassword(e.target.value.replace(/\s/g, ''))}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {password.length > 0 && (
                            isPasswordValid ? <CheckCircle2 size={16} className="text-[#25D366]" /> : <XCircle size={16} className="text-rose-500" />
                        )}
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

            <AuthInputField 
                label="Confirm Password" 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                placeholder="••••••••"
                onChange={(val) => setConfirmPassword(val.replace(/\s/g, ''))} 
                isValid={confirmPassword.length > 0 ? isConfirmValid : null}
                error={confirmPassword.length > 0 && !isConfirmValid ? 'Passwords don\'t match' : ''}
            />

            <div className="flex items-start gap-3 pt-2">
                <input 
                    type="checkbox" 
                    id="agreed"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required 
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#25D366] focus:ring-[#25D366] accent-[#25D366] cursor-pointer" 
                />
                <label htmlFor="agreed" className="text-[12px] text-slate-500 leading-snug cursor-pointer">
                    I have read and agree to the <button type="button" onClick={() => setActivePolicy('TERMS')} className="text-[#25D366] font-bold hover:underline">Terms of Service</button> and <button type="button" onClick={() => setActivePolicy('PRIVACY')} className="text-[#25D366] font-bold hover:underline">Privacy Policy</button>.
                </label>
            </div>

            <div className="pt-2">
                <button 
                    disabled={loading || !isFormValid}
                    className="w-full bg-[#25D366] hover:bg-[#1eb956] text-white py-3 rounded-xl font-bold text-[14px] shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Creating account...' : 'Create account'}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </div>
        </form>
    );
};
