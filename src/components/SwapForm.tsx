import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { RootNetworkService } from '../services/rootNetworkService';
import { ExclamationTriangleIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { useDemoStore } from '../store/demoStore';

interface TokenOption {
  symbol: string;
  name: string;
  icon: string;
  assetId: number;
}

const tokens: TokenOption[] = [
  {
    symbol: 'ROOT',
    name: 'Root Token',
    icon: '/icons/root.svg',
    assetId: RootNetworkService.ASSETS.ROOT
  },
  {
    symbol: 'XRP',
    name: 'XRP Token',
    icon: '/icons/xrp.svg',
    assetId: RootNetworkService.ASSETS.XRP
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '/icons/usdt.svg',
    assetId: RootNetworkService.ASSETS.USDT
  },
  {
    symbol: 'SYLO',
    name: 'Sylo',
    icon: '/icons/sylo.svg',
    assetId: 3172
  }
];

export const SwapForm = () => {
  const { address } = useAccount();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [fromToken, setFromToken] = useState<TokenOption>(tokens[0]);
  const [toToken, setToToken] = useState<TokenOption>(tokens[1]);
  const [amount, setAmount] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  const [priceImpact, setPriceImpact] = useState('0.00');
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [txStatus, setTxStatus] = useState<{ hash: string; success: boolean; error?: string } | null>(null);

  const activeAddress = isDemoMode ? demoWallet?.evmAddress : address;

  useEffect(() => {
    const fetchBalance = async () => {
      if (!activeAddress) return;
      try {
        if (fromToken.symbol === 'ROOT') {
          const rootBalance = await RootNetworkService.getBalance(activeAddress, 1);
          setBalance(formatUnits(rootBalance || '0', 6));
        } else {
          const balances = await RootNetworkService.getTokenBalances(activeAddress);
          setBalance(formatUnits(balances[fromToken.symbol] || '0', 6));
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      }
    };
    fetchBalance();
  }, [activeAddress, fromToken]);

  useEffect(() => {
    if (fromToken.assetId === toToken.assetId) {
      setError('Cannot swap the same token');
      setEstimatedAmount('');
      return;
    }

    // Validate amount against balance
    if (amount && parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      setEstimatedAmount('');
      return;
    }

    const getEstimate = async () => {
      if (!amount || !activeAddress) {
        setEstimatedAmount('');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const amountIn = BigInt(parseUnits(amount, 6).toString());
        const estimate = await RootNetworkService.getSwapEstimate(
          amountIn.toString(),
          fromToken.assetId,
          toToken.assetId
        );
        setEstimatedAmount(formatUnits(estimate.amountOut, 6));
        setPriceImpact(estimate.priceImpact.toFixed(2));
      } catch (error: any) {
        console.error('Error getting swap estimate:', error);
        if (error.message && error.message.includes('Pool not found')) {
          setError('No liquidity pool exists for this token pair.');
        } else {
          setError(error.message || 'Failed to get swap estimate');
        }
        setEstimatedAmount('');
      } finally {
        setIsLoading(false);
      }
    };

    getEstimate();
  }, [fromToken, toToken, amount, activeAddress, balance]);

  const handleSwap = async () => {
    if (!address || !amount || fromToken.assetId === toToken.assetId) return;
    setTxStatus(null);
    try {
      const amountIn = BigInt(parseUnits(amount, 6).toString());
      const minAmountOut = (BigInt(parseUnits(estimatedAmount, 6).toString()) * 95n) / 100n;

      const txHash = await RootNetworkService.swap(
        address,
        amountIn.toString(),
        minAmountOut.toString(),
        fromToken.assetId,
        toToken.assetId
      );

      setAmount('');
      setEstimatedAmount('');
      setTxStatus({ hash: txHash, success: true });
    } catch (err: any) {
      setTxStatus({ hash: err?.txHash || '', success: false, error: err?.message || 'Swap failed' });
      setError(err?.message || 'Swap failed');
    }
  };

  const handleMaxClick = () => {
    setAmount(balance);
  };

  const TokenSelector = ({ 
    selected, 
    onSelect, 
    show, 
    onClose 
  }: { 
    selected: TokenOption; 
    onSelect: (token: TokenOption) => void; 
    show: boolean; 
    onClose: () => void;
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 40 }}
            className="bg-[#181A20] rounded-2xl shadow-xl p-6 w-full max-w-xs mx-auto border border-gray-700 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="font-semibold text-white mb-4 flex justify-between items-center">
              <span>Select Token</span>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {tokens.map(token => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors ${selected.symbol === token.symbol ? 'bg-blue-900/60 text-blue-300' : 'hover:bg-gray-700/40 text-white'}`}
                >
                  <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-base">{token.symbol}</span>
                    <span className="text-xs text-gray-400">{token.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-[#1A1B1F] rounded-2xl p-6 border border-gray-800">
      {/* From Token */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">From</label>
          <p className="text-sm text-gray-400">
            Balance: {parseFloat(balance).toFixed(6)} {fromToken.symbol}
          </p>
        </div>
        <div className="relative">
          <div className="flex items-center gap-4 bg-[#23262F] rounded-xl p-4">
            <div className="relative">
              <button
                onClick={() => setShowFromSelect(true)}
                className="flex items-center gap-2 hover:bg-[#2C2F36] rounded-lg px-3 py-2 transition-colors"
              >
                <img src={fromToken.icon} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                <span className="font-medium text-white">{fromToken.symbol}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <TokenSelector
                selected={fromToken}
                onSelect={setFromToken}
                show={showFromSelect}
                onClose={() => setShowFromSelect(false)}
              />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-2xl font-bold focus:outline-none"
            />
            <button
              onClick={handleMaxClick}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded bg-blue-400/10"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-3 z-10">
        <button
          onClick={() => {
            setFromToken(toToken);
            setToToken(fromToken);
            setAmount('');
            setEstimatedAmount('');
          }}
          className="bg-[#2C2F36] p-2 rounded-full border border-gray-700 hover:bg-[#2C2F36]/80 transition-colors"
        >
          <ArrowsUpDownIcon className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* To Token */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">To (Estimated)</label>
        <div className="relative">
          <div className="flex items-center gap-4 bg-[#23262F] rounded-xl p-4">
            <div className="relative">
              <button
                onClick={() => setShowToSelect(true)}
                className="flex items-center gap-2 hover:bg-[#2C2F36] rounded-lg px-3 py-2 transition-colors"
              >
                <img src={toToken.icon} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                <span className="font-medium text-white">{toToken.symbol}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <TokenSelector
                selected={toToken}
                onSelect={setToToken}
                show={showToSelect}
                onClose={() => setShowToSelect(false)}
              />
            </div>
            <input
              type="text"
              value={estimatedAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-2xl font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Price Impact and Error */}
      {error ? (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        amount && estimatedAmount && (
          <div className="mt-4 space-y-2 bg-[#23262F] rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className={`font-medium ${
                parseFloat(priceImpact) > 5 ? 'text-red-400' : 'text-green-400'
              }`}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">
                1 {fromToken.symbol} = {(parseFloat(estimatedAmount) / parseFloat(amount)).toFixed(6)} {toToken.symbol}
              </span>
            </div>
          </div>
        )
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!amount || !estimatedAmount || isLoading || !!error}
        className={`w-full mt-6 py-4 rounded-xl font-semibold transition-all ${
          !amount || !estimatedAmount || isLoading || !!error
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20'
        }`}
      >
        {isLoading ? 'Loading...' : error ? 'Swap Unavailable' : 'Swap'}
      </button>

      {/* Transaction Status */}
      {txStatus && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${txStatus.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {txStatus.success ? (
            <>
              <span>Swap Successful!</span>
              <a href={`https://porcini.rootscan.io/tx/${txStatus.hash}`} target="_blank" rel="noopener noreferrer" className="underline">
                {txStatus.hash.slice(0, 10)}...{txStatus.hash.slice(-6)}
              </a>
            </>
          ) : (
            <>
              <span>Swap Failed:</span>
              <span>{txStatus.error}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 