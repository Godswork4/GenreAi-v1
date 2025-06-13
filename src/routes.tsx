import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/authStore';
import MainLayout from './components/Layout/MainLayout';
import { Landing } from './pages/Landing';
import { AuthCallback } from './pages/AuthCallback';
import Swap from './pages/Swap';
import Portfolio from './pages/Portfolio';
import Staking from './pages/Staking';
import Trading from './pages/Trade';
import Profile from './pages/Profile';
import { useDemoStore } from './store/demoStore';

// Protected route component that redirects to home if not authenticated
const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  const { isDemoMode } = useDemoStore();

  if (!isAuthenticated && !isDemoMode) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected app routes */}
      <Route path="/app" element={<ProtectedRoute element={<MainLayout />} />}>
        <Route index element={<Portfolio />} />
        <Route path="swap" element={<Swap />} />
        <Route path="staking" element={<Staking />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="trading" element={<Trading />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 