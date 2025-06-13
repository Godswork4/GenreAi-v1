import { ethers } from 'ethers';

const WALLET_STORAGE_KEY = 'genre_ai_wallet';
const RPC_URL = 'https://porcini.rootnet.app';

interface StoredWallet {
  privateKey: string;
  address: string;
  mnemonic: string;
}

class WalletService {
  private _provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private _isConnected: boolean = false;

  constructor() {
    this._provider = new ethers.JsonRpcProvider(RPC_URL);
  }

  private generateNewWallet(): StoredWallet {
    // Generate a new random wallet
    const randomWallet = ethers.Wallet.createRandom();
    
    return {
      privateKey: randomWallet.privateKey,
      address: randomWallet.address,
      mnemonic: randomWallet.mnemonic?.phrase || ''
    };
  }

  private saveWalletToStorage(wallet: StoredWallet) {
    try {
      const encryptedData = btoa(JSON.stringify(wallet));
      localStorage.setItem(WALLET_STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('Failed to save wallet:', error);
      throw error;
    }
  }

  private getWalletFromStorage(): StoredWallet | null {
    try {
      const encryptedData = localStorage.getItem(WALLET_STORAGE_KEY);
      if (!encryptedData) return null;
      
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      console.error('Failed to retrieve wallet:', error);
      return null;
    }
  }

  async connect() {
    try {
      let storedWallet = this.getWalletFromStorage();
      
      if (!storedWallet) {
        // Generate and save new wallet if none exists
        storedWallet = this.generateNewWallet();
        this.saveWalletToStorage(storedWallet);
        
        console.log('New wallet generated!');
        console.log('Please save this information securely:');
        console.log('Address:', storedWallet.address);
        console.log('Private Key:', storedWallet.privateKey);
        console.log('Mnemonic:', storedWallet.mnemonic);
      }

      // Connect the wallet
      this.wallet = new ethers.Wallet(storedWallet.privateKey, this._provider);
      this._isConnected = true;

      return {
        address: storedWallet.address,
        isConnected: true,
        isNewWallet: !this.getWalletFromStorage()
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this._isConnected = false;
      throw error;
    }
  }

  async getBalance() {
    if (!this.wallet) return '0';
    const balance = await this._provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  disconnect() {
    this.wallet = null;
    this._isConnected = false;
  }

  clearStoredWallet() {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    this.disconnect();
  }

  get isConnected() {
    return this._isConnected;
  }

  get address() {
    return this.wallet?.address || null;
  }

  get signer() {
    return this.wallet;
  }

  get provider() {
    return this._provider;
  }

  static getInstance() {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private static instance: WalletService;
}

export const walletService = WalletService.getInstance(); 