import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/google/oauth/status
 * Returns the Google OAuth connection status for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    // Check if user has Google OAuth tokens
    const client = await db.getClient();
    try {
      const result = await client.query(
        `SELECT
          google_email,
          google_user_id,
          is_active,
          expires_at,
          created_at,
          updated_at
         FROM google_oauth_tokens
         WHERE account_id = $1 AND is_active = TRUE`,
        [user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          connected: false
        });
      }

      const token = result.rows[0];
      const isExpired = new Date(token.expires_at) < new Date();

      return NextResponse.json({
        success: true,
        connected: true,
        google_email: token.google_email,
        google_user_id: token.google_user_id,
        expires_at: token.expires_at,
        is_expired: isExpired,
        connected_at: token.created_at,
        updated_at: token.updated_at
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error checking Google OAuth status:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
