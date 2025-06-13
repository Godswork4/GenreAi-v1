import { useState } from 'react';
import { motion } from 'framer-motion';
import { WaitlistService } from '../services/waitlistService';

export const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasFollowed, setHasFollowed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await WaitlistService.join(email);
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleFollow = () => {
    window.open('https://twitter.com/genre_ai', '_blank');
    setHasFollowed(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!hasFollowed && (
        <div className="flex flex-col items-center space-y-2">
          <p className="text-gray-300 text-center">To join the waitlist, please follow us on Twitter first.</p>
          <button
            type="button"
            onClick={handleFollow}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Follow on Twitter
          </button>
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={!hasFollowed}
          className="w-full px-4 py-3 bg-[#0B0B14] border border-[#4D4DFF]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-transparent transition-all duration-200 placeholder-gray-500 disabled:opacity-50"
        />
      </div>

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {errorMessage}
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-400 text-sm"
        >
          Thanks for joining! We'll be in touch soon.
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={status === 'loading' || !hasFollowed}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full px-6 py-3 text-lg font-medium rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#4D4DFF] text-white transition-all duration-200 ${
          status === 'loading' || !hasFollowed
            ? 'opacity-75 cursor-not-allowed'
            : 'hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]'
        }`}
      >
        {status === 'loading' ? (
          <div className="flex items-center justify-center gap-2">
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
            <span>Joining...</span>
          </div>
        ) : (
          'Join Waitlist'
        )}
      </motion.button>

      <p className="text-sm text-gray-400 text-center">
        By joining, you agree to receive updates about GenreAI
      </p>
    </form>
  );
}; 