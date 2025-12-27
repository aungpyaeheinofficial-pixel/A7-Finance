import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';

// Using Node.js runtime for LangChain compatibility
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { title, category, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Missing Google API key' },
        { status: 500 }
      );
    }

    console.log('[Admin Ingest] Starting upload process...');

    // Initialize Supabase client
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PRIVATE_KEY
    );

    // Test connection
    try {
      const { error: testError } = await client
        .from('documents')
        .select('id')
        .limit(1);
      
      if (testError && !testError.message.includes('relation') && !testError.message.includes('does not exist')) {
        console.error('[Admin Ingest] Supabase connection test failed:', testError);
        return NextResponse.json(
          { error: `Supabase connection failed: ${testError.message}` },
          { status: 500 }
        );
      }
      console.log('[Admin Ingest] Supabase connection verified');
    } catch (connErr: any) {
      console.error('[Admin Ingest] Supabase connection error:', connErr);
      return NextResponse.json(
        { error: `Supabase connection error: ${connErr.message}` },
        { status: 500 }
      );
    }

    // Initialize embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "text-embedding-004",
      apiKey: process.env.GOOGLE_API_KEY,
      taskType: "RETRIEVAL_DOCUMENT" as any,
    });

    // Initialize vector store
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client,
      tableName: 'documents',
      queryName: 'match_documents',
    });

    console.log('[Admin Ingest] Splitting text into chunks...');
    
    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const splitDocuments = await textSplitter.createDocuments([content]);
    const chunkCount = splitDocuments.length;
    
    console.log(`[Admin Ingest] Created ${chunkCount} chunks`);

    if (chunkCount === 0) {
      return NextResponse.json(
        { error: 'No text chunks generated from input' },
        { status: 400 }
      );
    }

    // Add metadata to each document
    const documentsWithMetadata = splitDocuments.map((doc, index) => {
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          title,
          category,
          source: 'admin_upload',
          chunk_index: index,
          total_chunks: chunkCount,
          uploaded_at: new Date().toISOString(),
        },
      });
    });

    console.log('[Admin Ingest] Uploading documents to vector store...');
    
    // Upload documents to vector store (this handles embeddings automatically)
    let uploadedCount = 0;
    let errors: string[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < documentsWithMetadata.length; i += batchSize) {
      const batch = documentsWithMetadata.slice(i, i + batchSize);
      try {
        await vectorStore.addDocuments(batch);
        uploadedCount += batch.length;
        console.log(`[Admin Ingest] Uploaded batch ${Math.floor(i / batchSize) + 1}, total: ${uploadedCount}/${chunkCount}`);
      } catch (err: any) {
        const errorMsg = `Batch ${Math.floor(i / batchSize) + 1}: ${err.message || String(err)}`;
        console.error(`[Admin Ingest] Error uploading batch:`, err);
        errors.push(errorMsg);
      }
      // Small delay between batches
      if (i + batchSize < documentsWithMetadata.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (uploadedCount === 0) {
      return NextResponse.json(
        { 
          error: `Failed to upload any chunks. Errors: ${errors.join('; ')}` 
        },
        { status: 500 }
      );
    }

    console.log('[Admin Ingest] Storing document metadata...');

    // Store document metadata in knowledge_documents table (if it exists)
    try {
      const { data: metaData, error: metaError } = await client
        .from('knowledge_documents')
        .insert({
          title,
          category,
          content: content.substring(0, 50000), // Limit content size if needed
          chunk_count: uploadedCount,
          status: 'indexed',
        })
        .select()
        .single();

      if (metaError) {
        console.warn('[Admin Ingest] Metadata insert warning (non-critical):', metaError);
        // Don't fail if metadata insert fails, chunks are already stored
      } else {
        console.log('[Admin Ingest] Metadata stored successfully, ID:', metaData?.id);
      }
    } catch (metaErr: any) {
      console.warn('[Admin Ingest] Metadata table may not exist, skipping:', metaErr.message);
      // This is okay - the metadata table is optional
    }

    console.log(`[Admin Ingest] Successfully processed ${uploadedCount} chunks`);

    return NextResponse.json({
      success: true,
      chunks: uploadedCount,
      message: `Successfully processed and uploaded ${uploadedCount} chunks to vector database`,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[Admin Ingest] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

