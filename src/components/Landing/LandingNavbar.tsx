import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '../../store/demoStore';

const LandingNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { setDemoMode } = useDemoStore();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleStartTrading = () => {
    navigate('/app/trade');
  };

  const handleTryDemo = () => {
    setDemoMode(true);
    navigate('/app');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <span className="text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                AI DeFi Copilot
              </span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => scrollToSection('overview')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Overview
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Features
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => scrollToSection('trading')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Trading
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => scrollToSection('staking')}
              className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              Staking
            </motion.button>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={handleTryDemo}
                className="px-4 py-2 text-sm font-medium text-white border border-primary/50 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Try Demo
              </button>
              <button
                onClick={handleStartTrading}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300"
              >
                Start Trading
              </button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-surface-light focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
            <button
              onClick={() => scrollToSection('overview')}
              className="block w-full px-3 py-2 text-base font-medium text-left text-gray-300 hover:text-white hover:bg-surface-light rounded-lg"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full px-3 py-2 text-base font-medium text-left text-gray-300 hover:text-white hover:bg-surface-light rounded-lg"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('trading')}
              className="block w-full px-3 py-2 text-base font-medium text-left text-gray-300 hover:text-white hover:bg-surface-light rounded-lg"
            >
              Trading
            </button>
            <button
              onClick={() => scrollToSection('staking')}
              className="block w-full px-3 py-2 text-base font-medium text-left text-gray-300 hover:text-white hover:bg-surface-light rounded-lg"
            >
              Staking
            </button>
            <div className="pt-4 space-y-2">
              <button
                onClick={handleTryDemo}
                className="w-full px-4 py-2 text-sm font-medium text-white border border-primary/50 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Try Demo
              </button>
              <button
                onClick={handleStartTrading}
                className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300"
              >
                Start Trading
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </nav>
  );
};

export default LandingNavbar; 