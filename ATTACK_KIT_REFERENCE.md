# Attack Kit Quick Reference

**For AI Agent Project**

This file provides quick access to the most critical Attack Kit patterns you'll need. Always refer to the full Attack Kit for complete details.

**Full Attack Kit Location**: `/mnt/c/Development/resources/ATTACK_KIT.md`

---

## 🚨 Critical Rules (NEVER VIOLATE)

### Database Operations

```bash
# ✅ CORRECT: Use exec_sql for all migrations
node scripts/run-migration.js supabase/migrations/001_create_tables.sql

# ❌ WRONG: Don't manually paste SQL into Supabase dashboard
# ❌ WRONG: Don't use direct PostgreSQL connections
```

### Admin Verification

```typescript
// ✅ CORRECT: Always verify admin from database
const { data: userData } = await supabase
  .from('users')
  .select('is_admin')
  .eq('id', user.id)
  .single()

const isAdmin = !!(userData as any)?.is_admin

// ❌ WRONG: Don't trust client-side admin claims
```

### API URLs

```typescript
// ✅ CORRECT: Use relative paths
const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ❌ WRONG: Don't hardcode localhost
const baseURL = 'http://localhost:3000/api'; // NEVER DO THIS
```

### Token Storage

```typescript
// ✅ CORRECT: Use Token Manager for sensitive data
const encrypted = await encryptToken('service', userId, { api_key: 'xxx' })
await supabase.from('table').insert({ encrypted_token: encrypted })

// ❌ WRONG: Don't store plaintext tokens
await supabase.from('table').insert({ api_key: 'xxx' }) // NEVER DO THIS
```

---

## 📋 Common Patterns

### 1. Supabase exec_sql Setup

**Create the function** (run once in Supabase SQL Editor):

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_text;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;
```

**Create run-migration.js**:

```javascript
// scripts/run-migration.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');

  const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('Migration successful:', data);
}

const migrationFile = process.argv[2];
runMigration(migrationFile);
```

**Usage**:

```bash
node scripts/run-migration.js supabase/migrations/001_init.sql
```

---

### 2. Authentication Pattern

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Usage in API route
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Continue with authenticated user
}
```

---

### 3. Token Manager Integration

**Helper functions** (`lib/token-manager.ts`):

```typescript
const TOKEN_MANAGER_URL = process.env.TOKEN_MANAGER_URL || 'http://localhost:3001'

export async function encryptToken(
  service: string,
  userId: string,
  data: any
): Promise<string> {
  const response = await fetch(`${TOKEN_MANAGER_URL}/tokens/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service, userId, data })
  })

  if (!response.ok) {
    throw new Error(`Token encryption failed: ${response.statusText}`)
  }

  const { encryptedToken } = await response.json()
  return encryptedToken
}

export async function decryptToken(encryptedToken: string): Promise<any> {
  const response = await fetch(`${TOKEN_MANAGER_URL}/tokens/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encryptedToken })
  })

  if (!response.ok) {
    throw new Error(`Token decryption failed: ${response.statusText}`)
  }

  const { data } = await response.json()
  return data
}
```

**Usage**:

```typescript
// Encrypt API key
const encrypted = await encryptToken('anthropic', userId, {
  api_key: 'sk-ant-xxx'
})

// Store in database
await supabase.from('api_keys').insert({
  user_id: userId,
  service: 'anthropic',
  encrypted_key: encrypted
})

// Later, retrieve and decrypt
const { data } = await supabase
  .from('api_keys')
  .select('encrypted_key')
  .eq('user_id', userId)
  .single()

const decrypted = await decryptToken(data.encrypted_key)
// decrypted = { api_key: 'sk-ant-xxx' }
```

---

### 4. API Route Standard Pattern

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Input validation schema
const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  age: z.number().int().min(0).optional()
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate input
    const body = await request.json()
    const validatedData = schema.parse(body)

    // 3. Business logic
    const result = await someOperation(validatedData)

    // 4. Success response
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Operation completed successfully'
    })

  } catch (error: any) {
    // Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    // Log error
    console.error('API Error:', {
      endpoint: request.url,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })

    // Generic error
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
```

---

### 5. Database Schema Standards

```sql
-- Standard users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standard admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standard audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY "Users see own records" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can see all data
CREATE POLICY "Admins see all records" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
```

---

### 6. OpenAI/Anthropic Function Calling Pattern

```typescript
// lib/ai/function-definitions.ts
export const functionDefinitions = [
  {
    name: 'query_database',
    description: 'Query the database for user data',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute'
        }
      },
      required: ['query']
    }
  }
]

// lib/ai/function-handlers.ts
export async function handleFunctionCall(
  functionName: string,
  args: any,
  userId: string
) {
  switch (functionName) {
    case 'query_database':
      return await queryDatabase(args.query, userId)

    default:
      throw new Error(`Unknown function: ${functionName}`)
  }
}

async function queryDatabase(query: string, userId: string) {
  // Implement with proper auth and RLS
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('safe_query', {
    query_text: query,
    user_id: userId
  })

  return { data, error }
}

// app/api/ai/chat/route.ts
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const { messages } = await request.json()

  let response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    tools: functionDefinitions,
    messages: messages
  })

  // Iterative function calling
  while (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(c => c.type === 'tool_use')

    const result = await handleFunctionCall(
      toolUse.name,
      toolUse.input,
      userId
    )

    messages.push({
      role: 'assistant',
      content: response.content
    })

    messages.push({
      role: 'user',
      content: [{
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result)
      }]
    })

    response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      tools: functionDefinitions,
      messages: messages
    })
  }

  return NextResponse.json({ response })
}
```

---

### 7. Environment Variables Template

```env
# .env.local (NEVER commit this file)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Token Manager
TOKEN_MANAGER_URL=http://localhost:3001

# Security
NEXTAUTH_SECRET=your-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

### 8. Vercel Configuration

**vercel.json**:

```json
{
  "regions": ["sfo1"],
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

---

## 🔍 Quick Lookup

### Need to...

| Task | See Section |
|------|-------------|
| Set up database migrations | Attack Kit Section 22 |
| Implement authentication | Attack Kit Section 6 |
| Integrate OpenAI/Anthropic | Attack Kit Section 23 |
| Set up GoHighLevel OAuth | Attack Kit Section 19 |
| Use Token Manager | Attack Kit Section 21 |
| Define database schema | Attack Kit Sections 3-5 |
| Create API routes | Attack Kit Section 11 |
| Handle errors | Attack Kit Section 15 |
| Deploy to Vercel | Attack Kit Section 20 |

---

## 📝 Pre-Flight Checklist

Before starting any feature:

- [ ] Check if pattern exists in Attack Kit
- [ ] Read relevant Attack Kit sections
- [ ] Understand security requirements
- [ ] Plan database schema changes
- [ ] Identify required environment variables

Before committing:

- [ ] Run `npm run build` (no errors)
- [ ] Run tests if available
- [ ] No sensitive data in code
- [ ] `.env.local` not committed
- [ ] Code follows Attack Kit standards

Before deploying:

- [ ] All environment variables set in Vercel
- [ ] Database migrations run on production
- [ ] `exec_sql` function created in production Supabase
- [ ] No hardcoded URLs (especially localhost)
- [ ] Build completes successfully

---

**Full Documentation**: `/mnt/c/Development/resources/ATTACK_KIT.md`

**Last Updated**: 2025-11-03
