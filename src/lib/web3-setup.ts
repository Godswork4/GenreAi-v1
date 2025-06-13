import { config } from '../config/web3.config';
import { walletService } from '../services/wallet';
import { demoWalletService } from '../services/demoWalletService';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable } from '@polkadot/extension-dapp';
import { cryptoWaitReady } from '@polkadot/util-crypto';

let polkadotApi: ApiPromise | null = null;
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeWeb3 = async () => {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // If already initialized, return immediately
  if (isInitialized) {
    console.log('Web3 already initialized');
    return true;
  }

  // Create new initialization promise
  initializationPromise = (async () => {
    try {
      console.log('Starting Web3 initialization...');

      // Step 1: Initialize WASM and wait for crypto
      console.log('Initializing WASM...');
      await cryptoWaitReady();
      await delay(500); // Add small delay after WASM init
      console.log('WASM initialized successfully');

      // Step 2: Initialize demo wallet service
      console.log('Initializing demo wallet...');
      await demoWalletService.initialize();
      await delay(500); // Add small delay after wallet init
      console.log('Demo wallet initialized');

      // Step 3: Initialize Polkadot extensions
      console.log('Initializing Polkadot extensions...');
      try {
        const injectedExtensions = await web3Enable('GenreAI DeFi');
        console.log('Polkadot extensions initialized:', injectedExtensions.length ? 'found' : 'none found');
      } catch (error) {
        console.warn('Failed to initialize Polkadot extensions:', error);
        // Continue anyway as extensions are optional
      }

      // Step 4: Setup Polkadot API
      console.log('Setting up Polkadot API...');
      const wsProvider = new WsProvider(config.polkadotEndpoint);
      polkadotApi = await ApiPromise.create({ 
        provider: wsProvider,
        noInitWarn: true
      });
      await polkadotApi.isReady;
      console.log('Polkadot API initialized');

      // Step 5: Initialize EVM wallet
      console.log('Initializing EVM wallet...');
      const walletResult = await walletService.connect();
      if (walletResult.isNewWallet) {
        console.log('New EVM wallet generated! Please save these credentials:');
        console.log('Address:', walletResult.address);
      }
      console.log('EVM wallet initialized');
      
      isInitialized = true;
      console.log('Web3 initialization complete');
      return true;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      isInitialized = false;
      // Clean up if initialization fails
      if (polkadotApi) {
        await polkadotApi.disconnect();
        polkadotApi = null;
      }
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

export const getPolkadotApi = () => {
  if (!polkadotApi || !isInitialized) {
    throw new Error('Polkadot API not initialized. Call initializeWeb3() first.');
  }
  return polkadotApi;
}; 