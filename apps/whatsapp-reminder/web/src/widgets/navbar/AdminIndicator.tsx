import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * 🚀 THE MODERN PRO ADMIN INDICATOR - v9.0
 * Discrete authority badge.
 */
interface AdminIndicatorProps {
  isAdmin: boolean;
}

export const AdminIndicator: React.FC<AdminIndicatorProps> = ({ isAdmin }) => {
  if (!isAdmin) return null;

  return (
    <div className="hidden md:flex fixed bottom-10 right-10 items-center gap-3 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl shadow-elevated z-50 animate-in fade-in slide-in-from-right-10 duration-700 select-none border border-white/10">
      <ShieldCheck size={14} className="text-success" />
      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Authority Access</span>
    </div>
  );
};
