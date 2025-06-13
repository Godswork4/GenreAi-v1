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
  UserCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { ethers } from 'ethers';
import { DEX_PRECOMPILE_ABI } from '@therootnetwork/evm';

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  value: number;
}

interface PoolPosition {
  token0: string;
  token1: string;
  liquidity: string;
  value: number;
  apy: number;
}

interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'stake';
  amount: string;
  token: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

const DEX_ADDRESS = '0x000000000000000000000000000000000000DdDD';
const ROOT_ADDRESS = '0xCCCCCCCC00000001000000000000000000000000';
const USDC_ADDRESS = '0xCCCCCCCC00000864000000000000000000000000';
const XRP_ADDRESS = '0xCCCCCCCC00000002000000000000000000000000';
const ASTO_ADDRESS = '0xCCCCCCCC00004464000000000000000000000000';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  const activeAddress = isDemoMode ? demoWallet?.evmAddress : null;

  useEffect(() => {
    fetchPortfolioData();
    // Fetch real token prices from DEX precompile
    const fetchPrices = async () => {
      try {
        // Use window.ethereum or fallback to a default provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const dex = new ethers.Contract(DEX_ADDRESS, DEX_PRECOMPILE_ABI, provider);
        // Get price of 1 ROOT in USDC
        const amountIn = ethers.utils.parseUnits('1', 6); // 1 ROOT (6 decimals)
        const amountsOut = await dex.getAmountsOut(amountIn, [ROOT_ADDRESS, USDC_ADDRESS]);
        const rootPrice = parseFloat(ethers.utils.formatUnits(amountsOut[1], 6));
        // Optionally fetch other token prices similarly
        setTokenPrices({ ROOT: rootPrice });
      } catch (err) {
        setTokenPrices({ ROOT: 0 });
      }
    };
    fetchPrices();
  }, []);

  const fetchPortfolioData = async () => {
    if (!activeAddress) {
      setIsLoading(false);
      setError('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch ROOT balance
      const rootBalance = await RootNetworkService.getBalance(activeAddress, 1);
      // Fetch other token balances
      const balances = await RootNetworkService.getTokenBalances(activeAddress);
      const allTokens = Object.values(RootNetworkService.TOKENS);
      const tokenData: TokenBalance[] = allTokens.map(tokenInfo => {
        let balance = '0';
        if (tokenInfo.symbol === 'ROOT') {
          balance = rootBalance || '0';
        } else {
          balance = balances[tokenInfo.symbol] || '0';
        }
        const formattedBalance = parseFloat(balance) / Math.pow(10, tokenInfo.decimals);
        const price = tokenPrices[tokenInfo.symbol] || 0;
        const value = formattedBalance * price;
        return {
          symbol: tokenInfo.symbol,
          balance,
          decimals: tokenInfo.decimals,
          value
        };
      });
      let portfolioValue = tokenData.reduce((sum, t) => sum + t.value, 0);
      setTokens(tokenData);
      setTotalValue(portfolioValue);

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

      // Remove mock transactions
      setTransactions([]);

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: string, decimals: number) => {
    return (parseFloat(amount || '0') / Math.pow(10, decimals)).toFixed(6);
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

  if (!activeAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1A1B1F] rounded-2xl p-8 text-center">
          <UserCircleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view your portfolio</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Portfolio Value Skeleton */}
          <div className="bg-[#1A1B1F] rounded-2xl p-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
            <div className="h-12 w-32 bg-gray-700 rounded"></div>
          </div>

          {/* Assets Skeleton */}
          <div className="bg-[#1A1B1F] rounded-2xl p-6">
            <div className="h-6 w-24 bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 w-20 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wallet Address Display */}
      <div className="flex items-center gap-2 mb-8">
        <span className="font-mono text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
          {activeAddress ? activeAddress : 'No address'}
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
      <div className="grid gap-6">
        {/* Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1B1F] rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Portfolio Value</h2>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-white">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </motion.div>

        {/* Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1B1F] rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Assets</h2>
          <div className="space-y-4">
            {tokens.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-4 bg-[#23262F] rounded-xl">
                <div className="flex items-center gap-4">
                  <img src={`/icons/${token.symbol.toLowerCase()}.svg`} alt={token.symbol} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-sm text-gray-400">
                      {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(6)} {token.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    ${token.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1B1F] rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.hash} className="flex items-center justify-between p-4 bg-[#23262F] rounded-xl">
                <div className="flex items-center gap-4">
                  {tx.type === 'swap' ? (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white capitalize">{tx.type}</div>
                    <div className="text-sm text-gray-400">
                      {tx.amount} {tx.token}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                  <div className={`text-sm ${
                    tx.status === 'completed' ? 'text-green-400' : 
                    tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;