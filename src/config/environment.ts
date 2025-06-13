// Environment configuration with validation
export const ENV_CONFIG = {
  // Wallet Connect
  WALLET_CONNECT_PROJECT_ID: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '',
  
  // Root Network
  TRN_RPC_URL: import.meta.env.VITE_TRN_RPC_URL || 'wss://porcini.rootnet.app',
  ROOT_NETWORK_API_URL: import.meta.env.VITE_ROOT_NETWORK_API_URL || 'https://auth.rootnet.live',
  ROOT_NETWORK_RPC_URL: import.meta.env.VITE_ROOT_NETWORK_RPC_URL || 'wss://porcini.rootnet.app',
  ROOT_NETWORK_CHAIN_ID: import.meta.env.VITE_ROOT_CHAIN_ID ? parseInt(import.meta.env.VITE_ROOT_CHAIN_ID) : 7672,
  
  // AI Services
  ASM_BRAIN_API_URL: import.meta.env.VITE_ASM_BRAIN_API_URL || 'https://api.asmbrain.com',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  
  // FuturePass
  FUTUREPASS_API_URL: import.meta.env.VITE_FUTUREPASS_API_URL || 'https://login.passonline.dev',
  FUTURE_PASS_CLIENT_ID: import.meta.env.VITE_FUTURE_PASS_CLIENT_ID || '',
  
  // Staking Configuration
  STAKING_CONTRACT_ADDRESS: import.meta.env.VITE_STAKING_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890', // Replace with actual contract address
  
  // App Configuration
  APP_NAME: 'Genre AI DeFi',
  APP_VERSION: '1.0.0',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV || false,
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development'
} as const;

// Validation function
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required environment variables
  const required = {
    'WALLET_CONNECT_PROJECT_ID': ENV_CONFIG.WALLET_CONNECT_PROJECT_ID,
    'TRN_RPC_URL': ENV_CONFIG.TRN_RPC_URL,
    'FUTURE_PASS_CLIENT_ID': ENV_CONFIG.FUTURE_PASS_CLIENT_ID,
  };
  
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });
  
  // URL validation
  const urls = {
    'TRN_RPC_URL': ENV_CONFIG.TRN_RPC_URL,
    'ROOT_NETWORK_API_URL': ENV_CONFIG.ROOT_NETWORK_API_URL,
    'ASM_BRAIN_API_URL': ENV_CONFIG.ASM_BRAIN_API_URL,
    'FUTUREPASS_API_URL': ENV_CONFIG.FUTUREPASS_API_URL,
  };
  
  Object.entries(urls).forEach(([key, url]) => {
    try {
      new URL(url);
    } catch {
      errors.push(`Invalid URL format for ${key}: ${url}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Initialize and validate on import
const validation = validateEnvironment();
if (!validation.isValid) {
  console.warn('Environment validation warnings:', validation.errors);
}

export default ENV_CONFIG;