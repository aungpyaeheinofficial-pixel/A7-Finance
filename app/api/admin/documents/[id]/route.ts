import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Using Node.js runtime for Supabase compatibility  
// export const runtime = 'edge';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

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

    // Try to delete from knowledge_documents table
    const { error: knowledgeError } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('id', id);

    // Also delete chunks from documents table
    const { error: documentsError } = await supabase
      .from('documents')
      .delete()
      .eq('metadata->>title', id);

    if (knowledgeError && documentsError) {
      console.error('Delete errors:', knowledgeError, documentsError);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Document deleted' });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

