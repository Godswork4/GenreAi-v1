import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { defineChain } from 'viem';
import { QueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from './environment';
import { FUTUREPASS_CONFIG } from './futurepass.config';
import type { Environment } from '@futureverse/auth-react/auth';

// Define Root Network chain
export const rootNetwork = defineChain({
  id: ENV_CONFIG.ROOT_NETWORK_CHAIN_ID,
  name: 'The Root Network Testnet',
  network: 'porcini',
  nativeCurrency: {
    decimals: 18,
    name: 'ROOT',
    symbol: 'ROOT',
  },
  rpcUrls: {
    default: {
      http: ['https://porcini.rootnet.app'],
      webSocket: [ENV_CONFIG.ROOT_NETWORK_RPC_URL],
    },
    public: {
      http: ['https://porcini.rootnet.app'],
      webSocket: [ENV_CONFIG.ROOT_NETWORK_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Root Network Explorer',
      url: 'https://explorer.rootnet.app',
    },
  },
  testnet: true,
});

// Initialize the Futureverse Auth Client
export const authClient = new FutureverseAuthClient({
  clientId: FUTUREPASS_CONFIG.CLIENT_ID,
  environment: FUTUREPASS_CONFIG.ENVIRONMENT as Environment,
  redirectUri: FUTUREPASS_CONFIG.AUTH_CONFIG.redirect_uri,
  signInFlow: 'redirect'
});

// Create wagmi config getter function
export const getWagmiConfig = () => createWagmiConfig({
  chains: [rootNetwork],
  walletConnectProjectId: ENV_CONFIG.WALLET_CONNECT_PROJECT_ID,
  storage: createStorage({
    storage: cookieStorage,
  }),
  authClient
});

// Initialize the query client
export const queryClient = new QueryClient(); 