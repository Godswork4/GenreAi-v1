import { Keyring } from '@polkadot/keyring';
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { RootNetworkService } from './rootNetworkService';

interface WalletInfo {
  address: string;
  mnemonic: string;
  publicKey: string;
}

export class WalletService {
  private static keyring: Keyring | null = null;

  static async initialize(): Promise<void> {
    await cryptoWaitReady();
    this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
  }

  static async createNewWallet(): Promise<WalletInfo> {
    try {
      await this.initialize();
      
      // Generate a new mnemonic
      const mnemonic = mnemonicGenerate();
      
      // Create keypair from mnemonic
      const keypair = this.keyring!.addFromMnemonic(mnemonic);
      
      return {
        address: keypair.address,
        mnemonic,
        publicKey: keypair.publicKey.toString()
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  static async importWallet(mnemonic: string): Promise<WalletInfo> {
    try {
      await this.initialize();
      
      const keypair = this.keyring!.addFromMnemonic(mnemonic);
      
      return {
        address: keypair.address,
        mnemonic,
        publicKey: keypair.publicKey.toString()
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  }

  static validateAddress(address: string): boolean {
    try {
      if (!this.keyring) return false;
      this.keyring.encodeAddress(address, 42);
      return true;
    } catch {
      return false;
    }
  }

  static async getBalances(address: string): Promise<Record<string, string>> {
    return await RootNetworkService.getTokenBalances(address);
  }

  static async requestFaucetTokens(address: string): Promise<void> {
    await RootNetworkService.requestTestnetTokens(address);
  }
}