# AI Agent Project Setup Guide

**Follow these steps in order to set up the project correctly.**

---

## 📚 Step 0: Read Documentation (REQUIRED)

**Before doing ANYTHING else, read these files:**

1. `/mnt/c/Development/resources/NEW_CLAUDE_PROJECT_INSTRUCTIONS.md`
2. `/mnt/c/Development/resources/ATTACK_KIT_FRAMEWORK.md`
3. Relevant sections of `/mnt/c/Development/resources/ATTACK_KIT.md`

**This will save you hours of troubleshooting!**

---

## 🎯 Step 1: Define Project Requirements

Before writing any code, answer these questions:

### What kind of AI agent are you building?

- [ ] **Chatbot/Assistant** - Conversational AI with memory
- [ ] **Task Automation** - Automated workflows
- [ ] **Data Analysis** - Process and analyze data
- [ ] **Research Agent** - Gather and synthesize information
- [ ] **Code Assistant** - Help with coding tasks
- [ ] **Multi-Agent System** - Multiple specialized agents
- [ ] **Custom** - Specify: _______________

### Core Features

What should the AI agent be able to do?

- [ ] Natural language conversation
- [ ] Access to external data sources
- [ ] Execute actions (API calls, database queries)
- [ ] Learn from interactions
- [ ] Multi-user support
- [ ] Memory/context retention
- [ ] Tool/function calling
- [ ] Other: _______________

### Integration Requirements

What services does it need to integrate with?

- [ ] Anthropic Claude API
- [ ] OpenAI API
- [ ] Database (Supabase)
- [ ] External APIs (specify): _______________
- [ ] File storage
- [ ] Email/notifications
- [ ] Other: _______________

---

## 🔧 Step 2: Technology Stack Decisions

Based on your requirements, confirm:

### Core Stack (Recommended)

- **Framework**: Next.js 15+ (App Router) ✅
- **Language**: TypeScript 5.0+ ✅
- **Database**: Supabase (PostgreSQL) ✅
- **AI Provider**: Anthropic Claude / OpenAI
- **Deployment**: Vercel ✅
- **Testing**: Playwright + Jest ✅

### Additional Services (Based on needs)

- [ ] **Token Manager** - For encrypting API keys
- [ ] **GoHighLevel** - If CRM integration needed
- [ ] **Stripe** - If payments needed
- [ ] **SendGrid** - If email needed
- [ ] **File Storage** - Supabase Storage or S3

---

## 🚀 Step 3: Initialize Next.js Project

```bash
# Navigate to project directory
cd /mnt/c/Development/Ai_Agent

# Initialize Next.js with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --use-npm

# Answer the prompts:
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Turbopack? … No
# ✔ Would you like to customize the default import alias? … No
```

---

## 📦 Step 4: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk  # or openai if using OpenAI
npm install zod                 # Input validation
npm install date-fns           # Date handling

# Development dependencies
npm install --save-dev @playwright/test
npm install --save-dev jest @types/jest
npm install --save-dev playwright

# Install Playwright browsers
npx playwright install chromium
```

---

## 🗄️ Step 5: Set Up Supabase

### 5.1 Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Choose region: **West US (us-west-1)** (recommended)
4. Wait for project to be ready (~2 minutes)

### 5.2 Get Credentials

From Supabase dashboard → Settings → API:

- **Project URL**: `https://xxx.supabase.co`
- **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### 5.3 Create exec_sql Function

**CRITICAL**: Run this in Supabase SQL Editor:

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

### 5.4 Enable UUID Extension

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🔐 Step 6: Configure Environment Variables

### 6.1 Create .env.local

```bash
# Create file
touch .env.local

# Or use nano/vim
nano .env.local
```

### 6.2 Add Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Provider (choose one or both)
ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...

# Token Manager (if using)
TOKEN_MANAGER_URL=http://localhost:3001

# Security
NEXTAUTH_SECRET=generate-a-random-string-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 6.3 Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 64

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 6.4 Create .env.example

```bash
# Copy .env.local to .env.example
cp .env.local .env.example

# Then replace all values with placeholders
nano .env.example
```

---

## 📁 Step 7: Create Project Structure

```bash
# Create directories
mkdir -p app/api/ai
mkdir -p app/api/auth
mkdir -p app/api/admin
mkdir -p components/ui
mkdir -p components/ai
mkdir -p lib/supabase
mkdir -p lib/ai
mkdir -p lib/services
mkdir -p lib/utils
mkdir -p supabase/migrations
mkdir -p scripts
mkdir -p tests/e2e
mkdir -p tests/api
mkdir -p tests/unit
mkdir -p Resources
mkdir -p .specify/memory
mkdir -p .specify/specs
mkdir -p .specify/templates
```

---

## 🗃️ Step 8: Set Up Database Schema

### 8.1 Create Initial Migration

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table (encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
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

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users see own records" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins see all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- RLS Policies for conversations
CREATE POLICY "Users see own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users see own messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for api_keys
CREATE POLICY "Users see own api keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

### 8.2 Create Migration Runner

Create `scripts/run-migration.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(filePath) {
  console.log(`Running migration: ${filePath}`);

  const sql = fs.readFileSync(filePath, 'utf8');

  const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('Migration successful:', data);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-file>');
  process.exit(1);
}

runMigration(migrationFile);
```

### 8.3 Run Migration

```bash
node scripts/run-migration.js supabase/migrations/001_initial_schema.sql
```

---

## 🧪 Step 9: Set Up Testing

### 9.1 Create Playwright Config

Create `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 9.2 Update package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test",
    "test:api": "jest tests/api",
    "test:unit": "jest tests/unit",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## 🎨 Step 10: Create Basic Files

### 10.1 Supabase Client (Server)

Create `lib/supabase/server.ts`:

```typescript
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
```

### 10.2 Supabase Client (Browser)

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 10.3 Token Manager Helper

Create `lib/token-manager.ts`:

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

---

## 🔄 Step 11: Initialize Git (If Not Already)

```bash
# Initialize git
git init

# Create .gitignore (should already exist from create-next-app)
# Ensure these are included:
echo ".env.local" >> .gitignore
echo "Resources/CONNECTIONS.md" >> .gitignore
echo ".claude.json" >> .gitignore

# Initial commit
git add .
git commit -m "chore: Initial project setup with Attack Kit standards"
```

---

## ✅ Step 12: Verification Checklist

Before proceeding to development:

- [ ] Next.js project initialized
- [ ] All dependencies installed
- [ ] Supabase project created
- [ ] `exec_sql` function created in Supabase
- [ ] `.env.local` file created with all credentials
- [ ] `.env.example` created with placeholder values
- [ ] Database schema migration successful
- [ ] Migration runner script working
- [ ] Project structure created
- [ ] Basic Supabase clients created
- [ ] Git initialized with proper .gitignore
- [ ] Can run `npm run dev` successfully
- [ ] Can run `npm run build` successfully

---

## 🚀 Step 13: Start Development

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

---

## 🎯 Next Steps

Now that setup is complete:

1. **Define Project Constitution**
   - Run `/speckit.constitution`
   - Define project principles and standards

2. **Specify Features**
   - Run `/speckit.specify`
   - Define what the AI agent should do

3. **Plan Implementation**
   - Run `/speckit.plan`
   - Technical planning and architecture

4. **Begin Development**
   - Follow Attack Kit standards
   - Reference patterns as needed
   - Test frequently

---

## 🆘 Troubleshooting

### Issue: Migration fails

**Solution**: Check that `exec_sql` function exists in Supabase:

```sql
-- Run in Supabase SQL Editor
SELECT exec_sql('SELECT 1');
-- Should return 'SQL executed successfully'
```

### Issue: Supabase client errors

**Solution**: Verify environment variables:

```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: Token Manager not available

**Solution**: Start Token Manager:

```bash
cd /mnt/c/Development/video_game_tokens
node server.js
```

---

**Setup Complete!**

You're now ready to build following Attack Kit standards. Always reference the Attack Kit before implementing new features.

**Last Updated**: 2025-11-03
