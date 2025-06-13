import { create } from 'zustand';
import { demoWalletService } from '../services/demoWalletService';
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
  setUser: (user: User) => void;
  login: () => Promise<void>;
  loginWithDemo: () => Promise<void>;
  loginWithFuturePass: () => Promise<void>;
  logout: () => Promise<void>;
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
      await authClient.signIn({ type: 'futureverseCustodialEmail' });
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
      const address = demoWalletService.getAddress();
      const polkadotAddress = demoWalletService.getPolkadotAddress();
      
      if (!address || !polkadotAddress) {
        throw new Error('Failed to initialize demo wallet');
      }
      
      const demoUser: User = {
        email: 'demo@genre.ai',
        demoWalletAddress: address,
        isDemo: true
      };
      
      // Set demo mode in demo store
      useDemoStore.getState().setDemoMode(true);
      
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
      useDemoStore.getState().setDemoMode(false);
    }
  },

  loginWithFuturePass: async () => {
    set({ isLoading: true, error: null });
    try {
      await authClient.signIn({ type: 'futureverseCustodialEmail' });
      const userSession = await authClient.userSession;
      
      if (!userSession) {
        throw new Error('Failed to get FuturePass account');
      }

      const user: User = {
        futurePassAddress: userSession.futurepass,
        email: userSession.user?.email,
        isDemo: false
      };

      // Ensure demo mode is off
      useDemoStore.getState().setDemoMode(false);

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
      await authClient.signOutPass();
      // Reset demo mode
      useDemoStore.getState().setDemoMode(false);
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