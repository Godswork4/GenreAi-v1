import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';
import type { AccountInfo, AccountData } from '@polkadot/types/interfaces';
import { rootNetwork } from '../config/web3.config';
import { useDemoStore } from '../store/demoStore';
import { useAuth } from '../store/authStore';
import { DemoWalletService } from './demoWalletService';
import { walletService } from './wallet'; // adjust path as needed

const WS_URL = rootNetwork.rpcUrls.default.webSocket[0];

interface PoolInfo {
  totalLiquidity: string;
  tokenAReserve: string;
  tokenBReserve: string;
  apy: number;
  unlockPeriod: number;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

// Mock data for demo mode
const DEMO_DATA = {
  balances: {
    trn: '1000000000000000000000', // 1000 TRN
    root: '500000000000000000000', // 500 ROOT
    usdt: '10000000000' // 10000 USDT (6 decimals)
  },
  pools: {
    'trn-root': {
      totalLiquidity: '2000000000000000000000',
      tokenAReserve: '1000000000000000000000',
      tokenBReserve: '1000000000000000000000',
      apy: 15,
      unlockPeriod: 86400
    },
    'trn-usdt': {
      totalLiquidity: '1500000000000000000000',
      tokenAReserve: '1000000000000000000000',
      tokenBReserve: '500000000',
      apy: 12,
      unlockPeriod: 86400
    },
    'root-usdt': {
      totalLiquidity: '1800000000000000000000',
      tokenAReserve: '1000000000000000000000',
      tokenBReserve: '800000000',
      apy: 10,
      unlockPeriod: 86400
    }
  },
  exchangeRates: {
    'trn-usdt': { rate: 1.5, apy: 12, unlockTime: 0 },
    'root-usdt': { rate: 2.0, apy: 10, unlockTime: 0 },
    'trn-root': { rate: 0.75, apy: 15, unlockTime: 0 }
  }
};

export class TRNService {
  private static api: ApiPromise | null = null;
  private static provider: WsProvider | null = null;
  private static connectionAttempts = 0;
  private static maxAttempts = 3;

  static async connect(): Promise<ApiPromise> {
    if (this.api && this.api.isConnected) {
      return this.api;
    }

    try {
      if (this.connectionAttempts >= this.maxAttempts) {
        throw new Error('Max connection attempts reached');
      }

      this.connectionAttempts++;
      this.provider = new WsProvider(WS_URL);
      this.api = await ApiPromise.create({ provider: this.provider });
      
      this.connectionAttempts = 0;
      return this.api;
    } catch (error) {
      console.error('Failed to connect to TRN network:', error);
      // Return a mock API for demo purposes
      return this.createMockApi();
    }
  }

  private static createMockApi(): any {
    return {
      isConnected: true,
      query: {
        system: {
          account: () => Promise.resolve({
            data: {
              free: { toString: () => '1000000000000000000000' },
              reserved: { toString: () => '0' }
            }
          })
        },
        tokens: {
          accounts: (address: string, tokenId: string) => {
            const balance = DEMO_DATA.balances[tokenId as keyof typeof DEMO_DATA.balances] || '0';
            return Promise.resolve({ toString: () => balance });
          }
        }
      },
      tx: {
        amm: {
          swap: () => ({
            signAndSend: () => Promise.resolve({ toString: () => 'mock-tx-hash' })
          })
        }
      }
    };
  }

  static async getBalance(address: string): Promise<{ free: string; reserved: string }> {
    try {
      const { user } = useAuth.getState();
      
      if (user?.isDemo) {
        const balance = await DemoWalletService.getBalance();
        return {
          free: balance,
          reserved: '0'
        };
      }

      const api = await this.connect();
      const accountInfo = await api.query.system.account(address) as unknown as AccountInfo;
      const { free, reserved } = accountInfo.data as AccountData;
      
      return {
        free: free.toString(),
        reserved: reserved.toString()
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return { free: '0', reserved: '0' };
    }
  }

  static async getTokenBalance(address: string, tokenId: string): Promise<string> {
    try {
      const { user } = useAuth.getState();
      
      if (user?.isDemo) {
        return DEMO_DATA.balances[tokenId as keyof typeof DEMO_DATA.balances] || '0';
      }

      const api = await this.connect();
      const balance = await api.query.tokens.accounts(address, tokenId);
      return balance.toString();
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return DEMO_DATA.balances[tokenId as keyof typeof DEMO_DATA.balances] || '0';
    }
  }

  static async getPoolInfo(poolId: string): Promise<PoolInfo> {
    try {
      const { user } = useAuth.getState();
      
      if (user?.isDemo) {
        const pool = DEMO_DATA.pools[poolId.toLowerCase() as keyof typeof DEMO_DATA.pools];
        if (!pool) throw new Error(`Pool ${poolId} not found`);
        return pool;
      }

      // For now, return demo data even for non-demo mode
      const pool = DEMO_DATA.pools[poolId.toLowerCase() as keyof typeof DEMO_DATA.pools];
      if (!pool) throw new Error(`Pool ${poolId} not found`);
      return pool;
    } catch (error) {
      console.error('Error fetching pool info:', error);
      return {
        totalLiquidity: '0',
        tokenAReserve: '0',
        tokenBReserve: '0',
        apy: 0,
        unlockPeriod: 0
      };
    }
  }

  static async getExchangeRate(fromToken: string, toToken: string): Promise<{
    rate: number;
    apy: number;
    unlockTime: number;
  }> {
    try {
      const key = `${fromToken.toLowerCase()}-${toToken.toLowerCase()}`;
      const rate = DEMO_DATA.exchangeRates[key as keyof typeof DEMO_DATA.exchangeRates];
      if (!rate) throw new Error(`Exchange rate for ${key} not found`);
      return rate;
    } catch (error) {
      console.error('Error calculating exchange rate:', error);
      return {
        rate: 0,
        apy: 0,
        unlockTime: 0
      };
    }
  }

  static async estimateSwapOutput(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<string> {
    try {
      const rate = await this.getExchangeRate(fromToken, toToken);
      const inputAmount = parseFloat(amount);
      const outputAmount = inputAmount * rate.rate;
      return outputAmount.toString();
    } catch (error) {
      console.error('Error estimating swap output:', error);
      return '0';
    }
  }

  static async swap(
    address: string,
    fromToken: string,
    toToken: string,
    amount: string,
    minReceived: string
  ): Promise<string> {
    try {
      const { user } = useAuth.getState();
      if (user?.isDemo) {
        // Simulate transaction for demo
        return 'demo-tx-hash-' + Date.now();
      }
      const api = await this.connect();
      const account = walletService.getPolkadotAccount();
      if (!account) throw new Error('Wallet not initialized');
      const signer = walletService.getSigner();
      const tx = api.tx.amm.swap(fromToken, toToken, amount, minReceived);
      const result = await new Promise((resolve, reject) => {
        tx.signAndSend(account.address, { signer }, ({ status, dispatchError, txHash }) => {
          if (dispatchError) {
            reject(new Error(dispatchError.toString()));
          } else if (status.isInBlock || status.isFinalized) {
            resolve(txHash.toString());
          }
        });
      });
      return result as string;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  static async getPrices(): Promise<Record<string, string>> {
    return {
      TRN: '1.50',
      ROOT: '2.00',
      USDT: '1.00'
    };
  }

  static async getVolumes(): Promise<Record<string, string>> {
    return {
      TRN: '150000',
      ROOT: '200000',
      USDT: '500000'
    };
  }

  static async getPools(): Promise<Array<{ id: string; totalLiquidity: string; apy: number }>> {
    return [
      { id: 'trn-root', totalLiquidity: '2000000000000000000000', apy: 15 },
      { id: 'trn-usdt', totalLiquidity: '1500000000000000000000', apy: 12 },
      { id: 'root-usdt', totalLiquidity: '1800000000000000000000', apy: 10 }
    ];
  }

  static async getLPTokenBalance(address: string, poolId: string): Promise<string> {
    return '0';
  }

  static async addLiquidity(
    address: string,
    poolId: string,
    amounts: string[],
    minLPTokens: string
  ): Promise<string> {
    try {
      const { user } = useAuth.getState();
      
      if (user?.isDemo) {
        return 'demo-liquidity-tx-' + Date.now();
      }

      const api = await this.connect();
      const tx = api.tx.amm.addLiquidity(poolId, amounts, minLPTokens);
      
      const injector = await web3FromAddress(address);
      const result = await tx.signAndSend(address, { signer: injector.signer });
      return result.toString();
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }

  static async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
    this.connectionAttempts = 0;
  }
}