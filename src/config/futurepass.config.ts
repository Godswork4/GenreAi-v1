export const FUTUREPASS_CONFIG = {
  // Client Details
  CLIENT_NAME: 'Genre AI DeFi',
  CLIENT_ID: import.meta.env.VITE_FUTURE_PASS_CLIENT_ID || '',
  
  // Redirect URLs (add both development and production)
  REDIRECT_URLS: [
    'http://localhost:5173/auth/callback',
    'http://localhost:3000/auth/callback',
    'https://genre-ai-defi.vercel.app/auth/callback'
  ],
  
  // Post Logout URLs
  POST_LOGOUT_URLS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://genre-ai-defi.vercel.app'
  ],
  
  // Client Type
  CLIENT_TYPE: 'web',
  
  // Feature Flags
  FEATURE_FLAGS: ['swap', 'stake', 'liquidity'],
  
  // Access Token (store this securely, preferably in environment variables)
  ACCESS_TOKEN: import.meta.env.VITE_FUTUREPASS_ACCESS_TOKEN || '',
  
  // Scopes needed for your application
  SCOPES: [
    'openid',
    'profile',
    'email',
    'wallet'
  ],
  
  // Auth Configuration
  AUTH_CONFIG: {
    response_type: 'code',
    code_challenge_method: 'S256',
    scope: 'openid profile email wallet',
  },
  
  // API URLs
  API_URL: import.meta.env.VITE_FUTUREPASS_API_URL || 'https://login.passonline.dev',
  
  // Environment
  ENVIRONMENT: 'development',
  
  // Branding
  BRANDING: {
    name: 'Genre AI',
    logo: 'https://genre.ai/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6'
  }
}; 