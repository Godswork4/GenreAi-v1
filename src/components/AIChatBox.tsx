import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/authStore';
import { AICopilotService } from '../services/aiCopilotService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  action?: {
    type: string;
    params: Record<string, string>;
  };
}

export const AIChatBox: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const aiResponse = await AICopilotService.getAIResponse(
        userMessage.text,
        user.futurePassAddress
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
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
              <p className="whitespace-pre-wrap">{message.text}</p>
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
            placeholder="Ask me anything about DeFi..."
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