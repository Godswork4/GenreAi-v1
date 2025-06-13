import { HDNodeWallet } from 'ethers';
import { Keyring } from '@polkadot/keyring';
import { mnemonicToMiniSecret, cryptoWaitReady } from '@polkadot/util-crypto';

const DEMO_MNEMONIC = 'deal rival shrimp damp smooth fit soup umbrella marble nasty win desk brisk other elephant bunker cereal fog casual student online any midnight absent';

class DemoWalletService {
  private static instance: DemoWalletService;
  private wallet: HDNodeWallet | null = null;
  private polkadotAccount: any = null;
  private isInitialized = false;

  private constructor() {
    // Don't initialize in constructor, wait for explicit initialization
  }

  public static getInstance(): DemoWalletService {
    if (!DemoWalletService.instance) {
      DemoWalletService.instance = new DemoWalletService();
    }
    return DemoWalletService.instance;
  }

  public async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing demo wallet...');
      
      // Wait for WASM to be ready
      await cryptoWaitReady();
      console.log('WASM initialized successfully');

      // Initialize EVM wallet
      this.wallet = HDNodeWallet.fromPhrase(DEMO_MNEMONIC);
      console.log('EVM wallet initialized');

      // Initialize Polkadot account
      const keyring = new Keyring({ type: 'sr25519' });
      this.polkadotAccount = keyring.addFromSeed(
        mnemonicToMiniSecret(DEMO_MNEMONIC)
      );
      console.log('Polkadot account initialized');

      this.isInitialized = true;
      console.log('Demo wallet initialization complete');
    } catch (error) {
      console.error('Failed to initialize demo wallet:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Demo wallet not initialized. Call initialize() first.');
    }
  }

  public getAddress(): string | null {
    this.ensureInitialized();
    return this.wallet?.address || null;
  }

  public getPolkadotAddress(): string | null {
    this.ensureInitialized();
    return this.polkadotAccount?.address || null;
  }

  public async signTransaction(transaction: any): Promise<string> {
    this.ensureInitialized();
    if (!this.wallet) {
      throw new Error('Demo wallet not initialized');
    }
    return await this.wallet.signTransaction(transaction);
  }

  public async signMessage(message: string): Promise<string> {
    this.ensureInitialized();
    if (!this.wallet) {
      throw new Error('Demo wallet not initialized');
    }
    return await this.wallet.signMessage(message);
  }
}

// Export the singleton instance
export const demoWalletService = DemoWalletService.getInstance();