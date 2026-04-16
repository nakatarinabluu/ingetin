import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Settings, Search } from 'lucide-react';
import { BRAND_COPY } from '../../constants/copy';

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE MOBILE HEADER
 * Concept: Fast, Functional, and Branded.
 */
export const MobileHeader = () => {
  return (
    <header className="md:hidden flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100 sticky top-0 z-[50]">
      <Link to="/dashboard" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white">
          <MessageCircle size={18} fill="white" />
        </div>
        <span className="font-bold text-[20px] tracking-tight text-[#111b21]">
          {BRAND_COPY.name}
        </span>
      </Link>
      
      <div className="flex items-center gap-4">
        <Link to="/settings" className="text-[#54656f] hover:text-[#00a884] transition-colors p-1">
          <Settings size={22} strokeWidth={2.5} />
        </Link>
      </div>
    </header>
  );
};
