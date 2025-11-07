import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/google/oauth/callback`
  : 'http://localhost:3000/api/google/oauth/callback';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/knowledge`
  : 'http://localhost:3000/dashboard/knowledge';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface GoogleUserInfo {
  email: string;
  id: string;
  name: string;
}

/**
 * GET /api/google/oauth/callback
 * Handles the OAuth callback from Google, exchanges code for tokens, and stores them
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${DASHBOARD_URL}?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${DASHBOARD_URL}?error=missing_parameters`);
    }

    // Verify state parameter
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      return NextResponse.redirect(`${DASHBOARD_URL}?error=invalid_state`);
    }

    // Verify timestamp (state should be less than 10 minutes old)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(`${DASHBOARD_URL}?error=expired_state`);
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || user.id !== stateData.userId) {
      return NextResponse.redirect(`${DASHBOARD_URL}?error=unauthorized`);
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(`${DASHBOARD_URL}?error=token_exchange_failed`);
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    if (!tokens.refresh_token) {
      console.error('No refresh token received. User may need to revoke access and try again.');
      return NextResponse.redirect(`${DASHBOARD_URL}?error=no_refresh_token`);
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info from Google');
      return NextResponse.redirect(`${DASHBOARD_URL}?error=user_info_failed`);
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Store tokens in database
    const client = await db.getClient();
    try {
      await client.query(
        `INSERT INTO google_oauth_tokens (
          account_id, access_token, refresh_token, token_type,
          scope, expires_at, google_email, google_user_id, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (account_id)
        DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          token_type = EXCLUDED.token_type,
          scope = EXCLUDED.scope,
          expires_at = EXCLUDED.expires_at,
          google_email = EXCLUDED.google_email,
          google_user_id = EXCLUDED.google_user_id,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()`,
        [
          user.id,
          tokens.access_token,
          tokens.refresh_token,
          tokens.token_type,
          tokens.scope,
          expiresAt,
          userInfo.email,
          userInfo.id,
          true
        ]
      );

      // Redirect back to knowledge base with success message
      return NextResponse.redirect(`${DASHBOARD_URL}?google_connected=true`);

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(`${DASHBOARD_URL}?error=${encodeURIComponent(error.message)}`);
  }
}
