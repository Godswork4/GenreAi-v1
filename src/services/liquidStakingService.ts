import { ApiPromise, WsProvider } from '@polkadot/api';
import { demoWalletService } from './demoWalletService';
import { ENV_CONFIG } from '../config/environment';
import { BN } from '@polkadot/util';
import { walletService } from './wallet';
import { ethers } from "ethers";

const MINIMUM_STAKE = new BN('25000000000000000000'); // 25 ROOT in Wei

class StakingService {
  private static api: ApiPromise | null = null;

  private static async getApi(): Promise<ApiPromise> {
    if (!this.api) {
      const wsProvider = new WsProvider(ENV_CONFIG.ROOT_NETWORK_RPC_URL);
      this.api = await ApiPromise.create({ provider: wsProvider });
    }
    return this.api;
  }

  public static async stake(amount: string): Promise<string> {
    try {
      const api = await this.getApi();
      const account = walletService.getPolkadotAccount();
      if (!account) throw new Error('Wallet not initialized');
      const signer = walletService.getSigner();
      const tx = api.tx.staking.bond(amount, 'Staked');
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
      console.error('Staking error:', error);
      throw error;
    }
  }

  public static async unstake(amount: string): Promise<string> {
    try {
      const api = await this.getApi();
      const account = demoWalletService.getPolkadotAccount();
      if (!account) {
        throw new Error('Demo wallet not initialized');
      }

      const tx = api.tx.staking.unbond(amount);
      const hash = await tx.signAndSend(account);
      return hash.toString();
    } catch (error) {
      console.error('Unstaking error:', error);
      throw error;
    }
  }

  public static async getStakingInfo(address: string) {
    try {
      const api = await this.getApi();
      
      // Get staking ledger
      const stakingLedger = await api.query.staking.ledger(address);
      
      // Get validator info if the address is nominating
      const nominators = await api.query.staking.nominators(address);
      
      // Get current era reward points
      const eraStakers = await api.query.staking.erasStakers(await api.query.staking.activeEra(), address);

      return {
        stakingLedger: stakingLedger.toJSON(),
        isNominating: !nominators.isEmpty,
        nominatedValidators: nominators.isEmpty ? [] : nominators.toJSON(),
        eraStakers: eraStakers.toJSON()
      };
    } catch (error) {
      console.error('Error getting staking info:', error);
      throw error;
    }
  }

  public static async getValidators() {
    try {
      const api = await this.getApi();
      
      // Get current validators
      const validators = await api.query.session.validators();
      
      // Get validator preferences
      const validatorPrefs = await Promise.all(
        validators.map(validator => 
          api.query.staking.validators(validator)
        )
      );

      return validators.map((validator, index) => ({
        address: validator.toString(),
        prefs: validatorPrefs[index].toJSON()
      }));
    } catch (error) {
      console.error('Error getting validators:', error);
      throw error;
    }
  }

  public static async nominate(validatorAddresses: string[]): Promise<string> {
    try {
      const api = await this.getApi();
      const account = demoWalletService.getPolkadotAccount();
      if (!account) {
        throw new Error('Demo wallet not initialized');
      }

      const tx = api.tx.staking.nominate(validatorAddresses);
      const hash = await tx.signAndSend(account);
      return hash.toString();
    } catch (error) {
      console.error('Nomination error:', error);
      throw error;
    }
  }

  public static async claimRewards(): Promise<string> {
    try {
      const api = await this.getApi();
      const account = demoWalletService.getPolkadotAccount();
      if (!account) {
        throw new Error('Demo wallet not initialized');
      }

      const tx = api.tx.staking.payoutStakers(account.address, await api.query.staking.activeEra());
      const hash = await tx.signAndSend(account);
      return hash.toString();
    } catch (error) {
      console.error('Reward claim error:', error);
      throw error;
    }
  }

  public static async swapTokens(amountIn: string, amountOutMin: string, path: string[], to: string, deadline: string): Promise<string> {
    try {
      const api = await this.getApi();
      const account = walletService.getPolkadotAccount();
      if (!account) throw new Error('Wallet not initialized');
      const signer = walletService.getSigner();
      const contract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
      const tx = await contract.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Swap error:', error);
      throw error;
    }
  }
}

export { StakingService };