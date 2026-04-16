import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { MobileHeader } from '../components/layout/MobileHeader';
import { AdminIndicator } from '../components/layout/AdminIndicator';
import { USER_MENU_ITEMS, ADMIN_MENU_ITEMS } from '../components/layout/NavigationData';

interface MainAppLayoutProps {
  children?: React.ReactNode;
}

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE APP LAYOUT
 * Concept: Clinical, Minimal, Stable.
 */
const MainAppLayout: React.FC<MainAppLayoutProps> = ({ children }) => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = session?.role?.toUpperCase() === 'ADMIN';
  const menuItems = isAdmin ? ADMIN_MENU_ITEMS : USER_MENU_ITEMS;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const currentPath = location.pathname;

  return (
    <div className="h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden text-left relative selection:bg-[#25D366]/10 selection:text-[#00a884]">
      
      {/* DESKTOP SIDEBAR */}
      <Sidebar 
        menuItems={menuItems} 
        currentPath={currentPath} 
        onLogout={handleLogout} 
      />

      {/* MOBILE NAVIGATION */}
      <MobileNav 
        menuItems={menuItems} 
        currentPath={currentPath} 
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative text-left bg-white">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Global Dashboard Background Texture */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />

        <div className="flex-1 overflow-y-auto custom-scrollbar md:p-10 px-4 py-6 text-left relative z-10">
          <div className="max-w-[1440px] mx-auto w-full min-h-full flex flex-col text-left px-2 md:px-6">
            {children || <Outlet />}
            {/* SPACING FOOTNOTE */}
            <div className="h-28 w-full shrink-0 md:hidden" />
          </div>
        </div>

        {/* Admin Indicator */}
        <AdminIndicator isAdmin={isAdmin} />
      </main>
    </div>
  );
};

export default MainAppLayout;
