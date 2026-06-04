import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, MessageCircle } from 'lucide-react';
import { COMMON_COPY } from '@/shared/config/copy';
import { motion } from 'framer-motion';

/**
 * NotFound — WhatsApp Official Style 404
 */
export default function NotFound() {
    useEffect(() => {
        document.title = `404 - Halaman Tidak Ditemukan — Ingetin`;
    }, []);

    return (
        <div className="min-h-screen bg-wa-bg flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">

                {/* Icon */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-center"
                >
                    <div className="w-20 h-20 bg-white rounded-3xl border border-wa-border shadow-wa flex items-center justify-center">
                        <MessageCircle size={36} className="text-wa-green" strokeWidth={1.5} />
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                >
                    <div className="text-7xl font-bold text-wa-border select-none leading-none">
                        404
                    </div>
                    <h1 className="text-2xl font-bold text-wa-dark">
                        {COMMON_COPY.error_404.title}
                    </h1>
                    <p className="text-wa-icon leading-relaxed max-w-xs mx-auto text-sm">
                        {COMMON_COPY.error_404.desc}
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="flex flex-col sm:flex-row justify-center gap-3"
                >
                    <Link
                        to="/"
                        className="h-11 px-6 bg-wa-green text-white text-sm font-semibold rounded-xl hover:bg-wa-green-dark transition-colors inline-flex items-center justify-center gap-2"
                    >
                        <Home size={16} strokeWidth={2} />
                        {COMMON_COPY.error_404.button}
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="h-11 px-6 bg-white text-wa-icon text-sm font-medium rounded-xl border border-wa-border hover:bg-wa-bg transition-colors inline-flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={16} strokeWidth={2} />
                        {COMMON_COPY.error_404.back_btn}
                    </button>
                </motion.div>

                <p className="text-xs text-wa-muted">
                    {COMMON_COPY.error_404.footnote}
                </p>
            </div>
        </div>
    );
}
