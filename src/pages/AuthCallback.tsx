import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@futureverse/auth-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/app');
    } else if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-white mb-2">Authenticating...</h2>
        <p className="text-gray-400">Please wait while we complete your sign-in</p>
      </div>
    </div>
  );
}; 