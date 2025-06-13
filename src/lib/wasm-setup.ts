import { cryptoWaitReady } from '@polkadot/util-crypto';

let isWasmInitialized = false;

export const setupWasm = async () => {
  if (isWasmInitialized) {
    console.log('WASM already initialized');
    return;
  }

  try {
    console.log('Starting WASM initialization...');
    // This will initialize WASM internally
    await cryptoWaitReady();
    isWasmInitialized = true;
    console.log('WASM initialization successful');
  } catch (error) {
    console.error('Failed to initialize WASM:', error);
    isWasmInitialized = false;
    throw new Error(`WASM initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const isWasmReady = () => isWasmInitialized;

// Add a helper to reset WASM state if needed
export const resetWasmState = () => {
  isWasmInitialized = false;
  console.log('WASM state reset');
}; 