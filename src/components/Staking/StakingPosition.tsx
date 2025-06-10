import React, { useEffect, useState } from 'react';
import { formatUnits } from 'ethers';
import { LiquidStakingService } from '../../services/liquidStakingService';

interface StakingPositionProps {
  userAddress: string;
}

export const StakingPosition: React.FC<StakingPositionProps> = ({ userAddress }) => {
  const [position, setPosition] = useState<{
    amount: string;
    unlockTime: number;
    rewards: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);

  const loadPosition = async () => {
    try {
      const pos = await LiquidStakingService.getStakingPosition(userAddress);
      setPosition(pos);
    } catch (error) {
      console.error('Error loading staking position:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadPosition().finally(() => setIsLoading(false));

    // Refresh position every minute
    const interval = setInterval(loadPosition, 60000);
    return () => clearInterval(interval);
  }, [userAddress]);

  const handleClaimRewards = async () => {
    setIsClaimingRewards(true);
    try {
      await LiquidStakingService.claimRewards(userAddress);
      await loadPosition();
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setIsClaimingRewards(false);
    }
  };

  const formatTimeLeft = (unlockTime: number) => {
    const now = Date.now() / 1000;
    const timeLeft = unlockTime - now;
    
    if (timeLeft <= 0) return 'Unlocked';

    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Your Position
      </h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Staked Amount
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {position?.amount ? formatUnits(position.amount, 18) : '0'} stROOT
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Unlock Time
          </div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            {position?.unlockTime ? formatTimeLeft(position.unlockTime) : 'N/A'}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Pending Rewards
          </div>
          <div className="text-xl font-bold text-green-500">
            {position?.rewards ? formatUnits(position.rewards, 18) : '0'} ROOT
          </div>
          {position?.rewards && parseFloat(position.rewards) > 0 && (
            <button
              onClick={handleClaimRewards}
              disabled={isClaimingRewards}
              className={`mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isClaimingRewards
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isClaimingRewards ? 'Claiming...' : 'Claim Rewards'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 