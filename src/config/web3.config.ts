import { createConfig } from '@wagmi/core'
import { http } from 'viem'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ENV_CONFIG } from './environment'

// Root Network Configuration
export const rootNetwork = {
  id: 7672,
  name: 'Root Network Porcini Testnet',
  network: 'root-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: ['https://porcini.rootnet.app/archive'],
      webSocket: [ENV_CONFIG.TRN_RPC_URL]
    },
    public: {
      http: ['https://porcini.rootnet.app/archive'],
      webSocket: [ENV_CONFIG.TRN_RPC_URL]
    },
  },
  blockExplorers: {
    default: {
      name: 'Root Network Explorer',
      url: 'https://explorer.rootnet.live',
    },
  },
  testnet: true,
  type: 'evm'
} as const;

// Export networks array
export const networks = [rootNetwork] as [typeof rootNetwork, ...typeof rootNetwork[]];

// Create Wagmi Config
export const config = createConfig({
  chains: [rootNetwork],
  transports: {
    [rootNetwork.id]: http()
  }
})

// Create and export WagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [rootNetwork],
  projectId: ENV_CONFIG.WALLET_CONNECT_PROJECT_ID
})