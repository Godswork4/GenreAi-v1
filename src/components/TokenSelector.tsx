import React from 'react';
import { TokenIcon } from './TokenIcon';

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  assetId: number;
  balance: string;
}

interface TokenSelectorProps {
  selectedToken: Token | null;
  tokens: Token[];
  onSelect: (token: Token) => void;
  disabled?: boolean;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  tokens,
  onSelect,
  disabled = false
}) => {
  return (
    <div className="relative">
      <select
        className={`appearance-none w-full pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-600'
        }`}
        value={selectedToken?.symbol || ''}
        onChange={(e) => {
          const token = tokens.find(t => t.symbol === e.target.value);
          if (token) onSelect(token);
        }}
        disabled={disabled}
      >
        <option value="" disabled>
          Select
        </option>
        {tokens.map((token) => (
          <option key={token.symbol} value={token.symbol}>
            {token.symbol}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
        {selectedToken && (
          <TokenIcon
            token={selectedToken.symbol as 'ROOT' | 'XRP' | 'USDT' | 'ASTO'}
            size="sm"
          />
        )}
      </div>
      
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}; 