import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { FutureverseAuthProvider } from '@futureverse/auth-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { authClient } from './config/auth';
import { FuturePassAuth } from './components/Auth/FuturePassAuth';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initializeCrypto } from './utils/crypto';
import { initializeWeb3 } from './lib/web3-setup';
import { testSupabaseConnection } from './lib/supabase';
import { queryClient } from './lib/query-client';
import { config } from './config/wagmi.config';
import './App.css';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Step 1: Initialize Web3 (includes WASM and crypto)
        await initializeWeb3();
        console.log('Web3 initialized successfully');
        
        // Step 2: Initialize app crypto utilities
        await initializeCrypto();
        console.log('Crypto utilities initialized successfully');
        
        // Step 3: Test Supabase connection (will use mock in development)
        const result = await testSupabaseConnection();
        if (!result.success) {
          console.warn('Supabase connection failed:', result.error);
          // Continue anyway since we have mock service
        } else {
          console.log('Supabase connection successful');
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize application');
      }
    };
    
    init();

    // Cleanup function
    return () => {
      // Add any cleanup needed
    };
  }, []);

  if (initError) {
    return (
      <div className="error-container">
        <h1>Initialization Error</h1>
        <p>{initError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="loading-container">
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <FutureverseAuthProvider authClient={authClient}>
            <FuturePassAuth />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </FutureverseAuthProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;