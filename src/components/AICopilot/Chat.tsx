import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, KeyIcon, BeakerIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { useAuth } from '../../store/authStore';
import { AICopilotService } from '../../services/aiCopilotService';
import { SwapService, SwapParams, SwapQuote } from '../../services/ai/swapService';
import SpeechAssistant from './SpeechAssistant';
import ApiKeyModal from '../ApiKeyModal';
import { walletService } from '../../services/wallet';

type ActionType = 'swap' | 'stake' | 'unstake' | 'provide_liquidity' | 'bridge';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai';
  action?: {
    type: ActionType;
    params: Record<string, string>;
  };
  suggestions?: string[];
  swapQuote?: SwapQuote;
  swapParams?: SwapParams;
}

interface CommandState {
  type: 'swap' | 'balance' | null;
  step: number;
  params: Partial<SwapParams>;
}

interface MotionDivProps extends MotionProps {
  className?: string;
  children?: React.ReactNode;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const activeAddress = walletService.address;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Genre AI, your DeFi assistant. How can I help you today?",
      type: 'ai',
      suggestions: [
        "Help me swap tokens",
        "What are the current staking rates?",
        "Show my portfolio",
        "How to provide liquidity?",
        "Explain DeFi concepts"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showInitialOptions, setShowInitialOptions] = useState(true);
  const [commandState, setCommandState] = useState<CommandState>({
    type: null,
    step: 0,
    params: {}
  });
  const [pendingSwap, setPendingSwap] = useState<{quote: SwapQuote, params: SwapParams} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if user has API key stored
    const storedApiKey = localStorage.getItem('openai_api_key');
    setHasApiKey(!!storedApiKey);
  }, []);

  // Clear chat context when component unmounts
  useEffect(() => {
    return () => {
      AICopilotService.clearChatHistory();
    };
  }, []);

  const simulateTyping = async (text: string): Promise<void> => {
    setIsTyping(true);
    const words = text.split(' ');
    let currentText = '';
    
    for (const word of words) {
      currentText += word + ' ';
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = currentText.trim();
        return newMessages;
      });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    setIsTyping(false);
  };

  const handleApiKeySave = (apiKey: string) => {
    localStorage.setItem('openai_api_key', apiKey);
    setHasApiKey(true);
    setShowInitialOptions(false);
  };

  const handleTryDemo = () => {
    setShowInitialOptions(false);
    setHasApiKey(false); // Use demo mode
  };

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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!input.trim() || !activeAddress || isLoading || isTyping) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const loadingId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: loadingId.toString(),
        text: '...',
        type: 'ai'
      }]);

      if (!activeAddress) {
        throw new Error('No wallet address available');
      }

      const apiKey = hasApiKey ? localStorage.getItem('openai_api_key') : null;
      const aiResponse = await AICopilotService.getAIResponse(
        userMessage.text,
        activeAddress,
        apiKey
      );

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== loadingId.toString());
        return [...filtered, {
          id: loadingId.toString(),
          type: 'ai',
          text: '',
          action: aiResponse.action,
          suggestions: aiResponse.suggestions
        }];
      });

      await simulateTyping(aiResponse.text);

      // Text-to-speech
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(aiResponse.text);
        speech.rate = 0.9;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.');
      console.error('AI response error:', err);
      
      setMessages(prev => prev.filter(m => m.text !== '...'));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  const handleTranscript = (text: string) => {
    setInput(text);
  };

  const handleActionClick = async (action: Message['action']) => {
    if (!action || !user) return;

    try {
      const walletAddress = user.futurePassAddress || user.demoWalletAddress;
      if (!walletAddress) {
        throw new Error('No wallet address available');
      }

      // TODO: Replace with real signer from wallet
      const mockSigner = {
        sendTransaction: async () => ({ wait: async () => ({ hash: '0xMOCKHASH' }) })
      } as any;

      const txHash = await AICopilotService.executeAIAction(action, walletAddress, mockSigner);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: `Action executed! Transaction hash: ${txHash}`
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute action. Please try again.');
    }
  };

  const MotionDiv = motion.div as React.FC<MotionDivProps>;

  if (showInitialOptions) {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full bg-[#1a1b1f] items-center justify-center p-6"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Genre AI</h2>
          <p className="text-gray-400">Choose how you'd like to use the AI assistant</p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="w-full flex items-center justify-center gap-3 p-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <KeyIcon className="w-5 h-5" />
            <span className="font-medium">Use Your OpenAI API Key</span>
          </button>

          <button
            onClick={handleTryDemo}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <BeakerIcon className="w-5 h-5" />
            <span className="font-medium">Try Demo Mode</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Demo mode provides basic responses without AI
          </p>
          <p className="text-sm text-gray-500">
            For full AI capabilities, use your own OpenAI API key
          </p>
        </div>

        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onSave={handleApiKeySave}
        />
      </MotionDiv>
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-[#1a1b1f]"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Genre AI</h2>
            <p className="text-sm text-gray-400">
              {hasApiKey ? 'AI-Powered Assistant' : 'Demo Mode'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Chat History">
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </button>
          <div className={`h-2 w-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Manage API Key"
          >
            <KeyIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MotionDiv
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#212226] text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              {message.action && (
                <button
                  onClick={() => handleActionClick(message.action)}
                  className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
                >
                  Execute {message.action.type}
                </button>
              )}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </MotionDiv>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-500/20 border-t border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="p-6 border-t border-gray-800">
        <form onSubmit={handleSend} className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={commandState.type === 'swap' 
                ? commandState.step === 1 
                  ? "Enter amount to swap..."
                  : commandState.step === 2 
                    ? "Enter token to swap from..."
                    : "Enter token to swap to..."
                : "Ask me anything about DeFi... or try /swap 10 ROOT to USDT"}
              className="w-full bg-[#212226] text-white rounded-lg pl-4 pr-12 py-3 outline-none placeholder-gray-500"
              disabled={isLoading || isTyping}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || isTyping}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg ${
                isLoading || !input.trim() || isTyping
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-blue-500 hover:text-blue-400'
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          <SpeechAssistant onTranscript={handleTranscript} isProcessing={isLoading || isTyping} />
        </form>
      </div>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
        currentApiKey={localStorage.getItem('openai_api_key') || ''}
      />
    </MotionDiv>
  );
};

export default Chat;