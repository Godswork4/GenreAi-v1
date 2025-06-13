import { createConnector } from 'wagmi';
import { walletService } from './wallet';
import { rootNetwork } from '../config/web3.config';

export const LocalWalletConnector = () => {
  return createConnector((config) => ({
    id: 'localWallet',
    name: 'Local Wallet',
    type: 'local',
    getProvider() {
      return Promise.resolve(walletService.provider);
    },
    connect: async () => {
      const result = await walletService.connect();
      return {
        accounts: [`0x${result.address.slice(2)}`] as const,
        chainId: config.chains[0]?.id ?? rootNetwork.id
      };
    },
    disconnect: async () => {
      walletService.disconnect();
    },
    getAccounts: async () => {
      const address = walletService.address;
      return address ? [`0x${address.slice(2)}`] as const : [];
    },
    getChainId: async () => {
      return config.chains[0]?.id ?? rootNetwork.id;
    },
    isAuthorized: async () => {
      return Boolean(walletService.isConnected);
    },
    onAccountsChanged(accounts: string[]) {
      const formattedAccounts = accounts.map(addr => 
        addr.startsWith('0x') ? addr : `0x${addr}`
      ) as `0x${string}`[];
      config.emitter.emit('change', { accounts: formattedAccounts });
    },
    onChainChanged(chainId: string) {
      config.emitter.emit('change', { chainId: parseInt(chainId, 16) });
    },
    onDisconnect() {
      config.emitter.emit('disconnect');
    }
  }));
}; 