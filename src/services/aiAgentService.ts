import { TRNService } from './trnService';
import { SyloService } from './syloService';
import { parseUnits, formatUnits } from 'ethers';

interface MarketSignal {
  type: 'buy' | 'sell' | 'provide_liquidity' | 'remove_liquidity';
  confidence: number;
  expectedReturn: number;
}

interface AgentState {
  lastAction: number;
  performanceMetrics: {
    totalTrades: number;
    successfulTrades: number;
    totalValue: string;
    pnl: string;
  };
}

interface NFIAgentState {
  lastAction: { toString(): string };
  metrics: {
    totalTrades: { toString(): string };
    successfulTrades: { toString(): string };
    totalValue: { toString(): string };
    pnl: { toString(): string };
  };
}

export class AIAgentService {
  private static readonly MIN_CONFIDENCE = 0.75;
  private static readonly MIN_EXPECTED_RETURN = 0.02; // 2%
  private static readonly ACTION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_SLIPPAGE = 0.01; // 1% max slippage

  /**
   * Initialize an AI agent with NFI pallet
   */
  static async initializeAgent(agentAddress: string): Promise<void> {
    const api = await TRNService.connect();

    try {
      // Register agent with NFI pallet
      const tx = api.tx.nfi.registerAgent(
        agentAddress,
        {
          allowedActions: ['trade', 'provide_liquidity'],
          riskLevel: 'moderate',
          maxTransactionValue: parseUnits('1', 18).toString() // 1 TRN
        }
      );

      await tx.signAndSend(agentAddress);
    } catch (error) {
      console.error('Error initializing AI agent:', error);
      throw error;
    }
  }

  /**
   * Analyze market conditions using SYLO queries
   */
  static async analyzeMarket(poolId: string): Promise<MarketSignal> {
    try {
      // Get real-time market data
      const marketData = await SyloService.query('market.analysis', {
        poolId,
        timeframe: '1h',
        indicators: ['price', 'volume', 'liquidity']
      });

      // Get pool info for liquidity analysis
      const poolInfo = await TRNService.getPoolInfo(poolId);
      
      // Process market data
      return this.processMarketData(marketData, poolInfo);
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    }
  }

  /**
   * Execute autonomous trading strategy
   */
  static async executeStrategy(
    agentAddress: string,
    poolId: string
  ): Promise<string | null> {
    try {
      // Get agent's current state
      const state = await this.getAgentState(agentAddress);
      
      // Check cooldown
      if (Date.now() - state.lastAction < this.ACTION_COOLDOWN) {
        return null;
      }

      // Analyze market
      const signal = await this.analyzeMarket(poolId);

      // Execute trade if conditions are met
      if (
        signal.confidence >= this.MIN_CONFIDENCE &&
        signal.expectedReturn >= this.MIN_EXPECTED_RETURN
      ) {
        return await this.executeTradeSignal(agentAddress, poolId, signal);
      }

      return null;
    } catch (error) {
      console.error('Error executing strategy:', error);
      throw error;
    }
  }

  /**
   * Execute trade based on market signal
   */
  private static async executeTradeSignal(
    agentAddress: string,
    poolId: string,
    signal: MarketSignal
  ): Promise<string> {
    const api = await TRNService.connect();

    try {
      // Get pool info
      const poolInfo = await TRNService.getPoolInfo(poolId);
      
      // Calculate optimal trade size based on signal confidence
      const tradeSize = this.calculateTradeSize(poolInfo, signal);

      // Execute appropriate action
      switch (signal.type) {
        case 'buy':
          return await TRNService.swap(
            agentAddress,
            poolInfo.tokenAReserve,
            poolInfo.tokenBReserve,
            tradeSize,
            this.calculateMinReceived(tradeSize, signal.confidence)
          );

        case 'provide_liquidity':
          return await TRNService.addLiquidity(
            agentAddress,
            poolId,
            [tradeSize, tradeSize],
            this.calculateMinLPTokens(tradeSize)
          );

        default:
          throw new Error('Unsupported signal type');
      }
    } catch (error) {
      console.error('Error executing trade signal:', error);
      throw error;
    }
  }

  /**
   * Get agent's current state
   */
  private static async getAgentState(agentAddress: string): Promise<AgentState> {
    try {
      const api = await TRNService.connect();
      const state = await api.query.nfi.agentState(agentAddress) as unknown as NFIAgentState;
      
      return {
        lastAction: parseInt(state.lastAction.toString()),
        performanceMetrics: {
          totalTrades: parseInt(state.metrics.totalTrades.toString()),
          successfulTrades: parseInt(state.metrics.successfulTrades.toString()),
          totalValue: state.metrics.totalValue.toString(),
          pnl: state.metrics.pnl.toString()
        }
      };
    } catch (error) {
      console.error('Error getting agent state:', error);
      throw error;
    }
  }

  /**
   * Calculate optimal trade size based on pool liquidity and signal confidence
   */
  private static calculateTradeSize(poolInfo: any, signal: MarketSignal): string {
    const totalLiquidity = parseFloat(formatUnits(poolInfo.totalLiquidity, 18));
    const maxTradeSize = totalLiquidity * 0.01; // Max 1% of pool liquidity
    const confidenceAdjustedSize = maxTradeSize * signal.confidence;
    
    return parseUnits(
      Math.min(confidenceAdjustedSize, maxTradeSize).toFixed(18),
      18
    ).toString();
  }

  /**
   * Calculate minimum received amount with slippage protection
   */
  private static calculateMinReceived(amount: string, confidence: number): string {
    const slippage = Math.min(this.MAX_SLIPPAGE, (1 - confidence) * 2);
    const amountFloat = parseFloat(formatUnits(amount, 18));
    const minReceived = amountFloat * (1 - slippage);
    
    return parseUnits(minReceived.toFixed(18), 18).toString();
  }

  /**
   * Calculate minimum LP tokens to receive
   */
  private static calculateMinLPTokens(amount: string): string {
    const amountFloat = parseFloat(formatUnits(amount, 18));
    const minLPTokens = amountFloat * 0.99; // 1% slippage tolerance
    
    return parseUnits(minLPTokens.toFixed(18), 18).toString();
  }

  /**
   * Process market data to generate trading signal
   */
  private static processMarketData(marketData: any, poolInfo: any): MarketSignal {
    const {
      price,
      volume,
      liquidity,
      priceChange24h,
      volumeChange24h,
      liquidityChange24h
    } = marketData;

    // Calculate metrics
    const priceVolatility = Math.abs(priceChange24h) / price;
    const volumeGrowth = volumeChange24h / volume;
    const liquidityHealth = liquidityChange24h / liquidity;

    // Calculate signal confidence based on multiple factors
    const confidence = this.calculateConfidence(
      priceVolatility,
      volumeGrowth,
      liquidityHealth
    );

    // Determine signal type
    const type = this.determineSignalType(
      priceChange24h,
      volumeGrowth,
      liquidityHealth
    );

    // Calculate expected return based on historical data
    const expectedReturn = this.calculateExpectedReturn(
      priceChange24h,
      volumeGrowth,
      confidence
    );

    return {
      type,
      confidence,
      expectedReturn
    };
  }

  /**
   * Calculate signal confidence based on market metrics
   */
  private static calculateConfidence(
    priceVolatility: number,
    volumeGrowth: number,
    liquidityHealth: number
  ): number {
    // Weight factors
    const weights = {
      priceVolatility: 0.4,
      volumeGrowth: 0.3,
      liquidityHealth: 0.3
    };

    // Normalize metrics to 0-1 range
    const normalizedVolatility = Math.min(1, Math.max(0, 1 - priceVolatility));
    const normalizedVolume = Math.min(1, Math.max(0, (volumeGrowth + 1) / 2));
    const normalizedLiquidity = Math.min(1, Math.max(0, (liquidityHealth + 1) / 2));

    // Calculate weighted confidence
    return (
      normalizedVolatility * weights.priceVolatility +
      normalizedVolume * weights.volumeGrowth +
      normalizedLiquidity * weights.liquidityHealth
    );
  }

  /**
   * Determine signal type based on market conditions
   */
  private static determineSignalType(
    priceChange: number,
    volumeGrowth: number,
    liquidityHealth: number
  ): MarketSignal['type'] {
    if (liquidityHealth < -0.1) {
      return 'provide_liquidity';
    }

    if (priceChange < 0 && volumeGrowth > 0) {
      return 'buy';
    }

    if (priceChange > 0 && volumeGrowth < 0) {
      return 'sell';
    }

    return 'provide_liquidity';
  }

  /**
   * Calculate expected return based on market conditions
   */
  private static calculateExpectedReturn(
    priceChange: number,
    volumeGrowth: number,
    confidence: number
  ): number {
    // Base expected return on price movement
    const baseReturn = Math.abs(priceChange);
    
    // Adjust based on volume growth
    const volumeAdjustment = volumeGrowth > 0 ? 1 + volumeGrowth : 1;
    
    // Apply confidence factor
    return baseReturn * volumeAdjustment * confidence;
  }
} 