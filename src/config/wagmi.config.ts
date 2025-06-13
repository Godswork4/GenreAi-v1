import { http } from 'viem';
import { createConfig } from 'wagmi';
import { rootNetwork } from './web3.config';
import { LocalWalletConnector } from '../services/walletConnector';

// Create Wagmi config with Root Network
export const config = createConfig({
  chains: [rootNetwork],
  connectors: [
    LocalWalletConnector()
  ],
  transports: {
    [rootNetwork.id]: http('https://porcini.rootnet.app')
  },
}); 