import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidGoogleTokens } from '@/lib/google-oauth';

export const dynamic = 'force-dynamic';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
}

/**
 * GET /api/google/docs
 * Lists Google Docs from the user's Google Drive
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

    // Get valid Google OAuth tokens
    const tokens = await getValidGoogleTokens(user.id);

    if (!tokens) {
      return NextResponse.json({
        success: false,
        error: 'Google account not connected or tokens expired. Please reconnect your Google account.'
      }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const pageToken = searchParams.get('pageToken') || '';

    // List Google Docs from Drive
    const queryParams = new URLSearchParams({
      q: "mimeType='application/vnd.google-apps.document' and trashed=false",
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink)',
      pageSize: pageSize.toString(),
      orderBy: 'modifiedTime desc'
    });

    if (pageToken) {
      queryParams.set('pageToken', pageToken);
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to list Google Docs:', errorData);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Google Docs'
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      files: data.files || [],
      nextPageToken: data.nextPageToken || null
    });

  } catch (error: any) {
    console.error('Error listing Google Docs:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
