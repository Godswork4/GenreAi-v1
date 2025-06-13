import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import { FUTUREPASS_CONFIG } from '../config/futurepass.config';

interface AuthResponse {
  token: string;
  user: {
    email?: string;
    address: string;
  };
}

class FuturePassService {
  private static codeVerifier: string;
  private static nonce: string;

  static async login() {
    try {
      // Generate PKCE code verifier and challenge
      this.codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(this.codeVerifier);
      
      // Generate state for CSRF protection
      const state = this.generateState();
      
      // Generate nonce
      this.nonce = this.generateNonce();
      
      // Store state and code verifier for validation
      sessionStorage.setItem('auth_state', state);
      sessionStorage.setItem('code_verifier', this.codeVerifier);
      sessionStorage.setItem('nonce', this.nonce);
      
      // Build authorization URL
      const authUrl = new URL(`${FUTUREPASS_CONFIG.API_URL}/oauth/authorize`);
      
      // Add all required parameters
      const params = {
        client_id: FUTUREPASS_CONFIG.CLIENT_ID,
        response_type: 'code',
        scope: FUTUREPASS_CONFIG.AUTH_CONFIG.scope,
        redirect_uri: FUTUREPASS_CONFIG.AUTH_CONFIG.redirect_uri,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        nonce: this.nonce
      };

      // Add parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          authUrl.searchParams.set(key, value);
        }
      });
      
      console.log('Redirecting to:', authUrl.toString());
      
      // Redirect to authorization server
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('FuturePass login error:', error);
      throw new Error('Failed to initialize login. Please try again.');
    }
  }

  static async handleCallback(code: string, state: string | null): Promise<AuthResponse> {
    try {
      // Validate state
      const storedState = sessionStorage.getItem('auth_state');
      const storedCodeVerifier = sessionStorage.getItem('code_verifier');
      
      if (!storedState || !storedCodeVerifier) {
        throw new Error('Missing authentication state. Please try logging in again.');
      }

      if (state !== storedState) {
        throw new Error('Invalid state parameter - possible security issue. Please try again.');
      }

      console.log('Exchanging code for token...');

      // Exchange code for token
      const tokenResponse = await axios.post(`${FUTUREPASS_CONFIG.API_URL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: FUTUREPASS_CONFIG.CLIENT_ID,
        code,
        redirect_uri: FUTUREPASS_CONFIG.AUTH_CONFIG.redirect_uri,
        code_verifier: storedCodeVerifier
      });

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new Error('No access token received from server.');
      }

      // Store the token
      localStorage.setItem('auth_token', access_token);

      // Get user info
      const userResponse = await axios.get(`${FUTUREPASS_CONFIG.API_URL}/oauth/userinfo`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      // Clear session storage
      sessionStorage.removeItem('auth_state');
      sessionStorage.removeItem('code_verifier');
      sessionStorage.removeItem('nonce');

      const userInfo = userResponse.data;
      return {
        token: access_token,
        user: {
          email: userInfo.email,
          address: userInfo.futurepass || userInfo.wallet || userInfo.sub
        }
      };
    } catch (error) {
      console.error('FuturePass callback error:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error_description || 
                           error.response?.data?.error || 
                           error.message;
        throw new Error(`Authentication failed: ${errorMessage}`);
      }
      
      throw error;
    }
  }

  static async logout() {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Clear any stored tokens
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      
      // Build logout URL
      const logoutUrl = new URL(`${FUTUREPASS_CONFIG.API_URL}/oauth/logout`);
      logoutUrl.searchParams.set('client_id', FUTUREPASS_CONFIG.CLIENT_ID);
      logoutUrl.searchParams.set('post_logout_redirect_uri', FUTUREPASS_CONFIG.POST_LOGOUT_URLS[0]);
      
      if (token) {
        logoutUrl.searchParams.set('id_token_hint', token);
      }
      
      window.location.href = logoutUrl.toString();
    } catch (error) {
      console.error('FuturePass logout error:', error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      window.location.href = '/';
    }
  }

  static async getWalletAddress(): Promise<string | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      const response = await axios.get(`${FUTUREPASS_CONFIG.API_URL}/oauth/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      return response.data.futurepass || response.data.wallet || response.data.sub || null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }

  static async isConnected(): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;
      
      // Verify token is still valid
      const response = await axios.get(`${FUTUREPASS_CONFIG.API_URL}/oauth/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      return !!response.data;
    } catch {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      return false;
    }
  }

  private static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export { FuturePassService };