import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { BN } from '@polkadot/util';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { ENV_CONFIG } from '../config/environment';
import type { Option, Vec } from '@polkadot/types';
import type { Codec } from '@polkadot/types/types';
import type { PalletDexPool } from '@polkadot/types/lookup';
import { RootNetwork } from '@therootnetwork/evm';
import { ethers } from 'ethers';
import { walletService } from './wallet'; // adjust path as needed

const ROOT_NETWORK_RPC = 'wss://porcini.rootnet.app';
const FAUCET_URL = 'https://faucet.rootnet.live';

interface TokenInfo {
  symbol: string;
  decimals: number;
  assetId: number;
}

interface DexReserves {
  reserve0: BN;
  reserve1: BN;
}

interface PoolInfo {
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: [string, string];
  totalSupply: string;
  fee: number;
}

interface StakingInfo {
  totalStaked: string;
  userStaked: string;
  rewards: string;
  apy: number;
  unbondingPeriod: number;
}

export class RootNetworkService {
  private static api: ApiPromise | null = null;
  private static keyring: Keyring | null = null;
  private provider: ethers.JsonRpcProvider;
  private rootNetwork: RootNetwork;

  // Root Network asset IDs
  static readonly ASSETS = {
    ROOT: 1, // Native ROOT token
    XRP: 2,  // XRP token
    USDT: 1984, // USDT token
    ASTO: 17508, // ASTO token
  };

  static readonly TOKENS: Record<number, TokenInfo> = {
    1: { symbol: 'ROOT', decimals: 6, assetId: 1 },
    2: { symbol: 'XRP', decimals: 6, assetId: 2 },
    1984: { symbol: 'USDT', decimals: 6, assetId: 1984 },
    17508: { symbol: 'ASTO', decimals: 18, assetId: 17508 },
  };

  constructor() {
    // Connect to RootNetwork mainnet
    this.provider = new ethers.JsonRpcProvider('https://root.rootnetwork.live');
    this.rootNetwork = new RootNetwork(this.provider);
  }

  static async initialize(): Promise<void> {
    try {
      await cryptoWaitReady();
      
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
      
      const provider = new WsProvider(ROOT_NETWORK_RPC);
      this.api = await ApiPromise.create({ provider });
      
      console.log('Root Network connected successfully');
    } catch (error) {
      console.error('Failed to initialize Root Network:', error);
      throw error;
    }
  }

  static async getApi(): Promise<ApiPromise> {
    if (!this.api) {
      const provider = new WsProvider(ROOT_NETWORK_RPC);
      this.api = await ApiPromise.create({ provider });
    }
    return this.api;
  }

  static async createWallet(): Promise<{ address: string; mnemonic: string }> {
    try {
      await cryptoWaitReady();
      
      if (!this.keyring) {
        this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
      }

      // Generate new keypair
      const keypair = this.keyring.addFromUri('//random//path//for//demo', { name: 'Demo Wallet' });
      
      return {
        address: keypair.address,
        mnemonic: 'Demo wallet - secure storage needed for production'
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  static async getBalance(address: string, assetId?: number): Promise<string> {
    try {
      const api = await this.getApi();
      
      if (!assetId || assetId === 1) {
        // Native ROOT balance
        const { data: { free } } = await api.query.system.account(address);
        return free.toString();
      } else {
        // Asset balance
        const balance = await api.query.assets.account(assetId, address);
        return balance.isSome ? balance.unwrap().balance.toString() : '0';
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  static async getTokenBalances(address: string): Promise<Record<string, string>> {
    try {
      const api = await this.getApi();
      const balances: Record<string, string> = {};
      
      // Get ROOT balance
      const { data: { free: rootBalance } } = await api.query.system.account(address);
      balances['ROOT'] = rootBalance.toString();

      // Get other token balances
      const tokenBalances = await api.query.tokens.accounts.entries(address);
      tokenBalances.forEach(([key, balance]) => {
        const assetId = key.args[1].toString();
        balances[assetId] = balance.free.toString();
      });

      return balances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return {};
    }
  }

  static async getPoolInfo(token0AssetId: number, token1AssetId: number): Promise<PoolInfo | null> {
    try {
      const api = await this.getApi();
      
      // Query DEX pool information
      const poolInfo = await api.query.dex.pools([token0AssetId, token1AssetId]);
      
      if (poolInfo.isNone) {
        return null;
      }

      const pool = poolInfo.unwrap();
      const token0 = this.TOKENS[token0AssetId];
      const token1 = this.TOKENS[token1AssetId];

      return {
        token0,
        token1,
        reserves: [pool.reserve0.toString(), pool.reserve1.toString()],
        totalSupply: pool.totalSupply.toString(),
        fee: 30 // 0.3% fee
      };
    } catch (error) {
      console.error('Error fetching pool info:', error);
      return null;
    }
  }

  static async getSwapAmountOut(
    amountIn: string,
    assetIdIn: number,
    assetIdOut: number
  ): Promise<string> {
    try {
      const api = await this.getApi();
      
      // Get pool info
      const pool = await api.query.dex.pools([assetIdIn, assetIdOut]);
      if (!pool.isSome) {
        throw new Error('Pool not found');
      }

      // Calculate amount out using AMM formula
      const result = await api.rpc.dex.getAmountOut(
        new BN(amountIn),
        assetIdIn,
        assetIdOut
      );
      
      return result.toString();
    } catch (error) {
      console.error('Error calculating swap amount:', error);
      throw error;
    }
  }

  static async swap(
    signer: string,
    amountIn: string,
    amountOutMin: string,
    assetIdIn: number,
    assetIdOut: number
  ): Promise<string> {
    try {
      const api = await this.getApi();
      
      // Create swap transaction
      const tx = api.tx.dex.swapExactTokensForTokens(
        new BN(amountIn),
        new BN(amountOutMin),
        [assetIdIn, assetIdOut],
        signer,
        await api.query.system.number().then(n => n.toNumber() + 100) // Deadline: current block + 100
      );

      // Sign and send transaction
      const injector = await web3FromAddress(signer);
      const result = await tx.signAndSend(signer, { signer: injector.signer });
      
      return result.toString();
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  static async addLiquidity(
    signer: string,
    assetIdA: number,
    assetIdB: number,
    amountADesired: string,
    amountBDesired: string,
    amountAMin: string,
    amountBMin: string
  ): Promise<string> {
    try {
      const api = await this.getApi();
      const deadline = (await api.query.system.number()).toNumber() + 100;
      
      const tx = api.tx.dex.addLiquidity(
        assetIdA,
        assetIdB,
        new BN(amountADesired),
        new BN(amountBDesired),
        new BN(amountAMin),
        new BN(amountBMin),
        signer,
        deadline
      );

      const txHash = await this.simulateTransaction(tx);
      return txHash;
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }

  static async getStakingInfo(address: string): Promise<StakingInfo> {
    try {
      const api = await this.getApi();
      
      // Get staking information
      const stakingInfo = await api.query.staking.ledger(address);
      const totalStaked = await api.query.staking.totalStake();
      
      if (stakingInfo.isNone) {
        return {
          totalStaked: totalStaked.toString(),
          userStaked: '0',
          rewards: '0',
          apy: 12, // Example APY
          unbondingPeriod: 7 * 24 * 60 * 60 // 7 days in seconds
        };
      }

      const ledger = stakingInfo.unwrap();
      
      return {
        totalStaked: totalStaked.toString(),
        userStaked: ledger.total.toString(),
        rewards: '0', // Calculate based on era rewards
        apy: 12,
        unbondingPeriod: 7 * 24 * 60 * 60
      };
    } catch (error) {
      console.error('Error fetching staking info:', error);
      return {
        totalStaked: '0',
        userStaked: '0',
        rewards: '0',
        apy: 0,
        unbondingPeriod: 0
      };
    }
  }

  static async stake(amount: string): Promise<string> {
    try {
      const api = await this.getApi();
      const account = walletService.getPolkadotAccount(); // or getEvmAccount() if EVM
      if (!account) throw new Error('Wallet not initialized');
      const signer = walletService.getSigner(); // ethers.js Wallet or similar
      const tx = api.tx.staking.bond(new BN(amount), 'Staked');
      return await new Promise((resolve, reject) => {
        tx.signAndSend(account.address, { signer }, ({ status, dispatchError, txHash }) => {
          if (dispatchError) {
            reject(new Error(dispatchError.toString()));
          } else if (status.isInBlock || status.isFinalized) {
            resolve(txHash.toString());
          }
        });
      });
    } catch (error) {
      console.error('Error staking:', error);
      throw error;
    }
  }

  static async unstake(signer: string, amount: string): Promise<string> {
    try {
      const api = await this.getApi();
      
      const tx = api.tx.staking.unbond(new BN(amount));
      
      const txHash = await this.simulateTransaction(tx);
      return txHash;
    } catch (error) {
      console.error('Error unstaking:', error);
      throw error;
    }
  }

  static async requestTestnetTokens(address: string): Promise<void> {
    // Open faucet in new tab
    window.open(`${FAUCET_URL}?address=${address}`, '_blank');
  }

  private static async simulateTransaction(tx: any): Promise<string> {
    // In production, this would be signed and submitted
    // For now, we'll return a simulated hash
    const hash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Simulated transaction:', hash);
    return hash;
  }

  static async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }

  static async getPools(): Promise<any[]> {
    try {
      const api = await this.getApi();
      const pools = await api.query.dex.pools.entries();
      
      return pools.map(([key, pool]) => ({
        assetIds: key.args[0].toJSON(),
        data: pool.toJSON()
      }));
    } catch (error) {
      console.error('Error fetching pools:', error);
      return [];
    }
  }

  static async getPoolLiquidity(assetIdA: number, assetIdB: number): Promise<{ reserve0: string; reserve1: string }> {
    try {
      const api = await this.getApi();
      const pool = await api.query.dex.pools([assetIdA, assetIdB]);
      
      if (!pool.isSome) {
        return { reserve0: '0', reserve1: '0' };
      }

      const { token0Reserve, token1Reserve } = pool.unwrap();
      return {
        reserve0: token0Reserve.toString(),
        reserve1: token1Reserve.toString()
      };
    } catch (error) {
      console.error('Error fetching pool liquidity:', error);
      return { reserve0: '0', reserve1: '0' };
    }
  }

  static async getSwapEstimate(
    amountIn: string,
    assetIdIn: number,
    assetIdOut: number
  ): Promise<{ amountOut: string; priceImpact: number }> {
    try {
      const api = await this.getApi();
      
      // Get pool info
      const poolInfo = (await api.query.dex.pools([assetIdIn, assetIdOut])) as unknown as Option<Codec>;
      if (!poolInfo || poolInfo.isEmpty) {
        throw new Error('Pool not found');
      }

      // Parse pool data - assuming the structure matches DexReserves
      const poolData = poolInfo.value.toJSON() as unknown as DexReserves;
      const reserveIn = new BN(poolData.reserve0);
      const reserveOut = new BN(poolData.reserve1);

      // Calculate amount out using constant product formula (x * y = k)
      const amountWithFee = new BN(amountIn).muln(997); // 0.3% fee
      const numerator = amountWithFee.mul(reserveOut);
      const denominator = reserveIn.muln(1000).add(amountWithFee);
      const amountOut = numerator.div(denominator);

      // Calculate price impact
      const priceImpact = parseFloat(amountIn) / (parseFloat(reserveIn.toString()) + parseFloat(amountIn)) * 100;

      return {
        amountOut: amountOut.toString(),
        priceImpact
      };
    } catch (error) {
      console.error('Error calculating swap estimate:', error);
      throw error;
    }
  }

  async getHighestPricedToken(): Promise<{ symbol: string; price: number; change24h: number }> {
    try {
      // Get all tokens from RootNetwork
      const tokens = await this.rootNetwork.getTokens();
      
      let highestPrice = 0;
      let highestPricedToken = null;

      // Iterate through tokens to find the one with highest price
      for (const token of tokens) {
        const price = await this.rootNetwork.getTokenPrice(token.address);
        const price24hAgo = await this.rootNetwork.getTokenPrice(token.address, Date.now() - 24 * 60 * 60 * 1000);
        
        if (price > highestPrice) {
          highestPrice = price;
          highestPricedToken = {
            symbol: token.symbol,
            price: price,
            change24h: ((price - price24hAgo) / price24hAgo) * 100
          };
        }
      }

      if (!highestPricedToken) {
        throw new Error('No tokens found');
      }

      return highestPricedToken;
    } catch (error) {
      console.error('Error fetching highest priced token:', error);
      throw error;
    }
  }
}