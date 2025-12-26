# RAG Training Setup Instructions

## 1. Install Dependencies
Run the following command to install the necessary libraries for the ingestion script:

```bash
npm install dotenv @langchain/google-genai @langchain/community @langchain/core @supabase/supabase-js langchain
```

If you don't have TypeScript execution tools globally installed, you might also need:
```bash
npm install -D ts-node typescript @types/node
```

## 2. Environment Variables (.env)
Create or update your `.env` file in the root directory. 
**Important:** For the ingestion script (which runs server-side), you need the `service_role` key (Private Key) to write to the database bypassing RLS (Row Level Security), or ensure your RLS policies allow inserts.

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_PRIVATE_KEY=your-service-role-key-starts-with-ey...

# Google AI Configuration
GOOGLE_API_KEY=your-google-gemini-api-key

# (Optional) If running the Groq parts of the app
GROQ_API_KEY=your-groq-api-key
```

## 3. Database Setup
1. Go to your Supabase Dashboard -> SQL Editor.
2. Copy the contents of `supabase/schema.sql`.
3. Run the query to enable vectors and create the table.

## 4. Run Ingestion
1. Place your real data in `data/finance_data.txt`.
2. Run the script:

```bash
npx ts-node scripts/ingest.ts
```

The script will chunk your text, generate embeddings using Gemini (`text-embedding-004`), and save them to Supabase with a 1-second delay between chunks to prevent API rate limits.