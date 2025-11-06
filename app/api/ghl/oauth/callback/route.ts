import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, storeTokens } from '@/lib/ghl/oauth';

/**
 * GHL OAuth callback handler
 * Receives authorization code and exchanges it for access token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?ghl_error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?ghl_error=missing_parameters`
      );
    }

    // Verify state parameter
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?ghl_error=invalid_state`
      );
    }

    // Check state timestamp (prevent replay attacks)
    const stateAge = Date.now() - stateData.timestamp;
    if (stateAge > 10 * 60 * 1000) { // 10 minutes
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?ghl_error=expired_state`
      );
    }

    // Get OAuth credentials
    const clientId = process.env.GHL_CLIENT_ID!;
    const clientSecret = process.env.GHL_CLIENT_SECRET!;
    const redirectUri = process.env.GHL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/ghl/oauth/callback`;

    // Exchange code for token
    const tokens = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri);

    // Get location ID from token response
    const locationId = tokens.locationId || tokens.companyId;
    if (!locationId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?ghl_error=no_location_id`
      );
    }

    // Store tokens in database
    await storeTokens(stateData.userId, locationId, tokens);

    // Success! Redirect to settings page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?ghl_connected=true`
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?ghl_error=callback_failed`
    );
  }
}
