/**
 * GoHighLevel Messaging API Client
 * Handles sending inbound messages and managing conversation status
 */

const GHL_API_BASE_URL = 'https://services.leadconnectorhq.com';

export interface GHLMessage {
  type: 'SMS' | 'Email' | 'Custom';
  contactId: string;
  message?: string; // For SMS
  html?: string; // For Email
  subject?: string; // For Email
  attachments?: string[];
  altId?: string; // For custom providers
  conversationId?: string;
  conversationProviderId?: string;
}

export interface GHLMessageResponse {
  conversationId: string;
  messageId: string;
  contactId: string;
  dateAdded: string;
}

export interface GHLContact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
}

/**
 * Send an inbound message to GoHighLevel
 * This is used when the AI responds to a conversation
 */
export async function sendInboundMessage(
  accessToken: string,
  conversationProviderId: string,
  message: GHLMessage
): Promise<GHLMessageResponse> {
  const endpoint = `${GHL_API_BASE_URL}/conversations/providers/${conversationProviderId}/inbound`;

  const payload: any = {
    type: message.type,
    contactId: message.contactId,
  };

  // Add type-specific fields
  if (message.type === 'SMS') {
    payload.message = message.message;
  } else if (message.type === 'Email') {
    payload.html = message.html;
    payload.subject = message.subject;
  }

  // Add optional fields
  if (message.attachments && message.attachments.length > 0) {
    payload.attachments = message.attachments;
  }

  if (message.altId) {
    payload.altId = message.altId;
  }

  if (message.conversationId) {
    payload.conversationId = message.conversationId;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send inbound message: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Update message status (read, delivered, etc.)
 */
export async function updateMessageStatus(
  accessToken: string,
  conversationProviderId: string,
  messageId: string,
  status: 'delivered' | 'read' | 'failed'
): Promise<void> {
  const endpoint = `${GHL_API_BASE_URL}/conversations/providers/${conversationProviderId}/messages/${messageId}/status`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update message status: ${response.status} ${error}`);
  }
}

/**
 * Get contact details from GoHighLevel
 */
export async function getContact(
  accessToken: string,
  contactId: string
): Promise<GHLContact> {
  const endpoint = `${GHL_API_BASE_URL}/contacts/${contactId}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get contact: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.contact;
}

/**
 * Create or update contact in GoHighLevel
 */
export async function upsertContact(
  accessToken: string,
  locationId: string,
  contact: Partial<GHLContact>
): Promise<GHLContact> {
  const endpoint = `${GHL_API_BASE_URL}/contacts/upsert`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
    body: JSON.stringify({
      ...contact,
      locationId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upsert contact: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.contact;
}

/**
 * Get conversation messages from GoHighLevel
 */
export async function getConversationMessages(
  accessToken: string,
  conversationId: string,
  limit: number = 20
): Promise<any[]> {
  const endpoint = `${GHL_API_BASE_URL}/conversations/${conversationId}/messages`;

  const response = await fetch(`${endpoint}?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get conversation messages: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.messages || [];
}
