import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LogOut, MessageCircle } from 'lucide-react';
import { cn } from '../../utils/tw.utils';
import { MenuItem } from './NavigationData';
import { BRAND_COPY } from '../../constants/copy';

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
    <aside className="hidden md:flex flex-col w-[240px] bg-[#f0f2f5] border-r border-[#e9edef] h-full shrink-0 text-left">

      {/* Header */}
      <div
        className="h-[60px] flex items-center px-5 bg-white border-b border-[#e9edef] cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00a884] flex items-center justify-center">
            <MessageCircle size={17} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-bold text-[16px] text-[#111b21] tracking-tight">
            {BRAND_COPY.name}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: linkActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-150 group",
                (isActive || linkActive)
                  ? "bg-white text-[#00a884] shadow-wa"
                  : "text-[#54656f] hover:bg-white/70 hover:text-[#111b21]"
              )}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  "transition-colors shrink-0",
                  isActive ? "text-[#00a884]" : "text-[#54656f] group-hover:text-[#111b21]"
                )}
              />
              <span className={cn(
                "text-[14px] tracking-tight transition-colors",
                isActive ? "font-semibold text-[#111b21]" : "font-medium"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00a884]" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-[#e9edef]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#54656f] hover:bg-white/70 hover:text-red-500 transition-all duration-150 text-left group"
        >
          <LogOut size={19} strokeWidth={2} className="group-hover:text-red-500 transition-colors shrink-0" />
          <span className="text-[14px] font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
};
