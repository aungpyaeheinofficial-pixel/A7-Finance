import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

/**
 * Diagnostic script to test Supabase connection and RAG retrieval
 * Run with: npx ts-node scripts/test-supabase.ts
 */

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection and RAG System...\n');

  // 1. Check Environment Variables
  console.log('1️⃣ Checking Environment Variables...');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PRIVATE_KEY;
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL is missing!');
    return;
  }
  console.log('✅ SUPABASE_URL:', supabaseUrl);

  if (!supabaseKey) {
    console.error('❌ SUPABASE_PRIVATE_KEY is missing!');
    return;
  }
  if (supabaseKey.startsWith('sb_publishable_')) {
    console.warn('⚠️  WARNING: You are using a publishable key, not a service_role key!');
    console.warn('   RAG operations require the service_role key (starts with eyJ...)');
  } else if (supabaseKey.startsWith('eyJ')) {
    console.log('✅ SUPABASE_PRIVATE_KEY: Service role key detected');
  } else {
    console.warn('⚠️  SUPABASE_PRIVATE_KEY format unclear');
  }

  if (!googleApiKey) {
    console.error('❌ GOOGLE_API_KEY is missing!');
    return;
  }
  console.log('✅ GOOGLE_API_KEY: Present\n');

  // 2. Test Supabase Connection
  console.log('2️⃣ Testing Supabase Connection...');
  const supabaseClient = createClient(supabaseUrl, supabaseKey);

  try {
    // Test basic connection by checking if documents table exists
    const { data: tables, error: tableError } = await supabaseClient
      .from('documents')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.code === 'PGRST116' || tableError.message.includes('relation') || tableError.message.includes('does not exist')) {
        console.error('❌ Table "documents" does not exist!');
        console.error('   → Run the SQL schema from supabase/schema.sql in your Supabase SQL Editor');
        return;
      }
      throw tableError;
    }

    console.log('✅ Successfully connected to Supabase');
    console.log('✅ "documents" table exists\n');
  } catch (error: any) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    return;
  }

  // 3. Check Document Count
  console.log('3️⃣ Checking Document Count...');
  try {
    const { count, error: countError } = await supabaseClient
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    console.log(`📊 Total documents in database: ${count || 0}`);
    
    if (count === 0) {
      console.warn('\n⚠️  WARNING: No documents found in the database!');
      console.warn('   → You need to ingest data first:');
      console.warn('     1. Go to http://localhost:3000/admin');
      console.warn('     2. Login with password: admin123');
      console.warn('     3. Paste content from data/*.txt files');
      console.warn('     4. Click "Upload & Train"');
      return;
    }
    console.log('✅ Documents found in database\n');
  } catch (error: any) {
    console.error('❌ Error counting documents:', error.message);
    return;
  }

  // 4. Test Embeddings Generation
  console.log('4️⃣ Testing Embeddings Generation...');
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      apiKey: googleApiKey,
      taskType: "RETRIEVAL_DOCUMENT" as any,
    });

    const testQuery = "gold market Myanmar";
    console.log(`   Generating embedding for: "${testQuery}"`);
    const queryEmbedding = await embeddings.embedQuery(testQuery);
    console.log(`✅ Embedding generated: ${queryEmbedding.length} dimensions\n`);
  } catch (error: any) {
    console.error('❌ Failed to generate embeddings:', error.message);
    if (error.message.includes('API key')) {
      console.error('   → Check your GOOGLE_API_KEY is valid');
    }
    return;
  }

  // 5. Test Vector Store Retrieval
  console.log('5️⃣ Testing Vector Store Retrieval...');
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      apiKey: googleApiKey,
      taskType: "RETRIEVAL_DOCUMENT" as any,
    });

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseClient,
      tableName: 'documents',
      queryName: 'match_documents',
    });

    const testQuery = "gold market regulations Myanmar";
    console.log(`   Searching for: "${testQuery}"`);
    
    const results = await vectorStore.similaritySearch(testQuery, 3);
    
    console.log(`✅ Retrieved ${results.length} documents:`);
    results.forEach((doc, i) => {
      const preview = doc.pageContent.substring(0, 100).replace(/\n/g, ' ');
      console.log(`   ${i + 1}. ${preview}...`);
    });
    
    if (results.length === 0) {
      console.warn('\n⚠️  WARNING: No documents retrieved!');
      console.warn('   → This could mean:');
      console.warn('     1. Documents exist but query doesn\'t match');
      console.warn('     2. match_documents function is not working');
      console.warn('     3. Vector embeddings are not properly stored');
    } else {
      console.log('\n✅ RAG retrieval is working correctly!');
    }
  } catch (error: any) {
    console.error('❌ Vector store retrieval failed:', error.message);
    if (error.message.includes('match_documents')) {
      console.error('   → The match_documents function may not exist');
      console.error('   → Run the SQL schema from supabase/schema.sql');
    }
    if (error.message.includes('permission') || error.message.includes('RLS')) {
      console.error('   → Row Level Security (RLS) may be blocking access');
      console.error('   → Check your service_role key has proper permissions');
    }
    return;
  }

  // 6. Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed! Your Supabase RAG system is ready.');
  console.log('='.repeat(50));
}

testSupabase().catch(console.error);

