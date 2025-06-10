import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { RootNetworkService } from '../services/rootNetworkService';
import { WalletService } from '../services/walletService';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  value: number; // USD value
  change24h: number;
}

interface PoolPosition {
  token0: string;
  token1: string;
  liquidity: string;
  value: number;
  apy: number;
}

const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [pools, setPools] = useState<PoolPosition[]>([]);
  const [stakingInfo, setStakingInfo] = useState({
    userStaked: '0',
    rewards: '0',
    apy: 0
  });
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;

  // Mock price data - in production, fetch from price API
  const tokenPrices: Record<string, { price: number; change24h: number }> = {
    ROOT: { price: 0.05, change24h: 5.2 },
    XRP: { price: 0.52, change24h: -2.1 },
    USDT: { price: 1.00, change24h: 0.1 },
    ASTO: { price: 0.12, change24h: 8.7 }
  };

  useEffect(() => {
    if (activeAddress) {
      fetchPortfolioData();
    }
  }, [activeAddress]);

  const fetchPortfolioData = async () => {
    if (!activeAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch token balances
      const balances = await RootNetworkService.getTokenBalances(activeAddress);
      const tokenData: TokenBalance[] = [];
      let portfolioValue = 0;
      let weightedChange = 0;

      for (const [symbol, balance] of Object.entries(balances)) {
        const tokenInfo = Object.values(RootNetworkService.TOKENS).find(t => t.symbol === symbol);
        if (tokenInfo && balance !== '0') {
          const formattedBalance = parseInt(balance) / Math.pow(10, tokenInfo.decimals);
          const priceData = tokenPrices[symbol] || { price: 0, change24h: 0 };
          const value = formattedBalance * priceData.price;
          
          tokenData.push({
            symbol,
            balance,
            decimals: tokenInfo.decimals,
            value,
            change24h: priceData.change24h
          });

          portfolioValue += value;
          weightedChange += value * priceData.change24h;
        }
      }

      setTokens(tokenData);
      setTotalValue(portfolioValue);
      setTotalChange(portfolioValue > 0 ? weightedChange / portfolioValue : 0);

      // Fetch staking info
      const staking = await RootNetworkService.getStakingInfo(activeAddress);
      setStakingInfo(staking);

      // Fetch pool positions (simplified for demo)
      const poolPositions: PoolPosition[] = [];
      
      // Check major pools
      const majorPools = [
        { token0: 1, token1: 1984 }, // ROOT-USDT
        { token0: 2, token1: 1984 }, // XRP-USDT
        { token0: 1, token1: 2 }     // ROOT-XRP
      ];

      for (const pool of majorPools) {
        const poolInfo = await RootNetworkService.getPoolInfo(pool.token0, pool.token1);
        if (poolInfo) {
          // In a real implementation, you'd check user's LP token balance
          // For now, we'll show empty positions
          poolPositions.push({
            token0: poolInfo.token0.symbol,
            token1: poolInfo.token1.symbol,
            liquidity: '0',
            value: 0,
            apy: 15 // Mock APY
          });
        }
      }

      setPools(poolPositions);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: string, decimals: number) => {
    return (parseInt(amount || '0') / Math.pow(10, decimals)).toFixed(6);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const requestFaucet = () => {
    if (activeAddress) {
      WalletService.requestFaucetTokens(activeAddress);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
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
            <div className="text-sm text-gray-400">Network</div>
            <div className="text-white">Root Network Testnet</div>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Total Balance</h3>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">
              {formatCurrency(totalValue)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              totalChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalChange >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}% (24h)
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Staked Assets</h3>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">
              {formatAmount(stakingInfo.userStaked, 6)} ROOT
            </div>
            <div className="text-sm text-gray-400">
              APY: <span className="text-green-400">{stakingInfo.apy}%</span>
            </div>
            <div className="text-sm text-gray-400">
              Rewards: <span className="text-green-400">{formatAmount(stakingInfo.rewards, 6)} ROOT</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Liquidity Pools</h3>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">
              {pools.reduce((sum, pool) => sum + pool.value, 0) > 0 
                ? formatCurrency(pools.reduce((sum, pool) => sum + pool.value, 0))
                : '$0.00'
              }
            </div>
            <div className="text-sm text-gray-400">
              {pools.filter(pool => pool.value > 0).length} active positions
            </div>
          </div>
        </motion.div>
      </div>

      {/* Token Balances */}
      <div className="bg-[#1a1b1f] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Token Balances</h3>
        {tokens.length > 0 ? (
          <div className="space-y-4">
            {tokens.map((token, index) => (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-[#212226] rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{token.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-sm text-gray-400">
                      {formatAmount(token.balance, token.decimals)} {token.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatCurrency(token.value)}
                  </div>
                  <div className={`text-sm ${
                    token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">No tokens found</div>
            <button
              onClick={requestFaucet}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Get Testnet Tokens
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;