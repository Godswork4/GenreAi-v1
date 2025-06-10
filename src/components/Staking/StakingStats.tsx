import React from 'react';
import { formatUnits } from 'ethers';

interface StakingStatsProps {
  totalStaked?: string;
  apy?: number;
  exchangeRate?: string;
}

export const StakingStats: React.FC<StakingStatsProps> = ({
  totalStaked,
  apy = 0,
  exchangeRate = '0',
}) => {
  const formattedTotalStaked = totalStaked
    ? parseFloat(formatUnits(totalStaked, 18)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : '0';

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Staking Statistics
      </h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Value Locked
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formattedTotalStaked} ROOT
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Current APY
          </div>
          <div className="text-2xl font-bold text-green-500">
            {apy.toFixed(2)}%
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Exchange Rate
          </div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            1 stROOT = {exchangeRate ? formatUnits(exchangeRate, 18) : '0'} ROOT
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Lock Period
          </div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            7 days
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Cooldown Period
          </div>
          <div className="text-base font-medium text-gray-900 dark:text-white">
            24 hours
          </div>
        </div>
      </div>
    </div>
  );
}; 