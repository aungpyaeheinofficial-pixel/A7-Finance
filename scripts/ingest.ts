import 'dotenv/config'; // Load .env file
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';

// 1. Configuration
const DATA_FILE_PATH = path.join((process as any).cwd(), 'data', 'finance_data.txt');
const SUPABASE_TABLE = 'documents';

const runIngestion = async () => {
  console.log('🚀 Starting ingestion process...');

  // 2. Validate Environment
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PRIVATE_KEY || !process.env.GOOGLE_API_KEY) {
    throw new Error('Missing environment variables: Check SUPABASE_URL, SUPABASE_PRIVATE_KEY, and GOOGLE_API_KEY.');
  }

  // 3. Initialize Clients
  const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PRIVATE_KEY
  );

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "text-embedding-004", // Generates 768-dimensional vectors
    apiKey: process.env.GOOGLE_API_KEY,
    // Fix: Cast string to any to avoid strict Enum type mismatch for TaskType in LangChain
    taskType: "RETRIEVAL_DOCUMENT" as any,
  });

  // 4. Load Data
  console.log(`📂 Loading data from ${DATA_FILE_PATH}...`);
  try {
    const text = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    
    // 5. Split Text
    // Chunk size 1000 is a good balance for financial context
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);
    console.log(`🔪 Split text into ${docs.length} chunks.`);

    // 6. Initialize Vector Store (wrapper around Supabase)
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: SUPABASE_TABLE,
      queryName: 'match_documents',
    });

    // 7. Upload with Rate Limiting
    // Google GenAI can be strict with rate limits on the free tier. 
    // We upload chunks sequentially with a delay.
    console.log('Network: Uploading chunks to Supabase...');
    
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const progress = Math.round(((i + 1) / docs.length) * 100);
      
      (process as any).stdout.write(`\r⏳ Processing chunk ${i + 1}/${docs.length} (${progress}%)`);

      try {
        // We use addDocuments to generate embedding and save to DB
        await vectorStore.addDocuments([doc]);
      } catch (err) {
        console.error(`\n❌ Error uploading chunk ${i}:`, err);
      }

      // Wait 1 second before next request to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Ingestion complete!');

  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.error(`\n❌ File not found: ${DATA_FILE_PATH}`);
      console.error('Please create this file and paste your training data inside.');
    } else {
      console.error('\n❌ Fatal error during ingestion:', error);
    }
  }
};

runIngestion();