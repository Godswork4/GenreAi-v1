import { create } from 'zustand';
import { DemoWalletService } from '../services/demoWalletService';
import { useAccount, useConnect, useDisconnect } from '@futureverse/auth-react/wagmi';
import { authClient } from '../config/auth';
import { useDemoStore } from './demoStore';

interface User {
  email?: string;
  futurePassAddress?: string;
  demoWalletAddress?: string;
  isDemo: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  loginWithDemo: () => Promise<void>;
  loginWithFuturePass: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  userEmail: null,
  isLoading: false,
  error: null,

  setUser: (user: User) => {
    set({ 
      user, 
      isAuthenticated: true,
      userEmail: user.email || null,
      error: null 
    });
  },

  login: async () => {
    set({ isLoading: true, error: null });
    try {
      await authClient.signIn();
      // The actual user setting will happen in the callback
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false 
      });
    }
  },

  loginWithDemo: async () => {
    set({ isLoading: true, error: null });
    try {
      // Initialize demo wallet
      await DemoWalletService.initialize();
      const wallet = await DemoWalletService.getWallet();
      
      const demoUser: User = {
        email: 'demo@genre.ai',
        demoWalletAddress: wallet.address,
        isDemo: true
      };
      
      // Set demo mode in demo store
      await useDemoStore.getState().setDemoMode(true);
      
      // Set auth state
      set({ 
        user: demoUser,
        isAuthenticated: true,
        userEmail: demoUser.email,
        isLoading: false 
      });
    } catch (error) {
      console.error('Demo login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create demo wallet',
        isLoading: false 
      });
      // Reset demo mode on error
      await useDemoStore.getState().setDemoMode(false);
    }
  },

  loginWithFuturePass: async () => {
    set({ isLoading: true, error: null });
    try {
      await authClient.signIn();
      const account = await authClient.getAccount();
      
      if (!account) {
        throw new Error('Failed to get FuturePass account');
      }

      const user: User = {
        futurePassAddress: account.address,
        email: account.email,
        isDemo: false
      };

      // Ensure demo mode is off
      await useDemoStore.getState().setDemoMode(false);

      set({
        user,
        isAuthenticated: true,
        userEmail: user.email || null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('FuturePass login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to login with FuturePass',
        isLoading: false 
      });
    }
  },

  logout: async () => {
    try {
      await authClient.signOut();
      // Reset demo mode
      await useDemoStore.getState().setDemoMode(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false,
        userEmail: null,
        isLoading: false,
        error: null 
      });
    }
  }
}));