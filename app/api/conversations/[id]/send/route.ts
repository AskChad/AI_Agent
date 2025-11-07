import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getValidToken } from '@/lib/ghl/oauth';
import { sendChannelMessage, formatMessageForChannel, ChannelType } from '@/lib/ghl/channels';

/**
 * Send a message through GoHighLevel (AI response to contact)
 * Supports all channels: SMS, Email, WhatsApp, Facebook, Google, Instagram
 */

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  channel: z.enum(['SMS', 'Email', 'WhatsApp', 'GMB', 'FB', 'Instagram', 'Custom']).optional(),
  subject: z.string().optional(), // For Email
  attachments: z.array(z.string()).optional(),
});

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id: conversationId } = params;
    const body = await request.json();

    // Validate input
    const validation = sendMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, channel, subject, attachments } = validation.data;

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, accounts!inner(ghl_location_id)')
      .eq('id', conversationId)
      .eq('account_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if GHL is configured
    if (!conversation.ghl_contact_id || !conversation.accounts.ghl_location_id) {
      return NextResponse.json(
        { error: 'This conversation is not connected to GoHighLevel' },
        { status: 400 }
      );
    }

    // Get GHL OAuth credentials
    const clientId = process.env.GHL_CLIENT_ID;
    const clientSecret = process.env.GHL_CLIENT_SECRET;
    const conversationProviderId = process.env.GHL_CONVERSATION_PROVIDER_ID;

    if (!clientId || !clientSecret || !conversationProviderId) {
      return NextResponse.json(
        { error: 'GHL not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Get valid access token
    const accessToken = await getValidToken(
      user.id,
      conversation.accounts.ghl_location_id,
      clientId,
      clientSecret
    );

    // Determine channel (use conversation's channel or specified channel)
    const messageChannel: ChannelType = channel || (conversation.channel?.toUpperCase() as ChannelType) || 'SMS';

    // Format content for channel
    const formattedContent = formatMessageForChannel(content, messageChannel);

    // Send message through GHL
    const result = await sendChannelMessage(
      accessToken,
      conversationProviderId,
      {
        channel: messageChannel,
        contactId: conversation.ghl_contact_id,
        content: formattedContent,
        subject,
        attachments,
        conversationId: conversation.ghl_conversation_id || undefined,
      }
    );

    // Store message in our database
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        account_id: user.id,
        role: 'assistant',
        content: formattedContent,
        ghl_message_id: result.messageId,
        channel: messageChannel.toLowerCase(),
        metadata: {
          ghl_response: result,
          subject,
          attachments: attachments || [],
        },
      })
      .select()
      .single();

    if (messageError) {
      console.error('Failed to store message:', messageError);
      // Message was sent to GHL but failed to store locally
      // We still return success but log the error
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({
        updated_at: new Date().toISOString(),
        channel: messageChannel.toLowerCase(), // Update channel if it changed
      })
      .eq('id', conversationId);

    return NextResponse.json({
      success: true,
      message: message || null,
      ghl: {
        messageId: result.messageId,
        conversationId: result.conversationId,
      },
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
