import { cryptoWaitReady } from '@polkadot/util-crypto';

export const initWasm = async () => {
  try {
    await cryptoWaitReady();
    console.log('WASM initialized successfully');
  } catch (error) {
    console.error('Failed to initialize WASM:', error);
    throw error;
  }
}; 