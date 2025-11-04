# AI Agent Project

**Status**: Initial Setup
**Created**: 2025-11-03
**Framework**: Attack Kit Methodology

---

## 🎯 Critical References

### Primary Documentation

**⚠️ MUST READ BEFORE STARTING ANY WORK:**

1. **Attack Kit** (Primary Implementation Guide)
   - Location: `/mnt/c/Development/resources/ATTACK_KIT.md`
   - Size: 186KB comprehensive guide
   - Contains: All implementation patterns, standards, and best practices

2. **Attack Kit Framework Guide**
   - Location: `/mnt/c/Development/resources/ATTACK_KIT_FRAMEWORK.md`
   - Quick overview of Attack Kit integration

3. **Attack Kit Quick Reference**
   - Location: `/mnt/c/Development/resources/ATTACK_KIT_QUICK_REFERENCE.md`
   - Essential commands and patterns

4. **New Claude Project Instructions**
   - Location: `/mnt/c/Development/resources/NEW_CLAUDE_PROJECT_INSTRUCTIONS.md`
   - **READ THIS FIRST** - Critical patterns and gotchas

5. **Claude Instructions**
   - Location: `/mnt/c/Development/resources/CLAUDE_INSTRUCTIONS.md`
   - How to work with Claude Code on this project

---

## 📚 Additional Resources

### Guides & Patterns

- **Supabase Configuration**: `/mnt/c/Development/resources/SUPABASE_CONFIGURATION_GUIDE.md`
- **Analytics Patterns**: `/mnt/c/Development/resources/ANALYTICS_PATTERNS.md`
- **UI Chart Standards**: `/mnt/c/Development/resources/UI_CHART_STANDARDS.md`
- **Error Management**: `/mnt/c/Development/resources/ERROR_MANAGEMENT.md`
- **Deployment Instructions**: `/mnt/c/Development/resources/DEPLOYMENT_INSTRUCTIONS.md`

### Integration Guides

- **GHL Universal**: `/mnt/c/Development/resources/ghl-universal/`
- **Token Manager**: `/mnt/c/Development/video_game_tokens/server.js`

### Configuration Files

- **Project Config Template**: `/mnt/c/Development/resources/project-config.json`
- **Attack Kit Config**: `/mnt/c/Development/resources/attack-kit-config.json`
- **Claude Preferences**: `/mnt/c/Development/resources/.claude-preferences.json`

---

## 🚀 Quick Start

### For New Claude Instances

1. **Read Documentation First**:
   ```bash
   # Read the primary guide
   cat /mnt/c/Development/resources/NEW_CLAUDE_PROJECT_INSTRUCTIONS.md

   # Read Attack Kit sections relevant to your task
   cat /mnt/c/Development/resources/ATTACK_KIT.md
   ```

2. **Check Existing Patterns**:
   - Before implementing ANY feature, check if a pattern exists in Attack Kit
   - Don't reinvent solutions that are already documented
   - Use proven patterns from resources

3. **Follow Standards**:
   - Use `exec_sql` for database migrations
   - Implement proper authentication/authorization
   - Follow security best practices
   - Use Token Manager for sensitive data

### For Development

1. **Check Resources First**: Always check `/mnt/c/Development/resources/` before implementing
2. **Use Attack Kit Patterns**: Follow established patterns for consistency
3. **Test Locally**: Before deploying or committing
4. **Document Decisions**: Keep this README updated

---

## 📋 Development Workflow

### Attack Kit Methodology

1. **Constitution** - Define project principles
2. **Specify** - Define what to build
3. **Clarify** - Resolve ambiguities
4. **Plan** - Technical planning
5. **Tasks** - Break into actionable items
6. **Implement** - Execute systematically
7. **Test** - Automated testing
8. **Deploy** - With confidence

### Daily Workflow

```bash
# Morning
npm run kit:sync          # Sync latest resources
git pull                  # Get latest code

# During development
npm run kit:specify       # Define requirements
npm run kit:plan          # Technical planning
npm run kit:test          # Run all tests

# Before committing
npm run test:all          # Test everything
git add .
git commit -m "feat: description"

# Deployment
npm run kit:deploy        # Deploy with tests
```

---

## 🎯 Project Principles

### Core Values

1. **Attack Kit First**: Always reference Attack Kit before implementing
2. **Security by Default**: Encrypt sensitive data, validate inputs
3. **Production-First**: Default to production-ready configurations
4. **Mobile-First**: Design for mobile, enhance for desktop
5. **Test Everything**: Automated testing at every level

### Standards

- **TypeScript**: All code in TypeScript
- **Next.js 15+**: App Router pattern
- **Supabase**: Database with RLS
- **Testing**: Unit, Integration, E2E
- **Documentation**: Clear and comprehensive

---

## 🔒 Security Requirements

### Always Required

- ✅ Use JWT for authentication
- ✅ Hash passwords with bcrypt (10+ rounds)
- ✅ Encrypt sensitive data with Token Manager
- ✅ Implement Row Level Security (RLS)
- ✅ Validate all inputs with Zod
- ✅ Use HTTPS in production
- ✅ Never expose service role keys to client

### Never Do

- ❌ Hardcode credentials or secrets
- ❌ Commit `.env.local` to git
- ❌ Trust client for admin checks
- ❌ Skip input validation
- ❌ Store plaintext tokens in database

---

## 📁 Project Structure

```
Ai_Agent/
├── README.md                 # This file
├── SETUP.md                  # Setup instructions
├── ATTACK_KIT_REFERENCE.md   # Quick reference guide
├── Resources/                # Project-specific resources
│   └── CONNECTIONS.md       # Credentials (gitignored)
├── .specify/                # Spec-Driven Development
│   ├── memory/              # Constitution & principles
│   ├── specs/               # Feature specifications
│   └── templates/           # Reusable templates
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   └── (pages)/            # App pages
├── components/              # React components
├── lib/                     # Utilities & services
│   ├── supabase/           # Supabase client
│   ├── ai/                 # AI integrations
│   └── services/           # Business logic
├── tests/                   # All tests
│   ├── e2e/                # End-to-end tests
│   ├── api/                # API tests
│   └── unit/               # Unit tests
├── supabase/                # Database
│   └── migrations/         # SQL migrations
└── scripts/                 # Build & deployment scripts
```

---

## 🛠️ Technology Stack

### Core

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.0+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Deployment**: Vercel
- **Testing**: Playwright, Jest

### AI/LLM Integration

- **Primary**: Anthropic Claude API
- **Alternative**: OpenAI API
- **Pattern**: Function calling (NOT Assistants API)

### Additional Services

- TBD based on project requirements

---

## 📝 Important Files

### Environment Variables

```env
# .env.local (NEVER commit this file)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
TOKEN_MANAGER_URL=http://localhost:3001
```

### Configuration

- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **next.config.ts** - Next.js configuration
- **vercel.json** - Deployment configuration

---

## 🆘 When You Need Help

### Check These First

1. **Attack Kit** - Most questions answered here
2. **NEW_CLAUDE_PROJECT_INSTRUCTIONS.md** - Common patterns and gotchas
3. **Resources Folder** - Service-specific guides

### Ask User When

- Requirements are unclear or ambiguous
- Multiple valid approaches exist
- Business logic is not documented
- Need credentials or API keys
- User preference needed (UI, features, etc.)

### Don't Ask User About

- How to set up `exec_sql` (it's in Attack Kit Section 22)
- How to implement authentication (it's in Attack Kit Section 6)
- Database schema patterns (it's in Attack Kit Sections 3-5)
- How to use Token Manager (it's in Attack Kit Section 21)
- Standard implementation patterns (check Attack Kit first)

---

## 🎓 Success Criteria

You are successfully following Attack Kit if:

1. ✅ You reference Attack Kit BEFORE implementing new features
2. ✅ You use `exec_sql` for ALL database operations
3. ✅ You use Token Manager for encrypting sensitive data
4. ✅ You follow standard patterns for auth, API routes, database schema
5. ✅ You implement proper error handling and validation
6. ✅ You verify admin checks from database (not client)
7. ✅ You use RLS on all tables
8. ✅ You test locally before deploying
9. ✅ User doesn't have to repeat information from Attack Kit

---

## 📍 Key File Locations

| Resource | Location |
|----------|----------|
| Attack Kit | `/mnt/c/Development/resources/ATTACK_KIT.md` |
| New Project Instructions | `/mnt/c/Development/resources/NEW_CLAUDE_PROJECT_INSTRUCTIONS.md` |
| Claude Instructions | `/mnt/c/Development/resources/CLAUDE_INSTRUCTIONS.md` |
| Project Config Template | `/mnt/c/Development/resources/project-config.json` |
| Attack Kit Config | `/mnt/c/Development/resources/attack-kit-config.json` |
| Token Manager | `/mnt/c/Development/video_game_tokens/server.js` |
| GHL Integration | `/mnt/c/Development/resources/ghl-universal/` |
| Resources Directory | `/mnt/c/Development/resources/` |

---

## 🚧 Project Status

### Setup Phase

- [x] Created README with Attack Kit references
- [ ] Initialize Attack Kit in project
- [ ] Set up Supabase database
- [ ] Configure environment variables
- [ ] Create initial database schema
- [ ] Set up authentication
- [ ] Configure deployment

### Next Steps

1. Define project requirements (what kind of AI agent?)
2. Create project constitution
3. Initialize Attack Kit framework
4. Set up development environment
5. Begin implementation

---

## 📞 Support

- **Documentation**: Check Attack Kit and resources first
- **Issues**: Document in project issues
- **Updates**: Keep this README current

---

**Last Updated**: 2025-11-03
**Version**: 0.1.0
**Status**: Initial Setup

---

**Remember**: The Attack Kit is your bible. Read it, reference it, follow it.
