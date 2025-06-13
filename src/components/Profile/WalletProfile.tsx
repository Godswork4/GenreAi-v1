import React, { useEffect, useState } from 'react';
import { useDemoStore } from '../../store/demoStore';
import { getPolkadotApi } from '../../lib/web3-setup';
import { formatBalance } from '@polkadot/util';

interface TokenBalance {
  symbol: string;
  balance: string;
}

export const WalletProfile: React.FC = () => {
  const { isDemoMode, demoWallet } = useDemoStore();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isDemoMode || !demoWallet?.polkadotAddress) return;

      try {
        const api = getPolkadotApi();
        const account = await api.query.system.account(demoWallet.polkadotAddress);
        const rootBalance = formatBalance(account.data.free, { 
          withUnit: 'ROOT',
          decimals: 18 
        });

        setBalances([
          { symbol: 'ROOT', balance: rootBalance }
        ]);
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [isDemoMode, demoWallet]);

  if (!isDemoMode || !demoWallet) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Please enable demo mode to view wallet profile</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Wallet Profile</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">EVM Address</h3>
          <p className="font-mono bg-gray-100 p-2 rounded break-all">
            {demoWallet.evmAddress || 'Not available'}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Polkadot Address</h3>
          <p className="font-mono bg-gray-100 p-2 rounded break-all">
            {demoWallet.polkadotAddress || 'Not available'}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Token Balances</h3>
          {isLoading ? (
            <p>Loading balances...</p>
          ) : (
            <div className="space-y-2">
              {balances.map((token) => (
                <div key={token.symbol} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span className="font-semibold">{token.symbol}</span>
                  <span>{token.balance}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <a 
            href="https://faucet.rootnet.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Request ROOT Testnet Tokens
          </a>
        </div>
      </div>
    </div>
  );
}; 