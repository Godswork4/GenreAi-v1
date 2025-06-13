export const FUTUREPASS_CONFIG = {
  // Client Details
  CLIENT_NAME: 'Genre AI',
  CLIENT_ID: import.meta.env.VITE_FUTURE_PASS_CLIENT_ID || '',
  
  // Redirect URLs (add both development and production)
  REDIRECT_URLS: [
    'http://localhost:3000/callback',
    'http://localhost:3000/auth/callback',
    window.location.origin + '/callback',
    window.location.origin + '/auth/callback'
  ],
  
  // Post Logout URLs
  POST_LOGOUT_URLS: [
    'http://localhost:3000',
    window.location.origin
  ],
  
  // Error handling URLs
  ERROR_URLS: [
    'http://localhost:3000/error',
    window.location.origin + '/error'
  ],
  
  // Client Type
  CLIENT_TYPE: 'web',
  
  // Feature Flags
  FEATURE_FLAGS: ['profile', 'wallet'],
  
  // Access Token (store this securely, preferably in environment variables)
  ACCESS_TOKEN: import.meta.env.VITE_FUTUREPASS_ACCESS_TOKEN || '',
  
  // Scopes needed for your application
  SCOPES: [
    'openid',
    'profile',
    'email',
    'futurepass:read',
    'wallet'
  ],
  
  // Auth Configuration
  AUTH_CONFIG: {
    response_type: 'code',
    code_challenge_method: 'S256',
    scope: 'openid profile email futurepass:read wallet',
    client_id: import.meta.env.VITE_FUTURE_PASS_CLIENT_ID || '',
    redirect_uri: window.location.origin + '/callback',
    error_uri: window.location.origin + '/error'
  },
  
  // API URLs
  API_URL: 'https://login.passonline.dev',
  API_VERSION: 'v1',
  
  // Environment
  ENVIRONMENT: import.meta.env.MODE === 'production' ? 'production' : 'development',
  
  // Branding
  BRANDING: {
    name: 'Genre AI',
    logo: 'https://genre.ai/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6'
  },
  
  // Error Handling
  ERROR_HANDLING: {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackUrl: window.location.origin + '/error'
  }
}; 