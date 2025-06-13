import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FuturePassComingSoon: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B14] px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#181A20] rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-700"
      >
        <div className="mb-6">
          <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#4D4DFF" />
              <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">FuturePass Coming Soon</h1>
          <p className="text-gray-400">We're working hard to bring you FuturePass login. Please check back soon or use Demo Mode for now!</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
};

export default FuturePassComingSoon; 