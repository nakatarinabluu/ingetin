import React from 'react';
import { ShieldAlert, Home, RefreshCw, Terminal, MessageCircle } from 'lucide-react';
import { BRAND_COPY } from '@/shared/config/copy';
import { motion } from 'framer-motion';
import type { FallbackProps } from 'react-error-boundary';

/**
 * GlobalErrorFallback — WhatsApp Official Style
 */
export const GlobalErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white rounded-2xl border border-wa-border shadow-wa-md p-8 text-center space-y-7"
      >

        {/* Brand icon */}
        <div className="flex flex-col items-center gap-3 pb-6 border-b border-wa-border">
          <div className="w-14 h-14 bg-wa-green/10 rounded-2xl flex items-center justify-center">
            <MessageCircle size={28} className="text-wa-green" strokeWidth={1.5} />
          </div>
          <span className="text-base font-bold text-wa-dark">{BRAND_COPY.name}</span>
        </div>

        {/* Error info */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600">
            <ShieldAlert size={14} strokeWidth={2} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Terjadi Kesalahan</span>
          </div>
          <h1 className="text-2xl font-bold text-wa-dark leading-snug">
            Sistem mengalami<br />
            <span className="text-wa-green">interupsi sejenak.</span>
          </h1>
          <p className="text-sm text-wa-icon leading-relaxed max-w-xs mx-auto">
            Asisten tidak dapat merespons saat ini. Jangan khawatir, data Anda tetap aman.
          </p>
        </div>

        {/* Error log */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-wa-muted">
            <Terminal size={13} strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Laporan Kesalahan</span>
          </div>
          <div className="p-4 bg-wa-bg border border-wa-border rounded-xl">
            <code className="text-[11px] font-mono text-wa-icon leading-relaxed break-all">
              {error instanceof Error ? error.message : 'Unknown System Exception'}
            </code>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 h-11 bg-wa-green hover:bg-wa-green-dark text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} strokeWidth={2.5} />
            Muat Ulang
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 h-11 bg-white hover:bg-wa-bg border border-wa-border text-wa-icon text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Home size={15} strokeWidth={2} />
            Kembali ke Beranda
          </button>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-wa-muted pt-2 border-t border-wa-border">
          Pemulihan otomatis aktif · v{BRAND_COPY.version}
        </p>
      </motion.div>
    </div>
  );
};
