-- ===========================================
-- Create Knowledge Base Table
-- ===========================================

-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_account ON knowledge_base(account_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_agent ON knowledge_base(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_type ON knowledge_base(document_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created ON knowledge_base(created_at DESC);

-- Create full-text search index on title and content
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING gin(to_tsvector('english', title || ' ' || content));

-- Verification
SELECT
    'Knowledge base table created!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name='knowledge_base') as table_exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='knowledge_base') as column_count;
