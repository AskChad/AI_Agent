# API Endpoints Specification

Complete REST API documentation for the AI Chat Agent.

---

## 📋 Table of Contents

1. [Base URL & Versioning](#base-url--versioning)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
   - [Auth & OAuth](#auth--oauth)
   - [Conversations](#conversations)
   - [Messages](#messages)
   - [AI Functions](#ai-functions)
   - [Webhooks](#webhooks)
   - [RAG Documents](#rag-documents)
   - [API Keys](#api-keys)
   - [Account Settings](#account-settings)
   - [Analytics](#analytics)

---

## 🌐 Base URL & Versioning

### Base URL

```
Production:  https://api.aichatagent.com/v1
Staging:     https://api-staging.aichatagent.com/v1
```

### API Versioning

- Current version: `v1`
- Version specified in URL path
- Breaking changes require new version
- Deprecated versions supported for 12 months

---

## 🔐 Authentication

### Authentication Methods

The API supports multiple authentication methods:

#### 1. Bearer Token (Account-level API Keys)

```http
Authorization: Bearer sk_live_abc123def456...
```

**Usage:**
- Account-level operations
- Server-to-server integrations
- Admin operations

**Get API Key:**
- Generate in Admin UI → Settings → API Keys

#### 2. User API Key (User-level)

```http
Authorization: Bearer uk_live_xyz789...
```

**Usage:**
- User-specific operations
- Limited permissions based on user role

#### 3. GHL OAuth Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Usage:**
- OAuth flows
- Temporary access
- User-authorized operations

### Authentication Examples

```bash
# Using account API key
curl https://api.aichatagent.com/v1/conversations \
  -H "Authorization: Bearer sk_live_abc123..."

# Using user API key
curl https://api.aichatagent.com/v1/messages \
  -H "Authorization: Bearer uk_live_xyz789..."
```

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-11-03T14:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 100,
    "has_more": true,
    "next_page": 2
  },
  "meta": {
    "timestamp": "2025-11-03T14:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "The 'message' field is required",
    "details": {
      "field": "message",
      "constraint": "required"
    }
  },
  "meta": {
    "timestamp": "2025-11-03T14:30:00Z",
    "request_id": "req_abc123"
  }
}
```

---

## ❌ Error Handling

### Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_PARAMETERS | Missing or invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 403 | FORBIDDEN | Insufficient permissions for this operation |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists or conflict |
| 422 | VALIDATION_ERROR | Request validation failed |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

### Example Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired API key"
  }
}
```

**422 Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "content",
          "message": "Content cannot be empty"
        },
        {
          "field": "contact_id",
          "message": "Must be a valid UUID"
        }
      ]
    }
  }
}
```

**429 Rate Limit**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 60 seconds",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset_at": "2025-11-03T14:31:00Z"
    }
  }
}
```

---

## ⏱️ Rate Limiting

### Rate Limits by Plan

| Plan | Requests/Minute | Requests/Hour | Burst |
|------|----------------|---------------|-------|
| Free | 10 | 300 | 20 |
| Pro | 100 | 5,000 | 200 |
| Enterprise | 1,000 | 50,000 | 2,000 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699016400
```

### Exceeding Rate Limits

When rate limit is exceeded, API returns `429` status with retry information.

---

## 📡 Endpoints

---

## 1. Auth & OAuth

### POST /auth/ghl/authorize

Initiate GHL OAuth flow.

**Request:**
```http
POST /v1/auth/ghl/authorize
Content-Type: application/json

{
  "redirect_uri": "https://yourapp.com/callback"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://marketplace.gohighlevel.com/oauth/chooselocation?...",
    "state": "random_state_token"
  }
}
```

---

### POST /auth/ghl/callback

Handle OAuth callback (exchange code for tokens).

**Request:**
```http
POST /v1/auth/ghl/callback
Content-Type: application/json

{
  "code": "auth_code_from_ghl",
  "state": "random_state_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account_id": "acc_123",
    "location_id": "loc_456",
    "access_token": "temporary_token_for_setup",
    "created": true
  }
}
```

---

### POST /auth/api-keys

Create a new API key.

**Authentication:** Required (Bearer token)

**Request:**
```http
POST /v1/auth/api-keys
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "key_name": "Production Server",
  "key_level": "account",
  "permissions": {
    "max_requests_per_minute": 100,
    "allowed_endpoints": ["conversations.*", "messages.*"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key_789",
    "key_name": "Production Server",
    "api_key": "sk_live_newkey123...",
    "created_at": "2025-11-03T14:30:00Z",
    "warning": "Save this key now. It will not be shown again."
  }
}
```

---

### GET /auth/api-keys

List all API keys for the account.

**Authentication:** Required

**Request:**
```http
GET /v1/auth/api-keys
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "key_789",
      "key_name": "Production Server",
      "key_preview": "sk_live_...abc123",
      "key_level": "account",
      "is_active": true,
      "last_used_at": "2025-11-03T14:00:00Z",
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### DELETE /auth/api-keys/:key_id

Revoke an API key.

**Authentication:** Required

**Request:**
```http
DELETE /v1/auth/api-keys/key_789
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key_789",
    "revoked": true,
    "revoked_at": "2025-11-03T14:30:00Z"
  }
}
```

---

## 2. Conversations

### GET /conversations

List all conversations for the account.

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `per_page` (number, default: 20, max: 100)
- `contact_id` (string, optional) - Filter by GHL contact ID
- `active` (boolean, optional) - Filter by active status
- `sort` (string, optional) - `created_at` or `last_message_at` (default)

**Request:**
```http
GET /v1/conversations?page=1&per_page=20&active=true
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "ghl_contact_id": "contact_456",
      "contact_name": "John Doe",
      "contact_email": "john@example.com",
      "contact_phone": "+1234567890",
      "conversation_title": "Conversation with John Doe",
      "last_message_at": "2025-11-03T14:25:00Z",
      "message_count": 47,
      "is_active": true,
      "created_at": "2025-10-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 3,
    "total_count": 52,
    "has_more": true
  }
}
```

---

### GET /conversations/:conversation_id

Get a specific conversation with recent messages.

**Authentication:** Required

**Query Parameters:**
- `include_messages` (boolean, default: true) - Include recent messages
- `message_limit` (number, default: 50, max: 200)

**Request:**
```http
GET /v1/conversations/conv_123?include_messages=true&message_limit=50
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "ghl_contact_id": "contact_456",
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "conversation_title": "Conversation with John Doe",
    "last_message_at": "2025-11-03T14:25:00Z",
    "message_count": 47,
    "is_active": true,
    "created_at": "2025-10-15T09:00:00Z",
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "content": "Hello, I need help with my order",
        "message_type": "chat",
        "created_at": "2025-11-03T14:20:00Z"
      },
      {
        "id": "msg_002",
        "role": "assistant",
        "content": "Hi John! I'd be happy to help you with your order. Could you provide your order number?",
        "message_type": "chat",
        "created_at": "2025-11-03T14:20:15Z"
      }
    ]
  }
}
```

---

### POST /conversations

Create a new conversation.

**Authentication:** Required

**Request:**
```http
POST /v1/conversations
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "ghl_contact_id": "contact_789",
  "contact_name": "Jane Smith",
  "contact_email": "jane@example.com",
  "contact_phone": "+0987654321",
  "conversation_title": "Support for Jane Smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_new123",
    "ghl_contact_id": "contact_789",
    "contact_name": "Jane Smith",
    "created_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### PATCH /conversations/:conversation_id

Update conversation details.

**Authentication:** Required

**Request:**
```http
PATCH /v1/conversations/conv_123
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "conversation_title": "Updated Title",
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "conversation_title": "Updated Title",
    "is_active": false,
    "updated_at": "2025-11-03T14:30:00Z"
  }
}
```

---

## 3. Messages

### GET /conversations/:conversation_id/messages

Get messages for a conversation.

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `per_page` (number, default: 50, max: 200)
- `role` (string, optional) - Filter by role: `user`, `assistant`, `system`
- `since` (ISO datetime, optional) - Only messages after this time
- `before` (ISO datetime, optional) - Only messages before this time

**Request:**
```http
GET /v1/conversations/conv_123/messages?per_page=50&role=user
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_001",
      "conversation_id": "conv_123",
      "role": "user",
      "content": "Hello, I need help with my order",
      "message_type": "chat",
      "ghl_message_id": "ghl_msg_xyz",
      "tokens_used": null,
      "created_at": "2025-11-03T14:20:00Z"
    },
    {
      "id": "msg_002",
      "conversation_id": "conv_123",
      "role": "assistant",
      "content": "Hi! I'd be happy to help.",
      "message_type": "chat",
      "tokens_used": 42,
      "model_used": "gpt-4-turbo-preview",
      "created_at": "2025-11-03T14:20:15Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total_pages": 1,
    "total_count": 47
  }
}
```

---

### POST /conversations/:conversation_id/messages

Send a message in a conversation (triggers AI if role is 'user').

**Authentication:** Required

**Request:**
```http
POST /v1/conversations/conv_123/messages
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "role": "user",
  "content": "What's the status of order #12345?",
  "message_type": "chat"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_message": {
      "id": "msg_new001",
      "role": "user",
      "content": "What's the status of order #12345?",
      "created_at": "2025-11-03T14:30:00Z"
    },
    "ai_response": {
      "id": "msg_new002",
      "role": "assistant",
      "content": "Let me check the status of order #12345 for you...",
      "tokens_used": 156,
      "model_used": "gpt-4-turbo-preview",
      "created_at": "2025-11-03T14:30:02Z"
    },
    "ghl_message_sent": true
  }
}
```

---

### POST /messages/send-to-ghl

Send a message directly to GHL (manual override).

**Authentication:** Required

**Request:**
```http
POST /v1/messages/send-to-ghl
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "contact_id": "contact_456",
  "message": "This is a manual message from the system",
  "type": "SMS"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ghl_message_id": "ghl_msg_new123",
    "contact_id": "contact_456",
    "message": "This is a manual message from the system",
    "sent_at": "2025-11-03T14:30:00Z"
  }
}
```

---

## 4. AI Functions

### GET /functions

List all available AI functions.

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `per_page` (number, default: 50)
- `category` (string, optional) - Filter by category
- `handler_type` (string, optional) - Filter by handler type
- `is_active` (boolean, optional) - Filter by active status
- `scope` (string, optional) - `platform`, `account`, `all` (default)

**Request:**
```http
GET /v1/functions?category=ghl&is_active=true
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "func_123",
      "function_name": "get_contact_details",
      "display_name": "Get Contact Details",
      "description": "Retrieve contact information from GoHighLevel",
      "category": "ghl",
      "handler_type": "internal",
      "is_platform_function": true,
      "is_active": true,
      "parameters": {
        "type": "object",
        "properties": {
          "contact_id": {
            "type": "string",
            "description": "GHL contact ID"
          }
        },
        "required": ["contact_id"]
      },
      "created_at": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total_count": 15
  }
}
```

---

### GET /functions/:function_id

Get a specific function with full details.

**Authentication:** Required

**Request:**
```http
GET /v1/functions/func_123
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "func_123",
    "function_name": "get_contact_details",
    "display_name": "Get Contact Details",
    "description": "Retrieve contact information from GoHighLevel",
    "category": "ghl",
    "handler_type": "internal",
    "handler_config": {
      "handler_function": "get_contact_details",
      "use_cache": true,
      "cache_ttl_seconds": 300
    },
    "parameters": {
      "type": "object",
      "properties": {
        "contact_id": {
          "type": "string",
          "description": "GHL contact ID"
        }
      },
      "required": ["contact_id"]
    },
    "requires_auth": true,
    "allowed_roles": ["admin", "user"],
    "is_active": true,
    "is_platform_function": true,
    "version": 1,
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-01T10:00:00Z"
  }
}
```

---

### POST /functions

Create a new AI function.

**Authentication:** Required (Admin only)

**Request:**
```http
POST /v1/functions
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "function_name": "check_inventory",
  "display_name": "Check Inventory",
  "description": "Check product inventory levels",
  "category": "custom",
  "handler_type": "webhook",
  "handler_config": {
    "webhook_name": "inventory_webhook",
    "method": "POST",
    "wait_for_response": true,
    "timeout_ms": 30000
  },
  "parameters": {
    "type": "object",
    "properties": {
      "product_id": {
        "type": "string",
        "description": "Product SKU or ID"
      },
      "location": {
        "type": "string",
        "description": "Warehouse location code",
        "enum": ["US-WEST", "US-EAST", "EU-CENTRAL"]
      }
    },
    "required": ["product_id"]
  },
  "requires_auth": true,
  "allowed_roles": ["admin", "user"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "func_new123",
    "function_name": "check_inventory",
    "display_name": "Check Inventory",
    "is_active": true,
    "created_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### PATCH /functions/:function_id

Update an existing function.

**Authentication:** Required (Admin only)

**Request:**
```http
PATCH /v1/functions/func_123
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "description": "Updated description",
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "func_123",
    "description": "Updated description",
    "is_active": false,
    "updated_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### DELETE /functions/:function_id

Delete a function (account-level only).

**Authentication:** Required (Admin only)

**Request:**
```http
DELETE /v1/functions/func_123
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "func_123",
    "deleted": true,
    "deleted_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### POST /functions/:function_id/test

Test a function with sample parameters.

**Authentication:** Required

**Request:**
```http
POST /v1/functions/func_123/test
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "parameters": {
    "contact_id": "contact_456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "function_id": "func_123",
    "execution_id": "exec_test_789",
    "status": "success",
    "input_parameters": {
      "contact_id": "contact_456"
    },
    "output_result": {
      "id": "contact_456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "tags": ["customer", "vip"]
    },
    "execution_time_ms": 234,
    "executed_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### GET /functions/:function_id/logs

Get execution logs for a function.

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `per_page` (number, default: 50)
- `status` (string, optional) - Filter by status: `success`, `error`
- `since` (ISO datetime, optional)
- `before` (ISO datetime, optional)

**Request:**
```http
GET /v1/functions/func_123/logs?status=error&per_page=20
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log_001",
      "function_id": "func_123",
      "function_name": "get_contact_details",
      "message_id": "msg_456",
      "conversation_id": "conv_789",
      "status": "error",
      "input_parameters": {
        "contact_id": "invalid_id"
      },
      "error_message": "Contact not found",
      "execution_time_ms": 1245,
      "executed_at": "2025-11-03T14:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 3
  }
}
```

---

## 5. Webhooks

### POST /webhooks/ghl

Receive webhooks from GoHighLevel.

**Authentication:** None (webhook signature verification)

**Headers:**
- `X-GHL-Signature` - Webhook signature (if provided by GHL)

**Request:**
```http
POST /v1/webhooks/ghl
Content-Type: application/json
X-GHL-Signature: sha256=abc123...

{
  "type": "InboundMessage",
  "locationId": "loc_123",
  "contactId": "contact_456",
  "conversationId": "ghl_conv_789",
  "messageId": "ghl_msg_001",
  "message": {
    "type": "SMS",
    "body": "Hello, I need help",
    "direction": "inbound",
    "contactId": "contact_456",
    "conversationId": "ghl_conv_789",
    "dateAdded": "2025-11-03T14:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "received": true,
    "event_id": "evt_123",
    "status": "processing"
  }
}
```

---

### GET /webhooks/configurations

List all webhook configurations.

**Authentication:** Required (Admin only)

**Request:**
```http
GET /v1/webhooks/configurations
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wh_123",
      "webhook_name": "inventory_webhook",
      "description": "Check inventory from warehouse system",
      "url": "https://warehouse.example.com/api/inventory",
      "method": "POST",
      "auth_type": "bearer",
      "timeout_ms": 30000,
      "retry_count": 3,
      "is_active": true,
      "created_at": "2025-10-15T10:00:00Z"
    }
  ]
}
```

---

### POST /webhooks/configurations

Create a new webhook configuration.

**Authentication:** Required (Admin only)

**Request:**
```http
POST /v1/webhooks/configurations
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "webhook_name": "payment_processor",
  "description": "Process payments via external gateway",
  "url": "https://payments.example.com/api/process",
  "method": "POST",
  "auth_type": "bearer",
  "auth_config": {
    "token": "secret_payment_token_123"
  },
  "headers": {
    "Content-Type": "application/json",
    "X-API-Version": "2.0"
  },
  "timeout_ms": 30000,
  "retry_count": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wh_new456",
    "webhook_name": "payment_processor",
    "url": "https://payments.example.com/api/process",
    "is_active": true,
    "created_at": "2025-11-03T14:30:00Z"
  }
}
```

---

## 6. RAG Documents

### GET /rag/documents

List all RAG documents for the account.

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `per_page` (number, default: 20)
- `is_active` (boolean, optional)

**Request:**
```http
GET /v1/rag/documents?is_active=true
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "document_name": "Product Catalog 2025",
      "document_type": "pdf",
      "chunk_count": 42,
      "is_active": true,
      "created_at": "2025-10-01T10:00:00Z",
      "updated_at": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 5
  }
}
```

---

### POST /rag/documents

Upload a new RAG document.

**Authentication:** Required

**Request:**
```http
POST /v1/rag/documents
Authorization: Bearer sk_live_...
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="product-catalog.pdf"
Content-Type: application/pdf

[PDF file content]
------WebKitFormBoundary
Content-Disposition: form-data; name="document_name"

Product Catalog 2025
------WebKitFormBoundary
Content-Disposition: form-data; name="metadata"

{"category": "products", "version": "2025-Q4"}
------WebKitFormBoundary--
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_new789",
    "document_name": "Product Catalog 2025",
    "document_type": "pdf",
    "status": "processing",
    "estimated_completion": "2025-11-03T14:35:00Z",
    "created_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### DELETE /rag/documents/:document_id

Delete a RAG document and all its chunks.

**Authentication:** Required (Admin only)

**Request:**
```http
DELETE /v1/rag/documents/doc_123
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "deleted": true,
    "chunks_deleted": 42,
    "deleted_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### POST /rag/search

Search RAG knowledge base.

**Authentication:** Required

**Request:**
```http
POST /v1/rag/search
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "query": "What are the features of Product X?",
  "limit": 5,
  "threshold": 0.75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "What are the features of Product X?",
    "results": [
      {
        "chunk_id": "chunk_001",
        "document_id": "doc_123",
        "document_name": "Product Catalog 2025",
        "chunk_text": "Product X features include: 1) Advanced AI processing...",
        "similarity": 0.89,
        "metadata": {
          "page": 12,
          "section": "Product Features"
        }
      }
    ],
    "execution_time_ms": 45
  }
}
```

---

## 7. API Keys

Covered in [Auth & OAuth](#auth--oauth) section.

---

## 8. Account Settings

### GET /settings

Get account settings.

**Authentication:** Required

**Request:**
```http
GET /v1/settings
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account_id": "acc_123",
    "context_window_days": 30,
    "context_window_messages": 60,
    "max_context_tokens": 8000,
    "enable_semantic_search": true,
    "semantic_search_limit": 10,
    "semantic_similarity_threshold": 0.7,
    "enable_rag": true,
    "rag_chunk_limit": 5,
    "rag_similarity_threshold": 0.75,
    "default_ai_provider": "openai",
    "openai_model": "gpt-4-turbo-preview",
    "anthropic_model": "claude-3-5-sonnet-20241022",
    "enable_function_calling": true,
    "max_function_calls_per_message": 10,
    "updated_at": "2025-11-03T14:30:00Z"
  }
}
```

---

### PATCH /settings

Update account settings.

**Authentication:** Required (Admin only)

**Request:**
```http
PATCH /v1/settings
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "context_window_days": 60,
  "context_window_messages": 100,
  "default_ai_provider": "anthropic",
  "enable_function_calling": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account_id": "acc_123",
    "context_window_days": 60,
    "context_window_messages": 100,
    "default_ai_provider": "anthropic",
    "enable_function_calling": true,
    "updated_at": "2025-11-03T14:30:00Z"
  }
}
```

---

## 9. Analytics

### GET /analytics/overview

Get account-level analytics overview.

**Authentication:** Required

**Query Parameters:**
- `period` (string, default: '30d') - `24h`, `7d`, `30d`, `90d`, `1y`

**Request:**
```http
GET /v1/analytics/overview?period=7d
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "total_conversations": 152,
    "total_messages": 3847,
    "ai_responses": 1923,
    "average_response_time_ms": 1456,
    "function_calls": {
      "total": 234,
      "success": 221,
      "error": 13,
      "success_rate": 0.944
    },
    "tokens_used": {
      "total": 1234567,
      "openai": 987654,
      "anthropic": 246913
    },
    "estimated_cost_usd": 45.67,
    "top_functions": [
      {
        "function_name": "get_contact_details",
        "call_count": 89,
        "success_rate": 0.989
      },
      {
        "function_name": "create_opportunity",
        "call_count": 45,
        "success_rate": 1.0
      }
    ]
  }
}
```

---

### GET /analytics/conversations/:conversation_id

Get analytics for a specific conversation.

**Authentication:** Required

**Request:**
```http
GET /v1/analytics/conversations/conv_123
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_123",
    "total_messages": 47,
    "user_messages": 24,
    "ai_messages": 23,
    "average_response_time_ms": 1234,
    "tokens_used": 12345,
    "function_calls": 5,
    "conversation_duration_hours": 72,
    "first_message_at": "2025-10-31T09:00:00Z",
    "last_message_at": "2025-11-03T14:25:00Z"
  }
}
```

---

### GET /analytics/functions

Get function execution analytics.

**Authentication:** Required

**Query Parameters:**
- `period` (string, default: '30d')
- `function_id` (string, optional) - Filter by function

**Request:**
```http
GET /v1/analytics/functions?period=7d
Authorization: Bearer sk_live_...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "total_executions": 234,
    "successful": 221,
    "failed": 13,
    "success_rate": 0.944,
    "average_execution_time_ms": 287,
    "functions": [
      {
        "function_id": "func_123",
        "function_name": "get_contact_details",
        "executions": 89,
        "success_rate": 0.989,
        "avg_execution_time_ms": 234,
        "error_count": 1
      }
    ]
  }
}
```

---

## 📝 SDK Examples

### JavaScript/TypeScript

```typescript
import { AIAgentClient } from '@ai-agent/sdk'

const client = new AIAgentClient({
  apiKey: 'sk_live_...',
  baseURL: 'https://api.aichatagent.com/v1'
})

// Send a message
const response = await client.messages.create('conv_123', {
  role: 'user',
  content: 'Hello, how can I help you?'
})

// Create a function
const func = await client.functions.create({
  function_name: 'check_inventory',
  display_name: 'Check Inventory',
  handler_type: 'webhook',
  // ... other params
})

// Get analytics
const analytics = await client.analytics.overview({ period: '7d' })
```

### Python

```python
from ai_agent import AIAgentClient

client = AIAgentClient(
    api_key='sk_live_...',
    base_url='https://api.aichatagent.com/v1'
)

# Send a message
response = client.messages.create(
    conversation_id='conv_123',
    role='user',
    content='Hello, how can I help you?'
)

# Get conversations
conversations = client.conversations.list(page=1, per_page=20)

# Search RAG
results = client.rag.search(
    query='What are the features?',
    limit=5
)
```

---

## 🔒 Security Best Practices

1. **Never expose API keys in client-side code**
2. **Use HTTPS for all API calls**
3. **Rotate API keys regularly**
4. **Implement rate limiting on your end**
5. **Validate webhook signatures**
6. **Use environment variables for keys**
7. **Monitor API usage for anomalies**

---

## 📚 Additional Resources

- **API Status Page**: https://status.aichatagent.com
- **Postman Collection**: [Download](https://api.aichatagent.com/postman-collection.json)
- **OpenAPI Spec**: [Download](https://api.aichatagent.com/openapi.yaml)
- **SDK Documentation**: https://docs.aichatagent.com/sdk
- **Rate Limits Guide**: https://docs.aichatagent.com/rate-limits

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
**API Version**: v1
**Status**: Complete - Ready for Implementation
