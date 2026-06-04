import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { useProfile } from '@/entities/user/model/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { GlobalErrorFallback } from '@/shared/ui/GlobalErrorFallback';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import MainAppLayout from '@/app/layouts/MainAppLayout';
import PageTransition from '@/shared/ui/PageTransition';

// --- Lazy Loaded Pages ---
const Home = lazy(() => import('@/pages/public/Home'));
const Login = lazy(() => import('@/pages/public/Login'));
const Register = lazy(() => import('@/pages/public/Register'));
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'));
const Terms = lazy(() => import('@/pages/public/Terms'));
const Privacy = lazy(() => import('@/pages/public/Privacy'));
const Help = lazy(() => import('@/pages/public/Help'));
const Features = lazy(() => import('@/pages/public/Features'));
const Activate = lazy(() => import('@/pages/public/Activate'));
const ResetPassword = lazy(() => import('@/pages/public/ResetPassword'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));

const UserProfile = lazy(() => import('@/pages/user/UserProfile'));
const UserOverview = lazy(() => import('@/pages/user/UserOverview'));
const UserReminders = lazy(() => import('@/pages/user/UserReminders'));
const UserFinances = lazy(() => import('@/pages/user/UserFinances'));
const UserHistory = lazy(() => import('@/pages/user/UserHistory'));

// Admin Pages
const AdminMonitor = lazy(() => import('@/pages/admin/AdminMonitor'));
const AdminLicenseManager = lazy(() => import('@/pages/admin/AdminLicenseManager'));
const AdminUserManager = lazy(() => import('@/pages/admin/AdminUserManager'));
const AdminUserAudit = lazy(() => import('@/pages/admin/AdminUserAudit'));
const AdminChatHub = lazy(() => import('@/pages/admin/chat-hub'));

/**
 * LoadingFallback — WhatsApp Official Style
 * Ditampilkan saat lazy-load chunk sedang diunduh.
 */
const LoadingFallback = () => (
  <div className="fixed inset-0 bg-wa-bg flex flex-col items-center justify-center z-[200] gap-6">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 bg-wa-green rounded-xl flex items-center justify-center">
        <span className="text-white font-black text-lg leading-none">i</span>
      </div>
      <span className="text-2xl font-bold text-wa-dark tracking-tight">Ingetin</span>
    </div>

    <div className="w-40 h-1 bg-wa-border rounded-full overflow-hidden">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        className="w-1/2 h-full bg-wa-green rounded-full"
      />
    </div>

    <span className="text-[11px] font-semibold text-wa-muted tracking-widest uppercase animate-pulse">
      Menghubungkan ke layanan...
    </span>
  </div>
);

const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { session, loading: authLoading, logout } = useAuth();
  const location = useLocation();

  // 1. Check Session First (Client-Side)
  if (authLoading) return <LoadingFallback />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;

  // 2. Then Load Profile (Server-Side)
  const { data: profile, isLoading: profileLoading, isError } = useProfile();

  if (profileLoading) return <LoadingFallback />;

  // Fix [L-06]: was returning LoadingFallback forever on API error
  if (isError) {
    logout();
    return <Navigate to="/login" replace state={{ reason: 'session_error' }} />;
  }

  if (!profile) return <LoadingFallback />;

  // High-Security Check: Use profile from server (React Query) as Source of Truth
  const isAdmin = profile.role === 'ADMIN';
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!isAdmin && !profile.isActivated && location.pathname !== '/activate') return <Navigate to="/activate" replace />;

  return <Outlet />;
};

const DashboardDispatcher = () => {
  const { data: profile, isLoading } = useProfile();
  
  if (isLoading) return <LoadingFallback />;
  const isAdmin = profile?.role === 'ADMIN';
  
  return isAdmin ? <AdminMonitor /> : <UserOverview />;
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
      <div className="min-h-screen bg-wa-bg selection:bg-wa-green/10 selection:text-wa-green">
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location}>
            
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
                {/* Smart Dashboard Dispatcher */}
                <Route path="/dashboard" element={<PageTransition><DashboardDispatcher /></PageTransition>} />
                
                <Route path="/reminders" element={<PageTransition><UserReminders /></PageTransition>} />
                <Route path="/finances" element={<PageTransition><UserFinances /></PageTransition>} />
                <Route path="/history" element={<PageTransition><UserHistory /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><UserProfile /></PageTransition>} />
                
                {/* Admin Routes - Strictly Protected */}
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route path="/admin-dashboard" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/admin-chat" element={<PageTransition><AdminChatHub /></PageTransition>} />
                  <Route path="/admin-license" element={<PageTransition><AdminLicenseManager /></PageTransition>} />
                  <Route path="/admin-users" element={<PageTransition><AdminUserManager /></PageTransition>} />
                  <Route path="/admin-user/:username/audit" element={<PageTransition><AdminUserAudit /></PageTransition>} />
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
