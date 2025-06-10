import { motion } from 'framer-motion';
import { ChatBubbleLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Analytics = () => {
  const tokens = [
    { name: 'TRN', balance: '1,234.56', value: '$2,345.67', apy: '15.24%' },
    { name: 'ROOT', balance: '557.63', value: '$4,567.69', apy: '12.8%' },
  ];

  const leaderboard = [
    { rank: 1, address: '598.28-47535E', balance: '1234.56 ROOT', avatar: '🎮' },
    { rank: 2, address: '234.56-89012A', balance: '987.65 ROOT', avatar: '🎯' },
    { rank: 3, address: '876.54-32109B', balance: '765.43 ROOT', avatar: '🎲' },
  ];

  return (
    <div className="min-h-screen bg-background py-4 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Token Balances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 lg:space-y-6"
          >
            <div className="bg-surface rounded-xl lg:rounded-2xl p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Total Balance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-white">$12,345</p>
                  <p className="text-xs lg:text-sm text-gray-400 mt-1">Staked: 58.765</p>
                </div>
                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20"></div>
              </div>
            </div>

            {tokens.map((token, index) => (
              <motion.div
                key={token.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface rounded-xl lg:rounded-2xl p-4 lg:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base lg:text-lg font-medium text-white">{token.name}</h3>
                    <p className="text-xl lg:text-2xl font-bold text-white mt-2">{token.balance} {token.name}</p>
                    <p className="text-xs lg:text-sm text-gray-400 mt-1">{token.value}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs lg:text-sm text-gray-400">APY</p>
                    <p className="text-base lg:text-lg font-semibold text-green-400">{token.apy}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* AI Copilot & Community */}
          <div className="space-y-4 lg:space-y-6">
            {/* Swap Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface rounded-xl lg:rounded-2xl p-4 lg:p-6"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-white">Swap</h2>
                <button className="text-primary hover:text-primary-dark transition-colors">
                  <UserGroupIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 lg:space-y-4">
                <div className="bg-surface-dark rounded-lg lg:rounded-xl p-3 lg:p-4">
                  <input
                    type="text"
                    placeholder="0"
                    className="w-full bg-transparent text-white text-xl lg:text-2xl font-bold focus:outline-none"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm lg:text-base text-gray-400">TRN</span>
                    <span className="text-sm lg:text-base text-gray-400">Balance: 1,234.56</span>
                  </div>
                </div>
                <div className="bg-surface-dark rounded-lg lg:rounded-xl p-3 lg:p-4">
                  <input
                    type="text"
                    placeholder="0"
                    className="w-full bg-transparent text-white text-xl lg:text-2xl font-bold focus:outline-none"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm lg:text-base text-gray-400">ROOT</span>
                    <span className="text-sm lg:text-base text-gray-400">Balance: 557.63</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2.5 lg:py-3 rounded-lg lg:rounded-xl font-medium shadow-glow hover:shadow-glow-strong transition-all duration-300">
                  Swap
                </button>
              </div>
            </motion.div>

            {/* AI Copilot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface rounded-xl lg:rounded-2xl p-4 lg:p-6"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-white">AI Copilot</h2>
                <ChatBubbleLeftIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-surface-dark rounded-lg lg:rounded-xl p-3 lg:p-4 mb-3 lg:mb-4">
                <p className="text-sm lg:text-base text-gray-400">Hello! How can I assist you today?</p>
              </div>
              <div className="flex space-x-3 lg:space-x-4">
                <input
                  type="text"
                  placeholder="Ask about DeFi strategies..."
                  className="flex-1 bg-surface-dark rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 text-sm lg:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="bg-primary text-white px-3 lg:px-4 rounded-lg lg:rounded-xl hover:bg-primary-dark transition-colors">
                  Send
                </button>
              </div>
            </motion.div>

            {/* Community Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-surface rounded-xl lg:rounded-2xl p-4 lg:p-6"
            >
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Leaderboard</h2>
              <div className="space-y-3 lg:space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center justify-between bg-surface-dark rounded-lg lg:rounded-xl p-3 lg:p-4">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <span className="text-xl lg:text-2xl">{user.avatar}</span>
                      <div>
                        <p className="text-sm lg:text-base text-white font-medium truncate max-w-[120px] lg:max-w-[160px]">{user.address}</p>
                        <p className="text-xs lg:text-sm text-gray-400">Rank #{user.rank}</p>
                      </div>
                    </div>
                    <p className="text-sm lg:text-base text-primary font-medium">{user.balance}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 