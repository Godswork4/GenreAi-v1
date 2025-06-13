import React, { useEffect, useState } from 'react';
import { RootNetworkService } from '../services/rootNetworkService';

interface TokenInfo {
  symbol: string;
  price: number;
  change24h: number;
}

export const TokenPriceDisplay: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        const service = new RootNetworkService();
        const info = await service.getHighestPricedToken();
        setTokenInfo(info);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch token information');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTokenInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Highest Priced Token on RootNetwork</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Token:</span>
          <span className="font-semibold">{tokenInfo.symbol}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Price:</span>
          <span className="font-semibold">${tokenInfo.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">24h Change:</span>
          <span className={`font-semibold ${tokenInfo.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {tokenInfo.change24h >= 0 ? '+' : ''}{tokenInfo.change24h.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}; 