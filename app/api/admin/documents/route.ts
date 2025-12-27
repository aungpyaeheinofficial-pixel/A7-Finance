import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Using Node.js runtime for Supabase compatibility
// export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PRIVATE_KEY
    );

    // Try to fetch from knowledge_documents table first
    try {
      const { data: knowledgeDocs, error: knowledgeError } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (!knowledgeError && knowledgeDocs && knowledgeDocs.length > 0) {
        // Transform to match expected format
        const formatted = knowledgeDocs.map((doc: any) => ({
          id: doc.id || doc.title?.toLowerCase().replace(/\s+/g, '-'),
          title: doc.title,
          category: doc.category || 'General',
          chunks: doc.chunk_count || doc.chunks || 0,
          status: doc.status || 'indexed',
          created_at: doc.created_at || doc.createdAt || new Date().toISOString(),
        }));
        return NextResponse.json(formatted);
      }
    } catch (metaErr) {
      console.warn('Knowledge documents table query failed (non-critical):', metaErr);
    }

    // Fallback: Aggregate from documents table by metadata
    try {
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(1000); // Limit to avoid memory issues

      if (documentsError) {
        console.error('Documents fetch error:', documentsError);
        return NextResponse.json([], { status: 200 }); // Return empty array on error
      }

      // Aggregate documents by title
      const aggregated: Record<string, any> = {};
      
      documents?.forEach((doc: any) => {
        const meta = doc.metadata || {};
        const title = meta.title || 'Untitled';
        
        if (!aggregated[title]) {
          aggregated[title] = {
            id: title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            title: title,
            category: meta.category || 'General',
            chunks: meta.total_chunks || 1,
            status: 'indexed',
            created_at: doc.created_at || meta.uploaded_at || new Date().toISOString(),
          };
        } else {
          // Update chunks count if this document has more chunks
          aggregated[title].chunks = Math.max(
            aggregated[title].chunks,
            meta.total_chunks || 1
          );
        }
      });

      return NextResponse.json(Object.values(aggregated));
    } catch (err) {
      console.error('Error aggregating documents:', err);
      return NextResponse.json([], { status: 200 });
    }

  } catch (error: any) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

