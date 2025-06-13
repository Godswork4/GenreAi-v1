import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDemoStore } from '../store/demoStore';
import { RootNetworkService } from '../services/rootNetworkService';
import {
  UserCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';

const Staking: React.FC = () => {
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
  const [copied, setCopied] = useState(false);
  const [txStatus, setTxStatus] = useState<{ hash: string; success: boolean; error?: string } | null>(null);

  const { address } = useAccount();

  const activeAddress = isDemoMode ? demoWallet?.evmAddress : address;

  const fetchBalance = async () => {
    if (!activeAddress) return setBalance('0');
    try {
      const rootBalance = await RootNetworkService.getBalance(activeAddress, 1);
      setBalance(rootBalance || '0');
    } catch {
      setBalance('0');
    }
  };

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
      setError('Failed to fetch staking information');
    }
  };

  const handleStake = async () => {
    if (!address || !amount) return;
    setTxStatus(null);
    try {
      const txHash = await RootNetworkService.stake(address, amount);
      setTxStatus({ hash: txHash, success: true });
      setAmount('');
      fetchStakingData();
      fetchBalance();
    } catch (err: any) {
      setTxStatus({ hash: err?.txHash || '', success: false, error: err?.message || 'Stake failed' });
    }
  };

  const handleUnstake = async () => {
    if (!address || !amount) return;
    setTxStatus(null);
    try {
      const txHash = await RootNetworkService.unstake(address, amount);
      setTxStatus({ hash: txHash, success: true });
      setAmount('');
      fetchStakingData();
      fetchBalance();
    } catch (err: any) {
      setTxStatus({ hash: err?.txHash || '', success: false, error: err?.message || 'Unstake failed' });
    }
  };

  const canStake = activeTab === 'stake' && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance) / 1e6;
  const canUnstake = activeTab === 'unstake' && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(stakingInfo.userStaked) / 1e6;

  if (!activeAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1A1B1F] rounded-2xl p-8 text-center">
          <UserCircleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to start staking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {/* Wallet Status */}
        <div className="bg-[#1A1B1F] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
              <div>
                <div className="text-sm text-gray-400">Connected Wallet</div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium font-mono text-xs bg-gray-800/50 px-2 py-1 rounded">
                    {activeAddress ? `${activeAddress}` : 'No address'}
                  </span>
                  <button
                    onClick={() => {
                      if (activeAddress) {
                        navigator.clipboard.writeText(activeAddress);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }
                    }}
                    className="hover:text-blue-400"
                    title="Copy address"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Available Balance</div>
              <div className="text-white font-medium">
                {(parseFloat(balance || '0') / Math.pow(10, 6)).toFixed(6)} ROOT
              </div>
            </div>
          </div>
        </div>

        {/* Staking Interface */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1A1B1F] rounded-2xl p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('stake')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'stake'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#23262F] text-gray-400 hover:text-white'
                }`}
              >
                Stake
              </button>
              <button
                onClick={() => setActiveTab('unstake')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'unstake'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#23262F] text-gray-400 hover:text-white'
                }`}
              >
                Unstake
              </button>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Amount to {activeTab}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAmount(val);
                      setError('');
                      if (activeTab === 'stake' && parseFloat(val) > parseFloat(balance) / 1e6) {
                        setError('Amount exceeds available balance');
                      }
                      if (activeTab === 'unstake' && parseFloat(val) > parseFloat(stakingInfo.userStaked) / 1e6) {
                        setError('Amount exceeds staked amount');
                      }
                    }}
                    placeholder="0.0"
                    className="w-full bg-[#23262F] text-white text-2xl font-bold rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-gray-400">ROOT</span>
                    <button
                      onClick={() => setAmount(activeTab === 'stake' ? (parseFloat(balance) / 1e6).toString() : (parseFloat(stakingInfo.userStaked) / 1e6).toString())}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded bg-blue-400/10"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Available: {activeTab === 'stake' 
                    ? `${(parseFloat(balance) / 1e6).toFixed(6)} ROOT`
                    : `${(parseFloat(stakingInfo.userStaked) / 1e6).toFixed(6)} ROOT`
                  }
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                  <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <button
                onClick={activeTab === 'stake' ? handleStake : handleUnstake}
                disabled={isLoading || !amount || !!error || (activeTab === 'stake' ? !canStake : !canUnstake)}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  isLoading || !amount || !!error || (activeTab === 'stake' ? !canStake : !canUnstake)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                {isLoading ? 'Processing...' : activeTab === 'stake' ? 'Stake ROOT' : 'Unstake ROOT'}
              </button>
            </div>
          </div>

          {/* Staking Info */}
          <div className="space-y-6">
            <div className="bg-[#1A1B1F] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Your Position</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Staked Amount</span>
                  <span className="text-white font-medium">
                    {(parseFloat(stakingInfo.userStaked) / 1e6).toFixed(6)} ROOT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pending Rewards</span>
                  <span className="text-green-400 font-medium">
                    {(parseFloat(stakingInfo.rewards) / 1e6).toFixed(6)} ROOT
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1B1F] rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Network Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Staked</span>
                  <span className="text-white font-medium">
                    {(parseFloat(stakingInfo.totalStaked) / 1e6).toFixed(6)} ROOT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current APY</span>
                  <div className="flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">{stakingInfo.apy}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Unbonding Period</span>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{stakingInfo.unbondingPeriod} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {txStatus && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${txStatus.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          <span>{txStatus.success ? 'Stake Successful!' : 'Stake Failed:'}</span>
          <a href={`https://porcini.rootscan.io/tx/${txStatus.hash}`} target="_blank" rel="noopener noreferrer" className="underline">
            {txStatus.hash.slice(0, 10)}...{txStatus.hash.slice(-6)}
          </a>
          {txStatus.error && <span className="ml-2">{txStatus.error}</span>}
        </div>
      )}
    </div>
  );
};

export default Staking;