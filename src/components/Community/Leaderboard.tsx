import { UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  username: string;
  amount: string;
  tokenSymbol: string;
}

const Leaderboard = () => {
  const leaderboardData: LeaderboardEntry[] = [
    { username: 'Attco', amount: '1234.56', tokenSymbol: 'ROOT' },
    { username: 'Trading_Pro', amount: '987.32', tokenSymbol: 'ROOT' },
    { username: 'DeFi_Master', amount: '756.89', tokenSymbol: 'ROOT' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1b1f] rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Community</h2>
        <button className="text-blue-500 hover:text-blue-400">
          <UserCircleIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Leaderboard</h3>
        {leaderboardData.map((entry, index) => (
          <motion.div
            key={entry.username}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg bg-[#212226] hover:bg-[#2a2b30] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-500 text-sm">{index + 1}</span>
              </div>
              <span className="text-white">{entry.username}</span>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{entry.amount} {entry.tokenSymbol}</p>
              <p className="text-sm text-gray-400">598.28 47835E</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Leaderboard; 