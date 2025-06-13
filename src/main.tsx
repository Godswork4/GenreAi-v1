import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { initializeWeb3 } from './lib/web3-setup';
import { demoWalletService } from './services/demoWalletService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDemoStore } from './store/demoStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initApp = async () => {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  const renderLoading = (message: string) => {
    root.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #0B0B14; color: white;">
        <div style="text-align: center;">
          <div style="border: 4px solid #4D4DFF; border-top-color: transparent; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
          <h2 style="margin: 0; font-size: 24px; color: #00E5FF;">${message}</h2>
        </div>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;
  };

  try {
    renderLoading('Initializing application...');
    
    // Step 1: Initialize WASM and wait for crypto
    await cryptoWaitReady();
    console.log('WASM initialization complete');
    
    // Add a small delay to ensure WASM is fully initialized
    await delay(1000);
    
    // Step 2: Initialize demo wallet
    renderLoading('Initializing wallet...');
    await demoWalletService.initialize();
    console.log('Demo wallet initialization complete');
    
    // Enable demo mode by default
    useDemoStore.getState().setDemoMode(true);
    
    // Add a small delay between initializations
    await delay(500);
    
    // Step 3: Initialize Web3
    renderLoading('Connecting to network...');
    await initializeWeb3();
    console.log('Web3 initialization complete');
    
    // Step 4: Render the application
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
    root.innerHTML = `
      <div style="color: red; padding: 20px; text-align: center; background: #0B0B14;">
        <h1 style="color: #FF4D4D;">Initialization Error</h1>
        <p style="color: white;">Failed to initialize the application. Please refresh the page to try again.</p>
        <pre style="background: #1A1A2E; padding: 15px; border-radius: 8px; color: #FF4D4D; text-align: left; margin: 20px;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </pre>
        <button onclick="window.location.reload()" style="background: #4D4DFF; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
  }
};

// Start initialization
initApp();
