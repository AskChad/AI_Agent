# AI Chat Agent - Testing Checklist

## Overview
This document tracks all features that have been implemented and need testing.

## Recent Updates (2025-11-07)
- ✅ Google Docs Integration for Knowledge Base
- ✅ Updated Agent Creation with Latest 2025 AI Models
- ✅ Environment Variable Sync to Vercel

---

## 1. Authentication & Account Management

### Registration
- [ ] User can register with email and password
- [ ] Registration creates account in database
- [ ] User is redirected to dashboard after registration
- [ ] Validation works (email format, password strength)

### Login
- [ ] User can login with valid credentials
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to dashboard
- [ ] Session is maintained across page refreshes

### Logout
- [ ] Logout button is visible in sidebar
- [ ] Clicking logout ends session
- [ ] User is redirected to login page
- [ ] Protected pages require re-authentication after logout

### Platform Admin
- [ ] Chad@askchad.net has platform admin privileges
- [ ] Admin has unlimited agents (max_agents = 0)
- [ ] is_platform_admin flag is set correctly

---

## 2. Agent Management

### Create Agent
- [ ] "Create Agent" button opens modal
- [ ] All form fields are present:
  - Agent Name (required)
  - Description (optional)
  - AI Provider (OpenAI / Anthropic dropdown)
  - Model (dynamic based on provider)
  - System Prompt
  - Context Window
  - Enable Function Calling checkbox

### AI Provider Selection
- [ ] Can select between OpenAI and Anthropic
- [ ] Changing provider updates model dropdown
- [ ] OpenAI models include:
  - ⭐ GPT-5 (recommended)
  - GPT-5 Mini, GPT-5 Nano
  - GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano
  - GPT-4o
  - o3, o3-mini, o3-pro
- [ ] Anthropic models include:
  - ⭐ Claude Sonnet 4.5 (recommended)
  - Claude Haiku 4.5
  - Claude Opus 4.1
  - Claude Sonnet 4, Claude Opus 4
  - Claude Sonnet 3.7, Claude 3.5 Sonnet

### Agent Operations
- [ ] Agent is created successfully
- [ ] New agent appears in agents list
- [ ] Can edit existing agent
- [ ] Can set agent as default
- [ ] Can archive agent
- [ ] Default agent has "Default" badge

### Agent Limits
- [ ] Agent limit is enforced (if max_agents > 0)
- [ ] Platform admins have unlimited agents
- [ ] Error shown when limit reached
- [ ] Usage bar shows current/max agents

---

## 3. Knowledge Base

### Document Management
- [ ] Can view list of documents
- [ ] Can upload new document manually
- [ ] Can edit existing document
- [ ] Can delete document (with confirmation)
- [ ] Can assign document to specific agent
- [ ] Search functionality works

### Statistics Cards
- [ ] Total Documents count is correct
- [ ] Document Types count is correct
- [ ] "With Agents" count is correct
- [ ] Last Updated date is correct

### Google Docs Integration

#### Connection
- [ ] "Connect Google" button is visible when disconnected
- [ ] Clicking "Connect Google" redirects to Google OAuth
- [ ] Can authorize application in Google
- [ ] Redirected back to knowledge base after auth
- [ ] Connection status shows: "Connected to Google: [email]"
- [ ] "Disconnect Google" button appears when connected

#### Document Import
- [ ] "Import from Google Docs" button appears when connected
- [ ] Clicking button opens modal with Google Docs list
- [ ] Modal shows all Google Docs from user's Drive
- [ ] Each document shows:
  - Document name
  - Last modified date
  - "View in Google Docs" link
  - "Import" button
- [ ] Clicking "Import" imports document content
- [ ] Imported document appears in knowledge base
- [ ] Re-importing same document updates existing entry
- [ ] Document content is extracted correctly
- [ ] google_doc_id and google_doc_url are stored

#### Google Docs Features
- [ ] OAuth tokens are encrypted and stored securely
- [ ] Tokens auto-refresh when expired
- [ ] Can disconnect Google account
- [ ] Disconnecting deactivates tokens
- [ ] Error handling for failed imports
- [ ] Loading states show during import

---

## 4. Conversations
- [ ] Can view list of conversations
- [ ] Can create new conversation
- [ ] Can select agent for conversation
- [ ] Can send messages
- [ ] AI responds to messages
- [ ] Conversation history is maintained
- [ ] Can switch between conversations

---

## 5. Functions
- [ ] Can view list of functions
- [ ] Can create new function
- [ ] Function calling works with agents
- [ ] Can edit function
- [ ] Can delete function

---

## 6. Analytics
- [ ] Dashboard shows key metrics
- [ ] Conversation count is accurate
- [ ] Message count is accurate
- [ ] Charts render correctly

---

## 7. Settings
- [ ] Can view account settings
- [ ] Can update account information
- [ ] Settings persist across sessions

---

## 8. Database & Backend

### Supabase Connection
- [ ] Database connection works on localhost
- [ ] Database connection works on Vercel
- [ ] All environment variables are set correctly
- [ ] RLS policies are enforced
- [ ] Data isolation works (users only see their data)

### Migrations
- [ ] All migrations have been run:
  - 001_initial_schema
  - 002_create_functions
  - 003_knowledge_base
  - 004_ghl_integration
  - 005_multi_agent_architecture
  - 006_create_knowledge_base
  - 007_google_docs_integration
- [ ] exec_sql function is installed
- [ ] All tables exist with correct schema

### API Endpoints
- [ ] /api/agents - List, Create agents
- [ ] /api/agents/[id] - Get, Update, Delete agent
- [ ] /api/knowledge - List, Create documents
- [ ] /api/knowledge/[id] - Get, Update, Delete document
- [ ] /api/google/oauth/authorize - OAuth flow start
- [ ] /api/google/oauth/callback - OAuth callback
- [ ] /api/google/oauth/status - Connection status
- [ ] /api/google/oauth/disconnect - Disconnect
- [ ] /api/google/docs - List Google Docs
- [ ] /api/google/docs/import - Import document
- [ ] /api/auth/login - User login
- [ ] /api/auth/logout - User logout
- [ ] /api/auth/register - User registration

---

## 9. Deployment & Production

### Environment Variables (Vercel)
- [x] NEXT_PUBLIC_SUPABASE_URL - Set
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY - Set
- [x] SUPABASE_SERVICE_ROLE_KEY - Set
- [x] NEXT_PUBLIC_APP_URL - Set to production URL
- [x] DB_PASSWORD - Set
- [x] TOKEN_MANAGER_URL - Set
- [x] TOKEN_MANAGER_PASSWORD - Set
- [ ] GOOGLE_CLIENT_ID - Needs to be set
- [ ] GOOGLE_CLIENT_SECRET - Needs to be set
- [ ] OPENAI_API_KEY - Needs to be set
- [ ] ANTHROPIC_API_KEY - Needs to be set

### Build & Deployment
- [x] Build completes successfully
- [x] No TypeScript errors
- [x] No linting errors
- [ ] Vercel deployment successful
- [ ] Production site loads without errors
- [ ] All routes accessible

### Performance
- [ ] Pages load within acceptable time
- [ ] API responses are fast
- [ ] No console errors in production
- [ ] Mobile responsive design works

---

## 10. Error Handling
- [ ] Invalid API requests show appropriate errors
- [ ] Network errors are handled gracefully
- [ ] User-friendly error messages
- [ ] Failed operations can be retried

---

## Test URLs

### Local Development
- Dashboard: http://localhost:3000/dashboard
- Knowledge Base: http://localhost:3000/dashboard/knowledge
- Agents: http://localhost:3000/dashboard/agents

### Production (Vercel)
- Dashboard: https://ai-agent-pi-one.vercel.app/dashboard
- Knowledge Base: https://ai-agent-pi-one.vercel.app/dashboard/knowledge
- Agents: https://ai-agent-pi-one.vercel.app/dashboard/agents

---

## Notes

### Known Issues
1. Google OAuth requires Google Cloud Console setup (Client ID & Secret)
2. AI API keys (OpenAI, Anthropic) need to be added for agent functionality
3. Token Manager service needs to be running for encryption features

### Next Steps
1. Set up Google Cloud Console project for OAuth
2. Add AI API keys to Vercel environment
3. Test all features on production deployment
4. Set up monitoring and error tracking

---

## Test Results Summary

| Category | Passed | Failed | Pending |
|----------|--------|--------|---------|
| Authentication | 0 | 0 | 4 |
| Agents | 0 | 0 | 10 |
| Knowledge Base | 0 | 0 | 20 |
| Google Docs | 0 | 0 | 15 |
| Database | 7 | 0 | 5 |
| Deployment | 5 | 0 | 5 |
| **TOTAL** | **12** | **0** | **59** |

---

Last Updated: 2025-11-07
