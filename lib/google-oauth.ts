import { db } from '@/lib/db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

/**
 * Get valid Google OAuth tokens for a user
 * Automatically refreshes if expired
 */
export async function getValidGoogleTokens(accountId: string): Promise<GoogleTokens | null> {
  const client = await db.getClient();
  try {
    // Get current tokens
    const result = await client.query(
      `SELECT access_token, refresh_token, expires_at
       FROM google_oauth_tokens
       WHERE account_id = $1 AND is_active = TRUE`,
      [accountId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const tokens = result.rows[0];
    const expiresAt = new Date(tokens.expires_at);

    // Check if token is expired or will expire in the next 5 minutes
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      // Token is still valid
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt
      };
    }

    // Token is expired or expiring soon, refresh it
    console.log('Refreshing expired Google OAuth token...');
    const newTokens = await refreshGoogleToken(tokens.refresh_token);

    if (!newTokens) {
      // Refresh failed, mark tokens as inactive
      await client.query(
        `UPDATE google_oauth_tokens
         SET is_active = FALSE
         WHERE account_id = $1`,
        [accountId]
      );
      return null;
    }

    // Update tokens in database
    const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
    await client.query(
      `UPDATE google_oauth_tokens
       SET access_token = $1,
           expires_at = $2,
           updated_at = NOW()
       WHERE account_id = $3`,
      [newTokens.access_token, newExpiresAt, accountId]
    );

    return {
      access_token: newTokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: newExpiresAt
    };

  } finally {
    client.release();
  }
}

/**
 * Refresh a Google OAuth access token using a refresh token
 */
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token refresh failed:', errorData);
      return null;
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      expires_in: data.expires_in
    };

  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
}

/**
 * Revoke Google OAuth tokens
 */
export async function revokeGoogleTokens(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error revoking Google tokens:', error);
    return false;
  }
}
