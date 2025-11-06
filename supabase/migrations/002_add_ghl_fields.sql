-- Add GoHighLevel integration fields to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT,
ADD COLUMN IF NOT EXISTS ghl_conversation_id TEXT,
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'sms';

-- Add index for faster GHL lookups
CREATE INDEX IF NOT EXISTS idx_conversations_ghl_contact ON conversations(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_ghl_conversation ON conversations(ghl_conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);

-- Add GHL message ID to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS ghl_message_id TEXT,
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'sms';

-- Add index for GHL message lookups
CREATE INDEX IF NOT EXISTS idx_messages_ghl_message ON messages(ghl_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);

-- Add conversation provider ID to account settings
ALTER TABLE account_settings
ADD COLUMN IF NOT EXISTS ghl_conversation_provider_id TEXT;

-- Add comment
COMMENT ON COLUMN conversations.ghl_contact_id IS 'GoHighLevel contact ID for integration';
COMMENT ON COLUMN conversations.ghl_conversation_id IS 'GoHighLevel conversation ID for message threading';
COMMENT ON COLUMN conversations.channel IS 'Communication channel: sms, email, whatsapp, gmb, fb, instagram';
COMMENT ON COLUMN messages.ghl_message_id IS 'GoHighLevel message ID for sync';
COMMENT ON COLUMN messages.channel IS 'Channel through which message was sent/received';
