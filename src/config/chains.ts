import { defineChain } from 'viem';

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