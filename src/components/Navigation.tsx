import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useConfig } from '../providers/ConfigProvider';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { config, updateConfig, validateConfig } = useConfig();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/swap', label: 'Swap' },
    { path: '/chat', label: 'Chat' },
    { path: '/leaderboard', label: 'Leaderboard' }
  ];

  // Access configuration values
  const futurePassConfig = config.futurePass;
  
  // Update configuration if needed
  const updateFuturePassConfig = () => {
    updateConfig({
      futurePass: {
        ...config.futurePass,
        apiUrl: 'new-url',
      }
    });
  };

  // Validate configuration
  const { isValid, errors } = validateConfig();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Genre AI</div>
        <div className="flex items-center gap-6">
          <div className="flex gap-6">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`${
                  isActive(path)
                    ? 'text-blue-400 font-semibold'
                    : 'text-gray-300 hover:text-white'
                } transition-colors`}
              >
                {label}
              </Link>
            ))}
          </div>
          {user && (
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-600">
              <span className="text-sm text-gray-400">
                {user.isDemo ? 'Demo Mode' : user.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}; 