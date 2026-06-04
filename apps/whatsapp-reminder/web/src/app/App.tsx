import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthContext';
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';

import ScrollToTop from '@/shared/ui/ScrollToTop';
import { Toaster } from '@/shared/ui/Toaster';
import { toast } from 'sonner';
import { TooltipProvider } from '@/shared/ui/Tooltip';
import { AppRoutes } from './routes/AppRoutes';

/**
 * Root Application Entry Point (v1.0 Official)
 * Providers for Auth, Theme, Toasts, and Tooltips.
 */
export default function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    // Apply theme class to body
    document.body.className = `theme-${theme}`;

    // Connection Resilience Listeners
    const handleOnline = () => toast.success("Koneksi Pulih", { description: "Anda kembali online." });
    const handleOffline = () => toast.error("Koneksi Terputus", { description: "Periksa sambungan internet Anda.", duration: Infinity });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [theme]);

  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </AuthProvider>
  );
}
