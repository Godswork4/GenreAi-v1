import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const validateApiKey = (key: string) => {
    // Basic OpenAI API key validation
    return key.startsWith('sk-') && key.length > 20;
  };

  const handleSave = () => {
    if (!validateApiKey(apiKey)) {
      setIsValid(false);
      return;
    }
    onSave(apiKey);
    onClose();
  };

  const handleInputChange = (value: string) => {
    setApiKey(value);
    setIsValid(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#1a1b1f] rounded-xl p-6 w-full max-w-md mx-4 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <KeyIcon className="w-6 h-6 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">OpenAI API Key</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="sk-proj-..."
                    className={`w-full bg-gray-800 text-white rounded-lg px-4 py-3 pr-12 outline-none transition-colors ${
                      !isValid ? 'border-2 border-red-500' : 'border border-gray-700 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKey ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {!isValid && (
                  <p className="text-red-400 text-sm mt-1">
                    Please enter a valid OpenAI API key (starts with sk-)
                  </p>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-400 mb-2">How to get your API key:</h3>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenAI API Keys</a></li>
                  <li>2. Sign in to your OpenAI account</li>
                  <li>3. Click "Create new secret key"</li>
                  <li>4. Copy and paste the key here</li>
                </ol>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-400">
                  <strong>Note:</strong> Your API key is stored locally and never sent to our servers. 
                  It's only used to communicate directly with OpenAI\'s API.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Save Key
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApiKeyModal;