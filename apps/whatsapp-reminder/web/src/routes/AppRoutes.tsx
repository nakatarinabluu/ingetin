import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { GlobalErrorFallback } from '../components/ui/GlobalErrorFallback';
import { PublicLayout } from '../layouts/PublicLayout';
import MainAppLayout from '../layouts/MainAppLayout';
import PageTransition from '../components/ui/PageTransition';

// --- Lazy Loaded Pages ---
const Home = lazy(() => import('../pages/public/Home'));
const Login = lazy(() => import('../pages/public/Login'));
const Register = lazy(() => import('../pages/public/Register'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));
const Terms = lazy(() => import('../pages/public/Terms'));
const Privacy = lazy(() => import('../pages/public/Privacy'));
const Help = lazy(() => import('../pages/public/Help'));
const Features = lazy(() => import('../pages/public/Features'));
const Activate = lazy(() => import('../pages/public/Activate'));
const ResetPassword = lazy(() => import('../pages/public/ResetPassword'));
const NotFound = lazy(() => import('../pages/public/NotFound'));

const UserProfile = lazy(() => import('../pages/user/UserProfile'));
const UserOverview = lazy(() => import('../pages/user/UserOverview'));
const UserReminders = lazy(() => import('../pages/user/UserReminders'));
const UserFinances = lazy(() => import('../pages/user/UserFinances'));

// Admin Pages
const AdminMonitor = lazy(() => import('../pages/admin/AdminMonitor'));
const AdminLicenseManager = lazy(() => import('../pages/admin/AdminLicenseManager'));
const AdminUserManager = lazy(() => import('../pages/admin/AdminUserManager'));
const AdminChatHub = lazy(() => import('../pages/admin/AdminChatHub'));

/**
 * 🚀 THE MODERN PRO LOADING FALLBACK - v9.0
 * Clinical, Precise, and Reassuring.
 */
const LoadingFallback = () => (
  <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[200]">
    <div className="space-y-8 flex flex-col items-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-sm">i</div>
        <span className="text-3xl font-bold text-foreground tracking-tighter leading-none">Ingetin.</span>
      </div>
      
      <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden relative border border-border/50">
        <motion.div 
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-accent w-1/3 rounded-full"
        />
      </div>
      
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Menghubungkan ke layanan...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  
  const isAdmin = session.role?.toUpperCase() === 'ADMIN';
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!isAdmin && !session.isActivated && location.pathname !== '/activate') return <Navigate to="/activate" replace />;
  
  return <Outlet />;
};

export const AppRoutes = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleAuthRequired = () => {
      logout(); 
      navigate('/login', { replace: true, state: { reason: 'session_expired' } });
    };
    window.addEventListener('auth-required', handleAuthRequired);
    return () => window.removeEventListener('auth-required', handleAuthRequired);
  }, [logout, navigate]);

  return (
    <ErrorBoundary 
      FallbackComponent={GlobalErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div className="min-h-screen bg-background selection:bg-accent/10 selection:text-accent">
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location} key={location.pathname}>
            
            {/* --- PUBLIC ROUTES --- */}
            <Route element={<PublicLayout><Outlet /></PublicLayout>}>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/help" element={<Help />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/activate" element={<Activate />} />

            {/* --- PRIVATE APP ROUTES --- */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainAppLayout><Outlet /></MainAppLayout>}>
                <Route path="/dashboard" element={<PageTransition><UserOverview /></PageTransition>} />
                <Route path="/reminders" element={<PageTransition><UserReminders /></PageTransition>} />
                <Route path="/finances" element={<PageTransition><UserFinances /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><UserProfile /></PageTransition>} />
                
                {/* 🛡️ ADMIN ROUTES - Strictly Protected */}
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route path="/admin-dashboard" element={<PageTransition><AdminMonitor /></PageTransition>} />
                  <Route path="/admin-chat" element={<PageTransition><AdminChatHub /></PageTransition>} />
                  <Route path="/admin-license" element={<PageTransition><AdminLicenseManager /></PageTransition>} />
                  <Route path="/admin-users" element={<PageTransition><AdminUserManager /></PageTransition>} />
                  <Route path="/admin-profile" element={<PageTransition><UserProfile /></PageTransition>} />
                </Route>
              </Route>
            </Route>

            <Route path="/settings" element={<Navigate to="/profile" replace />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};
