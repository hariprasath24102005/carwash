/**
 * Gmail Authentication Service
 * Handles Google OAuth 2.0 flow for Gmail API access
 * Stores and retrieves access tokens from localStorage
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/callback`;

/**
 * Initiate Google OAuth sign-in flow
 * Opens Google's OAuth consent screen to get access token
 */
export async function googleSignIn(): Promise<string> {
  try {
    // Check if Google API client library is loaded
    if (typeof (window as any).google === 'undefined') {
      throw new Error(
        'Google API client not loaded. Add this to your HTML <head>:\n' +
        '<script async defer src="https://accounts.google.com/gsi/client"><\/script>'
      );
    }

    // Check if already have a token stored
    const existingToken = localStorage.getItem('google_access_token');
    if (existingToken) {
      console.log('Using stored Google access token');
      return existingToken;
    }

    // In a real implementation, this would use Google's OAuth 2.0 library
    // to open the consent screen and get an access token
    throw new Error(
      'Google OAuth not configured. To enable Gmail integration:\n\n' +
      '1. Go to https://console.cloud.google.com\n' +
      '2. Create OAuth 2.0 Client ID (Web Application)\n' +
      '3. Add authorized redirect URIs:\n' +
      `   - ${GOOGLE_REDIRECT_URI}\n` +
      '4. Copy Client ID to .env.local:\n' +
      '   VITE_GOOGLE_CLIENT_ID=your_client_id_here\n' +
      '5. Implement the OAuth consent screen and token exchange'
    );
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign out from Google and clear stored access token
 */
export async function googleLogout(): Promise<void> {
  try {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user_info');

    // In a real implementation, would also sign out from Google API
    if (typeof (window as any).google !== 'undefined') {
      (window as any).google.accounts.id.revoke('', () => {
        console.log('Google Sign-Out complete');
      });
    }
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
}

/**
 * Get stored access token from localStorage
 * Returns null if no token is stored
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('google_access_token');
}

/**
 * Store access token in localStorage
 * Called after successful OAuth token exchange
 */
export function setAccessToken(token: string): void {
  localStorage.setItem('google_access_token', token);
}

/**
 * Check if user is authenticated with Google
 */
export function isGoogleAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Store user info in localStorage
 */
export function setUserInfo(userInfo: any): void {
  localStorage.setItem('google_user_info', JSON.stringify(userInfo));
}

/**
 * Get stored user info from localStorage
 */
export function getUserInfo(): any | null {
  const stored = localStorage.getItem('google_user_info');
  return stored ? JSON.parse(stored) : null;
}