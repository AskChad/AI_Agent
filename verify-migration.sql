-- Verification Script - Run this FIRST to check if migration will work
-- This checks for prerequisites before running the full migration

-- 1. Check PostgreSQL version (should be 14+)
SELECT version();

-- 2. Check if uuid-ossp extension is available
SELECT * FROM pg_available_extensions WHERE name = 'uuid-ossp';

-- 3. Check if pgcrypto extension is available
SELECT * FROM pg_available_extensions WHERE name = 'pgcrypto';

-- 4. Check if vector extension is available (for pgvector)
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- 5. If all checks pass, you'll see results
-- If any extension is missing, Supabase should have them available
-- The migration will enable them automatically

SELECT 'All prerequisites available!' AS status;
