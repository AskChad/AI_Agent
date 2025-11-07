import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidGoogleTokens } from '@/lib/google-oauth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ImportRequest {
  document_id: string;
  agent_id?: string;
}

/**
 * POST /api/google/docs/import
 * Imports a Google Doc into the knowledge base
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

    // Get request body
    const body: ImportRequest = await request.json();

    if (!body.document_id) {
      return NextResponse.json({
        success: false,
        error: 'document_id is required'
      }, { status: 400 });
    }

    // Get valid Google OAuth tokens
    const tokens = await getValidGoogleTokens(user.id);

    if (!tokens) {
      return NextResponse.json({
        success: false,
        error: 'Google account not connected or tokens expired. Please reconnect your Google account.'
      }, { status: 401 });
    }

    // Fetch document metadata
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${body.document_id}?fields=id,name,mimeType,webViewLink`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      const errorData = await metadataResponse.text();
      console.error('Failed to fetch document metadata:', errorData);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch document information'
      }, { status: metadataResponse.status });
    }

    const metadata = await metadataResponse.json();

    // Fetch document content
    const contentResponse = await fetch(
      `https://docs.googleapis.com/v1/documents/${body.document_id}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!contentResponse.ok) {
      const errorData = await contentResponse.text();
      console.error('Failed to fetch document content:', errorData);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch document content'
      }, { status: contentResponse.status });
    }

    const docData = await contentResponse.json();

    // Extract text content from the document
    const content = extractTextFromGoogleDoc(docData);

    // Store in knowledge base
    const client = await db.getClient();
    try {
      // Check if this document was already imported
      const existingDoc = await client.query(
        `SELECT id FROM knowledge_base
         WHERE google_doc_id = $1 AND account_id = $2`,
        [body.document_id, user.id]
      );

      let result;

      if (existingDoc.rows.length > 0) {
        // Update existing document
        result = await client.query(
          `UPDATE knowledge_base
           SET title = $1,
               content = $2,
               google_doc_url = $3,
               last_synced_at = NOW(),
               updated_at = NOW(),
               agent_id = $4
           WHERE id = $5
           RETURNING *`,
          [
            metadata.name,
            content,
            metadata.webViewLink,
            body.agent_id || null,
            existingDoc.rows[0].id
          ]
        );
      } else {
        // Insert new document
        result = await client.query(
          `INSERT INTO knowledge_base (
            account_id, agent_id, title, content, document_type,
            google_doc_id, google_doc_url, last_synced_at, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
          RETURNING *`,
          [
            user.id,
            body.agent_id || null,
            metadata.name,
            content,
            'google_doc',
            body.document_id,
            metadata.webViewLink,
            JSON.stringify({
              imported_from: 'google_docs',
              mime_type: metadata.mimeType
            })
          ]
        );
      }

      return NextResponse.json({
        success: true,
        document: result.rows[0],
        message: existingDoc.rows.length > 0 ? 'Document updated successfully' : 'Document imported successfully'
      }, { status: existingDoc.rows.length > 0 ? 200 : 201 });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error importing Google Doc:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Extracts plain text content from a Google Docs API response
 */
function extractTextFromGoogleDoc(docData: any): string {
  const content: string[] = [];

  if (!docData.body || !docData.body.content) {
    return '';
  }

  // Iterate through document structure
  for (const element of docData.body.content) {
    if (element.paragraph) {
      const paragraphText: string[] = [];

      if (element.paragraph.elements) {
        for (const textElement of element.paragraph.elements) {
          if (textElement.textRun && textElement.textRun.content) {
            paragraphText.push(textElement.textRun.content);
          }
        }
      }

      const text = paragraphText.join('').trim();
      if (text) {
        content.push(text);
      }
    } else if (element.table) {
      // Handle tables
      for (const row of element.table.tableRows || []) {
        const rowText: string[] = [];
        for (const cell of row.tableCells || []) {
          const cellText: string[] = [];
          for (const cellContent of cell.content || []) {
            if (cellContent.paragraph && cellContent.paragraph.elements) {
              for (const textElement of cellContent.paragraph.elements) {
                if (textElement.textRun && textElement.textRun.content) {
                  cellText.push(textElement.textRun.content);
                }
              }
            }
          }
          rowText.push(cellText.join('').trim());
        }
        const text = rowText.filter(t => t).join(' | ');
        if (text) {
          content.push(text);
        }
      }
    }
  }

  return content.join('\n\n');
}
