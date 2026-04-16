import React from 'react';
import { Camera, Shield, ShieldCheck } from 'lucide-react';
import { Session } from '../../../context/AuthContext';
import { cn } from '../../../utils/tw.utils';
import { Typography } from '../../ui/Typography';

interface ProfileHeaderProps {
  session: Session | null;
}

/**
 * 🚀 THE MODERN PRO PROFILE HEADER - v9.0
 * Authority Banner & Identity Anchor.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ session }) => {
  return (
    <div className="bg-zinc-950 h-40 w-full relative overflow-hidden rounded-[2rem] border border-border shadow-subtle group">
      {/* 01. AUTHORITY GRADIENT BLEND */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-zinc-900 to-accent/5 opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      
      {/* 02. SESSION TAG */}
      <div className="absolute top-6 right-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
          <Shield size={10} className="text-accent" />
          <Typography variant="small" className="text-white font-bold uppercase tracking-widest text-[9px]">
            Sesi Terverifikasi: {session?.id?.slice(0, 8) || 'PRO-9.0'}
          </Typography>
        </div>
      </div>
      
      {/* 03. IDENTITY ANCHOR (AVATAR) */}
      <div className="absolute -bottom-10 left-10 p-1.5 bg-white rounded-[2rem] shadow-elevated border border-border/50 transition-transform duration-500 hover:-translate-y-1">
        <div className="w-28 h-28 rounded-[1.5rem] overflow-hidden bg-secondary group/avatar relative cursor-pointer border shadow-inner">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.username || 'user'}&backgroundColor=F1F5F9`} 
            alt="Avatar" 
            className="w-full h-full object-cover transition-all duration-700 group-hover/avatar:scale-110 group-hover/avatar:rotate-2"
          />
          <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white gap-2">
            <Camera size={20} strokeWidth={2.5} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Update</span>
          </div>
        </div>
        
        {/* Status indicator on avatar */}
        <div className="absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full border border-border flex items-center justify-center shadow-sm">
            <ShieldCheck size={14} className="text-accent" />
        </div>
      </div>

      {/* 04. DECORATIVE ACCENT */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/40 opacity-50" />
    </div>
  );
};
