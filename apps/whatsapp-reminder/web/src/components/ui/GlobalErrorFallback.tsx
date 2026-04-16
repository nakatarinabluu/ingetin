import React from 'react';
import { ShieldAlert, Home, RefreshCw, Terminal, MessageCircle } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { BRAND_COPY } from '../../constants/copy';

interface GlobalErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE ERROR FALLBACK
 */
export const GlobalErrorFallback: React.FC<GlobalErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* WHATSAPP GREEN STRIP */}
      <div className="wa-header-strip h-[200px]" />

      <div className="max-w-xl w-full bg-white shadow-wa rounded-sm p-8 md:p-12 relative z-10 text-center space-y-10">
        
        {/* BRANDING */}
        <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-8">
            <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-sm">
                <MessageCircle size={28} fill="white" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#111b21]">{BRAND_COPY.name}</h3>
        </div>

        {/* ERROR CONTENT */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">
                <ShieldAlert size={14} />
                <span className="font-bold tracking-widest text-[10px] uppercase">Terjadi Kesalahan</span>
            </div>
            <h1 className="text-3xl font-light text-[#41525d] leading-tight">
                Sistem Mengalami <br/>
                <span className="text-[#00a884] font-bold italic">Interupsi Sejenak.</span>
            </h1>
            <p className="max-w-md mx-auto text-gray-500 font-medium leading-relaxed">
                Asisten tidak dapat merespons permintaan saat ini. Jangan khawatir, data Anda tetap aman dan terlindungi.
            </p>
          </div>
        </div>

        {/* TECHNICAL LOG */}
        <div className="space-y-3 text-left">
            <div className="flex items-center gap-2 text-gray-400">
                <Terminal size={14} />
                <span className="font-bold uppercase tracking-widest text-[9px]">Laporan Masalah</span>
            </div>
            <div className="p-5 bg-[#f0f2f5] border border-gray-100 rounded-lg">
                <code className="text-[11px] font-mono text-gray-600 leading-relaxed break-all">
                    {error.message || "Unknown System Exception"}
                </code>
            </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={resetErrorBoundary}
            className="flex-1 h-14 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full font-bold shadow-sm"
          >
            Muat Ulang Layanan
          </Button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 h-14 bg-white hover:bg-gray-50 border border-gray-200 text-[#111b21] transition-all flex items-center justify-center gap-2 text-[14px] font-bold rounded-full"
          >
            <Home size={18} className="text-gray-400" />
            Dashboard Utama
          </button>
        </div>

        {/* FOOTER */}
        <div className="pt-8 border-t border-gray-100 opacity-40">
            <p className="tracking-widest font-bold text-[9px] text-gray-400 uppercase">
                Sistem Pemulihan Otomatis Aktif • v{BRAND_COPY.version}
            </p>
        </div>
      </div>
    </div>
  );
};
