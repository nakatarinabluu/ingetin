import { useNavigate } from 'react-router-dom';
import { MessageCircle, Settings } from 'lucide-react';
import { BRAND_COPY } from '@/shared/config/copy';

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE MOBILE HEADER
 * Minimal, clinical, action-oriented.
 */
export const MobileHeader = () => {
    const navigate = useNavigate();

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-wa-border flex items-center justify-between px-5 z-[40]">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-wa-green flex items-center justify-center shadow-sm">
                    <MessageCircle size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-[16px] text-wa-dark tracking-tight">{BRAND_COPY.name}</span>
            </div>

            <div className="flex items-center gap-4 text-wa-icon">
                <button 
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 flex items-center justify-center hover:bg-wa-bg rounded-full transition-colors"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};
