#!/bin/bash
# Project Structure Setup Script
# Run this from your ai-chat-agent project root

echo "Creating project folder structure..."

# Core directories
mkdir -p lib/{ai,ghl,supabase,db,middleware,utils}
mkdir -p lib/ai/{functions,handlers}
mkdir -p lib/ai/functions/{ghl,webhook,api,database,utility,advanced}

# API routes
mkdir -p app/api/{auth,webhooks,conversations,messages,functions,rag,settings,analytics}
mkdir -p app/api/auth/ghl
mkdir -p app/api/webhooks/ghl

# Admin UI
mkdir -p app/admin/{functions,logs,analytics,settings}
mkdir -p app/admin/functions/{new,"[id]"}

# Components
mkdir -p components/{admin,ui,forms}

# Documentation
mkdir -p docs
mkdir -p supabase/migrations
mkdir -p .specify/memory
mkdir -p Resources

# Test directories
mkdir -p __tests__/{unit,integration,e2e}
mkdir -p __tests__/unit/{ai,db,functions}

echo "✅ Folder structure created!"
echo ""
echo "Directory tree:"
tree -L 2 -d lib app/api app/admin components docs
