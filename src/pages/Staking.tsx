import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { RootNetworkService } from '../services/rootNetworkService';
import { WalletService } from '../services/walletService';
import {
  UserCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Staking: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stakingInfo, setStakingInfo] = useState({
    totalStaked: '0',
    userStaked: '0',
    rewards: '0',
    apy: 0,
    unbondingPeriod: 0
  });
  const [balance, setBalance] = useState('0');

  const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;

  useEffect(() => {
    if (activeAddress) {
      fetchStakingData();
      fetchBalance();
    }
  }, [activeAddress]);

  const fetchStakingData = async () => {
    if (!activeAddress) return;

    try {
      const info = await RootNetworkService.getStakingInfo(activeAddress);
      setStakingInfo(info);
    } catch (error) {
      console.error('Error fetching staking data:', error);
    }
  };

  const fetchBalance = async () => {
    if (!activeAddress) return;

    try {
      const rootBalance = await RootNetworkService.getBalance(activeAddress, 1); // ROOT token
      setBalance(rootBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleStake = async () => {
    if (!activeAddress || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const availableBalance = parseInt(balance) / Math.pow(10, 6); // ROOT has 6 decimals
    if (parseFloat(amount) > availableBalance) {
      setError('Insufficient ROOT balance');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const stakeAmount = (parseFloat(amount) * Math.pow(10, 6)).toString();
      const txHash = await RootNetworkService.stake(activeAddress, stakeAmount);

      setSuccess(`Staking successful! Transaction: ${txHash.slice(0, 10)}...`);
      setAmount('');
      
      // Refresh data
      setTimeout(() => {
        fetchStakingData();
        fetchBalance();
      }, 2000);
    } catch (error) {
      console.error('Staking error:', error);
      setError('Staking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!activeAddress || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const stakedBalance = parseInt(stakingInfo.userStaked) / Math.pow(10, 6);
    if (parseFloat(amount) > stakedBalance) {
      setError('Amount exceeds staked balance');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const unstakeAmount = (parseFloat(amount) * Math.pow(10, 6)).toString();
      const txHash = await RootNetworkService.unstake(activeAddress, unstakeAmount);

      setSuccess(`Unstaking initiated! Transaction: ${txHash.slice(0, 10)}...`);
      setAmount('');
      
      // Refresh data
      setTimeout(() => {
        fetchStakingData();
        fetchBalance();
      }, 2000);
    } catch (error) {
      console.error('Unstaking error:', error);
      setError('Unstaking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: string, decimals: number = 6) => {
    return (parseInt(amount || '0') / Math.pow(10, decimals)).toFixed(6);
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    return `${days} days`;
  };

  const requestFaucet = () => {
    if (activeAddress) {
      WalletService.requestFaucetTokens(activeAddress);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Staking</h1>
        <button
          onClick={requestFaucet}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          Get Testnet Tokens
        </button>
      </div>

      {/* Wallet Info */}
      <div className="bg-[#1a1b1f] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <div>
              <div className="text-sm text-gray-400">Connected Wallet</div>
              <div className="font-mono text-white">
                {activeAddress ? `${activeAddress.slice(0, 8)}...${activeAddress.slice(-8)}` : 'Not connected'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Available Balance</div>
            <div className="text-lg font-semibold text-white">
              {formatAmount(balance)} ROOT
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staking Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1b1f] rounded-xl p-6">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('stake')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'stake'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Stake
              </button>
              <button
                onClick={() => setActiveTab('unstake')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'unstake'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Unstake
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to {activeTab}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-[#212226] text-white rounded-lg px-4 py-3 pr-16 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ROOT
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>
                    {activeTab === 'stake' 
                      ? `Available: ${formatAmount(balance)} ROOT`
                      : `Staked: ${formatAmount(stakingInfo.userStaked)} ROOT`
                    }
                  </span>
                  <button
                    onClick={() => setAmount(
                      activeTab === 'stake' 
                        ? formatAmount(balance)
                        : formatAmount(stakingInfo.userStaked)
                    )}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Staking Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current APY</span>
                  <span className="text-green-400">{stakingInfo.apy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Unbonding Period</span>
                  <span className="text-white">{formatTime(stakingInfo.unbondingPeriod)}</span>
                </div>
                {amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estimated Annual Rewards</span>
                    <span className="text-green-400">
                      {(parseFloat(amount) * stakingInfo.apy / 100).toFixed(6)} ROOT
                    </span>
                  </div>
                )}
              </div>

              {/* Messages */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm">{success}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={activeTab === 'stake' ? handleStake : handleUnstake}
                disabled={isLoading || !amount || parseFloat(amount) <= 0 || !activeAddress}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Processing...' : activeTab === 'stake' ? 'Stake ROOT' : 'Unstake ROOT'}
              </button>
            </div>
          </div>
        </div>

        {/* Staking Stats */}
        <div className="space-y-6">
          {/* Your Position */}
          <div className="bg-[#1a1b1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Position</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Staked Amount</div>
                <div className="text-2xl font-bold text-white">
                  {formatAmount(stakingInfo.userStaked)} ROOT
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Pending Rewards</div>
                <div className="text-xl font-semibold text-green-400">
                  {formatAmount(stakingInfo.rewards)} ROOT
                </div>
              </div>
            </div>
          </div>

          {/* Network Stats */}
          <div className="bg-[#1a1b1f] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Network Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Total Staked</div>
                <div className="text-xl font-bold text-white">
                  {formatAmount(stakingInfo.totalStaked)} ROOT
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Current APY</div>
                <div className="text-xl font-semibold text-green-400">
                  {stakingInfo.apy}%
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Unbonding Period</div>
                  <div className="text-sm text-white">{formatTime(stakingInfo.unbondingPeriod)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;