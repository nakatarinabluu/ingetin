import React from 'react';
import { Camera, ShieldCheck } from 'lucide-react';
import { Profile } from '@ingetin/types';

interface ProfileHeaderProps {
  profile: Profile | null;
}

/**
 * 🟢 REFINED PROFILE HEADER — CLEAN STYLE
 * Simple background, fixed avatar positioning, and clear identity display.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'User Profile';
  
  return (
    <div className="relative w-full">
      {/* 01. CLEAN BACKGROUND */}
      <div className="h-32 w-full bg-wa-bg border-b border-wa-border" />
      
      {/* 02. AVATAR & IDENTITY CLUSTER */}
      <div className="relative -mt-12 px-8 flex items-end gap-6 pb-2">
        <div className="p-1 bg-white rounded-2xl shadow-md border border-wa-border group/avatar relative shrink-0">
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-wa-bg relative cursor-pointer shadow-inner">
                <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}&backgroundColor=F1F5F9`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white gap-1.5">
                    <Camera size={18} strokeWidth={2.5} />
                    <span className="text-[11px] font-semibold">Ganti</span>
                </div>
            </div>
            
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-wa-green rounded-full border-4 border-white flex items-center justify-center shadow-md text-white">
                <ShieldCheck size={14} strokeWidth={2.5} />
            </div>
        </div>

        {/* Identity Text */}
        <div className="mb-4">
            <h2 className="text-xl font-bold text-wa-dark tracking-tight leading-none mb-1">
                {fullName}
            </h2>
            <p className="text-sm font-medium text-wa-green">
                @{profile?.username || 'user'}
            </p>
        </div>
      </div>
    </div>
  );
};
