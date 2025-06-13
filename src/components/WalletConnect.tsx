import { useConnect, useAccount, useDisconnect } from 'wagmi';

export const WalletConnect = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  const handleConnect = async () => {
    try {
      // Get the local wallet connector
      const connector = connectors.find(c => c.id === 'localWallet');
      if (!connector) {
        throw new Error('Local wallet connector not found');
      }
      await connect({ connector });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <button
      onClick={isConnected ? () => disconnect() : handleConnect}
      className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
    >
      {isConnected ? 'Disconnect' : 'Connect Demo Wallet'}
    </button>
  );
}; 