# Supabase Setup Guide for AI Chat Agent

**Project Name:** Agent_AI
**Date:** 2024-11-05

---

## 📋 Step 1: Create Supabase Project

### Go to Supabase Dashboard

1. **Visit:** https://supabase.com/dashboard
2. **Sign in** (or create account if needed)
3. **Click:** "New Project" button

### Project Configuration

Fill in the following details:

```
Project Name:     Agent_AI
Database Password: [CREATE A STRONG PASSWORD - SAVE IT!]
Region:           [Choose closest to you - e.g., US East, EU West]
Pricing Plan:     Free (to start)
```

⚠️ **IMPORTANT:** Save your database password securely! You'll need it later.

### Wait for Project Creation

- This takes ~2 minutes
- You'll see a progress indicator
- Don't close the browser tab!

---

## 📋 Step 2: Get Your Credentials

Once the project is created:

### A. Project URL

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Find **Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copy this entire URL

### B. Anon Key (Public)

1. Still in **API** tab
2. Find **Project API keys** section
3. Copy the **anon** / **public** key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```
   (This is safe for browser - it's public)

### C. Service Role Key (Secret)

1. Still in **API** tab
2. Click to reveal **service_role** key
3. Copy the **service_role** key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```
   ⚠️ **KEEP THIS SECRET!** Never commit to git!

---

## 📋 Step 3: Configure Environment Variables

### Create .env.local File

Once you have all three credentials above, provide them to me and I'll:

1. Create the `.env.local` file
2. Add all necessary environment variables
3. Ensure it's properly configured

**I'll need from you:**
- ✅ Project URL
- ✅ Anon Key
- ✅ Service Role Key

---

## 📋 Step 4: Enable Extensions (I'll do this)

We need to enable these PostgreSQL extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- For encryption
CREATE EXTENSION IF NOT EXISTS "vector";       -- For embeddings (pgvector)
```

---

## 📋 Step 5: Run Database Migration (I'll do this)

I'll run the complete schema migration that includes:

- ✅ 15+ tables for the AI Chat Agent
- ✅ Indexes for performance
- ✅ Triggers for automation
- ✅ Helper functions
- ✅ Row Level Security policies

---

## 📋 Step 6: Verify Setup (I'll do this)

I'll verify:
- ✅ Database connection works
- ✅ Tables are created
- ✅ Extensions enabled
- ✅ RLS policies active
- ✅ Sample queries work

---

## 🎯 What You Need to Do RIGHT NOW

### 1. Create the Project

Go to: **https://supabase.com/dashboard**

Click: **"New Project"**

### 2. Get Your 3 Credentials

Once created, get:
1. **Project URL** (from Settings → API)
2. **Anon Key** (from Settings → API)
3. **Service Role Key** (from Settings → API)

### 3. Provide Them to Me

Paste all three here in the chat:

```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
```

---

## ⏱️ Timeline

- **Project Creation:** 2 minutes
- **Getting Credentials:** 1 minute
- **My Setup (automated):** 2-3 minutes
- **Total:** ~5-6 minutes

---

## 🔒 Security Notes

✅ **Safe to share with me:**
- Project URL
- Anon Key (it's public anyway)
- Service Role Key (I'll store it securely in .env.local which is gitignored)

❌ **Never commit to git:**
- .env.local file
- Service Role Key
- Database password

✅ **.gitignore is already configured** to exclude:
- .env.local
- .env*.local
- All sensitive files

---

## 📞 Need Help?

If you encounter any issues:

1. **Can't find credentials?** Check Settings → API in Supabase
2. **Project creation failed?** Try a different region
3. **Other issues?** Let me know the error message

---

## ✅ Quick Checklist

Before providing credentials to me, make sure:

- [ ] Supabase project created successfully
- [ ] Project shows "Healthy" status
- [ ] You have the Project URL
- [ ] You have the Anon Key
- [ ] You have the Service Role Key
- [ ] You saved your database password somewhere safe

---

**Once you provide the credentials, I'll handle everything else automatically!** 🚀
