import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { demoWalletService } from '../services/demoWalletService';

interface DemoStore {
  isDemoMode: boolean;
  demoWallet: {
    evmAddress: string | null;
    polkadotAddress: string | null;
  } | null;
  setDemoMode: (isDemo: boolean) => void;
}

export const useDemoStore = create<DemoStore>()(
  devtools(
    (set) => ({
      isDemoMode: false,
      demoWallet: null,
      
      setDemoMode: (isDemo) => {
        if (isDemo) {
          set({
            isDemoMode: true,
            demoWallet: {
              evmAddress: demoWalletService.getAddress(),
              polkadotAddress: demoWalletService.getPolkadotAddress()
            }
          });
        } else {
          set({
            isDemoMode: false,
            demoWallet: null
          });
        }
      }
    })
  )
);