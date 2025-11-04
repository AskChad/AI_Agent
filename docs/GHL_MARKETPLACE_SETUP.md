# GoHighLevel Marketplace App Setup Guide

Complete guide for creating and configuring a GHL Marketplace App with OAuth 2.0 and Webhooks for the AI Chat Agent.

---

## 📋 Table of Contents

1. [Why GHL Marketplace App?](#why-ghl-marketplace-app)
2. [Prerequisites](#prerequisites)
3. [Create Marketplace App](#create-marketplace-app)
4. [OAuth 2.0 Configuration](#oauth-20-configuration)
5. [Webhook Setup](#webhook-setup)
6. [Integration with AI Agent](#integration-with-ai-agent)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

---

## 🎯 Why GHL Marketplace App?

### The Problem

Without a Marketplace App, you can only:
- ❌ Access YOUR OWN GHL account
- ❌ Manually manage API keys for each location
- ❌ No webhook access for real-time events
- ❌ Limited to location-level API keys
- ❌ Cannot distribute to other GHL users

### The Solution: Marketplace App

With a Marketplace App, you can:
- ✅ Users install your app via OAuth (one click)
- ✅ Automatic access token management
- ✅ Real-time webhooks for messages, contacts, etc.
- ✅ Agency-level access (all locations)
- ✅ Distribute to any GHL user
- ✅ Automatic token refresh
- ✅ Professional integration experience

### How It Works

```
┌─────────────┐          ┌──────────────┐          ┌─────────────┐
│  GHL User   │          │   Your App   │          │  GHL API    │
└──────┬──────┘          └──────┬───────┘          └──────┬──────┘
       │                        │                         │
       │  1. Click "Install"    │                         │
       ├───────────────────────>│                         │
       │                        │                         │
       │  2. Redirect to OAuth  │                         │
       │<───────────────────────┤                         │
       │                        │                         │
       │  3. Authorize App      │                         │
       ├─────────────────────────────────────────────────>│
       │                        │                         │
       │  4. Redirect with code │                         │
       ├───────────────────────>│                         │
       │                        │                         │
       │                        │  5. Exchange for token  │
       │                        ├────────────────────────>│
       │                        │                         │
       │                        │  6. Access + Refresh    │
       │                        │<────────────────────────┤
       │                        │                         │
       │  7. ✓ App Installed    │                         │
       │<───────────────────────┤                         │
       │                        │                         │
```

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **GHL Agency Account**
   - Access to https://marketplace.gohighlevel.com
   - Agency Pro or higher (required for Marketplace Apps)

2. **Development Environment**
   - Public HTTPS URL for OAuth redirects (use ngrok for local dev)
   - Database to store OAuth tokens (Supabase)
   - Token Manager for encryption

3. **Technical Knowledge**
   - Understanding of OAuth 2.0 flow
   - Basic webhook handling
   - API integration experience

---

## 🏗️ Create Marketplace App

### Step 1: Access Marketplace Portal

1. Log in to your GHL Agency account
2. Navigate to: https://marketplace.gohighlevel.com/apps
3. Click **"Create App"** button

### Step 2: Basic App Information

Fill in the app details:

```yaml
App Name: "AI Chat Agent"
App Description: "Intelligent AI assistant that responds to customer messages in GoHighLevel"
App Icon: [Upload 512x512 PNG]
App Category: "Communication & Messaging"
App Type: "Public" (or "Private" for testing)
```

**Important**: Choose "Private" during development, switch to "Public" when ready to launch.

### Step 3: Developer Information

```yaml
Developer Name: "Your Company Name"
Developer Email: "support@yourcompany.com"
Developer Website: "https://yourcompany.com"
Support URL: "https://yourcompany.com/support"
Privacy Policy URL: "https://yourcompany.com/privacy"
Terms of Service URL: "https://yourcompany.com/terms"
```

### Step 4: SSO & Distribution Settings

```yaml
SSO Configuration:
  - Enable: Yes
  - SSO Key: [Auto-generated - save this!]

Distribution Settings:
  - Available to: "All Agencies" or "Specific Agencies"
  - Pricing Model: "Free" or "Paid" (configure later)
```

---

## 🔐 OAuth 2.0 Configuration

### Step 5: OAuth Scopes

Select the permissions your app needs:

**Required Scopes for AI Chat Agent:**

```yaml
Conversations:
  ✓ conversations.readonly    # Read messages
  ✓ conversations.write       # Send messages

Contacts:
  ✓ contacts.readonly         # Read contact data
  ✓ contacts.write            # Update contact info (tags, custom fields)

Opportunities:
  ✓ opportunities.readonly    # Read pipeline/opportunities
  ✓ opportunities.write       # Create/update opportunities

Calendars:
  ✓ calendars.readonly        # View appointments
  ✓ calendars.write           # Book appointments (optional)

Locations:
  ✓ locations.readonly        # Get location info
```

**Optional Scopes (for advanced features):**

```yaml
Workflows:
  ✓ workflows.readonly        # Trigger workflows

Campaigns:
  ✓ campaigns.readonly        # Read campaign data

Custom Fields:
  ✓ customfields.write        # Update custom fields
```

### Step 6: OAuth Redirect URLs

Add your OAuth callback URLs:

**Production:**
```
https://yourdomain.com/api/auth/ghl/callback
```

**Development (using ngrok):**
```
https://abc123.ngrok.io/api/auth/ghl/callback
```

**Important**: GHL requires HTTPS. Use ngrok for local development.

### Step 7: Save OAuth Credentials

After saving, GHL will provide:

```yaml
Client ID: "66e7c4a2e6094f0d2a8e5f40"
Client Secret: "a8f3e9d2-4b5c-6e7f-8a9b-0c1d2e3f4g5h"
```

**🔒 CRITICAL**: Save these credentials securely. You'll need them for the OAuth flow.

Store in `.env.local`:
```bash
GHL_CLIENT_ID=66e7c4a2e6094f0d2a8e5f40
GHL_CLIENT_SECRET=a8f3e9d2-4b5c-6e7f-8a9b-0c1d2e3f4g5h
GHL_REDIRECT_URI=https://yourdomain.com/api/auth/ghl/callback
```

---

## 🔗 OAuth 2.0 Flow Implementation

### Step 8: Install Button

Create an install/connect button in your app:

```typescript
// pages/settings/integrations.tsx
'use client'

export default function GHLIntegration() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_GHL_REDIRECT_URI!)
    const scopes = encodeURIComponent(
      'conversations.readonly conversations.write contacts.readonly contacts.write opportunities.readonly locations.readonly'
    )

    const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?` +
      `response_type=code&` +
      `redirect_uri=${redirectUri}&` +
      `client_id=${clientId}&` +
      `scope=${scopes}`

    // Redirect user to GHL OAuth page
    window.location.href = authUrl
  }

  return (
    <button onClick={handleConnect} className="btn-primary">
      Connect to GoHighLevel
    </button>
  )
}
```

### Step 9: OAuth Callback Handler

Create the callback endpoint that GHL redirects to:

```typescript
// app/api/auth/ghl/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle authorization errors
  if (error || !code) {
    return NextResponse.redirect(
      `/settings/integrations?error=${error || 'no_code'}`
    )
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.GHL_REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    /*
    tokenData = {
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refresh_token: "a8f3e9d2-4b5c-6e7f-8a9b-0c1d2e3f4g5h",
      token_type: "Bearer",
      expires_in: 86400,
      scope: "conversations.readonly conversations.write...",
      locationId: "abc123xyz456",
      companyId: "company789",
      userId: "user456"
    }
    */

    // Get location details
    const locationResponse = await fetch(
      `https://services.leadconnectorhq.com/locations/${tokenData.locationId}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Version: '2021-07-28',
        },
      }
    )

    const locationData = await locationResponse.json()

    // Encrypt tokens using Token Manager
    const accessTokenRef = await encryptWithTokenManager(tokenData.access_token)
    const refreshTokenRef = await encryptWithTokenManager(tokenData.refresh_token)

    // Store in database
    const supabase = createClient()

    // Get or create account
    const { data: account } = await supabase
      .from('accounts')
      .upsert({
        ghl_location_id: tokenData.locationId,
        account_name: locationData.name,
      })
      .select()
      .single()

    // Store OAuth tokens
    await supabase.from('ghl_oauth_tokens').upsert({
      account_id: account.id,
      access_token_reference: accessTokenRef,
      refresh_token_reference: refreshTokenRef,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      location_id: tokenData.locationId,
      company_id: tokenData.companyId,
    })

    // Create default account settings
    await supabase.from('account_settings').upsert({
      account_id: account.id,
      // ... default settings
    })

    // Success! Redirect to dashboard
    return NextResponse.redirect('/dashboard?ghl_connected=true')

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect('/settings/integrations?error=auth_failed')
  }
}

// Helper function to encrypt with Token Manager
async function encryptWithTokenManager(value: string): Promise<string> {
  const response = await fetch('https://your-token-manager.com/encrypt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TOKEN_MANAGER_API_KEY}`,
    },
    body: JSON.stringify({ value }),
  })

  const { reference_id } = await response.json()
  return reference_id
}
```

### Step 10: Token Refresh Handler

Implement automatic token refresh:

```typescript
// lib/ghl/token-manager.ts
import { createClient } from '@/lib/supabase/server'

export async function getValidGHLToken(accountId: string): Promise<string> {
  const supabase = createClient()

  // Get stored token
  const { data: tokenData } = await supabase
    .from('ghl_oauth_tokens')
    .select('*')
    .eq('account_id', accountId)
    .single()

  if (!tokenData) {
    throw new Error('No GHL token found for account')
  }

  // Check if token is expired
  const expiresAt = new Date(tokenData.expires_at)
  const now = new Date()
  const fiveMinutes = 5 * 60 * 1000

  // Refresh if expired or expiring soon
  if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
    return await refreshGHLToken(accountId, tokenData)
  }

  // Decrypt and return existing token
  return await decryptWithTokenManager(tokenData.access_token_reference)
}

async function refreshGHLToken(accountId: string, tokenData: any): Promise<string> {
  // Decrypt refresh token
  const refreshToken = await decryptWithTokenManager(tokenData.refresh_token_reference)

  // Request new access token
  const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GHL_CLIENT_ID!,
      client_secret: process.env.GHL_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh GHL token')
  }

  const newTokenData = await response.json()

  // Encrypt new tokens
  const newAccessTokenRef = await encryptWithTokenManager(newTokenData.access_token)
  const newRefreshTokenRef = await encryptWithTokenManager(newTokenData.refresh_token)

  // Update database
  const supabase = createClient()
  await supabase
    .from('ghl_oauth_tokens')
    .update({
      access_token_reference: newAccessTokenRef,
      refresh_token_reference: newRefreshTokenRef,
      expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('account_id', accountId)

  return newTokenData.access_token
}

async function decryptWithTokenManager(referenceId: string): Promise<string> {
  const response = await fetch('https://your-token-manager.com/decrypt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TOKEN_MANAGER_API_KEY}`,
    },
    body: JSON.stringify({ reference_id: referenceId }),
  })

  const { value } = await response.json()
  return value
}
```

---

## 🪝 Webhook Setup

### Step 11: Configure Webhook URL in GHL

1. In GHL Marketplace Portal, go to your app settings
2. Navigate to "Webhooks" section
3. Add webhook URL:

```
https://yourdomain.com/api/webhooks/ghl
```

### Step 12: Select Webhook Events

Enable events for the AI agent:

```yaml
Message Events:
  ✓ InboundMessage       # New message from contact
  ✓ OutboundMessage      # Message sent by user/automation

Contact Events:
  ✓ ContactCreate        # New contact created
  ✓ ContactUpdate        # Contact updated
  ✓ ContactDelete        # Contact deleted (optional)

Opportunity Events:
  ✓ OpportunityCreate    # New opportunity
  ✓ OpportunityStageUpdate

Note Events:
  ✓ NoteCreate           # Notes added to contact (optional)
```

### Step 13: Implement Webhook Handler

Create the webhook endpoint:

```typescript
// app/api/webhooks/ghl/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processInboundMessage } from '@/lib/ai/message-processor'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const signature = request.headers.get('x-ghl-signature')

    // Verify webhook signature (if GHL provides it)
    // const isValid = verifyWebhookSignature(payload, signature)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // Store webhook event
    const supabase = createClient()
    const { data: webhookEvent } = await supabase
      .from('webhook_events')
      .insert({
        source: 'ghl',
        event_type: payload.type,
        payload: payload,
        headers: Object.fromEntries(request.headers.entries()),
        ghl_location_id: payload.locationId,
        ghl_contact_id: payload.contactId,
        status: 'pending',
      })
      .select()
      .single()

    // Process event asynchronously
    processWebhookEvent(webhookEvent.id, payload).catch(console.error)

    // Respond immediately (GHL expects quick response)
    return NextResponse.json({ received: true, eventId: webhookEvent.id })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function processWebhookEvent(eventId: string, payload: any) {
  const supabase = createClient()

  try {
    // Update status to processing
    await supabase
      .from('webhook_events')
      .update({ status: 'processing' })
      .eq('id', eventId)

    // Route based on event type
    switch (payload.type) {
      case 'InboundMessage':
        await handleInboundMessage(payload)
        break

      case 'ContactCreate':
        await handleContactCreate(payload)
        break

      case 'OpportunityCreate':
        await handleOpportunityCreate(payload)
        break

      default:
        console.log(`Unhandled event type: ${payload.type}`)
    }

    // Mark as processed
    await supabase
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('id', eventId)

  } catch (error) {
    console.error(`Error processing webhook event ${eventId}:`, error)

    // Mark as failed
    await supabase
      .from('webhook_events')
      .update({
        status: 'failed',
        error_message: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId)
  }
}

async function handleInboundMessage(payload: any) {
  /*
  payload = {
    type: "InboundMessage",
    locationId: "abc123",
    contactId: "contact456",
    conversationId: "conv789",
    messageId: "msg101112",
    message: {
      type: "SMS",
      body: "Hello, I need help with my order",
      direction: "inbound",
      contactId: "contact456",
      conversationId: "conv789",
      dateAdded: "2025-11-03T14:30:00Z"
    }
  }
  */

  const supabase = createClient()

  // Get account by location ID
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('ghl_location_id', payload.locationId)
    .single()

  if (!account) {
    console.error(`No account found for location ${payload.locationId}`)
    return
  }

  // Get or create conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .upsert({
      account_id: account.id,
      ghl_contact_id: payload.contactId,
      conversation_title: `Conversation with ${payload.contactId}`,
    }, {
      onConflict: 'account_id,ghl_contact_id'
    })
    .select()
    .single()

  // Save message to database
  const { data: message } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      account_id: account.id,
      role: 'user',
      content: payload.message.body,
      message_type: 'chat',
      ghl_message_id: payload.messageId,
    })
    .select()
    .single()

  // Create embedding for the message
  const embedding = await createEmbedding(payload.message.body)
  await supabase.from('conversation_embeddings').insert({
    message_id: message.id,
    conversation_id: conversation.id,
    account_id: account.id,
    message_text: payload.message.body,
    message_role: 'user',
    embedding: embedding,
  })

  // Process with AI (async - generates response and sends back to GHL)
  await processInboundMessage(conversation.id, message.id)
}

async function handleContactCreate(payload: any) {
  // Handle new contact creation
  // Could trigger welcome message, add to conversation queue, etc.
  console.log('New contact created:', payload.contactId)
}

async function handleOpportunityCreate(payload: any) {
  // Handle new opportunity
  // Could notify AI to focus on sales, update context, etc.
  console.log('New opportunity created:', payload.opportunityId)
}
```

### Step 14: Webhook Verification (Optional but Recommended)

If GHL provides webhook signatures:

```typescript
import crypto from 'crypto'

function verifyWebhookSignature(
  payload: any,
  signature: string | null
): boolean {
  if (!signature) return false

  const secret = process.env.GHL_WEBHOOK_SECRET!
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')

  return signature === hash
}
```

---

## 🔌 Integration with AI Agent

### How Webhooks Trigger AI Responses

```typescript
// lib/ai/message-processor.ts
import { createClient } from '@/lib/supabase/server'
import { loadConversationContext } from './context-manager'
import { generateAIResponse } from './openai-client'
import { sendGHLMessage } from '@/lib/ghl/client'

export async function processInboundMessage(
  conversationId: string,
  messageId: string
) {
  const supabase = createClient()

  // 1. Load conversation context
  const context = await loadConversationContext({
    conversationId,
    includeRecentMessages: true,
    includeSemanticSearch: true,
    includeRAG: true,
    includeFiles: true,
  })

  // 2. Get account settings
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, account:accounts(*), settings:account_settings(*)')
    .eq('id', conversationId)
    .single()

  // 3. Generate AI response
  const aiResponse = await generateAIResponse({
    conversationId,
    context,
    settings: conversation.settings,
    provider: conversation.settings.default_ai_provider || 'openai',
  })

  // 4. Save AI response to database
  const { data: responseMessage } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      account_id: conversation.account_id,
      role: 'assistant',
      content: aiResponse.content,
      message_type: 'chat',
      tokens_used: aiResponse.usage.total_tokens,
      model_used: aiResponse.model,
      function_call: aiResponse.function_call,
    })
    .select()
    .single()

  // 5. Create embedding for AI response
  const embedding = await createEmbedding(aiResponse.content)
  await supabase.from('conversation_embeddings').insert({
    message_id: responseMessage.id,
    conversation_id: conversationId,
    account_id: conversation.account_id,
    message_text: aiResponse.content,
    message_role: 'assistant',
    embedding,
  })

  // 6. Send response back to GHL
  await sendGHLMessage({
    accountId: conversation.account_id,
    contactId: conversation.ghl_contact_id,
    message: aiResponse.content,
  })

  // 7. Handle function calls if any
  if (aiResponse.function_call) {
    await executeFunctionCall(aiResponse.function_call, {
      conversationId,
      messageId: responseMessage.id,
      accountId: conversation.account_id,
    })
  }
}
```

---

## 🧪 Testing

### Test OAuth Flow

1. **Local Testing with ngrok:**
   ```bash
   # Start your Next.js app
   npm run dev

   # In another terminal, start ngrok
   ngrok http 3000

   # Update GHL redirect URI to ngrok URL
   # e.g., https://abc123.ngrok.io/api/auth/ghl/callback
   ```

2. **Test Installation:**
   - Click "Connect to GoHighLevel" in your app
   - Should redirect to GHL OAuth page
   - Select a location and authorize
   - Should redirect back to your callback
   - Check database for saved tokens

3. **Verify Token Storage:**
   ```sql
   SELECT * FROM ghl_oauth_tokens WHERE account_id = 'your-account-id';
   ```

### Test Webhooks

1. **Use GHL Webhook Tester:**
   - In GHL Marketplace Portal, find "Test Webhook" feature
   - Send sample InboundMessage event
   - Check your webhook endpoint receives it

2. **Manual Testing:**
   ```bash
   curl -X POST https://yourdomain.com/api/webhooks/ghl \
     -H "Content-Type: application/json" \
     -d '{
       "type": "InboundMessage",
       "locationId": "test-location",
       "contactId": "test-contact",
       "message": {
         "body": "Test message",
         "type": "SMS"
       }
     }'
   ```

3. **Check Webhook Events Table:**
   ```sql
   SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 10;
   ```

### Test AI Response Flow

1. Send a real message in GHL to a contact
2. Webhook should trigger AI processing
3. Check logs for AI generation
4. Verify response sent back to GHL
5. Check message appears in GHL conversation

---

## 🐛 Troubleshooting

### Issue: OAuth Redirect Not Working

**Symptoms:** After authorizing, user not redirected back to your app

**Solutions:**
- ✓ Verify redirect URI matches exactly (including https://)
- ✓ Check for trailing slashes
- ✓ Ensure ngrok tunnel is still running (regenerates URL on restart)
- ✓ Check browser console for errors

### Issue: Webhooks Not Received

**Symptoms:** No webhook events in database

**Solutions:**
- ✓ Verify webhook URL is publicly accessible (test with curl)
- ✓ Check GHL webhook configuration is enabled
- ✓ Ensure webhook URL uses HTTPS
- ✓ Check firewall/security settings
- ✓ Review GHL webhook delivery logs in Marketplace Portal

### Issue: Token Expired Errors

**Symptoms:** API calls failing with 401 Unauthorized

**Solutions:**
- ✓ Check token expiration date in database
- ✓ Verify refresh token is valid
- ✓ Test token refresh function manually
- ✓ Check Token Manager encryption/decryption working

### Issue: Missing Scopes

**Symptoms:** API calls failing with permission errors

**Solutions:**
- ✓ Verify required scopes are enabled in app settings
- ✓ User must re-authorize app after scope changes
- ✓ Check token data includes all requested scopes

---

## 🔒 Security Best Practices

### 1. Token Security

```typescript
// ✓ DO: Encrypt tokens with Token Manager
const accessTokenRef = await encryptWithTokenManager(token)

// ✗ DON'T: Store tokens in plain text
await supabase.from('tokens').insert({ access_token: token }) // ❌
```

### 2. Webhook Validation

```typescript
// ✓ DO: Verify webhook signatures
if (!verifyWebhookSignature(payload, signature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}

// ✗ DON'T: Trust all incoming webhooks
```

### 3. Rate Limiting

```typescript
// ✓ DO: Implement rate limiting on webhook endpoint
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
})

const { success } = await ratelimit.limit(ip)
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

### 4. Input Validation

```typescript
// ✓ DO: Validate webhook payloads
const webhookSchema = z.object({
  type: z.enum(['InboundMessage', 'OutboundMessage', ...]),
  locationId: z.string(),
  contactId: z.string(),
  message: z.object({
    body: z.string().max(10000), // Limit message size
    type: z.enum(['SMS', 'Email', 'WhatsApp']),
  }),
})

try {
  const validatedPayload = webhookSchema.parse(payload)
} catch (error) {
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
```

### 5. Error Handling

```typescript
// ✓ DO: Handle errors gracefully
try {
  await processWebhook(payload)
} catch (error) {
  console.error('Webhook processing error:', error)
  // Log to error monitoring (Sentry, etc.)
  // Don't expose internal errors to webhook sender
  return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
}
```

---

## 📊 Monitoring & Logging

### Recommended Monitoring

1. **Webhook Delivery Success Rate**
   ```sql
   SELECT
     status,
     COUNT(*) as count,
     COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
   FROM webhook_events
   WHERE received_at > NOW() - INTERVAL '24 hours'
   GROUP BY status;
   ```

2. **OAuth Token Refresh Failures**
   - Monitor refresh token errors
   - Alert if tokens can't be refreshed (user may need to re-authorize)

3. **API Call Latency**
   - Track GHL API response times
   - Alert on slowdowns or timeouts

4. **Function Call Success Rate**
   - Monitor function execution success/failure rates
   - Alert on high failure rates

---

## 📚 Related Documentation

- **GHL API Docs**: https://highlevel.stoplight.io/docs/integrations/
- **GHL Marketplace**: https://marketplace.gohighlevel.com/
- **OAuth 2.0 Spec**: https://oauth.net/2/
- **Attack Kit Section 19**: GoHighLevel Integration Patterns
- **Token Manager Integration**: See Attack Kit Section 21

---

## ✅ Setup Checklist

- [ ] Create Marketplace App in GHL
- [ ] Configure OAuth scopes and redirect URI
- [ ] Save client ID and client secret
- [ ] Implement OAuth callback handler
- [ ] Implement token refresh logic
- [ ] Configure webhooks in GHL
- [ ] Implement webhook endpoint
- [ ] Implement webhook event processing
- [ ] Set up Token Manager integration
- [ ] Test OAuth flow end-to-end
- [ ] Test webhook delivery
- [ ] Test AI message processing
- [ ] Set up monitoring and alerts
- [ ] Document for your team

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
**Status**: Complete - Ready for Implementation
