import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProviders } from './providers/AuthProviders';
import { AppRoutes } from './routes';
import { initializeCrypto } from './utils/crypto';
import { testSupabaseConnection } from './utils/test-supabase';
import './App.css';

function App() {
  useEffect(() => {
    const init = async () => {
      await initializeCrypto();
    };
    init();
  }, []);

  useEffect(() => {
    testSupabaseConnection().then(isConnected => {
      if (!isConnected) {
        console.error('Failed to connect to Supabase');
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProviders>
          <AppRoutes />
        </AuthProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;