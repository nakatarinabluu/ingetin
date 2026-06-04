import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Menu, MessageCircle, LayoutDashboard, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import { cn } from '@/shared/lib/tw.utils';
import { BRAND_COPY, NAVBAR_COPY } from '@/shared/config/copy';

/**
 * Navbar — WhatsApp Official Style
 * Clean, white, professional. No gimmicks.
 */
export const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menu on route change
    useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

    const navLinks = [
        { label: NAVBAR_COPY.links.features, path: '/features' },
        { label: NAVBAR_COPY.links.help, path: '/help' },
    ];

    return (
        <>
            <nav
                className={cn(
                    "sticky top-0 left-0 w-full z-[100] bg-white transition-shadow duration-200",
                    isScrolled ? "shadow-[0_1px_0_#e9edef,0_2px_8px_rgba(17,27,33,0.05)]" : "border-b border-wa-border"
                )}
            >
                <div className="wa-container h-[60px] flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                        <div className="w-8 h-8 rounded-lg bg-wa-green flex items-center justify-center shadow-sm">
                            <MessageCircle size={18} className="text-white fill-white/20" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[17px] text-wa-dark tracking-tight">
                            {BRAND_COPY.name}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[14px] font-medium transition-colors",
                                    location.pathname === link.path
                                        ? "text-wa-green bg-wa-green/6"
                                        : "text-wa-icon hover:text-wa-dark hover:bg-wa-bg"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-[14px] font-medium text-wa-icon hover:text-wa-dark transition-colors"
                                >
                                    {NAVBAR_COPY.btn_login}
                                </Link>
                                <Link
                                    to="/register"
                                    className="h-9 px-5 bg-wa-green text-white text-[14px] font-semibold rounded-lg hover:bg-wa-green-dark transition-colors inline-flex items-center"
                                >
                                    {NAVBAR_COPY.btn_register}
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/dashboard"
                                className="h-9 px-5 bg-wa-green text-white text-[14px] font-semibold rounded-lg hover:bg-wa-green-dark transition-colors inline-flex items-center gap-2"
                            >
                                <LayoutDashboard size={16} />
                                {NAVBAR_COPY.btn_dashboard}
                            </Link>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center text-wa-icon hover:text-wa-dark hover:bg-wa-bg rounded-lg transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 z-[98] md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Slide-in panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-white z-[99] shadow-wa-lg md:hidden flex flex-col"
                        >
                            {/* Drawer Header */}
                            <div className="h-[60px] flex items-center justify-between px-5 border-b border-wa-border">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-md bg-wa-green flex items-center justify-center">
                                        <MessageCircle size={15} className="text-white" strokeWidth={2} />
                                    </div>
                                    <span className="font-bold text-[16px] text-wa-dark">{BRAND_COPY.name}</span>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center text-wa-icon hover:bg-wa-bg rounded-lg transition-colors"
                                >
                                    <X size={18} strokeWidth={2} />
                                </button>
                            </div>

                            {/* Nav Links */}
                            <nav className="flex-1 py-3 px-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3.5 rounded-xl mb-1 transition-colors text-[15px] font-medium",
                                            location.pathname === link.path
                                                ? "bg-wa-green/8 text-wa-green"
                                                : "text-wa-dark hover:bg-wa-bg"
                                        )}
                                    >
                                        {link.label}
                                        <ChevronRight size={16} className="text-wa-icon" strokeWidth={2} />
                                    </Link>
                                ))}
                            </nav>

                            {/* Auth Buttons */}
                            <div className="p-4 border-t border-wa-border space-y-2.5">
                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/register"
                                            className="block w-full h-11 bg-wa-green text-white text-[14px] font-semibold rounded-lg hover:bg-wa-green-dark transition-colors text-center leading-[44px]"
                                        >
                                            {NAVBAR_COPY.mobile.btn_register}
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="block w-full h-11 bg-wa-bg text-wa-dark text-[14px] font-medium rounded-lg hover:bg-wa-border transition-colors text-center leading-[44px]"
                                        >
                                            {NAVBAR_COPY.btn_login}
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center justify-center gap-2 w-full h-11 bg-wa-green text-white text-[14px] font-semibold rounded-lg hover:bg-wa-green-dark transition-colors"
                                    >
                                        <LayoutDashboard size={16} />
                                        {NAVBAR_COPY.mobile.btn_dashboard}
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
