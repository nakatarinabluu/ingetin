import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { BRAND_COPY, FOOTER_COPY, COMMON_COPY } from '../../constants/copy';

/**
 * Footer — WhatsApp Official Style
 * Clean, light, professional. Consistent with WhatsApp.com.
 */
export const Footer = () => {
    const productLinks = [
        { label: 'Fitur Utama', path: '/features' },
        { label: 'Pusat Bantuan', path: '/help' },
        { label: 'Dashboard', path: '/dashboard' },
    ];

    const legalLinks = [
        { label: 'Kebijakan Privasi', path: '/privacy' },
        { label: 'Syarat & Ketentuan', path: '/terms' },
    ];

    return (
        <footer className="bg-[#f0f2f5] border-t border-[#e9edef] text-left">
            {/* Main footer content */}
            <div className="wa-container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-4">
                        <Link to="/" className="inline-flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-[#00a884] flex items-center justify-center shadow-sm">
                                <MessageCircle size={18} className="text-white" strokeWidth={2} />
                            </div>
                            <span className="font-bold text-[17px] text-[#111b21]">
                                {BRAND_COPY.name}
                            </span>
                        </Link>
                        <p className="text-sm text-[#54656f] leading-relaxed max-w-xs">
                            {BRAND_COPY.tagline}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
                            <span className="text-xs text-[#54656f] font-medium">{COMMON_COPY.operational} — Semua sistem berjalan normal</span>
                        </div>
                    </div>

                    {/* Produk */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-[#111b21] uppercase tracking-wider">
                            {FOOTER_COPY.sections.solutions}
                        </h4>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-[#54656f] hover:text-[#00a884] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-[#111b21] uppercase tracking-wider">
                            {FOOTER_COPY.sections.policies}
                        </h4>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-[#54656f] hover:text-[#00a884] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#e9edef]">
                <div className="wa-container h-12 flex items-center justify-between">
                    <p className="text-xs text-[#54656f]">
                        © 2026 {BRAND_COPY.name}. Seluruh hak cipta dilindungi.
                    </p>
                    <p className="text-xs text-[#54656f] hidden sm:block">
                        Dibuat dengan ❤ di Jakarta
                    </p>
                </div>
            </div>
        </footer>
    );
};
