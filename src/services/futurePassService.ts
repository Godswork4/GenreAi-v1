import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import { ENV_CONFIG } from '../config/environment';

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
      const authUrl = new URL(`${ENV_CONFIG.FUTUREPASS_API_URL}/auth`);
      authUrl.searchParams.set('client_id', ENV_CONFIG.FUTURE_PASS_CLIENT_ID);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid profile email futurepass:read');
      authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      authUrl.searchParams.set('nonce', this.nonce);
      
      console.log('Redirecting to:', authUrl.toString());
      
      // Redirect to authorization server
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('FuturePass login error:', error);
      throw error;
    }
  }

  static async handleCallback(code: string, state: string | null): Promise<AuthResponse> {
    try {
      // Validate state
      const storedState = sessionStorage.getItem('auth_state');
      const storedCodeVerifier = sessionStorage.getItem('code_verifier');
      
      if (state !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      if (!storedCodeVerifier) {
        throw new Error('Missing PKCE code verifier');
      }

      console.log('Exchanging code for token...');

      // Exchange code for token
      const tokenResponse = await axios.post(`${ENV_CONFIG.FUTUREPASS_API_URL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: ENV_CONFIG.FUTURE_PASS_CLIENT_ID,
        code,
        redirect_uri: `${window.location.origin}/auth/callback`,
        code_verifier: storedCodeVerifier
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Token response:', tokenResponse.data);

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new Error('No access token received');
      }

      // Get user info
      const userResponse = await axios.get(`${ENV_CONFIG.FUTUREPASS_API_URL}/oauth/userinfo`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Accept': 'application/json'
        }
      });

      console.log('User response:', userResponse.data);

      // Clear session storage
      sessionStorage.removeItem('auth_state');
      sessionStorage.removeItem('code_verifier');
      sessionStorage.removeItem('nonce');

      return {
        token: access_token,
        user: {
          email: userResponse.data.email,
          address: userResponse.data.futurepass || userResponse.data.wallet || userResponse.data.sub
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
      // Clear any stored tokens
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      
      // Build logout URL
      const logoutUrl = new URL(`${ENV_CONFIG.FUTUREPASS_API_URL}/logout`);
      logoutUrl.searchParams.set('client_id', ENV_CONFIG.FUTURE_PASS_CLIENT_ID);
      logoutUrl.searchParams.set('post_logout_redirect_uri', window.location.origin);
      
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
      
      const response = await axios.get(`${ENV_CONFIG.FUTUREPASS_API_URL}/oauth/userinfo`, {
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
      const response = await axios.get(`${ENV_CONFIG.FUTUREPASS_API_URL}/oauth/userinfo`, {
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