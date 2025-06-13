import { createConfig } from 'wagmi'
import { http } from 'viem'
import { defineChain } from 'viem'
import { LocalWalletConnector } from '../services/walletConnector'

// Define Root Network chain
export const rootNetwork = defineChain({
  id: 7672,
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
      webSocket: ['wss://porcini.rootnet.app/ws'],
    },
    public: {
      http: ['https://porcini.rootnet.app'],
      webSocket: ['wss://porcini.rootnet.app/ws'],
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

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [rootNetwork],
  connectors: [
    LocalWalletConnector()
  ],
  transports: {
    [rootNetwork.id]: http()
  }
});

// Polkadot and FuturePass configuration
export const config = {
  // EVM config
  wagmi: wagmiConfig,
  
  // Polkadot config
  polkadotEndpoint: 'wss://porcini.rootnet.app/ws',
  
  // FuturePass config
  futurepassAppId: process.env.VITE_FUTUREPASS_APP_ID || '',
  environment: process.env.VITE_ENVIRONMENT || 'testnet',
  
  // Root Network config
  rootNetwork
};