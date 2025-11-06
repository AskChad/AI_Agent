import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GHL Outbound Message Webhook Handler
 * Receives messages when a user sends from GoHighLevel to a contact
 * Supports all channels: SMS, Email, WhatsApp, Facebook, Google, etc.
 */

// Webhook payload schema
const outboundMessageSchema = z.object({
  type: z.enum(['SMS', 'Email', 'WhatsApp', 'GMB', 'FB', 'Instagram', 'Custom']),
  contactId: z.string(),
  locationId: z.string(),
  messageId: z.string(),
  userId: z.string().optional(),
  attachments: z.array(z.string()).optional(),

  // SMS fields
  phone: z.string().optional(),
  message: z.string().optional(),

  // Email fields
  emailTo: z.array(z.string()).optional(),
  emailFrom: z.object({
    email: z.string(),
    name: z.string().optional(),
  }).optional(),
  subject: z.string().optional(),
  html: z.string().optional(),
  emailMessageId: z.string().optional(),

  // WhatsApp/Social fields
  contentType: z.string().optional(),
  body: z.string().optional(),

  // Conversation tracking
  conversationId: z.string().optional(),
  conversationProviderId: z.string().optional(),
});

type OutboundMessage = z.infer<typeof outboundMessageSchema>;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    console.log('📨 Received GHL outbound webhook:', JSON.stringify(body, null, 2));

    // Validate webhook payload
    const validation = outboundMessageSchema.safeParse(body);
    if (!validation.success) {
      console.error('Invalid webhook payload:', validation.error);
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.errors },
        { status: 400 }
      );
    }

    const message = validation.data;

    // Find account by GHL location ID
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('ghl_location_id', message.locationId)
      .single();

    if (accountError || !account) {
      console.error('Account not found for location:', message.locationId);
      return NextResponse.json(
        { error: 'Account not configured for this location' },
        { status: 404 }
      );
    }

    // Extract message content based on type
    const content = extractMessageContent(message);
    const contactInfo = extractContactInfo(message);

    // Find or create conversation
    let conversation;

    if (message.conversationId) {
      // Try to find existing conversation by GHL conversation ID
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('ghl_conversation_id', message.conversationId)
        .eq('account_id', account.id)
        .single();

      conversation = existingConv;
    }

    if (!conversation) {
      // Find by contact ID
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('ghl_contact_id', message.contactId)
        .eq('account_id', account.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      conversation = existingConv;
    }

    // Create new conversation if none found
    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          account_id: account.id,
          ghl_contact_id: message.contactId,
          ghl_conversation_id: message.conversationId,
          contact_name: contactInfo.name || 'Unknown Contact',
          contact_phone: contactInfo.phone,
          contact_email: contactInfo.email,
          status: 'active',
          channel: message.type.toLowerCase(),
        })
        .select()
        .single();

      if (convError) {
        console.error('Failed to create conversation:', convError);
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }

      conversation = newConv;
    }

    // Store the message from user (role: user because it's from the contact)
    const { data: storedMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        account_id: account.id,
        role: 'user',
        content,
        ghl_message_id: message.messageId,
        channel: message.type.toLowerCase(),
        metadata: {
          type: message.type,
          userId: message.userId,
          attachments: message.attachments || [],
          raw: message,
        },
      })
      .select()
      .single();

    if (messageError) {
      console.error('Failed to store message:', messageError);
      return NextResponse.json(
        { error: 'Failed to store message' },
        { status: 500 }
      );
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    console.log('✅ Message stored:', storedMessage.id);

    // TODO: Trigger AI response if auto-reply is enabled
    // This will be implemented in the AI integration phase

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: storedMessage.id,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract message content from different channel types
 */
function extractMessageContent(message: OutboundMessage): string {
  switch (message.type) {
    case 'SMS':
    case 'WhatsApp':
      return message.message || message.body || '';

    case 'Email':
      return message.html || message.body || '';

    case 'GMB':
    case 'FB':
    case 'Instagram':
      return message.body || message.message || '';

    default:
      return message.message || message.body || message.html || '';
  }
}

/**
 * Extract contact information from message
 */
function extractContactInfo(message: OutboundMessage): {
  name?: string;
  phone?: string;
  email?: string;
} {
  const info: any = {};

  if (message.phone) {
    info.phone = message.phone;
  }

  if (message.emailTo && message.emailTo.length > 0) {
    info.email = message.emailTo[0];
  }

  return info;
}

// Allow POST without authentication for webhooks
export const dynamic = 'force-dynamic';
