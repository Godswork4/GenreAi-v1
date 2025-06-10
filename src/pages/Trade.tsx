import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { RootNetworkService } from '../services/rootNetworkService';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface MarketData {
  symbol: string;
  price: string;
  change24h: number;
  volume24h: string;
  marketCap: string;
}

const Trade: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('ROOT');
  const [isLoading, setIsLoading] = useState(true);

  const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;

  // Mock market data for demo
  const mockMarketData: MarketData[] = [
    {
      symbol: 'ROOT',
      price: '0.052',
      change24h: 5.2,
      volume24h: '1,234,567',
      marketCap: '52,000,000'
    },
    {
      symbol: 'XRP',
      price: '0.521',
      change24h: -2.1,
      volume24h: '987,654',
      marketCap: '28,000,000'
    },
    {
      symbol: 'USDT',
      price: '1.000',
      change24h: 0.1,
      volume24h: '2,345,678',
      marketCap: '100,000,000'
    },
    {
      symbol: 'ASTO',
      price: '0.123',
      change24h: 8.7,
      volume24h: '456,789',
      marketCap: '12,300,000'
    }
  ];

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        // In production, fetch real market data
        // For now, use mock data
        setMarketData(mockMarketData);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setMarketData(mockMarketData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(parseFloat(value));
  };

  const formatNumber = (value: string) => {
    return new Intl.NumberFormat('en-US').format(parseFloat(value));
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
        <h1 className="text-2xl font-bold text-white">Trading</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ClockIcon className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Total Market Cap</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            ${formatNumber('192,300,000')}
          </div>
          <div className="text-sm text-green-400 mt-1">+2.4% (24h)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">24h Volume</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            ${formatNumber('5,024,688')}
          </div>
          <div className="text-sm text-blue-400 mt-1">+15.2% (24h)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Active Pairs</h3>
          </div>
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-sm text-gray-400 mt-1">Trading pairs</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1b1f] rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Network</h3>
          </div>
          <div className="text-lg font-bold text-white">Root Network</div>
          <div className="text-sm text-green-400 mt-1">Testnet Active</div>
        </motion.div>
      </div>

      {/* Token List */}
      <div className="bg-[#1a1b1f] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Market Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Token</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Price</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">24h Change</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">24h Volume</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Market Cap</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((token, index) => (
                <motion.tr
                  key={token.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{token.symbol}</div>
                        <div className="text-sm text-gray-400">
                          {token.symbol === 'ROOT' ? 'Root Network Token' :
                           token.symbol === 'XRP' ? 'Ripple' :
                           token.symbol === 'USDT' ? 'Tether USD' :
                           'Asto Token'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-medium text-white">
                      {formatCurrency(token.price)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.change24h >= 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      )}
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-white">${formatNumber(token.volume24h)}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-white">${formatNumber(token.marketCap)}</div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedToken(token.symbol)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      Trade
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trading Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <ChartBarIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Trading Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-2">Available Features</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Spot trading on Root Network DEX</li>
              <li>• Real-time price feeds</li>
              <li>• Low trading fees (0.3%)</li>
              <li>• Instant settlements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Supported Tokens</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• ROOT - Native Root Network token</li>
              <li>• XRP - Ripple token</li>
              <li>• USDT - Tether USD stablecoin</li>
              <li>• ASTO - Asto ecosystem token</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            <strong>Testnet Notice:</strong> You're trading on Root Network testnet. 
            All tokens are for testing purposes only and have no real value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Trade;