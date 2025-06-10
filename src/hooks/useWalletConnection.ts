import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { rootNetwork } from '../config/web3.config';

export const useWalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector({
      chains: [rootNetwork],
      options: {
        name: 'Root Network Wallet',
        shimDisconnect: true,
      },
    }),
  });
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        try {
          setIsLoading(true);
          await connect();
        } catch (error) {
          console.error('Failed to connect:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, connect]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    address,
    isConnected,
    isLoading,
    connect: handleConnect,
    disconnect
  };
}; 