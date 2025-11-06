# GoHighLevel Integration Guide

## Overview

The AI Chat Agent is fully integrated with GoHighLevel Marketplace to enable bi-directional messaging across all GHL channels:

- 📱 SMS
- 📧 Email
- 📱 WhatsApp
- 🏢 Google Business Messages (GMB)
- 👥 Facebook Messenger
- 📷 Instagram DM
- 🔌 Custom Channels

## Architecture

### OAuth 2.0 Flow
```
User → Connect Button → GHL Authorization → Callback → Store Tokens → Connected
```

### Message Flow

**Inbound (Contact → AI):**
```
Contact sends message in GHL
   ↓
GHL sends webhook to /api/ghl/webhooks/outbound-message
   ↓
Store message in database with role='user'
   ↓
Trigger AI response (future: auto-reply)
```

**Outbound (AI → Contact):**
```
AI generates response
   ↓
POST to /api/conversations/{id}/send
   ↓
Send via GHL API with channel-specific formatting
   ↓
Store message in database with role='assistant'
   ↓
Update message status when delivered
```

## Setup Instructions

### 1. Create Marketplace App

1. Go to https://marketplace.gohighlevel.com/apps
2. Click "Create New App"
3. Fill in app details:
   - **Name:** AI Chat Agent
   - **Description:** Intelligent AI-powered chat agent with multi-channel support
   - **Category:** Conversations

### 2. Configure OAuth

1. Navigate to **Advanced Settings** → **Auth**
2. Set **Distribution Type:** Public (or Private for testing)
3. Add **OAuth Scopes:**
   ```
   conversations.readonly
   conversations.write
   conversations/message.readonly
   conversations/message.write
   contacts.readonly
   contacts.write
   ```
4. Set **Redirect URI:**
   ```
   https://your-domain.com/api/ghl/oauth/callback

   # For local development:
   http://localhost:3001/api/ghl/oauth/callback
   ```
5. Generate Client Credentials:
   - Copy **Client ID**
   - Copy **Client Secret**

### 3. Create Conversation Provider

1. In your marketplace app, go to **Conversation Providers**
2. Click "Create Conversation Provider"
3. Fill in details:
   - **Name:** AI Chat Agent
   - **Type:** SMS (or custom for multi-channel)
4. Set **Delivery URL:**
   ```
   https://your-domain.com/api/ghl/webhooks/outbound-message

   # For local development (use ngrok):
   https://your-ngrok-url.ngrok.io/api/ghl/webhooks/outbound-message
   ```
5. Copy the **Conversation Provider ID**

### 4. Configure Environment Variables

Add to `.env.local`:

```env
# GoHighLevel Marketplace Integration
GHL_CLIENT_ID=your_client_id_here
GHL_CLIENT_SECRET=your_client_secret_here
GHL_REDIRECT_URI=http://localhost:3001/api/ghl/oauth/callback
GHL_CONVERSATION_PROVIDER_ID=your_provider_id_here

# Public App URL (change for production)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 5. Test Webhook (Local Development)

For local development, use ngrok to expose your localhost:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3001
ngrok http 3001

# Copy the https URL and update your GHL Conversation Provider delivery URL
```

### 6. Connect in Application

1. Start the development server: `npm run dev`
2. Navigate to **Dashboard → Settings**
3. Click "Connect to GoHighLevel"
4. Authorize the app in GHL
5. You'll be redirected back with a success message

## API Endpoints

### OAuth Endpoints

#### `GET /api/ghl/oauth/authorize`
Initiates OAuth flow, returns authorization URL

**Response:**
```json
{
  "success": true,
  "authUrl": "https://marketplace.gohighlevel.com/oauth/chooselocation?..."
}
```

#### `GET /api/ghl/oauth/callback`
Handles OAuth callback, exchanges code for token

**Query Params:**
- `code` - Authorization code
- `state` - CSRF protection token

**Redirects to:** `/dashboard/settings?ghl_connected=true`

### Status & Management

#### `GET /api/ghl/status`
Check GHL connection status

**Response:**
```json
{
  "connected": true,
  "locationId": "xxx",
  "expiresAt": "2025-12-06T...",
  "scopes": ["conversations.readonly", "conversations.write", ...]
}
```

#### `POST /api/ghl/disconnect`
Disconnect GHL integration

**Response:**
```json
{
  "success": true,
  "message": "Successfully disconnected from GoHighLevel"
}
```

### Webhook Endpoints

#### `POST /api/ghl/webhooks/outbound-message`
Receives messages from GHL when user/contact sends message

**Payload (SMS):**
```json
{
  "type": "SMS",
  "contactId": "xxx",
  "locationId": "xxx",
  "messageId": "xxx",
  "phone": "+1234567890",
  "message": "Hello from contact",
  "conversationId": "xxx",
  "attachments": []
}
```

**Payload (Email):**
```json
{
  "type": "Email",
  "contactId": "xxx",
  "locationId": "xxx",
  "messageId": "xxx",
  "emailTo": ["contact@example.com"],
  "emailFrom": {
    "email": "user@ghl.com",
    "name": "User Name"
  },
  "subject": "Subject line",
  "html": "<p>Email content</p>",
  "conversationId": "xxx",
  "attachments": []
}
```

### Messaging Endpoints

#### `POST /api/conversations/{id}/send`
Send a message through GHL (AI response)

**Request:**
```json
{
  "content": "AI response message",
  "channel": "SMS",
  "subject": "Email subject (for Email channel)",
  "attachments": ["https://..."]
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "xxx",
    "content": "AI response message",
    "role": "assistant",
    "channel": "sms"
  },
  "ghl": {
    "messageId": "ghl_msg_xxx",
    "conversationId": "ghl_conv_xxx"
  }
}
```

## Database Schema

### New Columns Added

**conversations table:**
```sql
- ghl_contact_id TEXT         -- GHL contact ID
- ghl_conversation_id TEXT    -- GHL conversation ID for threading
- channel TEXT                -- Channel type (sms, email, whatsapp, etc.)
```

**messages table:**
```sql
- ghl_message_id TEXT         -- GHL message ID for sync
- channel TEXT                -- Channel through which message was sent
```

**account_settings table:**
```sql
- ghl_conversation_provider_id TEXT  -- Provider ID for this account
```

## Channel Support

### SMS
- ✅ Send & Receive
- ✅ Attachments (images, files)
- Character limit: 1,600

### Email
- ✅ Send & Receive
- ✅ HTML formatting
- ✅ Attachments
- ✅ Subject lines
- Character limit: ~100,000

### WhatsApp
- ✅ Send & Receive
- ✅ Attachments (images, documents, audio)
- Character limit: 4,096
- Requires WhatsApp Business API setup in GHL

### Google Business Messages (GMB)
- ✅ Send & Receive
- ✅ Rich media
- Character limit: 4,000
- Requires Google Business Profile connection

### Facebook Messenger
- ✅ Send & Receive
- ✅ Attachments
- Character limit: 2,000
- Requires Facebook Page connection in GHL

### Instagram DM
- ✅ Send & Receive
- ✅ Images
- Character limit: 1,000
- Requires Instagram Business account connection

## Message Formatting

The system automatically formats messages for each channel:

```typescript
import { formatMessageForChannel, getChannelMessageLimit } from '@/lib/ghl/channels';

// Automatically truncates messages that exceed channel limits
const formattedMessage = formatMessageForChannel(content, 'SMS');
```

## Testing

### Test Inbound Messages

1. Send a message to a contact in GHL (via any channel)
2. Check webhook logs: `http://localhost:3001/api/ghl/webhooks/outbound-message`
3. Verify message appears in conversations list
4. Check database: `SELECT * FROM messages WHERE ghl_message_id IS NOT NULL`

### Test Outbound Messages

1. Open a conversation in the dashboard
2. Send a message using the chat interface
3. Verify message appears in GHL conversation
4. Check contact receives message on their device

## Rate Limits

GoHighLevel API rate limits (as of 2025):
- **Burst:** 100 requests per 10 seconds per app per resource
- **Daily:** 200,000 requests per day

The system handles rate limiting automatically with exponential backoff.

## Troubleshooting

### Connection Issues

**Error: "No OAuth tokens found"**
- Solution: Reconnect by going to Settings and clicking "Connect to GoHighLevel"

**Error: "Failed to refresh token"**
- Solution: Disconnect and reconnect to get new tokens

### Webhook Issues

**Messages not received:**
1. Check webhook URL in GHL marketplace app
2. Verify delivery URL is publicly accessible (use ngrok for local dev)
3. Check webhook logs in GHL dashboard
4. Test endpoint manually:
   ```bash
   curl -X POST http://localhost:3001/api/ghl/webhooks/outbound-message \
     -H "Content-Type: application/json" \
     -d '{"type":"SMS","contactId":"test","locationId":"test","messageId":"test","phone":"+1234567890","message":"Test"}'
   ```

**Messages not sending:**
1. Verify GHL connection status: `GET /api/ghl/status`
2. Check access token hasn't expired
3. Verify conversation has `ghl_contact_id`
4. Check GHL API logs for errors

### Channel-Specific Issues

**WhatsApp not working:**
- Ensure WhatsApp Business API is set up in GHL
- Verify phone number is registered with WhatsApp
- Check WhatsApp template message requirements

**Email formatting issues:**
- Use HTML formatting for email content
- Include proper subject lines
- Test with plain text fallback

## Security

- OAuth tokens are encrypted at rest in the database
- Tokens are automatically refreshed before expiration
- Webhook endpoints validate GHL signatures (implement in production)
- Rate limiting prevents abuse
- CSRF protection via state parameter in OAuth flow

## Production Deployment

### Environment Variables

Update these for production:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
GHL_REDIRECT_URI=https://your-production-domain.com/api/ghl/oauth/callback
```

### Webhook Configuration

Update GHL Conversation Provider delivery URL:
```
https://your-production-domain.com/api/ghl/webhooks/outbound-message
```

### SSL/TLS

Ensure your production server has valid SSL certificate. GHL requires HTTPS for webhooks.

## Support

For issues with the integration:
- Check logs: `/var/log/ai-chat-agent/` (or console in development)
- GHL API Documentation: https://marketplace.gohighlevel.com/docs
- GHL Support: https://help.gohighlevel.com

## Future Enhancements

- [ ] Auto-reply when AI confidence > threshold
- [ ] Message queue for handling rate limits
- [ ] Retry logic for failed messages
- [ ] Message status tracking (delivered, read)
- [ ] Typing indicators
- [ ] Rich media support (images, videos, voice notes)
- [ ] Multi-language support
- [ ] Conversation assignment to team members
- [ ] Analytics and reporting

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
