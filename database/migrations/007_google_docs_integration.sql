-- ===========================================
-- Google Docs Integration for Knowledge Base
-- ===========================================

-- Create google_oauth_tokens table to store user's Google OAuth credentials
CREATE TABLE IF NOT EXISTS google_oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    -- OAuth tokens (encrypted in production)
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,

    -- Token metadata
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- User info from Google
    google_email VARCHAR(255),
    google_user_id VARCHAR(255),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(account_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_oauth_account ON google_oauth_tokens(account_id);
CREATE INDEX IF NOT EXISTS idx_google_oauth_active ON google_oauth_tokens(is_active) WHERE is_active = TRUE;

-- Add google_doc_id column to knowledge_base table to track source Google Docs
ALTER TABLE knowledge_base
ADD COLUMN IF NOT EXISTS google_doc_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_doc_url TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Create index for google_doc_id
CREATE INDEX IF NOT EXISTS idx_knowledge_base_google_doc ON knowledge_base(google_doc_id) WHERE google_doc_id IS NOT NULL;

-- Add comment
COMMENT ON TABLE google_oauth_tokens IS 'Stores Google OAuth tokens for accessing Google Docs API';
COMMENT ON COLUMN knowledge_base.google_doc_id IS 'Google Doc ID if this document was imported from Google Docs';
COMMENT ON COLUMN knowledge_base.last_synced_at IS 'Last time this document was synced from Google Docs';

-- Verification
SELECT
    'Google Docs integration tables created!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name='google_oauth_tokens') as oauth_table_exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='knowledge_base' AND column_name='google_doc_id') as google_doc_id_column_exists;
