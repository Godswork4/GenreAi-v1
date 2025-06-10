/**
 * PKCE (Proof Key for Code Exchange) utility functions for OAuth2 security
 */

/**
 * Generates a cryptographically secure random code verifier string
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generates a SHA256 code challenge from the code verifier
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Encodes a buffer as base64URL (RFC 4648 Section 5)
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Validates a code verifier format
 */
export function validateCodeVerifier(codeVerifier: string): boolean {
  return /^[A-Za-z0-9\-._~]{43,128}$/.test(codeVerifier);
}