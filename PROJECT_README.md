# AI Chat Agent

Intelligent AI assistant that integrates with GoHighLevel to provide automated, context-aware responses to customer messages.

**Status:** Day 1 - Foundation Setup ✅
**Next:** Day 2 - Supabase Setup

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.template .env.local

# Edit .env.local with your API keys
# (See SETUP.md for detailed instructions)

# Run development server
npm run dev
```

Visit http://localhost:3000

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **IMPLEMENTATION_CHECKLIST.md** | Day-by-day implementation guide (YOUR ROADMAP!) |
| **PROJECT_OVERVIEW.md** | System architecture and overview |
| **SETUP.md** | Detailed environment setup |
| **docs/API_ENDPOINTS.md** | REST API specification |
| **docs/ADMIN_UI_FUNCTIONS.md** | Admin UI design |
| **docs/GHL_MARKETPLACE_SETUP.md** | GHL OAuth setup |
| **docs/FUNCTION_EXAMPLES.md** | 15 production-ready examples |

---

## 📋 Current Progress

### ✅ Day 1: Project Initialization (COMPLETE)
- [x] Next.js project created
- [x] Dependencies installed
- [x] Project structure set up
- [x] Configuration files created
- [x] Core utilities created

### 🔄 Next: Day 2 - Supabase Setup
- [ ] Create Supabase project
- [ ] Deploy database migration
- [ ] Verify tables created
- [ ] Test vector search functions

---

## 🏗️ Project Structure

```
ai-chat-agent/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── webhooks/     # Webhook receivers
│   │   ├── conversations/
│   │   ├── messages/
│   │   └── functions/
│   ├── admin/            # Admin UI
│   │   ├── functions/
│   │   ├── logs/
│   │   └── analytics/
│   └── page.tsx          # Home page
│
├── lib/
│   ├── ai/               # AI engine
│   │   ├── functions/    # Function implementations
│   │   ├── handlers/     # Function handlers
│   │   ├── context-manager.ts
│   │   ├── message-processor.ts
│   │   └── function-executor.ts
│   ├── ghl/              # GoHighLevel integration
│   │   └── token-manager.ts
│   ├── supabase/         # Database clients
│   │   ├── client.ts
│   │   └── server.ts
│   ├── db/               # Database operations
│   ├── middleware/       # Auth, rate limiting
│   ├── config.ts         # Configuration
│   ├── logger.ts         # Logging utility
│   ├── api-response.ts   # Response helpers
│   └── errors.ts         # Error classes
│
├── components/
│   ├── admin/            # Admin components
│   ├── ui/               # UI components
│   └── forms/            # Form components
│
├── docs/                 # Technical documentation
├── supabase/
│   └── migrations/       # Database migrations
├── .specify/
│   └── memory/
│       └── constitution.md
└── Resources/            # Credentials guide
```

---

## 🔧 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI:** OpenAI, Anthropic
- **Styling:** Tailwind CSS
- **Testing:** Jest, Playwright

---

## 🎯 Key Features

- ✅ Multi-provider AI (OpenAI & Anthropic)
- ✅ GHL OAuth integration
- ✅ Real-time webhook processing
- ✅ Advanced function calling (4 handler types)
- ✅ Multi-tier context loading
- ✅ RAG knowledge base
- ✅ Semantic conversation search
- ✅ Admin UI for function management
- ✅ REST API

---

## 📖 Core Files Created (Day 1)

### Configuration
- `lib/config.ts` - Centralized configuration
- `.env.local.template` - Environment variables template
- `tsconfig.json` - TypeScript configuration

### Utilities
- `lib/logger.ts` - Logging utility
- `lib/api-response.ts` - API response formatters
- `lib/errors.ts` - Custom error classes

---

## 🔑 Environment Variables Needed

```bash
# Supabase (Day 2)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (Day 2-3)
OPENAI_API_KEY=

# GHL (Phase 3)
GHL_CLIENT_ID=
GHL_CLIENT_SECRET=
GHL_REDIRECT_URI=
```

See `.env.local.template` for complete list.

---

## 📅 Implementation Timeline

**Current:** Week 1, Day 1 ✅
**Next:** Week 1, Day 2

### Phases
1. **Foundation** (Weeks 1-2) - Database, environment, core utilities
2. **AI Engine** (Weeks 3-4) - OpenAI, context, functions
3. **GHL Integration** (Week 5) - OAuth, webhooks
4. **Admin UI** (Weeks 6-7) - Function management
5. **API** (Week 8) - REST endpoints
6. **Testing** (Weeks 9-10) - Tests, security, polish
7. **Launch** (Week 11) - Beta, deploy, launch

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Next Steps

1. **Now:** Complete Day 1 checklist in `IMPLEMENTATION_CHECKLIST.md`
2. **Tomorrow:** Set up Supabase (Day 2)
3. **This Week:** Complete foundation (Days 1-5)

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test
npm run test:e2e

# Lint
npm run lint
```

---

## 📞 Need Help?

- Check `IMPLEMENTATION_CHECKLIST.md` for daily tasks
- See `SETUP.md` for detailed setup instructions
- Review `PROJECT_OVERVIEW.md` for architecture
- Reference `docs/` for specific implementations

---

## 🎉 Day 1 Complete!

You've successfully:
- ✅ Created Next.js project with TypeScript
- ✅ Installed all core dependencies
- ✅ Set up complete project structure
- ✅ Created configuration files
- ✅ Built core utility functions

**Next:** Open `IMPLEMENTATION_CHECKLIST.md` and start Day 2!

---

**Built with the Attack Kit methodology** 🎯
