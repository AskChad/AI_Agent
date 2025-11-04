# AI Function Implementation Examples

Complete, production-ready function examples for common use cases.

---

## 📋 Table of Contents

1. [GHL Functions](#1-ghl-functions)
2. [Webhook Functions](#2-webhook-functions)
3. [API Functions](#3-api-functions)
4. [Database Functions](#4-database-functions)
5. [Utility Functions](#5-utility-functions)
6. [Advanced Examples](#6-advanced-examples)

---

## 1. GHL Functions

### 1.1 Get Contact Details

**Use Case:** Retrieve contact information from GoHighLevel

**Function Definition:**
```typescript
// lib/ai/functions/ghl/get-contact-details.ts
import { getValidGHLToken } from '@/lib/ghl/token-manager'

export async function getContactDetails(params: {
  contact_id: string
}): Promise<any> {
  const { contact_id } = params

  // Get GHL access token
  const token = await getValidGHLToken(accountId)

  // Call GHL API
  const response = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contact_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get contact: ${response.statusText}`)
  }

  const contact = await response.json()

  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    tags: contact.tags || [],
    customFields: contact.customFields || [],
    source: contact.source,
    dateAdded: contact.dateAdded,
  }
}

// OpenAI Function Schema
export const getContactDetailsSchema = {
  name: 'get_contact_details',
  description: 'Get detailed information about a contact from GoHighLevel',
  parameters: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'The GoHighLevel contact ID',
      },
    },
    required: ['contact_id'],
  },
}
```

---

### 1.2 Update Contact Tags

**Use Case:** Add or remove tags from a contact

**Function Definition:**
```typescript
// lib/ai/functions/ghl/update-contact-tag.ts
import { getValidGHLToken } from '@/lib/ghl/token-manager'

export async function updateContactTag(params: {
  contact_id: string
  tags: string[]
  action: 'add' | 'remove'
}): Promise<any> {
  const { contact_id, tags, action } = params

  // Get GHL access token
  const token = await getValidGHLToken(accountId)

  // First, get current tags
  const contactResponse = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contact_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
      },
    }
  )

  if (!contactResponse.ok) {
    throw new Error(`Failed to get contact: ${contactResponse.statusText}`)
  }

  const contact = await contactResponse.json()
  let currentTags = contact.tags || []

  // Update tags based on action
  let updatedTags: string[]
  if (action === 'add') {
    updatedTags = [...new Set([...currentTags, ...tags])]
  } else {
    updatedTags = currentTags.filter((tag: string) => !tags.includes(tag))
  }

  // Update contact with new tags
  const updateResponse = await fetch(
    `https://services.leadconnectorhq.com/contacts/${contact_id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: updatedTags,
      }),
    }
  )

  if (!updateResponse.ok) {
    throw new Error(`Failed to update tags: ${updateResponse.statusText}`)
  }

  return {
    success: true,
    contact_id,
    action,
    tags_modified: tags,
    current_tags: updatedTags,
  }
}

// OpenAI Function Schema
export const updateContactTagSchema = {
  name: 'update_contact_tag',
  description: 'Add or remove tags from a GoHighLevel contact',
  parameters: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'The GoHighLevel contact ID',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of tag names to add or remove',
      },
      action: {
        type: 'string',
        enum: ['add', 'remove'],
        description: 'Whether to add or remove the tags',
      },
    },
    required: ['contact_id', 'tags', 'action'],
  },
}
```

---

### 1.3 Create Opportunity

**Use Case:** Create a new opportunity in GHL pipeline

**Function Definition:**
```typescript
// lib/ai/functions/ghl/create-opportunity.ts
import { getValidGHLToken } from '@/lib/ghl/token-manager'

export async function createOpportunity(params: {
  contact_id: string
  pipeline_id: string
  stage_id: string
  name: string
  value?: number
  status?: string
  notes?: string
}): Promise<any> {
  const {
    contact_id,
    pipeline_id,
    stage_id,
    name,
    value,
    status = 'open',
    notes,
  } = params

  // Get GHL access token
  const token = await getValidGHLToken(accountId)

  // Create opportunity
  const response = await fetch(
    `https://services.leadconnectorhq.com/opportunities/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pipelineId: pipeline_id,
        pipelineStageId: stage_id,
        name,
        status,
        monetaryValue: value,
        contactId: contact_id,
        notes,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create opportunity: ${response.statusText}`)
  }

  const opportunity = await response.json()

  return {
    success: true,
    opportunity_id: opportunity.id,
    name: opportunity.name,
    pipeline_id: opportunity.pipelineId,
    stage_id: opportunity.pipelineStageId,
    value: opportunity.monetaryValue,
    status: opportunity.status,
    created_at: opportunity.dateAdded,
  }
}

// OpenAI Function Schema
export const createOpportunitySchema = {
  name: 'create_opportunity',
  description: 'Create a new opportunity in GoHighLevel pipeline',
  parameters: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'The contact ID to associate with this opportunity',
      },
      pipeline_id: {
        type: 'string',
        description: 'The pipeline ID where the opportunity will be created',
      },
      stage_id: {
        type: 'string',
        description: 'The initial pipeline stage ID',
      },
      name: {
        type: 'string',
        description: 'Name of the opportunity (e.g., "New Sale - John Doe")',
      },
      value: {
        type: 'number',
        description: 'Monetary value of the opportunity',
      },
      notes: {
        type: 'string',
        description: 'Optional notes about the opportunity',
      },
    },
    required: ['contact_id', 'pipeline_id', 'stage_id', 'name'],
  },
}
```

---

### 1.4 Send GHL Message

**Use Case:** Send a message to a contact via GHL

**Function Definition:**
```typescript
// lib/ai/functions/ghl/send-message.ts
import { getValidGHLToken } from '@/lib/ghl/token-manager'

export async function sendGHLMessage(params: {
  contact_id: string
  message: string
  type?: 'SMS' | 'Email' | 'WhatsApp'
}): Promise<any> {
  const { contact_id, message, type = 'SMS' } = params

  // Get GHL access token
  const token = await getValidGHLToken(accountId)

  // Get contact's conversation
  const conversationsResponse = await fetch(
    `https://services.leadconnectorhq.com/conversations/search?contactId=${contact_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
      },
    }
  )

  if (!conversationsResponse.ok) {
    throw new Error('Failed to find conversation')
  }

  const conversations = await conversationsResponse.json()
  let conversationId = conversations.conversations?.[0]?.id

  // Create conversation if doesn't exist
  if (!conversationId) {
    const createConvResponse = await fetch(
      `https://services.leadconnectorhq.com/conversations/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contact_id,
        }),
      }
    )

    const newConv = await createConvResponse.json()
    conversationId = newConv.conversation.id
  }

  // Send message
  const messageResponse = await fetch(
    `https://services.leadconnectorhq.com/conversations/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        conversationId,
        message,
      }),
    }
  )

  if (!messageResponse.ok) {
    throw new Error(`Failed to send message: ${messageResponse.statusText}`)
  }

  const sentMessage = await messageResponse.json()

  return {
    success: true,
    message_id: sentMessage.messageId,
    conversation_id: conversationId,
    type,
    sent_at: new Date().toISOString(),
  }
}

// OpenAI Function Schema
export const sendGHLMessageSchema = {
  name: 'send_ghl_message',
  description: 'Send a message to a contact via GoHighLevel (SMS, Email, or WhatsApp)',
  parameters: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'The contact ID to send the message to',
      },
      message: {
        type: 'string',
        description: 'The message content to send',
      },
      type: {
        type: 'string',
        enum: ['SMS', 'Email', 'WhatsApp'],
        description: 'The type of message to send (default: SMS)',
      },
    },
    required: ['contact_id', 'message'],
  },
}
```

---

### 1.5 List Appointments

**Use Case:** Get upcoming appointments for a contact

**Function Definition:**
```typescript
// lib/ai/functions/ghl/list-appointments.ts
import { getValidGHLToken } from '@/lib/ghl/token-manager'

export async function listAppointments(params: {
  contact_id?: string
  start_date?: string
  end_date?: string
  limit?: number
}): Promise<any> {
  const {
    contact_id,
    start_date = new Date().toISOString(),
    end_date,
    limit = 10,
  } = params

  // Get GHL access token
  const token = await getValidGHLToken(accountId)

  // Build query parameters
  const queryParams = new URLSearchParams({
    startTime: start_date,
    ...(end_date && { endTime: end_date }),
    ...(contact_id && { contactId: contact_id }),
  })

  // Get appointments
  const response = await fetch(
    `https://services.leadconnectorhq.com/appointments/?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get appointments: ${response.statusText}`)
  }

  const data = await response.json()
  const appointments = data.appointments?.slice(0, limit) || []

  return {
    appointments: appointments.map((apt: any) => ({
      id: apt.id,
      title: apt.title,
      start_time: apt.startTime,
      end_time: apt.endTime,
      calendar_id: apt.calendarId,
      contact_id: apt.contactId,
      status: apt.appointmentStatus,
      location: apt.address,
      notes: apt.notes,
    })),
    total: appointments.length,
  }
}

// OpenAI Function Schema
export const listAppointmentsSchema = {
  name: 'list_appointments',
  description: 'Get upcoming appointments, optionally filtered by contact',
  parameters: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'Optional contact ID to filter appointments',
      },
      start_date: {
        type: 'string',
        description: 'Start date in ISO format (default: now)',
      },
      end_date: {
        type: 'string',
        description: 'End date in ISO format (optional)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of appointments to return (default: 10)',
      },
    },
    required: [],
  },
}
```

---

## 2. Webhook Functions

### 2.1 Check Inventory (Webhook)

**Use Case:** Check product inventory via external webhook

**Function Definition:**
```typescript
// lib/ai/functions/webhook/check-inventory.ts
import { createClient } from '@/lib/supabase/server'

export async function checkInventory(params: {
  product_id: string
  location?: string
}): Promise<any> {
  const { product_id, location = 'US-WEST' } = params

  const supabase = createClient()

  // Get webhook configuration
  const { data: webhookConfig } = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('webhook_name', 'inventory_webhook')
    .eq('is_active', true)
    .single()

  if (!webhookConfig) {
    throw new Error('Inventory webhook not configured')
  }

  // Prepare webhook payload
  const payload = {
    product_id,
    location,
    timestamp: new Date().toISOString(),
  }

  // Call webhook
  const response = await fetch(webhookConfig.url, {
    method: webhookConfig.method,
    headers: {
      'Content-Type': 'application/json',
      ...webhookConfig.headers,
      ...(webhookConfig.auth_type === 'bearer' && {
        Authorization: `Bearer ${webhookConfig.auth_config.token}`,
      }),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(webhookConfig.timeout_ms),
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()

  return {
    product_id,
    location,
    available: result.available,
    quantity: result.quantity,
    reserved: result.reserved,
    warehouse: result.warehouse,
  }
}

// OpenAI Function Schema
export const checkInventorySchema = {
  name: 'check_inventory',
  description: 'Check product inventory levels at a specific warehouse location',
  parameters: {
    type: 'object',
    properties: {
      product_id: {
        type: 'string',
        description: 'Product SKU or ID',
      },
      location: {
        type: 'string',
        enum: ['US-WEST', 'US-EAST', 'EU-CENTRAL'],
        description: 'Warehouse location code (default: US-WEST)',
      },
    },
    required: ['product_id'],
  },
}
```

---

### 2.2 Process Payment (Webhook)

**Use Case:** Trigger payment processing via webhook

**Function Definition:**
```typescript
// lib/ai/functions/webhook/process-payment.ts
import { createClient } from '@/lib/supabase/server'

export async function processPayment(params: {
  customer_id: string
  amount: number
  currency?: string
  description?: string
  payment_method?: string
}): Promise<any> {
  const {
    customer_id,
    amount,
    currency = 'USD',
    description = 'Payment',
    payment_method = 'card',
  } = params

  const supabase = createClient()

  // Get webhook configuration
  const { data: webhookConfig } = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('webhook_name', 'payment_processor')
    .eq('is_active', true)
    .single()

  if (!webhookConfig) {
    throw new Error('Payment webhook not configured')
  }

  // Prepare payment payload
  const payload = {
    customer_id,
    amount,
    currency,
    description,
    payment_method,
    idempotency_key: `payment_${Date.now()}_${customer_id}`,
  }

  // Call payment webhook
  const response = await fetch(webhookConfig.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...webhookConfig.headers,
      Authorization: `Bearer ${webhookConfig.auth_config.token}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(webhookConfig.timeout_ms),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Payment failed: ${error.message}`)
  }

  const result = await response.json()

  return {
    success: result.status === 'succeeded',
    transaction_id: result.transaction_id,
    amount: result.amount,
    currency: result.currency,
    status: result.status,
    receipt_url: result.receipt_url,
  }
}

// OpenAI Function Schema
export const processPaymentSchema = {
  name: 'process_payment',
  description: 'Process a payment for a customer',
  parameters: {
    type: 'object',
    properties: {
      customer_id: {
        type: 'string',
        description: 'Customer ID',
      },
      amount: {
        type: 'number',
        description: 'Amount to charge in cents (e.g., 1000 = $10.00)',
      },
      currency: {
        type: 'string',
        description: 'Currency code (default: USD)',
      },
      description: {
        type: 'string',
        description: 'Payment description',
      },
      payment_method: {
        type: 'string',
        enum: ['card', 'bank_transfer', 'paypal'],
        description: 'Payment method (default: card)',
      },
    },
    required: ['customer_id', 'amount'],
  },
}
```

---

## 3. API Functions

### 3.1 Weather Lookup (External API)

**Use Case:** Get weather information via external API

**Function Definition:**
```typescript
// lib/ai/functions/api/get-weather.ts

export async function getWeather(params: {
  location: string
  units?: 'metric' | 'imperial'
}): Promise<any> {
  const { location, units = 'imperial' } = params

  const apiKey = process.env.WEATHER_API_KEY

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${units}&appid=${apiKey}`,
    {
      signal: AbortSignal.timeout(5000),
    }
  )

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    location: data.name,
    country: data.sys.country,
    temperature: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    wind_speed: data.wind.speed,
    units: units === 'metric' ? '°C' : '°F',
  }
}

// OpenAI Function Schema
export const getWeatherSchema = {
  name: 'get_weather',
  description: 'Get current weather information for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or location (e.g., "San Francisco, CA")',
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        description: 'Temperature units (metric = Celsius, imperial = Fahrenheit)',
      },
    },
    required: ['location'],
  },
}
```

---

### 3.2 Stock Price Lookup (External API)

**Use Case:** Get stock price information

**Function Definition:**
```typescript
// lib/ai/functions/api/get-stock-price.ts

export async function getStockPrice(params: {
  symbol: string
}): Promise<any> {
  const { symbol } = params

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
    {
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!response.ok) {
    throw new Error(`Stock API error: ${response.statusText}`)
  }

  const data = await response.json()
  const quote = data['Global Quote']

  if (!quote || Object.keys(quote).length === 0) {
    throw new Error(`Symbol '${symbol}' not found`)
  }

  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    change_percent: quote['10. change percent'],
    volume: parseInt(quote['06. volume']),
    latest_trading_day: quote['07. latest trading day'],
  }
}

// OpenAI Function Schema
export const getStockPriceSchema = {
  name: 'get_stock_price',
  description: 'Get current stock price and trading information',
  parameters: {
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: 'Stock ticker symbol (e.g., "AAPL", "GOOGL")',
      },
    },
    required: ['symbol'],
  },
}
```

---

## 4. Database Functions

### 4.1 Lookup Customer Orders

**Use Case:** Query customer orders from database

**Function Definition:**
```typescript
// lib/ai/functions/database/lookup-customer-orders.ts
import { createClient } from '@/lib/supabase/server'

export async function lookupCustomerOrders(params: {
  customer_email: string
  start_date?: string
  limit?: number
}): Promise<any> {
  const {
    customer_email,
    start_date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Default: 90 days ago
    limit = 10,
  } = params

  const supabase = createClient()

  // Query orders table (example - adjust to your schema)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_id, order_date, total_amount, status, items')
    .eq('customer_email', customer_email)
    .gte('order_date', start_date)
    .order('order_date', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Database query failed: ${error.message}`)
  }

  return {
    customer_email,
    orders: orders.map((order) => ({
      order_id: order.order_id,
      order_date: order.order_date,
      total_amount: order.total_amount,
      status: order.status,
      item_count: order.items?.length || 0,
    })),
    total_orders: orders.length,
  }
}

// OpenAI Function Schema
export const lookupCustomerOrdersSchema = {
  name: 'lookup_customer_orders',
  description: 'Look up recent orders for a customer by email address',
  parameters: {
    type: 'object',
    properties: {
      customer_email: {
        type: 'string',
        description: 'Customer email address',
      },
      start_date: {
        type: 'string',
        description: 'Start date for order search (ISO format, default: 90 days ago)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of orders to return (default: 10)',
      },
    },
    required: ['customer_email'],
  },
}
```

---

### 4.2 Search Knowledge Base

**Use Case:** Search company knowledge base in database

**Function Definition:**
```typescript
// lib/ai/functions/database/search-knowledge-base.ts
import { createClient } from '@/lib/supabase/server'
import { createEmbedding } from '@/lib/ai/embeddings'

export async function searchKnowledgeBase(params: {
  query: string
  category?: string
  limit?: number
}): Promise<any> {
  const { query, category, limit = 5 } = params

  const supabase = createClient()

  // Create embedding for the query
  const queryEmbedding = await createEmbedding(query)

  // Search knowledge base using vector similarity
  let dbQuery = supabase.rpc('search_knowledge_base', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
  })

  if (category) {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data: results, error } = await dbQuery

  if (error) {
    throw new Error(`Knowledge base search failed: ${error.message}`)
  }

  return {
    query,
    results: results.map((result: any) => ({
      title: result.title,
      content: result.content,
      category: result.category,
      similarity: result.similarity,
      url: result.url,
    })),
    total_results: results.length,
  }
}

// OpenAI Function Schema
export const searchKnowledgeBaseSchema = {
  name: 'search_knowledge_base',
  description: 'Search the company knowledge base for relevant information',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query or question',
      },
      category: {
        type: 'string',
        enum: ['product', 'support', 'policy', 'technical'],
        description: 'Optional category to filter results',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 5)',
      },
    },
    required: ['query'],
  },
}
```

---

## 5. Utility Functions

### 5.1 Calculate Date

**Use Case:** Calculate dates relative to today

**Function Definition:**
```typescript
// lib/ai/functions/utility/calculate-date.ts

export async function calculateDate(params: {
  operation: 'add' | 'subtract'
  amount: number
  unit: 'days' | 'weeks' | 'months' | 'years'
  from_date?: string
}): Promise<any> {
  const { operation, amount, unit, from_date } = params

  const baseDate = from_date ? new Date(from_date) : new Date()

  let resultDate = new Date(baseDate)

  const multiplier = operation === 'add' ? 1 : -1
  const days = amount * multiplier

  switch (unit) {
    case 'days':
      resultDate.setDate(resultDate.getDate() + days)
      break
    case 'weeks':
      resultDate.setDate(resultDate.getDate() + days * 7)
      break
    case 'months':
      resultDate.setMonth(resultDate.getMonth() + amount * multiplier)
      break
    case 'years':
      resultDate.setFullYear(resultDate.getFullYear() + amount * multiplier)
      break
  }

  return {
    original_date: baseDate.toISOString(),
    calculated_date: resultDate.toISOString(),
    operation: `${operation} ${amount} ${unit}`,
    formatted: resultDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}

// OpenAI Function Schema
export const calculateDateSchema = {
  name: 'calculate_date',
  description: 'Calculate a date by adding or subtracting time from today or a specific date',
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract'],
        description: 'Whether to add or subtract time',
      },
      amount: {
        type: 'number',
        description: 'Amount of time to add/subtract',
      },
      unit: {
        type: 'string',
        enum: ['days', 'weeks', 'months', 'years'],
        description: 'Unit of time',
      },
      from_date: {
        type: 'string',
        description: 'Starting date (ISO format, default: today)',
      },
    },
    required: ['operation', 'amount', 'unit'],
  },
}
```

---

### 5.2 Format Currency

**Use Case:** Format numbers as currency

**Function Definition:**
```typescript
// lib/ai/functions/utility/format-currency.ts

export async function formatCurrency(params: {
  amount: number
  currency?: string
  locale?: string
}): Promise<any> {
  const { amount, currency = 'USD', locale = 'en-US' } = params

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  })

  return {
    amount,
    formatted: formatter.format(amount),
    currency,
    locale,
  }
}

// OpenAI Function Schema
export const formatCurrencySchema = {
  name: 'format_currency',
  description: 'Format a number as currency with proper symbols and locale',
  parameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount to format',
      },
      currency: {
        type: 'string',
        description: 'Currency code (default: USD)',
      },
      locale: {
        type: 'string',
        description: 'Locale for formatting (default: en-US)',
      },
    },
    required: ['amount'],
  },
}
```

---

## 6. Advanced Examples

### 6.1 Multi-Step Function: Complete Order Status

**Use Case:** Get complete order status with multiple data sources

**Function Definition:**
```typescript
// lib/ai/functions/advanced/complete-order-status.ts
import { getContactDetails } from '../ghl/get-contact-details'
import { lookupCustomerOrders } from '../database/lookup-customer-orders'
import { checkInventory } from '../webhook/check-inventory'

export async function getCompleteOrderStatus(params: {
  contact_id: string
  order_id: string
}): Promise<any> {
  const { contact_id, order_id } = params

  // Step 1: Get contact details
  const contact = await getContactDetails({ contact_id })

  // Step 2: Lookup orders
  const orders = await lookupCustomerOrders({
    customer_email: contact.email,
    limit: 50,
  })

  // Find specific order
  const order = orders.orders.find((o: any) => o.order_id === order_id)

  if (!order) {
    throw new Error(`Order ${order_id} not found for contact`)
  }

  // Step 3: Check inventory for ordered items (if pending)
  let inventoryStatus = null
  if (order.status === 'pending' && order.items) {
    inventoryStatus = await Promise.all(
      order.items.map((item: any) =>
        checkInventory({ product_id: item.product_id })
      )
    )
  }

  return {
    contact: {
      name: contact.name,
      email: contact.email,
    },
    order: {
      order_id: order.order_id,
      status: order.status,
      order_date: order.order_date,
      total_amount: order.total_amount,
    },
    inventory: inventoryStatus,
  }
}

// OpenAI Function Schema
export const getCompleteOrderStatusSchema = {
  name: 'get_complete_order_status',
  description: 'Get complete order status including customer info, order details, and inventory',
  parameters: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'GHL contact ID',
      },
      order_id: {
        type: 'string',
        description: 'Order ID to look up',
      },
    },
    required: ['contact_id', 'order_id'],
  },
}
```

---

### 6.2 Conditional Function: Smart Lead Routing

**Use Case:** Route leads based on criteria with automatic actions

**Function Definition:**
```typescript
// lib/ai/functions/advanced/smart-lead-routing.ts
import { getContactDetails } from '../ghl/get-contact-details'
import { updateContactTag } from '../ghl/update-contact-tag'
import { createOpportunity } from '../ghl/create-opportunity'
import { sendGHLMessage } from '../ghl/send-message'

export async function smartLeadRouting(params: {
  contact_id: string
  lead_score?: number
  source?: string
}): Promise<any> {
  const { contact_id, lead_score = 0, source } = params

  // Get contact details
  const contact = await getContactDetails({ contact_id })

  // Determine routing logic
  let tags: string[] = []
  let pipelineStageId: string
  let assignedRep: string
  let message: string

  if (lead_score >= 80) {
    // Hot lead
    tags = ['hot-lead', 'priority']
    pipelineStageId = 'stage_hot_leads'
    assignedRep = 'senior-rep'
    message = 'Thank you for your interest! A senior representative will contact you within 1 hour.'
  } else if (lead_score >= 50) {
    // Warm lead
    tags = ['warm-lead']
    pipelineStageId = 'stage_warm_leads'
    assignedRep = 'mid-rep'
    message = 'Thank you for your interest! We\'ll be in touch within 24 hours.'
  } else {
    // Cold lead - nurture
    tags = ['cold-lead', 'nurture']
    pipelineStageId = 'stage_nurture'
    assignedRep = 'auto-nurture'
    message = 'Thank you for your interest! You\'ll receive helpful information from us soon.'
  }

  // Add source tag if provided
  if (source) {
    tags.push(`source-${source}`)
  }

  // Execute actions
  await Promise.all([
    // Add tags
    updateContactTag({
      contact_id,
      tags,
      action: 'add',
    }),

    // Create opportunity
    createOpportunity({
      contact_id,
      pipeline_id: 'pipeline_main',
      stage_id: pipelineStageId,
      name: `${contact.name} - ${source || 'Unknown Source'}`,
      value: lead_score * 100, // Estimated value based on score
    }),

    // Send welcome message
    sendGHLMessage({
      contact_id,
      message,
      type: 'SMS',
    }),
  ])

  return {
    contact_id,
    lead_score,
    routing: {
      category: lead_score >= 80 ? 'hot' : lead_score >= 50 ? 'warm' : 'cold',
      assigned_rep: assignedRep,
      pipeline_stage: pipelineStageId,
    },
    actions_taken: {
      tags_added: tags,
      opportunity_created: true,
      message_sent: true,
    },
  }
}

// OpenAI Function Schema
export const smartLeadRoutingSchema = {
  name: 'smart_lead_routing',
  description: 'Automatically route and process leads based on score and source',
  parameters: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'Contact ID to route',
      },
      lead_score: {
        type: 'number',
        description: 'Lead score (0-100)',
      },
      source: {
        type: 'string',
        description: 'Lead source (e.g., "website", "referral", "ad")',
      },
    },
    required: ['contact_id'],
  },
}
```

---

## 📚 Function Registry

### Registering Functions

Create a central registry for all functions:

```typescript
// lib/ai/functions/index.ts
import { getContactDetailsSchema, getContactDetails } from './ghl/get-contact-details'
import { updateContactTagSchema, updateContactTag } from './ghl/update-contact-tag'
import { createOpportunitySchema, createOpportunity } from './ghl/create-opportunity'
// ... import all other functions

// Internal handler registry
export const internalHandlers = {
  get_contact_details: getContactDetails,
  update_contact_tag: updateContactTag,
  create_opportunity: createOpportunity,
  send_ghl_message: sendGHLMessage,
  list_appointments: listAppointments,
  check_inventory: checkInventory,
  process_payment: processPayment,
  get_weather: getWeather,
  get_stock_price: getStockPrice,
  lookup_customer_orders: lookupCustomerOrders,
  search_knowledge_base: searchKnowledgeBase,
  calculate_date: calculateDate,
  format_currency: formatCurrency,
  get_complete_order_status: getCompleteOrderStatus,
  smart_lead_routing: smartLeadRouting,
}

// Function schemas for OpenAI
export const functionSchemas = [
  getContactDetailsSchema,
  updateContactTagSchema,
  createOpportunitySchema,
  sendGHLMessageSchema,
  listAppointmentsSchema,
  checkInventorySchema,
  processPaymentSchema,
  getWeatherSchema,
  getStockPriceSchema,
  lookupCustomerOrdersSchema,
  searchKnowledgeBaseSchema,
  calculateDateSchema,
  formatCurrencySchema,
  getCompleteOrderStatusSchema,
  smartLeadRoutingSchema,
]

// Get enabled functions for an account
export async function getEnabledFunctions(accountId: string) {
  const supabase = createClient()

  const { data: functions } = await supabase
    .from('ai_functions')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true)

  return functions || []
}
```

---

## 🧪 Testing Functions

### Unit Test Example

```typescript
// __tests__/functions/get-contact-details.test.ts
import { getContactDetails } from '@/lib/ai/functions/ghl/get-contact-details'

describe('getContactDetails', () => {
  it('should fetch contact details successfully', async () => {
    const result = await getContactDetails({
      contact_id: 'test_contact_123',
    })

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('email')
  })

  it('should throw error for invalid contact ID', async () => {
    await expect(
      getContactDetails({ contact_id: 'invalid' })
    ).rejects.toThrow()
  })
})
```

---

## 📋 Best Practices

1. **Error Handling**
   - Always wrap external calls in try-catch
   - Provide clear error messages
   - Log errors for debugging

2. **Timeout Management**
   - Set reasonable timeouts for all external calls
   - Use AbortSignal for fetch requests
   - Default: 30 seconds for webhooks, 10 seconds for APIs

3. **Input Validation**
   - Validate all parameters before execution
   - Use TypeScript types
   - Check for required fields

4. **Caching**
   - Cache frequently accessed data (e.g., contact details)
   - Set appropriate TTL based on data volatility
   - Use Redis or in-memory cache

5. **Security**
   - Never expose API keys in function responses
   - Encrypt sensitive data with Token Manager
   - Validate permissions before execution

6. **Performance**
   - Run independent operations in parallel with Promise.all()
   - Limit database query results
   - Use pagination for large datasets

7. **Documentation**
   - Clear function descriptions
   - Detailed parameter descriptions
   - Include examples in schema

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
**Status**: Complete - Production Ready
