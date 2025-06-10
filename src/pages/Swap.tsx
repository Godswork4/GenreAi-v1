import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useDemoStore } from '../store/demoStore';
import { RootNetworkService } from '../services/rootNetworkService';
import { WalletService } from '../services/walletService';
import {
  ArrowsUpDownIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { TokenSelector, Token } from '../components/TokenSelector';
import { TokenIcon } from '../components/TokenIcon';

const Swap: React.FC = () => {
  const { user } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  
  // State management
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [priceImpact, setPriceImpact] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);

  const activeAddress = isDemoMode ? demoWallet?.address : user?.futurePassAddress;

  // Available tokens on Root Network
  const availableTokens: Token[] = [
    {
      symbol: 'ROOT',
      name: 'Root Network Token',
      decimals: 6,
      assetId: 1,
      balance: '0'
    },
    {
      symbol: 'XRP',
      name: 'Ripple',
      decimals: 6,
      assetId: 2,
      balance: '0'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      assetId: 1984,
      balance: '0'
    },
    {
      symbol: 'ASTO',
      name: 'Asto Token',
      decimals: 18,
      assetId: 17508,
      balance: '0'
    }
  ];

  useEffect(() => {
    if (activeAddress) {
      fetchTokenBalances();
      // Set default tokens
      setFromToken(availableTokens[0]); // ROOT
      setToToken(availableTokens[2]); // USDT
    }
  }, [activeAddress]);

  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      calculateSwapOutput();
    }
  }, [fromToken, toToken, fromAmount, slippage]);

  const fetchTokenBalances = async () => {
    if (!activeAddress) return;

    try {
      const balances = await RootNetworkService.getTokenBalances(activeAddress);
      const updatedTokens = availableTokens.map(token => ({
        ...token,
        balance: balances[token.symbol] || '0'
      }));
      setTokens(updatedTokens);
    } catch (error) {
      console.error('Error fetching token balances:', error);
      setTokens(availableTokens);
    }
  };

  const calculateSwapOutput = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setExchangeRate(0);
      setPriceImpact(0);
      return;
    }

    try {
      const amountIn = (parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString();
      const amountOut = await RootNetworkService.getSwapAmountOut(
        amountIn,
        fromToken.assetId,
        toToken.assetId
      );

      const outputAmount = parseInt(amountOut) / Math.pow(10, toToken.decimals);
      setToAmount(outputAmount.toFixed(6));
      
      // Calculate exchange rate
      const rate = outputAmount / parseFloat(fromAmount);
      setExchangeRate(rate);

      // Calculate price impact (simplified)
      const impact = Math.abs((rate - 1) * 100);
      setPriceImpact(impact);
    } catch (error) {
      console.error('Error calculating swap output:', error);
      setToAmount('0');
      setExchangeRate(0);
      setPriceImpact(0);
    }
  };

  const handleSwap = async () => {
    if (!activeAddress || !fromToken || !toToken || !fromAmount) {
      setError('Please fill in all required fields');
      return;
    }

    const fromBalance = parseInt(fromToken.balance) / Math.pow(10, fromToken.decimals);
    if (parseFloat(fromAmount) > fromBalance) {
      setError(`Insufficient ${fromToken.symbol} balance`);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const amountIn = (parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString();
      const minAmountOut = (parseFloat(toAmount) * (1 - slippage / 100) * Math.pow(10, toToken.decimals)).toString();

      const txHash = await RootNetworkService.swap(
        activeAddress,
        amountIn,
        minAmountOut,
        fromToken.assetId,
        toToken.assetId
      );

      setSuccess(`Swap successful! Transaction: ${txHash.slice(0, 10)}...`);
      setFromAmount('');
      setToAmount('');
      
      // Refresh balances
      setTimeout(() => {
        fetchTokenBalances();
      }, 2000);
    } catch (error) {
      console.error('Swap error:', error);
      setError('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSwitch = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxAmount = () => {
    if (fromToken) {
      const balance = parseInt(fromToken.balance) / Math.pow(10, fromToken.decimals);
      setFromAmount(balance.toString());
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    return (parseInt(balance || '0') / Math.pow(10, decimals)).toFixed(6);
  };

  const getSlippageColor = () => {
    if (slippage <= 0.5) return 'text-green-400';
    if (slippage <= 1.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPriceImpactColor = () => {
    if (priceImpact <= 1) return 'text-green-400';
    if (priceImpact <= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const requestFaucet = () => {
    if (activeAddress) {
      WalletService.requestFaucetTokens(activeAddress);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Swap</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CogIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* From Token Section */}
        <div className="space-y-3 mb-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">From</label>
            <span className="text-sm text-gray-400">
              Balance: {fromToken ? formatBalance(fromToken.balance, fromToken.decimals) : '0.00'}
            </span>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 rounded-lg px-4 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-40">
              <TokenSelector
                selectedToken={fromToken}
                tokens={tokens}
                onSelect={setFromToken}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleTokenSwitch}
            className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            <ArrowsUpDownIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* To Token Section */}
        <div className="space-y-3 mt-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">To</label>
            <span className="text-sm text-gray-400">
              Balance: {toToken ? formatBalance(toToken.balance, toToken.decimals) : '0.00'}
            </span>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.00"
                className="w-full bg-gray-700 rounded-lg px-4 py-3 text-xl focus:outline-none opacity-75"
              />
            </div>
            <div className="w-40">
              <TokenSelector
                selectedToken={toToken}
                tokens={tokens}
                onSelect={setToToken}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        {exchangeRate > 0 && fromToken && toToken && (
          <div className="mt-4 text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <span>Exchange Rate:</span>
              <span>
                1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Price Impact Warning */}
        {priceImpact > 2 && (
          <div className={`mt-2 text-sm flex items-center ${getPriceImpactColor()}`}>
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            Price Impact: {priceImpact.toFixed(2)}%
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-500 text-sm flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 text-green-500 text-sm flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            {success}
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!fromToken || !toToken || !fromAmount || isLoading}
          className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading || !fromToken || !toToken || !fromAmount
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </div>
          ) : (
            'Swap'
          )}
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="mt-4 bg-gray-800 rounded-xl p-4">
          <h3 className="text-lg font-medium mb-4">Transaction Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Slippage Tolerance
              </label>
              <div className="flex space-x-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSlippage(value);
                      setCustomSlippage('');
                    }}
                    className={`px-3 py-1 rounded-lg ${
                      slippage === value && !customSlippage
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  value={customSlippage}
                  onChange={(e) => {
                    setCustomSlippage(e.target.value);
                    setSlippage(parseFloat(e.target.value) || 0);
                  }}
                  placeholder="Custom"
                  className="w-20 px-2 py-1 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swap;