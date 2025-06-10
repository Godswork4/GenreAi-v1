import { useEffect, useState } from 'react';
import { useAuth } from '../store/authStore';

interface AccountHook {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

export const useAccount = (): AccountHook => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    setIsLoading(false);
  }, [user]);

  return {
    address: user?.futurePassAddress || null,
    isConnected: !!user,
    isLoading
  };
}; 