import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle } from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';
import { MenuItem } from '@/shared/config/navigation';
import { BRAND_COPY } from '@/shared/config/copy';

interface SidebarProps {
  menuItems: MenuItem[];
  currentPath: string;
  onLogout: () => void;
}

/**
 * Sidebar — WhatsApp Web Official Style
 * #f0f2f5 background, clean icon + label navigation.
 */
export const Sidebar: React.FC<SidebarProps> = ({ menuItems, currentPath, onLogout }) => {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-[240px] bg-wa-bg border-r border-wa-border h-full shrink-0 text-left">

      {/* Header */}
      <div
        className="h-[60px] flex items-center px-5 bg-white border-b border-wa-border cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-wa-green flex items-center justify-center">
            <MessageCircle size={17} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-bold text-[16px] text-wa-dark tracking-tight">
            {BRAND_COPY.name}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.path === '/dashboard' 
            ? currentPath === '/dashboard' 
            : currentPath.startsWith(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: linkActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-150 group",
                (isActive || linkActive)
                  ? "bg-white text-wa-green shadow-wa"
                  : "text-wa-icon hover:bg-white/70 hover:text-wa-dark"
              )}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  "transition-colors shrink-0",
                  isActive ? "text-wa-green" : "text-wa-icon group-hover:text-wa-dark"
                )}
              />
              <span className={cn(
                "text-[14px] tracking-tight transition-colors",
                isActive ? "font-semibold text-wa-dark" : "font-medium"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-wa-green" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-wa-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-wa-icon hover:bg-white/70 hover:text-red-500 transition-all duration-150 text-left group"
        >
          <LogOut size={19} strokeWidth={2} className="group-hover:text-red-500 transition-colors shrink-0" />
          <span className="text-[14px] font-medium">Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
};
