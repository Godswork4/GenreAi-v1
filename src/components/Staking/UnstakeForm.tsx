import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAccount } from '../../hooks/useAccount';
import { LiquidStakingService } from '../../services/liquidStakingService';
import { formatUnits, parseUnits } from 'ethers';

interface UnstakeFormProps {
  exchangeRate?: string;
}

interface StakingPosition {
  amount: string;
  unlockTime: number;
  rewards: string;
}

export const UnstakeForm: React.FC<UnstakeFormProps> = ({ exchangeRate = '0' }) => {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [stakingPosition, setStakingPosition] = useState<StakingPosition>();

  useEffect(() => {
    const loadPosition = async () => {
      if (!address) return;
      try {
        const position = await LiquidStakingService.getStakingPosition(address);
        setStakingPosition(position);
      } catch (error) {
        console.error('Error loading staking position:', error);
      }
    };

    loadPosition();
  }, [address]);

  const handleUnstake = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address || !amount) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const amountInWei = parseUnits(amount, 18); // Assuming 18 decimals for stROOT
      await LiquidStakingService.unstake(address, amountInWei.toString());
      setAmount('');
    } catch (error) {
      console.error('Unstaking error:', error);
      setError('Failed to unstake tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const estimatedReceived = amount && exchangeRate
    ? (parseFloat(amount) * parseFloat(formatUnits(exchangeRate, 18))).toFixed(6)
    : '0';

  const maxAmount = stakingPosition?.amount
    ? formatUnits(stakingPosition.amount, 18)
    : '0';

  const isUnlocked = stakingPosition?.unlockTime
    ? Date.now() / 1000 > stakingPosition.unlockTime
    : true;

  return (
    <form onSubmit={handleUnstake} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount to Unstake
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="block w-full pr-16 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            placeholder="0.0"
            min="0"
            max={maxAmount}
            step="0.000001"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-500 sm:text-sm">stROOT</span>
          </div>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Available: {maxAmount} stROOT
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            You will receive
          </span>
          <span className="font-medium">
            {estimatedReceived} ROOT
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-500 dark:text-gray-400">
            Exchange Rate
          </span>
          <span className="font-medium">
            1 stROOT = {exchangeRate ? formatUnits(exchangeRate, 18) : '0'} ROOT
          </span>
        </div>
        {!isUnlocked && (
          <div className="mt-2 text-sm text-yellow-500">
            Your tokens are still locked. Please wait until the unlock period ends.
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!address || !amount || isLoading || !isUnlocked}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          !address || !amount || isLoading || !isUnlocked
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Unstaking...' : 'Unstake'}
      </button>
    </form>
  );
}; 