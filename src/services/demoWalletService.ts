import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, randomAsU8a } from '@polkadot/util-crypto';

interface DemoWallet {
  address: string;
  privateKey: string;
}

export class DemoWalletService {
  private static wallet: DemoWallet | null = null;
  private static keyring: Keyring | null = null;
  private static isInitializing = false;

  static async initialize(): Promise<void> {
    if (this.wallet || this.isInitializing) return;

    try {
      this.isInitializing = true;

      // Wait for crypto to be ready
      await cryptoWaitReady();
      
      // Create keyring instance
      this.keyring = new Keyring({ 
        type: 'sr25519',
        ss58Format: 42 // Root Network format
      });
      
      // Generate secure random seed
      const seed = randomAsU8a(32);
      
      // Generate new keypair for demo wallet
      const keypair = this.keyring.addFromSeed(
        seed,
        { name: 'demo' },
        'sr25519'
      );
      
      this.wallet = {
        address: keypair.address,
        privateKey: Buffer.from(seed).toString('hex')
      };

      console.log('Demo wallet initialized:', this.wallet.address);
    } catch (error) {
      console.error('Failed to initialize demo wallet:', error);
      this.disconnect();
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  static async getWallet(): Promise<DemoWallet> {
    if (!this.wallet) {
      await this.initialize();
    }
    return this.wallet!;
  }

  static async getBalance(): Promise<string> {
    // Return demo balance
    return '1000000000000000000000'; // 1000 tokens
  }

  static async getTokenBalance(tokenId: string): Promise<string> {
    // Return demo token balances
    const balances: Record<string, string> = {
      trn: '1000000000000000000000', // 1000 TRN
      root: '500000000000000000000', // 500 ROOT
      usdt: '10000000000' // 10000 USDT (6 decimals)
    };
    
    return balances[tokenId.toLowerCase()] || '0';
  }

  static async signTransaction(tx: any): Promise<string> {
    if (!this.wallet || !this.keyring) {
      throw new Error('Demo wallet not initialized');
    }

    try {
      // Simulate transaction signing
      const txHash = 'demo-tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      return txHash;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  static async requestTestnetTokens(): Promise<void> {
    // Simulate requesting testnet tokens
    console.log('Testnet tokens requested for demo wallet');
  }

  static async disconnect(): Promise<void> {
    this.wallet = null;
    this.keyring = null;
    this.isInitializing = false;
  }
}