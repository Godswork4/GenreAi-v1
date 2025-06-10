import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWalletConnection } from '../../hooks/useWalletConnection';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, isLoading, connect, disconnect, address } = useWalletConnection();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Trade', path: '/trade' },
    { name: 'Analytics', path: '/analytics' },
  ];

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed w-full z-50 backdrop-blur-xl bg-background/80 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                  AI DeFi Copilot
                </span>
              </div>
            </Link>
          </motion.div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-surface-light rounded-lg transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWalletClick}
                disabled={isLoading}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg shadow-glow transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-secondary hover:shadow-glow-strong'
                }`}
              >
                {isLoading
                  ? 'Connecting...'
                  : isConnected
                  ? formatAddress(address || '')
                  : 'Connect Wallet'}
              </motion.button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-surface-light focus:outline-none"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden"
      >
        {isOpen && (
          <div className="px-2 pt-2 pb-3 space-y-1 bg-surface-dark">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-surface-light rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button 
              onClick={handleWalletClick}
              disabled={isLoading}
              className={`w-full mt-4 px-6 py-2 text-base font-medium text-white rounded-lg shadow-glow transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary hover:shadow-glow-strong'
              }`}
            >
              {isLoading
                ? 'Connecting...'
                : isConnected
                ? formatAddress(address || '')
                : 'Connect Wallet'}
            </button>
          </div>
        )}
      </motion.div>
    </nav>
  );
};

export default Navbar; 