import React from 'react';
import { MessageCircle, Shield, Zap, CheckCircle } from 'lucide-react';
import { AUTH_COPY, BRAND_COPY } from '@/shared/config/copy';

interface AuthBrandingProps {
    activeTab: 'login' | 'register' | 'forgot-password' | 'recovery';
}

/**
 * AuthBranding — WhatsApp Official Style
 * Clean left panel for auth pages (desktop only).
 */
export const AuthBranding: React.FC<AuthBrandingProps> = ({ activeTab }) => {
    const getContent = () => {
        switch (activeTab) {
            case 'register': return AUTH_COPY.branding.register;
            case 'forgot-password': return AUTH_COPY.branding.recovery;
            default: return AUTH_COPY.branding.login;
        }
    };

    const content = getContent();

    return (
        <div className="h-full flex flex-col justify-between p-10 bg-wa-teal relative overflow-hidden">
            {/* Subtle doodle bg */}
            <div className="absolute inset-0 wa-doodle-light opacity-10 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />

            {/* Top — Brand */}
            <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-10">
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                        <MessageCircle size={20} className="text-white" strokeWidth={2} />
                    </div>
                    <span className="font-bold text-[17px] text-white tracking-tight">{BRAND_COPY.name}</span>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white leading-snug">
                        {content.title}
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                        {content.desc}
                    </p>
                </div>
            </div>

            {/* Middle — Feature list */}
            <div className="relative z-10 space-y-4 my-10">
                {[
                    { icon: Shield, label: AUTH_COPY.branding.feature_security },
                    { icon: Zap, label: AUTH_COPY.branding.feature_latency },
                    { icon: CheckCircle, label: 'Tanpa instalasi aplikasi' },
                ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                            <Icon size={16} className="text-white" strokeWidth={2} />
                        </div>
                        <span className="text-sm text-white/80 font-medium">{label}</span>
                    </div>
                ))}
            </div>

            {/* Bottom — Footer */}
            <div className="relative z-10">
                <p className="text-xs text-white/40 font-medium">
                    {AUTH_COPY.branding.footer}
                </p>
            </div>
        </div>
    );
};
