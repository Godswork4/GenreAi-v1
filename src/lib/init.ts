import { cryptoWaitReady } from '@polkadot/util-crypto';
import { setupWasm } from './wasm-setup';
import { initializeWeb3 } from './web3-setup';

let isAppInitialized = false;

export const initializeApp = async () => {
  if (isAppInitialized) {
    console.log('App already initialized');
    return;
  }

  try {
    console.log('Starting app initialization...');

    // Step 1: Initialize WASM
    console.log('Initializing WASM...');
    await setupWasm();
    
    // Step 2: Wait for crypto
    console.log('Waiting for crypto...');
    await cryptoWaitReady();
    
    // Add a small delay to ensure everything is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Initialize Web3
    console.log('Initializing Web3...');
    await initializeWeb3();

    isAppInitialized = true;
    console.log('App initialization complete');
  } catch (error) {
    console.error('App initialization failed:', error);
    isAppInitialized = false;
    throw error;
  }
};

export const isInitialized = () => isAppInitialized;

export const resetInitialization = () => {
  isAppInitialized = false;
}; 