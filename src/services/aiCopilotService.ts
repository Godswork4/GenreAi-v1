import { RootNetworkService } from './rootNetworkService';
import { ENV_CONFIG } from '../config/environment';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  text: string;
  action?: {
    type: 'swap' | 'stake' | 'unstake' | 'provide_liquidity';
    params: Record<string, string>;
  };
  suggestions?: string[];
}

interface MarketContext {
  prices: Record<string, string>;
  pools: Array<{
    token0: string;
    token1: string;
    reserves: [string, string];
    fee: number;
  }>;
  stakingInfo: {
    totalStaked: string;
    apy: number;
  };
}

interface UserContext {
  balances: Record<string, string>;
  stakingPosition: {
    userStaked: string;
    rewards: string;
  };
  address: string;
}

export class AICopilotService {
  private static readonly COMMON_SUGGESTIONS = [
    "Help me swap tokens",
    "What are the current staking rates?",
    "Show my portfolio",
    "How to provide liquidity?",
    "Check ROOT/USDT pool"
  ];

  private static chatHistory: ChatMessage[] = [];

  private static async getSystemMessage(userAddress: string): Promise<string> {
    const [marketContext, userContext] = await Promise.all([
      this.getMarketContext(),
      this.getUserContext(userAddress)
    ]);

    return [
      'You are Genre AI, a DeFi assistant for the Root Network blockchain.',
      'You help users with token swaps, staking, and liquidity provision on Root Network.',
      '',
      'Current market data:',
      JSON.stringify(marketContext, null, 2),
      '',
      'User\'s portfolio:',
      JSON.stringify(userContext, null, 2),
      '',
      'Available tokens on Root Network:',
      '- ROOT: Native token (6 decimals)',
      '- XRP: Ripple token (6 decimals)', 
      '- USDT: Tether USD (6 decimals)',
      '- ASTO: Asto token (18 decimals)',
      '',
      'Instructions:',
      '1. Provide accurate information about Root Network DeFi',
      '2. Help with real token swaps using actual DEX pools',
      '3. Assist with staking ROOT tokens for rewards',
      '4. Explain liquidity provision opportunities',
      '5. Always mention this is testnet for testing purposes',
      '6. Suggest using the faucet for testnet tokens',
      '7. Keep responses helpful and informative',
      '',
      'Remember: All operations are on Root Network testnet for testing purposes.'
    ].join('\n');
  }

  static async getMarketContext(): Promise<MarketContext> {
    try {
      // Get real pool information from Root Network
      const pools = [];
      const poolPairs = [
        { token0: 1, token1: 1984 }, // ROOT-USDT
        { token0: 2, token1: 1984 }, // XRP-USDT
        { token0: 1, token1: 2 }     // ROOT-XRP
      ];

      for (const pair of poolPairs) {
        const poolInfo = await RootNetworkService.getPoolInfo(pair.token0, pair.token1);
        if (poolInfo) {
          pools.push({
            token0: poolInfo.token0.symbol,
            token1: poolInfo.token1.symbol,
            reserves: poolInfo.reserves,
            fee: poolInfo.fee
          });
        }
      }

      // Mock prices for testnet (in production, fetch from price oracle)
      const prices = {
        ROOT: '0.05',
        XRP: '0.52', 
        USDT: '1.00',
        ASTO: '0.12'
      };

      // Get staking information
      const stakingInfo = await RootNetworkService.getStakingInfo('dummy'); // Get general stats

      return {
        prices,
        pools,
        stakingInfo: {
          totalStaked: stakingInfo.totalStaked,
          apy: stakingInfo.apy
        }
      };
    } catch (error) {
      console.error('Error getting market context:', error);
      // Return fallback data
      return {
        prices: { ROOT: '0.05', XRP: '0.52', USDT: '1.00', ASTO: '0.12' },
        pools: [],
        stakingInfo: { totalStaked: '0', apy: 12 }
      };
    }
  }

  static async getUserContext(userAddress: string): Promise<UserContext> {
    try {
      // Get real user balances from Root Network
      const balances = await RootNetworkService.getTokenBalances(userAddress);
      
      // Get real staking position
      const stakingInfo = await RootNetworkService.getStakingInfo(userAddress);

      return {
        balances,
        stakingPosition: {
          userStaked: stakingInfo.userStaked,
          rewards: stakingInfo.rewards
        },
        address: userAddress
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      // Return fallback data
      return {
        balances: {},
        stakingPosition: { userStaked: '0', rewards: '0' },
        address: userAddress
      };
    }
  }

  static async getAIResponse(
    userMessage: string,
    userAddress: string,
    apiKey?: string | null
  ): Promise<AIResponse> {
    try {
      // If no API key provided, use intelligent demo responses
      if (!apiKey && !ENV_CONFIG.OPENAI_API_KEY) {
        return this.generateIntelligentResponse(userMessage, userAddress);
      }

      // Use OpenAI API with user's key or environment key
      const systemMessage = await this.getSystemMessage(userAddress);

      // Add user message to chat history
      this.chatHistory.push({ role: 'user', content: userMessage });

      // Prepare messages for API call
      const messages: ChatMessage[] = [
        { role: 'system', content: systemMessage },
        ...this.chatHistory.slice(-10) // Keep last 10 messages for context
      ];

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || ENV_CONFIG.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;
      
      // Add AI response to chat history
      this.chatHistory.push({ role: 'assistant', content: aiMessage });
      
      // Generate contextual suggestions
      const suggestions = this.generateSuggestions(userMessage, await this.getMarketContext());
      
      return {
        text: aiMessage,
        suggestions
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to demo response if API fails
      return this.generateIntelligentResponse(userMessage, userAddress);
    }
  }

  private static async generateIntelligentResponse(userMessage: string, userAddress: string): Promise<AIResponse> {
    const message = userMessage.toLowerCase();
    
    // Get real user context for intelligent responses
    const userContext = await this.getUserContext(userAddress);
    const marketContext = await this.getMarketContext();
    
    if (message.includes('swap') || message.includes('trade')) {
      const availablePools = marketContext.pools.map(p => `${p.token0}/${p.token1}`).join(', ');
      return {
        text: `I can help you swap tokens on Root Network! Available trading pairs: ${availablePools}\n\nCurrent prices (testnet):\n• ROOT: $0.05\n• XRP: $0.52\n• USDT: $1.00\n\nWhich tokens would you like to swap?`,
        suggestions: [
          "Swap ROOT to USDT",
          "Swap XRP to USDT", 
          "Check swap fees",
          "View my balances"
        ]
      };
    }
    
    if (message.includes('stake') || message.includes('staking')) {
      const userStaked = (parseInt(userContext.stakingPosition.userStaked) / Math.pow(10, 6)).toFixed(6);
      const rewards = (parseInt(userContext.stakingPosition.rewards) / Math.pow(10, 6)).toFixed(6);
      
      return {
        text: `Root Network staking information:\n• Current APY: ${marketContext.stakingInfo.apy}%\n• Your staked: ${userStaked} ROOT\n• Pending rewards: ${rewards} ROOT\n• Unbonding period: 7 days\n\nStaking ROOT tokens helps secure the network and earns you rewards!`,
        suggestions: [
          "Stake ROOT tokens",
          "Check staking rewards",
          "View unbonding schedule",
          "Calculate staking returns"
        ]
      };
    }
    
    if (message.includes('portfolio') || message.includes('balance')) {
      const balanceText = Object.entries(userContext.balances)
        .map(([symbol, balance]) => {
          const token = Object.values(RootNetworkService.TOKENS).find(t => t.symbol === symbol);
          if (token && balance !== '0') {
            const formatted = (parseInt(balance) / Math.pow(10, token.decimals)).toFixed(6);
            return `• ${symbol}: ${formatted}`;
          }
          return null;
        })
        .filter(Boolean)
        .join('\n');

      return {
        text: `Your Root Network portfolio:\n${balanceText || 'No tokens found'}\n\nThis is your testnet wallet. Use the faucet to get testnet tokens for testing!`,
        suggestions: [
          "Get testnet tokens",
          "View detailed breakdown", 
          "Check price changes",
          "Stake ROOT tokens"
        ]
      };
    }
    
    if (message.includes('liquidity') || message.includes('pool')) {
      const poolsText = marketContext.pools
        .map(p => `• ${p.token0}/${p.token1} pool`)
        .join('\n');
        
      return {
        text: `Root Network liquidity pools:\n${poolsText}\n\nProviding liquidity earns you trading fees from swaps. Each pool has a 0.3% trading fee that's distributed to liquidity providers.`,
        suggestions: [
          "Add liquidity to ROOT/USDT",
          "Check pool statistics", 
          "Calculate LP rewards",
          "Remove liquidity"
        ]
      };
    }
    
    if (message.includes('faucet') || message.includes('testnet')) {
      return {
        text: `Root Network testnet faucet:\n\nYou can get free testnet tokens at: https://faucet.rootnet.live\n\nTestnet tokens have no real value and are only for testing DeFi operations. Use them to:\n• Test token swaps\n• Try staking\n• Provide liquidity\n• Learn DeFi concepts`,
        suggestions: [
          "Open faucet website",
          "Check my balances",
          "Try a test swap",
          "Learn about staking"
        ]
      };
    }
    
    // Default response
    return {
      text: `Hello! I'm Genre AI, your Root Network DeFi assistant. I can help you with:\n\n• Token swapping on Root Network DEX\n• Staking ROOT tokens for rewards\n• Liquidity provision\n• Portfolio management\n• Testnet token faucet\n\nThis is Root Network testnet - perfect for learning DeFi safely! What would you like to explore?`,
      suggestions: this.COMMON_SUGGESTIONS
    };
  }

  private static generateSuggestions(
    userMessage: string,
    marketContext: MarketContext
  ): string[] {
    const suggestions: string[] = [...this.COMMON_SUGGESTIONS];
    
    // Add contextual suggestions based on market data
    if (marketContext.stakingInfo.apy > 10) {
      suggestions.push(`Stake ROOT at ${marketContext.stakingInfo.apy}% APY`);
    }

    // Add pool-specific suggestions
    marketContext.pools.forEach(pool => {
      suggestions.push(`Check ${pool.token0}/${pool.token1} pool`);
    });

    // Add suggestions based on user's message context
    if (userMessage.toLowerCase().includes('stake')) {
      suggestions.push(
        'View staking rewards',
        'Calculate staking returns',
        'Unstake tokens'
      );
    } else if (userMessage.toLowerCase().includes('swap')) {
      suggestions.push(
        'Check token prices',
        'View trading pairs',
        'Calculate swap fees'
      );
    }

    // Return unique suggestions, limited to 5
    return Array.from(new Set(suggestions)).slice(0, 5);
  }

  static async executeAIAction(
    action: AIResponse['action'],
    userAddress: string
  ): Promise<string> {
    if (!action) return '';

    try {
      switch (action.type) {
        case 'swap':
          const amountIn = (parseFloat(action.params.amount) * Math.pow(10, 6)).toString();
          const amountOutMin = (parseFloat(action.params.minReceived || '0') * Math.pow(10, 6)).toString();
          
          return await RootNetworkService.swap(
            userAddress,
            amountIn,
            amountOutMin,
            parseInt(action.params.fromToken),
            parseInt(action.params.toToken)
          );

        case 'stake':
          const stakeAmount = (parseFloat(action.params.amount) * Math.pow(10, 6)).toString();
          return await RootNetworkService.stake(userAddress, stakeAmount);

        case 'unstake':
          const unstakeAmount = (parseFloat(action.params.amount) * Math.pow(10, 6)).toString();
          return await RootNetworkService.unstake(userAddress, unstakeAmount);

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error('Error executing AI action:', error);
      throw error;
    }
  }

  static clearChatHistory(): void {
    this.chatHistory = [];
  }
}