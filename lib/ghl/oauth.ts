/**
 * GoHighLevel OAuth Helper Functions
 * Handles OAuth 2.0 authorization code flow for GHL Marketplace apps
 */

import { createClient } from '@/lib/supabase/server';

const GHL_AUTH_BASE_URL = 'https://marketplace.gohighlevel.com/oauth/chooselocation';
const GHL_TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token';
const GHL_LOCATION_TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/locationToken';

// Required OAuth scopes for messaging
const REQUIRED_SCOPES = [
  'conversations.readonly',
  'conversations.write',
  'conversations/message.readonly',
  'conversations/message.write',
  'contacts.readonly',
  'contacts.write',
];

export interface GHLTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  userType: 'Company' | 'Location';
  locationId?: string;
  companyId?: string;
}

export interface GHLLocationTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  locationId: string;
}

/**
 * Generate OAuth authorization URL to redirect user to GHL
 */
export function getAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  state?: string
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: REQUIRED_SCOPES.join(' '),
  });

  if (state) {
    params.append('state', state);
  }

  return `${GHL_AUTH_BASE_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<GHLTokenResponse> {
  const response = await fetch(GHL_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<GHLTokenResponse> {
  const response = await fetch(GHL_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

/**
 * Generate a location-specific token from a company-level token
 */
export async function getLocationToken(
  companyToken: string,
  locationId: string,
  clientId: string,
  clientSecret: string
): Promise<GHLLocationTokenResponse> {
  const response = await fetch(GHL_LOCATION_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      companyId: locationId,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get location token: ${error}`);
  }

  return response.json();
}

/**
 * Store OAuth tokens in database
 */
export async function storeTokens(
  accountId: string,
  locationId: string,
  tokens: GHLTokenResponse
): Promise<void> {
  const supabase = await createClient();

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const { error } = await supabase
    .from('ghl_oauth_tokens')
    .upsert({
      account_id: accountId,
      ghl_location_id: locationId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_at: expiresAt.toISOString(),
      user_type: tokens.userType,
    }, {
      onConflict: 'account_id,ghl_location_id',
    });

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }

  // Update account with GHL location ID
  await supabase
    .from('accounts')
    .update({ ghl_location_id: locationId })
    .eq('id', accountId);
}

/**
 * Get valid access token for account, refreshing if necessary
 */
export async function getValidToken(
  accountId: string,
  locationId: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const supabase = await createClient();

  const { data: tokenData, error } = await supabase
    .from('ghl_oauth_tokens')
    .select('*')
    .eq('account_id', accountId)
    .eq('ghl_location_id', locationId)
    .single();

  if (error || !tokenData) {
    throw new Error('No OAuth tokens found. Please reconnect to GoHighLevel.');
  }

  // Check if token is expired (with 5 minute buffer)
  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000; // 5 minutes

  if (expiresAt.getTime() - now.getTime() > bufferMs) {
    // Token is still valid
    return tokenData.access_token;
  }

  // Token is expired or about to expire, refresh it
  try {
    const newTokens = await refreshAccessToken(
      tokenData.refresh_token,
      clientId,
      clientSecret
    );

    // Store new tokens
    await storeTokens(accountId, locationId, newTokens);

    return newTokens.access_token;
  } catch (error) {
    throw new Error('Failed to refresh token. Please reconnect to GoHighLevel.');
  }
}

/**
 * Revoke OAuth tokens (disconnect)
 */
export async function revokeTokens(
  accountId: string,
  locationId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('ghl_oauth_tokens')
    .delete()
    .eq('account_id', accountId)
    .eq('ghl_location_id', locationId);

  if (error) {
    throw new Error(`Failed to revoke tokens: ${error.message}`);
  }
}
