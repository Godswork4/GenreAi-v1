import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { defineChain } from 'viem';
import { QueryClient } from '@tanstack/react-query';

// Environment variables
const clientId = import.meta.env.VITE_FUTURE_PASS_CLIENT_ID;
const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const futurePassApiUrl = import.meta.env.VITE_FUTUREPASS_API_URL;
const rootRpcUrl = import.meta.env.VITE_TRN_RPC_URL;
const rootChainId = Number(import.meta.env.VITE_ROOT_CHAIN_ID);

if (!clientId) {
  throw new Error('Missing VITE_FUTURE_PASS_CLIENT_ID environment variable');
}

if (!walletConnectProjectId) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID environment variable');
}

if (!futurePassApiUrl) {
  throw new Error('Missing VITE_FUTUREPASS_API_URL environment variable');
}

if (!rootRpcUrl) {
  throw new Error('Missing VITE_TRN_RPC_URL environment variable');
}

if (!rootChainId) {
  throw new Error('Missing VITE_ROOT_CHAIN_ID environment variable');
}

// Define Root Network chain
export const rootNetwork = defineChain({
  id: rootChainId,
  name: 'The Root Network',
  network: 'root',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: [rootRpcUrl.replace('wss://', 'https://')],
      webSocket: [rootRpcUrl],
    },
    public: {
      http: [rootRpcUrl.replace('wss://', 'https://')],
      webSocket: [rootRpcUrl],
    },
  },
});

// Get the base URL for redirects
const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  
  return import.meta.env.VITE_APP_URL || window.location.origin;
};

// Initialize the Futureverse Auth Client
export const authClient = new FutureverseAuthClient({
  clientId,
  environment: futurePassApiUrl.includes('dev') ? 'development' : 'production',
  redirectUri: `${getBaseUrl()}/auth/callback`,
});

// Initialize the Query Client for data fetching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create Wagmi configuration
export const getWagmiConfig = async () => {
  return createWagmiConfig({
    walletConnectProjectId,
    authClient,
    ssr: false,
    chains: [rootNetwork],
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
}; 