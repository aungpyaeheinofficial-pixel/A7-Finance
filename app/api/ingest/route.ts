
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function POST(req: NextRequest) {
  try {
    const { text, password } = await req.json();

    // Basic server-side auth check
    if (password !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PRIVATE_KEY || !process.env.GOOGLE_API_KEY) {
      console.error("[Ingest] Missing env vars:", {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_PRIVATE_KEY,
        hasGoogleKey: !!process.env.GOOGLE_API_KEY
      });
      return NextResponse.json({ error: "Server misconfiguration (missing env vars)" }, { status: 500 });
    }

    console.log("[Ingest] Initializing Supabase client...");
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PRIVATE_KEY
    );
    
    // Test connection
    try {
      const { data, error: testError } = await client
        .from('documents')
        .select('id')
        .limit(1);
      
      if (testError && !testError.message.includes('relation') && !testError.message.includes('does not exist')) {
        console.error("[Ingest] Supabase connection test failed:", testError);
        return NextResponse.json({ 
          error: `Supabase connection failed: ${testError.message}` 
        }, { status: 500 });
      }
      console.log("[Ingest] Supabase connection verified");
    } catch (connErr: any) {
      console.error("[Ingest] Supabase connection error:", connErr);
      return NextResponse.json({ 
        error: `Supabase connection error: ${connErr.message}` 
      }, { status: 500 });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      apiKey: process.env.GOOGLE_API_KEY,
      taskType: "RETRIEVAL_DOCUMENT" as any,
    });

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client,
      tableName: 'documents',
      queryName: 'match_documents',
    });

    // Split text
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);
    console.log(`[Ingest] Split into ${docs.length} chunks`);
    
    if (docs.length === 0) {
      return NextResponse.json({ error: "No text chunks generated from input" }, { status: 400 });
    }

    // Upload with rate limiting (processing sequentially)
    let uploadedCount = 0;
    let errors: string[] = [];
    
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      try {
        console.log(`[Ingest] Uploading chunk ${i + 1}/${docs.length}...`);
        await vectorStore.addDocuments([doc]);
        uploadedCount++;
        console.log(`[Ingest] Successfully uploaded chunk ${i + 1}`);
      } catch (err: any) {
        const errorMsg = `Chunk ${i + 1}: ${err.message || String(err)}`;
        console.error(`[Ingest] Error uploading chunk ${i + 1}:`, err);
        errors.push(errorMsg);
      }
      // Slight delay to be respectful of rate limits
      await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    if (uploadedCount === 0 && errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Failed to upload any chunks. Errors: ${errors.join('; ')}`,
        uploadedCount: 0
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed and uploaded ${uploadedCount} chunks to the Knowledge Base.`,
      uploadedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error("Ingest API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
