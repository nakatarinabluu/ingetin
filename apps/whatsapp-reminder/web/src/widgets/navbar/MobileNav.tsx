import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, MessageCircle, Wallet, User as UserIcon } from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';
import { MenuItem } from '@/shared/config/navigation';

interface MobileNavProps {
  menuItems: MenuItem[];
  currentPath: string;
}

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE MOBILE NAVIGATION - CENTRALLY MANAGED
 */
export const MobileNav: React.FC<MobileNavProps> = ({ menuItems, currentPath }) => {
  const navigate = useNavigate();
  
  // Fungsi Icon tetap menggunakan mapping karena MenuItem membawa LucideIcon object
  const getIcon = (_label: string, path: string) => {
      if (path === '/dashboard') return LayoutGrid;
      if (path === '/reminders') return MessageCircle;
      if (path === '/finances') return Wallet;
      if (path === '/profile') return UserIcon;
      return LayoutGrid;
  };

  const displayItems = menuItems.slice(0, 4);
  const leftMenus = displayItems.slice(0, 2);
  const rightMenus = displayItems.slice(2, 4);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-[68px] px-1 flex items-center justify-between z-50 pb-safe shadow-[0_-1px:10px_rgba(0,0,0,0.01)]">
      
      <div className="flex flex-[2.5] justify-evenly items-center h-full">
        {leftMenus.map((item) => (
          <MenuLink key={item.path} item={item} currentPath={currentPath} icon={getIcon(item.label, item.path)} />
        ))}
      </div>

      {/* CENTER ACTION */}
      <div className="flex-[1] flex justify-center relative -top-4">
        <button 
          onClick={() => navigate('/reminders?action=new')}
          className="w-13 h-13 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-wa active:scale-90 transition-all border-[3px] border-white"
        >
          <Plus size={26} strokeWidth={4} />
        </button>
      </div>

      <div className="flex flex-[2.5] justify-evenly items-center h-full">
        {rightMenus.map((item) => (
          <MenuLink key={item.path} item={item} currentPath={currentPath} icon={getIcon(item.label, item.path)} />
        ))}
      </div>

    </nav>
  );
};

function MenuLink({ item, currentPath, icon: Icon }: { item: MenuItem, currentPath: string, icon: React.ElementType }) {
  const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
  
  return (
    <NavLink
      to={item.path}
      className={({ isActive: linkActive }) => cn(
        "flex flex-col items-center justify-center gap-0.5 transition-all duration-300 min-w-[50px]",
        (isActive || linkActive) ? "text-[#00a884]" : "text-[#54656f]"
      )}
    >
      <div className="relative flex items-center justify-center h-6">
          <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className={cn(
        "text-[9px] font-bold tracking-tighter text-center whitespace-nowrap uppercase transition-colors duration-300",
        isActive ? "text-[#00a884]" : "text-[#54656f]/50"
      )}>
        {item.label}
      </span>
    </NavLink>
  );
}
