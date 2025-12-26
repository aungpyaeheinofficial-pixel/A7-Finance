-- Quick verification queries to run in Supabase SQL Editor

-- 1. Check if documents table exists and structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents';

-- 2. Check if match_documents function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'match_documents';

-- 3. Check current document count (should be 0 initially)
SELECT COUNT(*) as total_documents FROM documents;

-- 4. Check if vector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

