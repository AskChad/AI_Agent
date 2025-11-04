-- Test Database Setup
-- Run these queries one by one to verify everything works

-- ============================================================================
-- 1. TEST: Create a test account
-- ============================================================================
INSERT INTO accounts (account_name, ghl_location_id)
VALUES ('Test Account', 'test-location-123')
RETURNING *;

-- Save the 'id' from the result above, you'll need it!
-- Replace 'YOUR_ACCOUNT_ID' in the queries below with the actual UUID


-- ============================================================================
-- 2. TEST: Create account settings (use the account_id from above)
-- ============================================================================
INSERT INTO account_settings (
    account_id,
    context_window_days,
    context_window_messages,
    enable_semantic_search,
    enable_rag,
    default_ai_provider
)
VALUES (
    'YOUR_ACCOUNT_ID',  -- Replace this!
    30,
    60,
    true,
    true,
    'openai'
)
RETURNING *;


-- ============================================================================
-- 3. TEST: Create a test conversation
-- ============================================================================
INSERT INTO conversations (
    account_id,
    ghl_contact_id,
    contact_name,
    contact_email,
    conversation_title
)
VALUES (
    'YOUR_ACCOUNT_ID',  -- Replace this!
    'test-contact-456',
    'Test User',
    'test@example.com',
    'Test Conversation'
)
RETURNING *;

-- Save the conversation 'id' for the next tests!


-- ============================================================================
-- 4. TEST: Create test messages
-- ============================================================================
-- Replace 'YOUR_CONVERSATION_ID' and 'YOUR_ACCOUNT_ID' below

-- User message 1
INSERT INTO messages (
    conversation_id,
    account_id,
    role,
    content,
    message_type
)
VALUES (
    'YOUR_CONVERSATION_ID',  -- Replace this!
    'YOUR_ACCOUNT_ID',       -- Replace this!
    'user',
    'Hello, I need help with my order',
    'chat'
)
RETURNING *;

-- Assistant message 1
INSERT INTO messages (
    conversation_id,
    account_id,
    role,
    content,
    message_type,
    tokens_used,
    model_used
)
VALUES (
    'YOUR_CONVERSATION_ID',  -- Replace this!
    'YOUR_ACCOUNT_ID',       -- Replace this!
    'assistant',
    'Hi! I would be happy to help you with your order. Can you provide your order number?',
    'chat',
    45,
    'gpt-4-turbo-preview'
)
RETURNING *;

-- User message 2
INSERT INTO messages (
    conversation_id,
    account_id,
    role,
    content,
    message_type
)
VALUES (
    'YOUR_CONVERSATION_ID',  -- Replace this!
    'YOUR_ACCOUNT_ID',       -- Replace this!
    'user',
    'My order number is 12345',
    'chat'
)
RETURNING *;


-- ============================================================================
-- 5. TEST: Check if trigger set precedes_user_reply correctly
-- ============================================================================
-- The second user message should have set precedes_user_reply = true
-- on the previous assistant message

SELECT
    id,
    role,
    LEFT(content, 50) as content_preview,
    precedes_user_reply,
    created_at
FROM messages
WHERE conversation_id = 'YOUR_CONVERSATION_ID'  -- Replace this!
ORDER BY created_at ASC;

-- You should see:
-- User message 1:     precedes_user_reply = false
-- Assistant message:  precedes_user_reply = true  ✅ (set by trigger!)
-- User message 2:     precedes_user_reply = false


-- ============================================================================
-- 6. TEST: Create a conversation embedding (for vector search)
-- ============================================================================
-- Replace the IDs below
-- Note: This uses a dummy embedding (zeros). In production,
-- you'll generate real embeddings with OpenAI

INSERT INTO conversation_embeddings (
    message_id,
    conversation_id,
    account_id,
    message_text,
    message_role,
    embedding
)
SELECT
    m.id,
    m.conversation_id,
    m.account_id,
    m.content,
    m.role,
    array_fill(0, ARRAY[1536])::vector(1536)  -- Dummy embedding
FROM messages m
WHERE m.conversation_id = 'YOUR_CONVERSATION_ID'  -- Replace this!
AND m.role = 'user'
LIMIT 1;


-- ============================================================================
-- 7. TEST: Vector search function
-- ============================================================================
-- Test the conversation history search function
-- Replace YOUR_CONVERSATION_ID

SELECT * FROM search_conversation_history(
    'YOUR_CONVERSATION_ID'::uuid,  -- Replace this!
    array_fill(0, ARRAY[1536])::vector(1536),  -- Dummy query embedding
    10,  -- limit
    0.0  -- threshold (0.0 for testing, since we're using dummy embeddings)
);

-- You should see results! Even with dummy embeddings, the function works.


-- ============================================================================
-- 8. TEST: Check conversation was updated by trigger
-- ============================================================================
-- The trigger should have updated last_message_at and message_count

SELECT
    id,
    contact_name,
    message_count,
    last_message_at,
    created_at
FROM conversations
WHERE id = 'YOUR_CONVERSATION_ID';  -- Replace this!

-- message_count should be 3 (we inserted 3 messages)
-- last_message_at should be the timestamp of the last message


-- ============================================================================
-- 9. TEST: Create a test AI function
-- ============================================================================
INSERT INTO ai_functions (
    function_name,
    display_name,
    description,
    category,
    account_id,
    is_platform_function,
    parameters,
    handler_type,
    handler_config,
    requires_auth,
    is_active
)
VALUES (
    'test_function',
    'Test Function',
    'A test function to verify the functions table works',
    'utility',
    'YOUR_ACCOUNT_ID',  -- Replace this!
    false,
    '{"type": "object", "properties": {"test": {"type": "string"}}, "required": ["test"]}'::jsonb,
    'internal',
    '{"handler_function": "test_handler"}'::jsonb,
    true,
    true
)
RETURNING *;


-- ============================================================================
-- 10. CLEANUP: Delete test data (optional)
-- ============================================================================
-- Run this if you want to clean up the test data

/*
DELETE FROM conversation_embeddings WHERE account_id = 'YOUR_ACCOUNT_ID';
DELETE FROM messages WHERE account_id = 'YOUR_ACCOUNT_ID';
DELETE FROM conversations WHERE account_id = 'YOUR_ACCOUNT_ID';
DELETE FROM ai_functions WHERE account_id = 'YOUR_ACCOUNT_ID';
DELETE FROM account_settings WHERE account_id = 'YOUR_ACCOUNT_ID';
DELETE FROM accounts WHERE id = 'YOUR_ACCOUNT_ID';
*/


-- ============================================================================
-- 11. VIEW ALL TABLES (verify everything is there)
-- ============================================================================
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;


-- ============================================================================
-- SUCCESS! ✅
-- ============================================================================
-- If all queries above worked, your database is fully set up and ready!
