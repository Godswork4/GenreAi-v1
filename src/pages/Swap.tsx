import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletConnect } from '../components/WalletConnect';
import { SwapForm } from '../components/SwapForm';
import { ClipboardIcon, CheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const Swap = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Swap Tokens</h1>

      {/* Wallet Info Bar */}
      <div className="flex items-center justify-between bg-[#1A1B1F] rounded-xl px-4 py-3 mb-8 border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
            {address ? address : 'No address'}
          </span>
          <button
            onClick={() => {
              if (address) {
                navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }
            }}
            className="hover:text-blue-400"
            title="Copy address"
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
          </button>
          {isConnected && (
            <button
              onClick={() => disconnect()}
              className="ml-2 px-2 py-1 text-xs text-red-400 border border-red-400 rounded hover:bg-red-400/10 flex items-center gap-1"
              title="Disconnect wallet"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" /> Disconnect
            </button>
          )}
        </div>
        {!isConnected && (
          <WalletConnect />
        )}
      </div>

      {/* Swap UI */}
      <div className="max-w-lg mx-auto">
        <SwapForm />
      </div>
    </div>
  );
};

export default Swap;