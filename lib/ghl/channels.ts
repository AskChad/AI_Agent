/**
 * Multi-Channel Messaging Support for GoHighLevel
 * Handles sending messages across all GHL supported channels
 */

import { sendInboundMessage, GHLMessage } from './messaging';

export type ChannelType = 'SMS' | 'Email' | 'WhatsApp' | 'GMB' | 'FB' | 'Instagram' | 'Custom';

export interface ChannelMessage {
  channel: ChannelType;
  contactId: string;
  content: string;
  subject?: string; // For Email
  attachments?: string[];
  conversationId?: string;
}

/**
 * Send a message through any GHL channel
 */
export async function sendChannelMessage(
  accessToken: string,
  conversationProviderId: string,
  message: ChannelMessage
): Promise<any> {
  // Prepare message based on channel type
  const ghlMessage: GHLMessage = {
    type: getGHLMessageType(message.channel),
    contactId: message.contactId,
    conversationId: message.conversationId,
    conversationProviderId,
    attachments: message.attachments,
  };

  // Format message content based on channel
  switch (message.channel) {
    case 'Email':
      ghlMessage.html = message.content;
      ghlMessage.subject = message.subject || 'Message from AI Agent';
      break;

    case 'SMS':
    case 'WhatsApp':
    case 'GMB':
    case 'FB':
    case 'Instagram':
      ghlMessage.message = message.content;
      break;

    default:
      ghlMessage.message = message.content;
  }

  return sendInboundMessage(accessToken, conversationProviderId, ghlMessage);
}

/**
 * Convert our channel type to GHL message type
 */
function getGHLMessageType(channel: ChannelType): 'SMS' | 'Email' | 'Custom' {
  switch (channel) {
    case 'Email':
      return 'Email';
    case 'SMS':
      return 'SMS';
    default:
      // WhatsApp, GMB, FB, Instagram all use Custom type with specific provider
      return 'Custom';
  }
}

/**
 * Get channel display name
 */
export function getChannelDisplayName(channel: string): string {
  const names: Record<string, string> = {
    sms: 'SMS',
    email: 'Email',
    whatsapp: 'WhatsApp',
    gmb: 'Google Business',
    fb: 'Facebook Messenger',
    instagram: 'Instagram DM',
    custom: 'Custom Channel',
  };

  return names[channel.toLowerCase()] || channel;
}

/**
 * Get channel icon/emoji
 */
export function getChannelIcon(channel: string): string {
  const icons: Record<string, string> = {
    sms: '💬',
    email: '📧',
    whatsapp: '📱',
    gmb: '🏢',
    fb: '👥',
    instagram: '📷',
    custom: '🔌',
  };

  return icons[channel.toLowerCase()] || '💬';
}

/**
 * Check if channel supports attachments
 */
export function channelSupportsAttachments(channel: string): boolean {
  const supportsAttachments = ['email', 'whatsapp', 'fb', 'instagram'];
  return supportsAttachments.includes(channel.toLowerCase());
}

/**
 * Get channel-specific message length limit
 */
export function getChannelMessageLimit(channel: string): number {
  const limits: Record<string, number> = {
    sms: 1600, // SMS concatenation limit
    whatsapp: 4096,
    gmb: 4000,
    fb: 2000,
    instagram: 1000,
    email: 100000, // Effectively unlimited for email
  };

  return limits[channel.toLowerCase()] || 2000;
}

/**
 * Format message for specific channel (handle character limits, etc.)
 */
export function formatMessageForChannel(content: string, channel: string): string {
  const limit = getChannelMessageLimit(channel);

  if (content.length <= limit) {
    return content;
  }

  // Truncate with ellipsis
  return content.substring(0, limit - 3) + '...';
}
