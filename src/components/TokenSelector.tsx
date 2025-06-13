import React from 'react';
import { TokenIcon } from './TokenIcon';
import { Token } from './TokenIcon';

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
  show: boolean;
  onClose: () => void;
}

export const TokenSelector = ({ selectedToken, tokens, onSelect, show, onClose }: TokenSelectorProps) => {
  if (!show) return null;
  return (
    <div className="w-64 bg-[#181A20] rounded-2xl shadow-xl p-4 z-50 absolute left-0 top-10">
      <div className="font-semibold text-white mb-2 flex justify-between items-center">
        Select Token
        <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
      </div>
      <div className="space-y-2">
        {tokens.map(token => (
          <button
            key={token.symbol}
            onClick={() => onSelect(token)}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors ${selectedToken?.symbol === token.symbol ? 'bg-blue-900/60 text-blue-300' : 'hover:bg-gray-700/40 text-white'}`}
          >
            <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-base">{token.symbol}</span>
              <span className="text-xs text-gray-400">{token.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 