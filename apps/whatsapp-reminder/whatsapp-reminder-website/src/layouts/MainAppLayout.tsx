import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Zap,
  Ticket,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MainAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  sidebarContent?: React.ReactNode;
  listTitle?: string;
  listSubtitle?: string;
  headerAvatarSeed?: string;
  onBack?: () => void;
}

const MainAppLayout: React.FC<MainAppLayoutProps> = ({ 
    children, 
    title, 
    subtitle, 
    sidebarContent, 
    listTitle, 
    listSubtitle,
    headerAvatarSeed,
    onBack
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = user?.role?.toUpperCase() === 'ADMIN' ? [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin-dashboard' },
    { icon: MessageSquare, label: 'Activity Feed', path: '/admin-chat' },
    { icon: Users, label: 'Manage Users', path: '/admin-user' },
    { icon: Ticket, label: 'License Manager', path: '/admin-license' },
    { icon: User, label: 'Admin Profile', path: '/admin-profile' },
  ] : [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bell, label: 'Reminders', path: '/reminders' },
    { icon: User, label: 'Profile Settings', path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="h-screen w-screen bg-[#F0F2F5] flex flex-col md:flex-row overflow-hidden font-sans text-[#111B21]">
      
      {/* --- SIDE RAIL --- */}
      <aside className="fixed bottom-0 w-full h-[60px] bg-[#F0F2F5] border-t border-[#D1D7DB] flex md:relative md:w-[60px] md:h-full md:bg-[#F0F2F5] md:flex-col md:border-t-0 md:border-r items-center py-0 md:py-4 z-50">
        <div className="flex flex-row md:flex-col items-center justify-around md:justify-start w-full gap-0 md:gap-4 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) => `
                w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all
                ${isActive ? 'bg-slate-100 md:bg-[#D1D7DB] text-[#00A884]' : 'text-[#54656F] hover:bg-slate-50 md:hover:bg-[#D1D7DB]'}
              `}
            >
              <item.icon size={20} fill={location.pathname.startsWith(item.path) ? "currentColor" : "none"} />
            </NavLink>
          ))}
          
          {/* Mobile Logout Button */}
          <button 
            onClick={handleLogout}
            title="Logout"
            className="w-12 h-12 flex md:hidden items-center justify-center text-[#54656F] hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        {/* Desktop Logout Button */}
        <div className="hidden md:flex flex-col gap-4 mt-auto items-center">
          <button 
            onClick={handleLogout}
            title="Logout"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656F] hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* --- List Pane (Middle) --- */}
      {sidebarContent && (
        <section className={`
          w-full md:w-[350px] lg:w-[400px] bg-white border-r border-[#D1D7DB] flex flex-col flex-shrink-0 h-full md:h-auto
          ${location.pathname.includes('admin-chat') && title ? 'hidden md:flex' : 'flex-1 md:flex-none md:flex'}
        `}>
          <header className="h-[60px] bg-[#F0F2F5] px-4 flex items-center gap-3 border-b border-[#D1D7DB] flex-shrink-0">
             <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D1D7DB] flex-shrink-0 bg-white shadow-sm">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(user?.username || 'ingetin').toLowerCase()}`} alt="Admin Avatar" crossOrigin="anonymous" />
             </div>
             <div className="min-w-0">
                <h2 className="text-[13px] md:text-sm font-bold text-[#111B21] truncate">{listTitle || title || "Ingetin"}</h2>
                <p className="text-[10px] md:text-[11px] text-[#667781] truncate">{listSubtitle || "Registry"}</p>
             </div>
          </header>

          <div className="flex-1 flex flex-col min-h-0 pb-[60px] md:pb-0">
             {sidebarContent}
          </div>
        </section>
      )}

      {/* --- Content Stage (Right) --- */}
      <main className={`
        flex-1 flex flex-col bg-[#F0F2F5] relative overflow-hidden h-full
        ${sidebarContent && location.pathname.includes('admin-chat') && !title ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="absolute inset-0 wa-chat-pattern pointer-events-none opacity-[0.04]" />
        
        {title && (
            <header className="h-[60px] bg-[#F0F2F5] px-4 flex items-center justify-between border-b border-[#D1D7DB] relative z-10 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="md:hidden p-1 -ml-2 text-[#00A884] active:scale-90 transition-all"
                        >
                            <ChevronLeft size={24} strokeWidth={3} />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D1D7DB] flex-shrink-0 bg-white shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(headerAvatarSeed || user?.username || 'ingetin').toLowerCase()}`} alt="Header Avatar" crossOrigin="anonymous" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[13px] md:text-sm font-bold text-[#111B21] truncate">{title}</h3>
                        <p className="text-[10px] md:text-[11px] text-[#667781] truncate">{subtitle || "online"}</p>
                    </div>
                </div>
            </header>
        )}

        <div id="main-scroll-container" className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-[60px] md:pb-0">
            {children}
        </div>
      </main>
    </div>
  );
};

export default MainAppLayout;
