import React, { useMemo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollToTop from './components/atoms/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import MainAppLayout from './layouts/MainAppLayout';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Activate = lazy(() => import('./pages/Activate'));
const AdminMonitor = lazy(() => import('./pages/admin/AdminMonitor'));
const AdminChatHub = lazy(() => import('./pages/admin/AdminChatHub'));
const AdminUserManager = lazy(() => import('./pages/admin/AdminUserManager'));
const AdminUserAudit = lazy(() => import('./pages/admin/AdminUserAudit'));
const AdminLicenseManager = lazy(() => import('./pages/admin/AdminLicenseManager'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const UserOverview = lazy(() => import('./pages/user/UserOverview'));
const UserReminders = lazy(() => import('./pages/user/UserReminders'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
    <div className="w-10 h-10 border-2 border-slate-100 border-t-[#25D366] rounded-full animate-spin"></div>
    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing...</div>
  </div>
);

// Unified Protected Route Wrapper
const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;

  const isAdmin = user.role?.toUpperCase() === 'ADMIN';

  // Admin access
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  // Activation Wall for standard users
  if (!isAdmin && !user.isActivated && location.pathname !== '/activate') {
    return <Navigate to="/activate" replace />;
  }

  return <Outlet />;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      
      {/* Activation */}
      <Route 
        path="/activate" 
        element={user && user.role !== 'ADMIN' && !user.isActivated ? <Activate /> : <Navigate to="/dashboard" replace />} 
      />

      {/* User Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={user?.role === 'ADMIN' ? <Navigate to="/admin-dashboard" replace /> : <UserOverview />} />
        <Route path="/reminders" element={<UserReminders />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin-dashboard" element={<AdminMonitor />} />
        <Route path="/admin-chat" element={<AdminChatHub />} />
        <Route path="/admin-user" element={<AdminUserManager />} />
        <Route path="/admin-user/:username/audit" element={<AdminUserAudit />} />
        <Route path="/admin-license" element={<AdminLicenseManager />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Router>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <AppRoutes />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
