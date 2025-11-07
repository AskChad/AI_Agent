import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/ghl/oauth';

/**
 * Initiate GHL OAuth flow
 * Redirects user to GoHighLevel authorization page
 */
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get GHL OAuth credentials from environment
    const clientId = process.env.GHL_CLIENT_ID;
    const redirectUri = process.env.GHL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/ghl/oauth/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'GHL OAuth not configured. Please set GHL_CLIENT_ID environment variable.' },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(clientId, redirectUri, state);

    // Return redirect URL for frontend to handle
    return NextResponse.json({
      success: true,
      authUrl,
    });

  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
