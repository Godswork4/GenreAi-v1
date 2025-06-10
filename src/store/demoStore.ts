import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DemoWalletService } from '../services/demoWalletService';

interface DemoStore {
  isDemoMode: boolean;
  demoWallet: {
    address: string;
    privateKey: string;
  } | null;
  setDemoMode: (isDemo: boolean) => Promise<void>;
  createDemoWallet: () => Promise<void>;
}

export const useDemoStore = create<DemoStore>()(
  devtools(
    (set, get) => ({
      isDemoMode: false,
      demoWallet: null,
      
      setDemoMode: async (isDemo) => {
        if (isDemo && !get().demoWallet) {
          await get().createDemoWallet();
        }
        if (!isDemo) {
          await DemoWalletService.disconnect();
          set({ demoWallet: null });
        }
        set({ isDemoMode: isDemo });
      },
      
      createDemoWallet: async () => {
        try {
          await DemoWalletService.initialize();
          const wallet = await DemoWalletService.getWallet();
          set({
            demoWallet: {
              address: wallet.address,
              privateKey: wallet.privateKey
            }
          });
        } catch (error) {
          console.error('Failed to create demo wallet:', error);
          throw error;
        }
      }
    })
  )
);