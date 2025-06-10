import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@futureverse/auth-react';

export const FuturePassAuth = () => {
  const navigate = useNavigate();
  const { signIn, isLoading, error, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
      if (isAuthenticated) {
        navigate('/app');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <motion.button
        onClick={handleLogin}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full px-6 py-3 text-lg font-medium rounded-xl 
          bg-gradient-to-r from-[#BD00FF] to-[#4D4DFF] text-white
          flex items-center justify-center gap-3 transition-all duration-200
          ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(189,0,255,0.3)]'}`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16V12M12 8H12.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Connect with FuturePass</span>
          </>
        )}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm text-center"
        >
          {error.message || 'Authentication failed'}
        </motion.div>
      )}

      <p className="text-sm text-gray-400 text-center">
        Securely connect using your FuturePass wallet
      </p>
    </div>
  );
}; 