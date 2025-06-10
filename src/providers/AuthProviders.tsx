import { PropsWithChildren, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  FutureverseAuthProvider,
  FutureverseWagmiProvider,
} from '@futureverse/auth-react';
import { AuthUiProvider, type ThemeConfig } from '@futureverse/auth-ui';
import { authClient, queryClient, getWagmiConfig } from '../config/auth';

// Theme configuration
const themeConfig: ThemeConfig = {
  defaultAuthOption: 'web3',
  showCloseButton: true,
  colors: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    background: '#1a1b1e',
    surface: '#27272a',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    border: '#3f3f46',
    error: '#ef4444',
    success: '#22c55e',
  },
  font: {
    family: 'Inter, system-ui, sans-serif',
    size: {
      base: '16px',
      small: '14px',
      large: '18px',
    },
    weight: {
      normal: '400',
      medium: '500',
      bold: '600',
    },
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  images: {
    logo: '/logo.svg', // Make sure this exists in your public folder
  }
};

export const AuthProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FutureverseWagmiProvider getWagmiConfig={getWagmiConfig}>
        <FutureverseAuthProvider authClient={authClient}>
          <AuthUiProvider authClient={authClient} themeConfig={themeConfig}>
            {children}
          </AuthUiProvider>
        </FutureverseAuthProvider>
      </FutureverseWagmiProvider>
    </QueryClientProvider>
  );
}; 