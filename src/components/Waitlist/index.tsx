import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WaitlistService } from '../../services/waitlistService';

export const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [hasFollowed, setHasFollowed] = useState(false);
  const [twitterWindow, setTwitterWindow] = useState<Window | null>(null);

  useEffect(() => {
    // Cleanup function to handle window close
    return () => {
      if (twitterWindow) {
        twitterWindow.close();
      }
    };
  }, [twitterWindow]);

  const handleTwitterFollow = () => {
    // Close existing window if any
    if (twitterWindow) {
      twitterWindow.close();
    }

    // Open Twitter follow intent in a new window
    const newWindow = window.open(
      'https://twitter.com/intent/follow?screen_name=gener_ai',
      'twitter-follow-dialog',
      'width=600,height=600'
    );

    if (newWindow) {
      setTwitterWindow(newWindow);
      
      // Poll for window close
      const timer = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(timer);
          setTwitterWindow(null);
          // Instead of auto-setting hasFollowed, we'll verify
          verifyTwitterFollow();
        }
      }, 1000);
    } else {
      // If popup was blocked, show alternative method
      setMessage('Popup blocked. Please click the button again or follow us manually on Twitter @gener_ai');
      setStatus('error');
    }
  };

  const verifyTwitterFollow = async () => {
    if (!email) {
      setMessage('Please enter your email first');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('Verifying Twitter follow...');

    try {
      const isVerified = await WaitlistService.verifyTwitterFollow(email);
      
      if (isVerified) {
        setHasFollowed(true);
        setMessage('Twitter follow verified! You can now join the waitlist.');
        setStatus('success');
        // Auto submit after verification
        handleSubmit(null);
      } else {
        setHasFollowed(false);
        setMessage('Could not verify Twitter follow. Please make sure you followed @gener_ai');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error verifying Twitter follow:', error);
      setHasFollowed(false);
      setMessage('Error verifying Twitter follow. Please try again.');
      setStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent | null) => {
    if (e) {
      e.preventDefault();
    }

    if (!email) {
      setMessage('Please enter your email address');
      setStatus('error');
      return;
    }

    if (!hasFollowed) {
      handleTwitterFollow();
      return;
    }
    
    setStatus('loading');
    setMessage('Joining waitlist...');
    
    try {
      // Submit to waitlist
      const result = await WaitlistService.join(email);
      
      if (result.success) {
        setStatus('success');
        setEmail('');
        setHasFollowed(false);
        // Redirect to Twitter profile after successful join
        window.location.href = 'https://twitter.com/gener_ai';
      } else {
        setStatus('error');
      }
      
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error('Waitlist submission error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <motion.button
          type="submit"
          disabled={status === 'loading'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-colors ${
            status === 'loading'
              ? 'bg-blue-600/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#00E5FF] to-[#4D4DFF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]'
          }`}
        >
          {status === 'loading' ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Joining...</span>
            </div>
          ) : hasFollowed ? 'Join Waitlist' : 'Follow & Join Waitlist'}
        </motion.button>
      </form>
      
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 text-center ${
            status === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {message}
        </motion.p>
      )}
      
      <p className="mt-4 text-sm text-gray-400 text-center">
        {hasFollowed 
          ? 'Thanks for following! Complete your registration above.'
          : 'Follow us on Twitter to join the waitlist and stay updated.'}
      </p>
    </div>
  );
}; 