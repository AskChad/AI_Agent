import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/google/oauth/disconnect
 * Disconnects the user's Google account by deactivating the OAuth tokens
 */
export async function POST(request: NextRequest) {
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

    // Deactivate the OAuth tokens
    const client = await db.getClient();
    try {
      const result = await client.query(
        `UPDATE google_oauth_tokens
         SET is_active = FALSE, updated_at = NOW()
         WHERE account_id = $1 AND is_active = TRUE
         RETURNING id`,
        [user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No active Google connection found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Google account disconnected successfully'
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error disconnecting Google account:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
