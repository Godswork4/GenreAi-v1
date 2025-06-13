import React from 'react';
import {
  FutureverseAuthProvider,
  FutureverseWagmiProvider,
} from '@futureverse/auth-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { State } from 'wagmi';
import { authClient, getWagmiConfig, queryClient } from '../config/auth.config';

interface ProvidersProps {
  children: React.ReactNode;
  initialWagmiState?: State;
}

export function AuthProviders({ children, initialWagmiState }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <FutureverseWagmiProvider
        getWagmiConfig={getWagmiConfig}
        initialState={initialWagmiState}
      >
        <FutureverseAuthProvider authClient={authClient}>
          {children}
        </FutureverseAuthProvider>
      </FutureverseWagmiProvider>
    </QueryClientProvider>
  );
} 