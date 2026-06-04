import { BRAND_COPY } from '@/shared/config/copy';

/**
 * Footer — WhatsApp Official Style
 * Clinical, minimal, legal-focused.
 */
export const Footer = () => {
  return (
    <footer className="w-full py-8 border-t border-wa-border bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-wa-dark">{BRAND_COPY.name}</span>
            <span className="text-[10px] text-wa-muted">© 2026 Ingetin Corp. All rights reserved.</span>
        </div>
        
        <div className="flex items-center gap-6">
            <FooterLink label="Ketentuan" href="/terms" />
            <FooterLink label="Privasi" href="/privacy" />
            <FooterLink label="Bantuan" href="/help" />
        </div>
      </div>
    </footer>
  );
};

function FooterLink({ label, href }: { label: string; href: string }) {
    return (
        <a 
            href={href}
            className="text-[10px] font-bold text-wa-icon hover:text-wa-dark transition-colors uppercase tracking-widest"
        >
            {label}
        </a>
    );
}
