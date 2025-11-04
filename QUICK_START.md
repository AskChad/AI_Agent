# AI Agent - Quick Start Guide

**Get up and running in minutes**

---

## 🎯 For New Claude Instances

### Step 1: Read This First (5 minutes)

```bash
# Read the critical instructions
cat /mnt/c/Development/resources/NEW_CLAUDE_PROJECT_INSTRUCTIONS.md

# Read the project README
cat README.md
```

**What you'll learn**:
- How to work with this project
- Where to find documentation
- What NOT to do
- Standard patterns to follow

### Step 2: Understand the Project (10 minutes)

```bash
# Read the constitution
cat .specify/memory/constitution.md

# Read the Attack Kit reference
cat ATTACK_KIT_REFERENCE.md
```

**What you'll learn**:
- Project principles and standards
- Common patterns and recipes
- Quick reference for daily tasks

### Step 3: Get Context (as needed)

```bash
# Check the resources index
cat RESOURCES_INDEX.md

# Read Attack Kit sections relevant to your task
cat /mnt/c/Development/resources/ATTACK_KIT.md
```

**What you'll learn**:
- Where to find specific information
- How to search for patterns
- What resources are available

---

## 🚀 For Development

### Initial Setup (First Time Only)

**Prerequisites**:
- Node.js 22.x installed
- npm installed
- Git configured
- Supabase account

**Run Setup**:

```bash
# Follow the comprehensive setup guide
cat SETUP.md

# Then execute step by step
# (See SETUP.md for detailed instructions)
```

### Daily Workflow

**Morning**:
```bash
# Update code
git pull

# Install any new dependencies
npm install

# Start development server
npm run dev
```

**During Development**:
```bash
# Reference Attack Kit before implementing
cat ATTACK_KIT_REFERENCE.md

# Run tests frequently
npm test

# Check types
npx tsc --noEmit
```

**Before Committing**:
```bash
# Run build
npm run build

# Run all tests
npm run test:all

# Check for errors
npm run lint
```

---

## 📁 Key Files & Locations

### Documentation

| File | Purpose | When to Read |
|------|---------|--------------|
| `README.md` | Project overview | Always first |
| `SETUP.md` | Initial setup | First time only |
| `ATTACK_KIT_REFERENCE.md` | Quick patterns | Daily reference |
| `RESOURCES_INDEX.md` | Resource lookup | When searching |
| `.specify/memory/constitution.md` | Project principles | Before implementing |

### Configuration

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (NOT committed) |
| `.env.example` | Environment template (committed) |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `vercel.json` | Deployment configuration |

### Critical Directories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js pages and API routes |
| `components/` | React components |
| `lib/` | Utilities and services |
| `supabase/migrations/` | Database migrations |
| `Resources/` | Credentials (gitignored) |
| `tests/` | All tests |

---

## 🔍 Common Tasks

### "I need to implement [feature]"

1. **Check if pattern exists**:
   ```bash
   grep -r "feature-name" /mnt/c/Development/resources/ATTACK_KIT.md
   ```

2. **Read relevant Attack Kit section**:
   ```bash
   cat /mnt/c/Development/resources/ATTACK_KIT.md | grep -A 50 "Section Name"
   ```

3. **Check Attack Kit Reference**:
   ```bash
   cat ATTACK_KIT_REFERENCE.md
   ```

4. **Implement using proven pattern**

### "I need to set up [service]"

1. **Check project config template**:
   ```bash
   cat /mnt/c/Development/resources/project-config.json
   ```

2. **Check service-specific guide**:
   ```bash
   ls /mnt/c/Development/resources/*[SERVICE]*.md
   ```

3. **Follow setup instructions**

### "I'm getting an error"

1. **Check common errors**:
   ```bash
   cat /mnt/c/Development/resources/common_errors.md
   ```

2. **Check troubleshooting guides**:
   ```bash
   grep -r "error-message" /mnt/c/Development/resources/*.md
   ```

3. **Check Attack Kit error handling section**

### "How do I deploy?"

1. **Read deployment guide**:
   ```bash
   cat /mnt/c/Development/resources/DEPLOYMENT_INSTRUCTIONS.md
   ```

2. **Check deployment verification**:
   ```bash
   cat /mnt/c/Development/resources/DEPLOYMENT_VERIFICATION.md
   ```

3. **Follow pre-deployment checklist** (in SETUP.md)

---

## ⚡ Ultra Quick Reference

### Database Migration

```bash
# Run migration
node scripts/run-migration.js supabase/migrations/001_migration.sql
```

### Environment Setup

```bash
# Copy template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

### Development

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Build
npm run build
```

### Supabase Clients

```typescript
// Server-side
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client-side
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Token Manager

```typescript
import { encryptToken, decryptToken } from '@/lib/token-manager'

// Encrypt
const encrypted = await encryptToken('service', userId, { key: 'value' })

// Decrypt
const decrypted = await decryptToken(encrypted)
```

### API Route Template

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Your logic here

  return NextResponse.json({ success: true })
}
```

---

## 🚨 Critical Reminders

### ALWAYS

- ✅ Check Attack Kit before implementing
- ✅ Use `exec_sql` for database migrations
- ✅ Verify admin from database
- ✅ Use Token Manager for sensitive data
- ✅ Validate inputs with Zod
- ✅ Implement RLS on tables
- ✅ Test before deploying

### NEVER

- ❌ Manually paste SQL into Supabase dashboard
- ❌ Trust client for auth/admin checks
- ❌ Commit `.env.local` or credentials
- ❌ Hardcode localhost URLs
- ❌ Store plaintext sensitive data
- ❌ Skip RLS policies
- ❌ Implement without checking Attack Kit

---

## 🎯 First Day Checklist

As a new Claude instance or developer:

- [ ] Read `NEW_CLAUDE_PROJECT_INSTRUCTIONS.md`
- [ ] Read `README.md`
- [ ] Read `.specify/memory/constitution.md`
- [ ] Skim `ATTACK_KIT_REFERENCE.md`
- [ ] Understand project structure
- [ ] Know where to find resources
- [ ] Understand security requirements
- [ ] Know the non-negotiables

**Time**: ~30 minutes
**Value**: Saves hours of mistakes

---

## 📞 Getting Unstuck

### "I don't know how to do X"

1. Check `ATTACK_KIT_REFERENCE.md`
2. Search Attack Kit
3. Check `RESOURCES_INDEX.md`
4. Ask user only if truly not documented

### "Something's not working"

1. Check error message
2. Read `common_errors.md`
3. Check relevant troubleshooting guide
4. Review Attack Kit section
5. Ask user with context

### "Is this the right approach?"

1. Check if pattern exists in Attack Kit
2. Read project constitution
3. Consider security implications
4. Ask user if multiple valid approaches

---

## 🎓 Learn More

### Next Steps

1. **Read Full Attack Kit**: `/mnt/c/Development/resources/ATTACK_KIT.md`
2. **Review Service Guides**: Check `/mnt/c/Development/resources/`
3. **Study GHL Patterns**: `/mnt/c/Development/resources/ghl-universal/`
4. **Explore Templates**: `/mnt/c/Development/resources/attack-kit/templates/`

### Recommended Reading Order

1. NEW_CLAUDE_PROJECT_INSTRUCTIONS.md
2. README.md
3. constitution.md
4. ATTACK_KIT_REFERENCE.md
5. Relevant Attack Kit sections
6. Service-specific guides (as needed)

---

**Last Updated**: 2025-11-03

**Time to productivity**: ~30 minutes of reading, lifetime of productivity.
