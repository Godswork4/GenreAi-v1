import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { AICopilotService } from '../services/aiCopilotService';
import { SwapService, SwapParams, SwapQuote } from '../services/ai/swapService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  action?: {
    type: string;
    params: Record<string, string>;
  };
  swapQuote?: SwapQuote;
  swapParams?: SwapParams;
}

interface CommandState {
  type: 'swap' | 'balance' | null;
  step: number;
  params: Partial<SwapParams>;
}

export const AIChatBox: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSwap, setPendingSwap] = useState<{quote: SwapQuote, params: SwapParams} | null>(null);
  const [commandState, setCommandState] = useState<CommandState>({
    type: null,
    step: 0,
    params: {}
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Command parsing and handling
  const handleCommand = (text: string) => {
    const parts = text.trim().split(' ');
    const command = parts[0].toLowerCase();

    if (command === '/swap') {
      if (parts.length === 1) {
        // Just /swap command
        setCommandState({
          type: 'swap',
          step: 1,
          params: {}
        });
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: 'How many tokens would you like to swap?'
        }]);
        return true;
      } else if (parts.length === 2) {
        // /swap <amount>
        const amount = parts[1];
        if (isNaN(Number(amount))) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            text: 'Please enter a valid number for the amount.'
          }]);
          return true;
        }
        setCommandState({
          type: 'swap',
          step: 2,
          params: { amount }
        });
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: `Swap ${amount} of which token?`
        }]);
        return true;
      } else if (parts.length === 3) {
        // /swap <amount> <fromToken>
        const amount = parts[1];
        const fromToken = parts[2].toUpperCase();
        setCommandState({
          type: 'swap',
          step: 3,
          params: { amount, fromToken }
        });
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: `Swap ${amount} ${fromToken} to which token?`
        }]);
        return true;
      } else if (parts.length === 5 && parts[3].toLowerCase() === 'to') {
        // Complete swap command: /swap <amount> <fromToken> to <toToken>
        const amount = parts[1];
        const fromToken = parts[2].toUpperCase();
        const toToken = parts[4].toUpperCase();
        
        setCommandState({
          type: null,
          step: 0,
          params: {}
        });

        // Process the complete swap command
        processSwapCommand({ amount, fromToken, toToken });
        return true;
      }
    }

    return false;
  };

  const processSwapCommand = async (params: SwapParams) => {
    try {
      const quote = await SwapService.getSwapQuote(params);
      setPendingSwap({ quote, params });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: `Swap Quote:\n${params.amount} ${params.fromToken} → ~${quote.toToken.amount} ${params.toToken}\nPrice Impact: ${quote.priceImpact}%\nEstimated Gas: ${quote.estimatedGas}\n\nType /confirm to execute this swap.`,
        swapQuote: quote,
        swapParams: params
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: 'Failed to get swap quote. Please try again.'
      }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Handle command state
    if (commandState.type === 'swap') {
      const handled = handleCommand(userMessage.text);
      if (handled) {
        setIsLoading(false);
        return;
      }
    }

    // Check for confirm command
    if (userMessage.text.trim().toLowerCase() === '/confirm' && pendingSwap) {
      try {
        // TODO: Replace with real signer from wallet
        const mockSigner = {
          sendTransaction: async () => ({ wait: async () => ({ hash: '0xMOCKHASH' }) })
        } as any;
        const txHash = await SwapService.executeSwap(pendingSwap.params, mockSigner);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: `Swap executed! Transaction hash: ${txHash}`
        }]);
        setPendingSwap(null);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          text: 'Failed to execute swap. Please try again.'
        }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Default: Use AI Copilot
    try {
      const aiResponse = await AICopilotService.getAIResponse(
        userMessage.text,
        user.futurePassAddress
      );

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        text: aiResponse.text,
        action: aiResponse.action
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
      console.error('AI response error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action: Message['action']) => {
    if (!action || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await AICopilotService.executeAIAction(action, user.futurePassAddress);
      
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        text: `Action executed successfully! Transaction hash: ${result}`
      };

      setMessages(prev => [...prev, confirmationMessage]);
    } catch (err) {
      setError('Failed to execute action. Please try again.');
      console.error('Action execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render message with command highlighting
  const renderMessage = (message: Message) => {
    if (message.type === 'user' && message.text.startsWith('/')) {
      const parts = message.text.split(' ');
      return (
        <div className="space-y-1">
          <span className="text-blue-400">{parts[0]}</span>
          {parts.slice(1).map((part, index) => (
            <span key={index} className="text-white">
              {part}{' '}
            </span>
          ))}
        </div>
      );
    }
    return <p className="whitespace-pre-wrap">{message.text}</p>;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Genre AI Copilot</h2>
            <p className="text-sm text-gray-400">Your DeFi assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {renderMessage(message)}
              {message.action && (
                <button
                  onClick={() => handleActionClick(message.action)}
                  className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
                >
                  Execute {message.action.type}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-500/20 border-t border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={commandState.type === 'swap' 
              ? commandState.step === 1 
                ? "Enter amount to swap..."
                : commandState.step === 2 
                  ? "Enter token to swap from..."
                  : "Enter token to swap to..."
              : "Ask me anything about DeFi... or try /swap 10 ROOT to USDT"}
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-6 rounded-lg font-medium ${
              isLoading || !input.trim()
                ? 'bg-blue-600/50 text-white/50 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}; 