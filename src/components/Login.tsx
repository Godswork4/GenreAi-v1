import React from 'react';
import { useAuth } from '../store/authStore';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { login, loginWithDemo, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome to Genre AI DeFi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Choose how you want to connect
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => login()}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Connect with FuturePass'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={() => loginWithDemo()}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border-2 border-purple-500 rounded-lg text-sm font-medium text-white hover:bg-purple-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating Demo Wallet...' : 'Use Demo Wallet'}
          </button>
        </div>

        <div className="mt-6">
          <p className="text-center text-xs text-gray-400">
            Demo wallet is for testing purposes only. It will be created on the Root Network testnet.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 