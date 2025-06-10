import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import Chat from '../AICopilot/Chat';
import Leaderboard from '../Community/Leaderboard';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../store/authStore';
import { FuturePassService } from '../../services/futurePassService';

interface MotionDivProps extends MotionProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  key?: string | number;
}

const MotionDiv = motion.div as React.FC<MotionDivProps>;
const MotionButton = motion.button as React.FC<MotionDivProps>;
const MotionSpan = motion.span as React.FC<MotionDivProps>;
const MotionAside = motion.aside as React.FC<MotionDivProps>;

const MainLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userEmail, logout } = useAuth();

  const navigationItems = [
    { name: 'Home', path: '/app', icon: HomeIcon },
    { name: 'Swap', path: '/app/swap', icon: ArrowsRightLeftIcon },
    { name: 'Staking', path: '/app/staking', icon: BanknotesIcon },
    { name: 'Portfolio', path: '/app/portfolio', icon: ChartBarIcon },
    { name: 'Profile', path: '/app/profile', icon: UserCircleIcon },
  ];

  const featureCards = [
    {
      title: 'AI-Powered Swaps',
      description: 'Intelligent token swaps with price predictions and optimal routing',
      icon: SparklesIcon,
      path: '/app/swap',
      gradient: 'from-blue-500 to-purple-500',
      demo: (
        <div className="h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-400">Best Route</div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Estimated Savings</span>
              <span className="text-green-400">+2.5%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Smart Staking',
      description: 'Maximize yields with AI-optimized staking strategies',
      icon: BeakerIcon,
      path: '/app/staking',
      gradient: 'from-green-500 to-blue-500',
      demo: (
        <div className="h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">APY</span>
              <MotionSpan
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-400 font-medium"
              >
                12.8%
              </MotionSpan>
            </div>
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <MotionDiv
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                className="absolute h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Portfolio Analytics',
      description: 'Track and analyze your DeFi investments with AI insights',
      icon: ChartBarIcon,
      path: '/app/portfolio',
      gradient: 'from-purple-500 to-pink-500',
      demo: (
        <div className="h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">Performance</span>
            <CpuChipIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="h-12 flex items-end space-x-1">
            {[40, 65, 55, 70, 85, 75, 90].map((height, i) => (
              <MotionDiv
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
              />
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleLogout = async () => {
    try {
      await FuturePassService.logout();
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1011]">
      {/* Sidebar */}
        <div className="w-64 bg-[#1a1b1f] border-r border-gray-800">
          <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <h1 className="text-xl font-bold text-white">Genre AI</h1>
          </Link>
          </div>

          <nav className="mt-6">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-blue-500/10 border-r-2 border-blue-500'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
          <header className="h-16 border-b border-gray-800 bg-[#1a1b1f] flex items-center justify-between px-6">
            <h2 className="text-lg font-semibold text-white">
              {navigationItems.find(item => item.path === location.pathname)?.name || 'Home'}
            </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
          </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {location.pathname === '/app' ? (
            <div className="max-w-7xl mx-auto">
              <div className="mb-12 text-center">
                <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white mb-4"
                >
                  Welcome to Genre AI
                </MotionDiv>
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-gray-400"
                >
                  Your intelligent DeFi companion powered by artificial intelligence
                </MotionDiv>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featureCards.map((feature, index) => (
                  <MotionDiv
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-[#1a1b1f] rounded-xl overflow-hidden"
                    onMouseEnter={() => setActiveFeature(feature.title)}
                    onMouseLeave={() => setActiveFeature(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-10" />
                    <div className="relative p-6 space-y-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                      
                      <AnimatePresence mode="wait">
                        {activeFeature === feature.title && (
                          <MotionDiv
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {feature.demo}
                          </MotionDiv>
                        )}
                      </AnimatePresence>

                      <MotionButton
                        onClick={() => navigate(feature.path)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RocketLaunchIcon className="w-5 h-5" />
                        Get Started
                      </MotionButton>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          ) : (
          <Outlet />
          )}
        </main>
      </div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <MotionAside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 w-96 bg-[#1a1b1f] border-l border-gray-800 shadow-xl"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <Chat />
          </MotionAside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout; 