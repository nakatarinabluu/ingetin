import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/layout/ScrollToTop';
import { Toaster } from './components/ui/Toaster';
import { TooltipProvider } from './components/ui/Tooltip';
import { AppRoutes } from './routes/AppRoutes';

/**
 * Root Application Entry Point (v7.2 Rebirth)
 * Providers for Auth, Theme, Toasts, and Tooltips.
 */
export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ingetin-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <ScrollToTop />
            <AppRoutes />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
