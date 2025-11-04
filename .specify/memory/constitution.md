# AI Agent Project Constitution

**Version**: 1.0
**Created**: 2025-11-03
**Last Updated**: 2025-11-03

---

## 🎯 Project Purpose

**Mission**: [Define what this AI agent is designed to accomplish]

**Vision**: [Long-term goals and aspirations for this project]

**Core Value Proposition**: [What makes this AI agent unique/valuable]

---

## 🏗️ Technical Principles

### 1. Attack Kit Compliance

- **ALL implementation** MUST follow Attack Kit standards
- **Reference Attack Kit** before implementing any feature
- **Use proven patterns** from Attack Kit and resources
- **Document deviations** if absolutely necessary (rare)

### 2. Security First

- ✅ **Encrypt sensitive data** using Token Manager
- ✅ **Validate all inputs** with Zod
- ✅ **Implement RLS** on all database tables
- ✅ **Never trust client** for authentication/authorization
- ✅ **Use HTTPS** in production
- ✅ **Hash passwords** with bcrypt (10+ rounds)
- ❌ **Never commit** `.env.local` or credentials
- ❌ **Never expose** service role keys to client

### 3. Production-First Mindset

- **Default to production-ready** configurations
- **Use relative paths** for API calls (never hardcode localhost)
- **Environment variables** for all configuration
- **Test in production-like** environments
- **Monitor and log** errors properly

### 4. Code Quality Standards

- **TypeScript** for all code
- **Comprehensive types** and interfaces
- **Meaningful names** for variables, functions, components
- **Single Responsibility** - one purpose per function/component
- **DRY principle** - don't repeat yourself
- **Comments for "why"** not "what"
- **Test critical paths** - unit, integration, E2E

### 5. Database Standards

- **Use `exec_sql`** for ALL migrations (Attack Kit Section 22)
- **Always include** `IF NOT EXISTS` in migrations
- **Always include** `created_at` and `updated_at` timestamps
- **Implement RLS** on all tables
- **Index foreign keys** and frequently queried columns
- **Use transactions** for multi-step operations

---

## 🤖 AI Agent Specific Principles

### 1. AI Model Usage

- **Primary**: Anthropic Claude API
  - Models: Claude 3.5 Sonnet (primary), Claude 3 Opus (advanced tasks)
  - Use function calling for tool use
  - Implement streaming for better UX

- **Alternative**: OpenAI API
  - Use Chat Completions (NOT Assistants API per Attack Kit)
  - Function calling pattern (same as Anthropic)

### 2. Context Management

- **Store conversations** in database
- **Implement memory** with RAG (Retrieval Augmented Generation) if needed
- **Token limits** - monitor and manage context windows
- **Summarization** - for long conversations
- **User privacy** - respect data retention preferences

### 3. Function Calling Standards

- **Define clear** function schemas
- **Validate parameters** before execution
- **Handle errors** gracefully
- **Audit function calls** for debugging
- **Rate limit** expensive operations
- **Security check** before executing functions

### 4. Response Quality

- **Accurate** - verify information when possible
- **Helpful** - provide actionable responses
- **Concise** - respect user's time
- **Context-aware** - remember conversation history
- **Error handling** - explain when things go wrong

---

## 📊 Performance Standards

### Response Time Targets

- **Chat response**: < 3 seconds
- **Simple query**: < 1 second
- **Complex analysis**: < 10 seconds
- **API calls**: < 500ms
- **Database queries**: < 200ms

### Scalability Goals

- **Support**: 100+ concurrent users
- **Conversations**: 10,000+ active conversations
- **Messages**: 1,000,000+ messages stored
- **Uptime**: 99.9% availability

---

## 🎨 User Experience Principles

### 1. Conversation Design

- **Natural language** - conversational, not robotic
- **Clear intent** - understand user goals
- **Progressive disclosure** - reveal complexity gradually
- **Error recovery** - help users when confused
- **Feedback** - show thinking/processing states

### 2. UI/UX Standards

- **Mobile-first** design
- **Accessible** - WCAG 2.1 AA compliance
- **Fast** - optimize for performance
- **Intuitive** - minimal learning curve
- **Responsive** - works on all devices

### 3. Privacy & Ethics

- **User data ownership** - users own their data
- **Transparent** - explain AI limitations
- **Opt-in** - user choice for data usage
- **GDPR/CCPA** compliant
- **No tracking** without consent

---

## 🔄 Development Workflow

### Spec-Driven Development

1. **Constitution** - This document
2. **Specify** - Define requirements clearly
3. **Clarify** - Resolve ambiguities
4. **Plan** - Technical architecture
5. **Tasks** - Actionable breakdown
6. **Implement** - Execute with tests
7. **Review** - Code review and QA
8. **Deploy** - Automated deployment

### Git Workflow

- **Branches**: `main` (production), `develop` (staging), `feature/*`, `fix/*`
- **Commits**: Conventional commits format
- **Pull Requests**: Required for main branch
- **Reviews**: At least one approval required
- **Tests**: Must pass before merge

### Testing Requirements

- **Unit tests**: Critical business logic
- **Integration tests**: API endpoints
- **E2E tests**: Critical user flows
- **Coverage**: Minimum 70% for critical paths

---

## 📋 Deployment Standards

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] No hardcoded secrets or URLs
- [ ] Build completes successfully
- [ ] Performance benchmarks met
- [ ] Security audit completed

### Deployment Process

1. **Test locally** - verify all features work
2. **Run migrations** - on production database
3. **Deploy to staging** - test in production-like environment
4. **Smoke tests** - verify critical paths
5. **Deploy to production** - gradual rollout
6. **Monitor** - watch for errors/issues
7. **Rollback plan** - ready if needed

---

## 🚫 Non-Negotiables (NEVER Violate)

1. ❌ **NEVER** manually paste SQL into Supabase dashboard (use `exec_sql`)
2. ❌ **NEVER** trust client for admin/auth checks (verify from database)
3. ❌ **NEVER** commit `.env.local` or credentials to git
4. ❌ **NEVER** hardcode localhost URLs (use relative paths)
5. ❌ **NEVER** store plaintext sensitive data (use Token Manager)
6. ❌ **NEVER** skip RLS policies on database tables
7. ❌ **NEVER** expose service role keys to client
8. ❌ **NEVER** implement patterns without checking Attack Kit first

---

## ✅ Success Criteria

This project is successful when:

1. ✅ **Follows Attack Kit** - 100% compliance with standards
2. ✅ **Secure** - No security vulnerabilities
3. ✅ **Performant** - Meets all performance targets
4. ✅ **Reliable** - 99.9% uptime
5. ✅ **Tested** - Comprehensive test coverage
6. ✅ **Documented** - Clear, up-to-date documentation
7. ✅ **Scalable** - Can handle growth
8. ✅ **Maintainable** - Easy to update and extend

---

## 📖 Reference Documents

- **Attack Kit**: `/mnt/c/Development/resources/ATTACK_KIT.md`
- **New Project Instructions**: `/mnt/c/Development/resources/NEW_CLAUDE_PROJECT_INSTRUCTIONS.md`
- **Setup Guide**: `SETUP.md`
- **Attack Kit Reference**: `ATTACK_KIT_REFERENCE.md`

---

## 🔄 Updates & Amendments

### Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-03 | 1.0 | Initial constitution | Initial Setup |

### Amendment Process

1. **Propose change** - document reasoning
2. **Review** - team discussion
3. **Approve** - consensus required
4. **Document** - update constitution
5. **Communicate** - notify all team members

---

**This constitution is a living document. Update it as the project evolves, but never compromise on the core principles outlined in the Attack Kit.**

**Last Updated**: 2025-11-03
**Status**: Active
