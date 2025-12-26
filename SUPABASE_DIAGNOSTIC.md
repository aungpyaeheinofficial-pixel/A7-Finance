# Supabase RAG Diagnostic Checklist

Your AI is responding with "Based on general knowledge, as there is no specific internal data provided in the context" - this means **RAG is not retrieving documents from Supabase**.

## Quick Diagnostic Steps

### Step 1: Check if Data is in Supabase

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor** → **documents** table
4. Check if there are **any rows** in the table

**If the table doesn't exist:**
- Go to **SQL Editor** in Supabase
- Copy the entire contents of `supabase/schema.sql` from this project
- Paste and **Run** it
- This creates the `documents` table and `match_documents` function

**If the table exists but is empty (0 rows):**
- You need to ingest data first (see Step 2)

### Step 2: Ingest Data

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open: `http://localhost:3000/admin`

3. Login with password: `admin123`

4. Copy content from one of these files:
   - `data/myanmar_gold_market.txt` (for gold market questions)
   - `data/myanmar_forex_market.txt` (for exchange rate questions)
   - `data/myanmar_banking_regulations.txt` (for banking questions)
   - `data/finance_data.txt` (general finance)

5. Paste into the text area and click **"Upload & Train"**

6. Wait for success message: `Success: Successfully processed and uploaded X chunks...`

7. Go back to Supabase Dashboard → Table Editor → documents
   - You should now see new rows!

### Step 3: Check Environment Variables

Make sure your `.env.local` file (in project root) has:

```env
SUPABASE_URL=https://dzgamdpxlzcqmenfxpgu.supabase.co
SUPABASE_PRIVATE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
GOOGLE_API_KEY=YOUR_GOOGLE_KEY_HERE
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

**CRITICAL:** `SUPABASE_PRIVATE_KEY` must be the **service_role** key (starts with `eyJ...`), NOT the `sb_publishable_...` key.

To get the service_role key:
1. Supabase Dashboard → Project Settings → API
2. Find **"service_role"** key (keep it secret!)
3. Copy it to `.env.local`

**After editing `.env.local`, restart your dev server!**

### Step 4: Check Terminal Logs

When you ask a question in the chat:

1. Look at the terminal where `npm run dev` is running
2. You should see one of these:

   **✅ GOOD (RAG working):**
   ```
   [RAG] Retrieved 3 docs
   ```

   **❌ BAD (RAG failing):**
   ```
   [RAG] Retrieval failed, proceeding without context: [error message]
   ```

   **❌ BAD (No data):**
   ```
   [RAG] Retrieved 0 docs
   ```

### Step 5: Test with Specific Questions

After ingesting `myanmar_gold_market.txt`, try asking:

- "What are the gold market regulations in Myanmar?"
- "How does YGEA set gold prices?"
- "What is the gold trading framework?"

If RAG is working, the AI should reference specific details from the document (like "YGEA", "Yangon Gold Entrepreneurs Association", "1 tical = 16.33 grams", etc.)

If it still says "Based on general knowledge...", then RAG retrieval is still failing.

## Common Issues & Fixes

### Issue: "Table documents does not exist"
**Fix:** Run `supabase/schema.sql` in Supabase SQL Editor

### Issue: "Retrieved 0 docs" but table has data
**Possible causes:**
- `match_documents` function doesn't exist → Run schema.sql
- Embeddings weren't generated properly → Re-ingest data
- Query doesn't match document content → Try different question

### Issue: "Retrieval failed" error
**Check:**
- Is `SUPABASE_PRIVATE_KEY` the service_role key?
- Does `match_documents` function exist?
- Are there any RLS (Row Level Security) policies blocking access?

### Issue: "Missing Supabase credentials" error
**Fix:** Check `.env.local` has `SUPABASE_URL` and `SUPABASE_PRIVATE_KEY`

## Quick Test Query

Run this in Supabase SQL Editor to verify your setup:

```sql
-- Check if table exists and has data
SELECT COUNT(*) as total_documents FROM documents;

-- Check if match_documents function exists
SELECT proname FROM pg_proc WHERE proname = 'match_documents';

-- View sample documents
SELECT id, LEFT(content, 100) as preview FROM documents LIMIT 5;
```

All three queries should return results if everything is set up correctly.

