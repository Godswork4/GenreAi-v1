import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { FuturePassService } from '../services/futurePassService';
import { WalletService } from '../services/walletService';
import { RootNetworkService } from '../services/rootNetworkService';
import {
  WalletIcon,
  ArrowsRightLeftIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  BeakerIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState({
    balance: '0',
    isValid: false
  });

  const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;

  useEffect(() => {
    if (activeAddress) {
      fetchWalletInfo();
    }
  }, [activeAddress]);

  const fetchWalletInfo = async () => {
    if (!activeAddress) return;

    try {
      const balance = await RootNetworkService.getBalance(activeAddress, 1); // ROOT token
      const isValid = WalletService.validateAddress(activeAddress);
      
      setWalletInfo({
        balance,
        isValid
      });
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      if (!isDemoMode) {
        await FuturePassService.logout();
      }
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openFaucet = () => {
    window.open('https://faucet.rootnet.live', '_blank');
  };

  const openExplorer = () => {
    if (activeAddress) {
      window.open(`https://explorer.rootnet.live/account/${activeAddress}`, '_blank');
    }
  };

  const formatBalance = (balance: string) => {
    return (parseInt(balance || '0') / Math.pow(10, 6)).toFixed(6);
  };

  const sections = [
    {
      title: 'Wallet Information',
      icon: WalletIcon,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
              <p className="font-mono text-white text-sm break-all">
                {activeAddress || 'Not connected'}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={copyAddress}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={openExplorer}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="View on explorer"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Wallet Type</div>
              <div className="flex items-center gap-2">
                {isDemoMode ? (
                  <>
                    <BeakerIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">Demo Wallet</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">FuturePass</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">ROOT Balance</div>
              <div className="text-white font-medium">
                {formatBalance(walletInfo.balance)} ROOT
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <GlobeAltIcon className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">Root Network Testnet</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-blue-400">Root Network Porcini</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chain ID:</span>
                <span className="text-blue-400">7672</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RPC:</span>
                <span className="text-blue-400 text-xs">wss://porcini.rootnet.app</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openFaucet}
              className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
            >
              <BeakerIcon className="w-4 h-4" />
              <span className="text-sm">Get Testnet Tokens</span>
            </button>
            <button
              onClick={openExplorer}
              className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              <span className="text-sm">View on Explorer</span>
            </button>
          </div>

          {isDemoMode && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                <strong>Demo Mode:</strong> This is a testnet wallet created specifically for demonstration. 
                Your wallet is unique and stored locally. Use the faucet to get testnet tokens for testing.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Network Settings',
      icon: ArrowsRightLeftIcon,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Root Network Testnet</div>
                <div className="text-sm text-gray-400">Connected to Porcini testnet</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/30 rounded-lg opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-500">Root Network Mainnet</div>
                <div className="text-sm text-gray-500">Coming soon</div>
              </div>
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Currently connected to Root Network testnet. Mainnet support will be available soon.
          </div>
        </div>
      )
    },
    {
      title: 'Account Settings',
      icon: CogIcon,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Account Type</div>
            <div className="text-white">
              {isDemoMode ? 'Demo Account (Testnet)' : 'FuturePass Account'}
            </div>
          </div>

          {!isDemoMode && user?.email && (
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Email</div>
              <div className="text-white">{user.email}</div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <WalletIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Wallet Profile</h1>
            <p className="text-gray-400">
              {isDemoMode ? 'Demo Account on Root Network Testnet' : 'FuturePass Account'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              {section.content}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;