-- AI Chat Agent - Complete Database Schema
-- Migration: 001_initial_schema
-- Created: 2025-11-03

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ACCOUNTS & SETTINGS
-- ============================================================================

-- Accounts table (represents companies/organizations using the AI agent)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name TEXT NOT NULL,
  ghl_location_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account-level settings for AI behavior
CREATE TABLE account_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,

  -- Context window settings
  context_window_days INTEGER DEFAULT 30,
  context_window_messages INTEGER DEFAULT 60,
  max_context_tokens INTEGER DEFAULT 8000,

  -- Semantic search settings
  enable_semantic_search BOOLEAN DEFAULT true,
  semantic_search_limit INTEGER DEFAULT 10,
  semantic_similarity_threshold FLOAT DEFAULT 0.7,

  -- RAG settings
  enable_rag BOOLEAN DEFAULT true,
  rag_chunk_limit INTEGER DEFAULT 5,
  rag_similarity_threshold FLOAT DEFAULT 0.75,

  -- AI Provider settings
  default_ai_provider TEXT DEFAULT 'openai' CHECK (default_ai_provider IN ('openai', 'anthropic')),
  openai_model TEXT DEFAULT 'gpt-4-turbo-preview',
  anthropic_model TEXT DEFAULT 'claude-3-5-sonnet-20241022',

  -- Function calling settings
  enable_function_calling BOOLEAN DEFAULT true,
  max_function_calls_per_message INTEGER DEFAULT 10,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- API KEY MANAGEMENT
-- ============================================================================

-- API Keys for OpenAI and Anthropic
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Key type and ownership
  key_type TEXT NOT NULL CHECK (key_type IN ('openai', 'anthropic', 'ghl')),
  key_level TEXT NOT NULL CHECK (key_level IN ('platform', 'account', 'user')),

  -- User-specific keys (NULL for platform/account level)
  user_id UUID,

  -- Encrypted API key (stored using Token Manager)
  encrypted_key_reference TEXT NOT NULL, -- Token Manager reference ID

  -- Key metadata
  key_name TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Permissions
  permissions JSONB DEFAULT '{}', -- e.g., {"max_tokens": 100000, "models": ["gpt-4"]}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_account ON api_keys(account_id);
CREATE INDEX idx_api_keys_user ON api_keys(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================================

-- Conversations (one per GHL contact)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- GHL contact information
  ghl_contact_id TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Conversation metadata
  conversation_title TEXT,
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,

  -- AI preferences for this conversation
  preferred_ai_provider TEXT CHECK (preferred_ai_provider IN ('openai', 'anthropic')),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(account_id, ghl_contact_id)
);

CREATE INDEX idx_conversations_account ON conversations(account_id);
CREATE INDEX idx_conversations_contact ON conversations(ghl_contact_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages in conversations
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'function')),
  content TEXT NOT NULL,

  -- Message type (for filtering)
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'automation', 'manual')),

  -- Smart context loading flag
  -- TRUE if there is a contact reply AFTER this message (set via trigger)
  precedes_user_reply BOOLEAN DEFAULT false,

  -- GHL message ID (for messages from GHL)
  ghl_message_id TEXT,

  -- Function calling data
  function_call JSONB, -- OpenAI function call data
  function_call_result JSONB, -- Result from function execution

  -- Metadata
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_account ON messages(account_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_precedes_reply ON messages(precedes_user_reply) WHERE precedes_user_reply = true;

-- Trigger to set precedes_user_reply flag
CREATE OR REPLACE FUNCTION update_precedes_user_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new user message is inserted
  IF NEW.role = 'user' THEN
    -- Mark all previous messages in this conversation that don't already precede a user reply
    UPDATE messages
    SET precedes_user_reply = true
    WHERE conversation_id = NEW.conversation_id
      AND created_at < NEW.created_at
      AND precedes_user_reply = false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_precedes_user_reply
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_precedes_user_reply();

-- Conversation embeddings for semantic search
CREATE TABLE conversation_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Embedded content
  message_text TEXT NOT NULL,
  message_role TEXT NOT NULL,

  -- Vector embedding (OpenAI ada-002 = 1536 dimensions)
  embedding vector(1536),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_embeddings_message ON conversation_embeddings(message_id);
CREATE INDEX idx_conversation_embeddings_conversation ON conversation_embeddings(conversation_id);
CREATE INDEX idx_conversation_embeddings_vector ON conversation_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- FILE UPLOADS
-- ============================================================================

-- Files uploaded in conversations
CREATE TABLE conversation_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,

  -- Storage reference
  storage_path TEXT NOT NULL, -- Supabase Storage path
  storage_url TEXT NOT NULL, -- Public or signed URL

  -- Processing status
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,

  -- Metadata
  uploaded_by_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_files_conversation ON conversation_files(conversation_id);
CREATE INDEX idx_conversation_files_account ON conversation_files(account_id);

-- ============================================================================
-- RAG KNOWLEDGE BASE
-- ============================================================================

-- RAG documents (per account)
CREATE TABLE rag_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Document information
  document_name TEXT NOT NULL,
  document_type TEXT,
  source_url TEXT,

  -- Content
  full_content TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rag_documents_account ON rag_documents(account_id);

-- RAG chunks (split from documents)
CREATE TABLE rag_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES rag_documents(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Chunk content
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,

  -- Vector embedding
  embedding vector(1536),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rag_chunks_document ON rag_chunks(document_id);
CREATE INDEX idx_rag_chunks_account ON rag_chunks(account_id);
CREATE INDEX idx_rag_chunks_vector ON rag_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================================
-- FUNCTION CALLING SYSTEM
-- ============================================================================

-- AI Functions definitions
CREATE TABLE ai_functions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Function identification
  function_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'ghl', 'custom', 'webhook', 'database', 'utility'

  -- Ownership (NULL account_id = platform-wide function)
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  is_platform_function BOOLEAN DEFAULT false,

  -- Function schema (OpenAI format)
  parameters JSONB NOT NULL, -- OpenAI function parameters schema

  -- Handler configuration
  handler_type TEXT NOT NULL CHECK (handler_type IN ('internal', 'api', 'webhook', 'database')),
  handler_config JSONB NOT NULL, -- Handler-specific configuration

  -- Security & permissions
  requires_auth BOOLEAN DEFAULT true,
  allowed_roles TEXT[], -- ['admin', 'user', 'contact']

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  version INTEGER DEFAULT 1,
  created_by UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(function_name, account_id)
);

CREATE INDEX idx_ai_functions_account ON ai_functions(account_id);
CREATE INDEX idx_ai_functions_category ON ai_functions(category);
CREATE INDEX idx_ai_functions_active ON ai_functions(is_active) WHERE is_active = true;

-- Function call execution logs
CREATE TABLE function_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference to function and message
  function_id UUID REFERENCES ai_functions(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Function details (snapshot at execution time)
  function_name TEXT NOT NULL,
  handler_type TEXT NOT NULL,

  -- Execution data
  input_parameters JSONB NOT NULL,
  output_result JSONB,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'error')),
  error_message TEXT,

  -- Performance metrics
  execution_time_ms INTEGER,

  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_function_call_logs_function ON function_call_logs(function_id);
CREATE INDEX idx_function_call_logs_message ON function_call_logs(message_id);
CREATE INDEX idx_function_call_logs_conversation ON function_call_logs(conversation_id);
CREATE INDEX idx_function_call_logs_account ON function_call_logs(account_id);
CREATE INDEX idx_function_call_logs_status ON function_call_logs(status);

-- ============================================================================
-- WEBHOOK SYSTEM
-- ============================================================================

-- Webhook configurations (for triggering external webhooks)
CREATE TABLE webhook_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Webhook identification
  webhook_name TEXT NOT NULL,
  description TEXT,

  -- Webhook endpoint
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST' CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),

  -- Headers and authentication
  headers JSONB DEFAULT '{}', -- Custom headers
  auth_type TEXT CHECK (auth_type IN ('none', 'bearer', 'basic', 'apikey')),
  auth_config JSONB, -- Encrypted auth credentials reference

  -- Request configuration
  timeout_ms INTEGER DEFAULT 30000,
  retry_count INTEGER DEFAULT 3,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(account_id, webhook_name)
);

CREATE INDEX idx_webhook_configs_account ON webhook_configurations(account_id);

-- Webhook events log (incoming webhooks from GHL, etc.)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,

  -- Event source
  source TEXT NOT NULL, -- 'ghl', 'stripe', 'custom'
  event_type TEXT NOT NULL,

  -- Event data
  payload JSONB NOT NULL,
  headers JSONB,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  -- GHL-specific fields
  ghl_location_id TEXT,
  ghl_contact_id TEXT,

  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_account ON webhook_events(account_id);
CREATE INDEX idx_webhook_events_source ON webhook_events(source);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_ghl_contact ON webhook_events(ghl_contact_id) WHERE ghl_contact_id IS NOT NULL;

-- ============================================================================
-- GHL INTEGRATION
-- ============================================================================

-- GHL OAuth tokens (encrypted via Token Manager)
CREATE TABLE ghl_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,

  -- OAuth tokens (encrypted references)
  access_token_reference TEXT NOT NULL,
  refresh_token_reference TEXT NOT NULL,

  -- Token metadata
  token_type TEXT DEFAULT 'Bearer',
  scope TEXT,
  expires_at TIMESTAMPTZ NOT NULL,

  -- GHL location info
  location_id TEXT NOT NULL,
  company_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ghl_tokens_account ON ghl_oauth_tokens(account_id);
CREATE INDEX idx_ghl_tokens_location ON ghl_oauth_tokens(location_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to search conversation embeddings
CREATE OR REPLACE FUNCTION search_conversation_history(
  p_conversation_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 10,
  p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  message_id UUID,
  message_text TEXT,
  message_role TEXT,
  similarity FLOAT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.message_id,
    ce.message_text,
    ce.message_role,
    1 - (ce.embedding <=> p_query_embedding) AS similarity,
    ce.created_at
  FROM conversation_embeddings ce
  WHERE ce.conversation_id = p_conversation_id
    AND 1 - (ce.embedding <=> p_query_embedding) >= p_threshold
  ORDER BY ce.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to search RAG knowledge base
CREATE OR REPLACE FUNCTION search_rag_knowledge(
  p_account_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 5,
  p_threshold FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.document_id,
    rc.chunk_text,
    1 - (rc.embedding <=> p_query_embedding) AS similarity,
    rc.metadata
  FROM rag_chunks rc
  INNER JOIN rag_documents rd ON rc.document_id = rd.id
  WHERE rc.account_id = p_account_id
    AND rd.is_active = true
    AND 1 - (rc.embedding <=> p_query_embedding) >= p_threshold
  ORDER BY rc.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE function_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be added based on your auth setup
-- Example: Allow users to access only their account's data
-- CREATE POLICY "Users can view own account data" ON conversations
--   FOR SELECT USING (account_id = auth.uid());

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default account settings template
-- (Will be created automatically for each new account via application logic)

COMMENT ON TABLE accounts IS 'Organizations/companies using the AI agent';
COMMENT ON TABLE conversations IS 'One conversation per GHL contact, stores all messages';
COMMENT ON TABLE messages IS 'Individual messages in conversations with smart context loading';
COMMENT ON TABLE conversation_embeddings IS 'Vector embeddings for semantic search of conversation history';
COMMENT ON TABLE rag_chunks IS 'Knowledge base chunks with embeddings for RAG';
COMMENT ON TABLE ai_functions IS 'Function definitions for AI function calling';
COMMENT ON TABLE webhook_events IS 'Incoming webhook events from GHL and other sources';

-- Migration complete
