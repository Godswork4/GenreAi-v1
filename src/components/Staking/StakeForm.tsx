import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../store/authStore';
import { useDemoStore } from '../../store/demoStore';
import { LiquidStakingService } from '../../services/liquidStakingService';
import { formatUnits, parseUnits } from 'ethers';
import { TRNService } from '../../services/trnService';

interface StakeFormProps {
  exchangeRate?: string;
}

export const StakeForm: React.FC<StakeFormProps> = ({ exchangeRate = '0' }) => {
  const { user } = useAuth();
  const { isDemoMode, demoWallet } = useDemoStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      const address = isDemoMode ? demoWallet?.address : user?.futurePassAddress;
      if (!address) return;

      try {
        const rootBalance = await TRNService.getTokenBalance(address, 'root');
        setBalance(rootBalance);
      } catch (err) {
        console.error('Error fetching ROOT balance:', err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [isDemoMode, demoWallet, user]);

  const handleStake = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const address = isDemoMode ? demoWallet?.address : user?.futurePassAddress;
    if (!address || !amount) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const amountInWei = parseUnits(amount, 18);
      await LiquidStakingService.stake(address, amountInWei.toString());
      setAmount('');
    } catch (error) {
      console.error('Staking error:', error);
      setError('Failed to stake tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || parseFloat(value) <= parseFloat(balance)) {
      setAmount(value);
      setError(undefined);
    } else {
      setError('Amount exceeds balance');
    }
  };

  const estimatedReceived = amount && exchangeRate
    ? (parseFloat(amount) / parseFloat(formatUnits(exchangeRate, 18))).toFixed(6)
    : '0';

  return (
    <form onSubmit={handleStake} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount to Stake
        </label>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-400">Balance: {formatUnits(balance, 18)} ROOT</span>
          <button 
            type="button"
            onClick={() => setAmount(formatUnits(balance, 18))}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Max
          </button>
        </div>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="block w-full pr-16 sm:text-sm rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.0"
            min="0"
            step="0.000001"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 sm:text-sm">ROOT</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700/50 rounded-lg p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            You will receive
          </span>
          <span className="text-white font-medium">
            {estimatedReceived} stROOT
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-400">
            Exchange Rate
          </span>
          <span className="text-white font-medium">
            1 stROOT = {exchangeRate ? formatUnits(exchangeRate, 18) : '0'} ROOT
          </span>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!amount || isLoading || !!error}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
          !amount || isLoading || !!error
            ? 'bg-blue-500/50 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isLoading ? 'Staking...' : 'Stake'}
      </button>
    </form>
  );
}; 