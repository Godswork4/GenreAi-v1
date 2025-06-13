import { useEffect, useState } from 'react';
import { walletService } from '../services/wallet';

export const useWalletConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');

  const updateBalance = async () => {
    if (isConnected) {
      const newBalance = await walletService.getBalance();
      setBalance(newBalance);
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    setIsConnected(walletService.isConnected);
    setAddress(walletService.address);
    updateBalance();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        try {
          setIsLoading(true);
          const result = await walletService.connect();
          setIsConnected(result.isConnected);
          setAddress(result.address);
          await updateBalance();
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
  }, [isConnected]);

  // Set up balance polling
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(updateBalance, 10000); // Update balance every 10 seconds
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const result = await walletService.connect();
      setIsConnected(result.isConnected);
      setAddress(result.address);
      await updateBalance();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    walletService.disconnect();
    setIsConnected(false);
    setAddress(null);
    setBalance('0');
  };

  const clearWallet = () => {
    walletService.clearStoredWallet();
    setIsConnected(false);
    setAddress(null);
    setBalance('0');
  };

  return {
    address,
    isConnected,
    isLoading,
    balance,
    connect: handleConnect,
    disconnect: handleDisconnect,
    clearWallet
  };
}; 