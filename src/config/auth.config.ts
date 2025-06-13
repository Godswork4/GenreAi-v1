import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { QueryClient } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { rootNetwork } from './web3.config';

// Environment configuration
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const FUTUREPASS_CLIENT_ID = import.meta.env.VITE_FUTURE_PASS_CLIENT_ID;
const AUTH_REDIRECT_URI = import.meta.env.VITE_APP_URL || 'http://localhost:3000';
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!FUTUREPASS_CLIENT_ID) {
  console.error('Missing VITE_FUTURE_PASS_CLIENT_ID environment variable');
}

if (!WALLET_CONNECT_PROJECT_ID) {
  console.error('Missing VITE_WALLET_CONNECT_PROJECT_ID environment variable');
}

// Create the auth client
export const authClient = new FutureverseAuthClient({
  clientId: FUTUREPASS_CLIENT_ID || '',
  environment: ENVIRONMENT as 'development' | 'staging' | 'production',
  redirectUri: `${AUTH_REDIRECT_URI}/auth/callback`,
  signInFlow: 'redirect',
});

// Create query client
export const queryClient = new QueryClient();

// Create Wagmi configuration
export const getWagmiConfig = async () => {
  return createWagmiConfig({
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID || '',
    authClient,
    ssr: false,
    chains: [rootNetwork],
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
}; 