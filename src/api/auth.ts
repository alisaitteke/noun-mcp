/**
 * OAuth 1.0a Authentication for The Noun Project API
 * 
 * The Noun Project API uses OAuth 1.0a for authentication.
 * This module generates OAuth signature headers for each request.
 */

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

/**
 * OAuth client instance
 */
let oauthClient: OAuth | null = null;

/**
 * OAuth credentials
 */
interface OAuthCredentials {
  consumerKey: string;
  consumerSecret: string;
}

/**
 * Initialize the OAuth client
 * 
 * @param consumerKey - The Noun Project consumer key
 * @param consumerSecret - The Noun Project consumer secret
 */
export function initializeOAuth(consumerKey: string, consumerSecret: string): void {
  oauthClient = new OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerSecret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString, key) {
      return crypto
        .createHmac('sha1', key)
        .update(baseString)
        .digest('base64');
    },
  });
}

/**
 * Generate OAuth authorization header for the given URL and method
 * 
 * @param url - Request URL
 * @param method - HTTP method (GET, POST, etc.)
 * @returns OAuth authorization header
 * @throws Error if OAuth client is not initialized
 */
export function getOAuthHeaders(url: string, method: string = 'GET'): { Authorization: string } {
  if (!oauthClient) {
    throw new Error(
      'OAuth client is not initialized. Please call initializeOAuth() first. ' +
      'Make sure NOUN_CONSUMER_KEY and NOUN_CONSUMER_SECRET are set in your environment.'
    );
  }

  const requestData = {
    url,
    method: method.toUpperCase(),
  };

  const authHeader = oauthClient.toHeader(oauthClient.authorize(requestData));
  
  return authHeader as { Authorization: string };
}

/**
 * Check if OAuth client is initialized
 * 
 * @returns true if OAuth client is initialized
 */
export function isOAuthInitialized(): boolean {
  return oauthClient !== null;
}

/**
 * Get credentials from environment variables and initialize OAuth
 * 
 * @throws Error if required environment variables are not set
 */
export function initializeFromEnv(): void {
  const consumerKey = process.env.NOUN_CONSUMER_KEY;
  const consumerSecret = process.env.NOUN_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      'Missing required environment variables: NOUN_CONSUMER_KEY and NOUN_CONSUMER_SECRET\n\n' +
      'Please follow these steps:\n' +
      '1. Visit https://thenounproject.com/developers/apps/\n' +
      '2. Create a new app or select an existing one\n' +
      '3. Copy your Consumer Key and Consumer Secret\n' +
      '4. Create a .env file with:\n' +
      '   NOUN_CONSUMER_KEY=your_key_here\n' +
      '   NOUN_CONSUMER_SECRET=your_secret_here'
    );
  }

  initializeOAuth(consumerKey, consumerSecret);
}
