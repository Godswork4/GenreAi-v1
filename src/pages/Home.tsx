import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import LandingNavbar from '../components/Landing/LandingNavbar';
import {
  SparklesIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setDemoMode } = useDemoStore();

  const handleConnectWallet = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleTryDemo = async () => {
    try {
      await setDemoMode(true);
      navigate('/app');
    } catch (error) {
      console.error('Demo mode failed:', error);
    }
  };

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Trading',
      description: 'Get intelligent insights and recommendations powered by advanced AI algorithms',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: ArrowsRightLeftIcon,
      title: 'Advanced Swapping',
      description: 'Seamless token swaps with optimal routing and minimal slippage',
      gradient: 'from-green-500 to-blue-500'
    },
    {
      icon: BanknotesIcon,
      title: 'Smart Staking',
      description: 'Maximize your yields with intelligent staking strategies and rewards',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Portfolio Analytics',
      description: 'Track and analyze your DeFi investments with comprehensive insights',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Trusted',
      description: 'Built on Root Network with enterprise-grade security standards',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: CpuChipIcon,
      title: 'Real-time Data',
      description: 'Access live market data and execute trades with lightning speed',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$2.5M+', icon: BanknotesIcon },
    { label: 'Active Users', value: '10K+', icon: ChartBarIcon },
    { label: 'Transactions', value: '100K+', icon: ArrowsRightLeftIcon },
    { label: 'Uptime', value: '99.9%', icon: ShieldCheckIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Genre AI
              </span>
              <br />
              <span className="text-white">DeFi Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Your intelligent companion for navigating the Root Network DeFi ecosystem. 
              Swap tokens, manage liquidity, and explore opportunities with AI guidance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={handleConnectWallet}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <RocketLaunchIcon className="w-6 h-6 inline-block mr-2" />
              Connect FuturePass
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>

            <button
              onClick={handleTryDemo}
              className="group relative px-8 py-4 border-2 border-purple-400 rounded-xl font-semibold text-lg text-purple-400 hover:bg-purple-400/10 transition-all duration-300 transform hover:scale-105"
            >
              <BeakerIcon className="w-6 h-6 inline-block mr-2" />
              Try Demo Mode
            </button>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of DeFi with our comprehensive suite of tools and features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-12 border border-blue-500/20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users already using Genre AI for their DeFi needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConnectWallet}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Now
              </button>
              <button
                onClick={handleTryDemo}
                className="px-8 py-4 border-2 border-gray-600 rounded-xl font-semibold text-lg text-gray-300 hover:bg-gray-800/50 transition-all duration-300"
              >
                Explore Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold text-white mb-4">Genre AI</div>
          <p className="text-gray-400 mb-6">
            Built on Root Network • Powered by AI • Secured by Blockchain
          </p>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Genre AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;