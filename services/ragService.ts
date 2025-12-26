import { RagDocument } from '../types';

/**
 * Simulates a Supabase Vector Store retrieval.
 * In a real Next.js app, this would be a server-side call to Supabase pgvector.
 */
export const retrieveContext = async (query: string): Promise<string> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log(`[RAG] Querying vector db for: "${query}"`);

  // Mocked financial context for Myanmar
  const mockKnowledgeBase: RagDocument[] = [
    {
      title: "CBM Exchange Rate Policy 2024",
      content: "The Central Bank of Myanmar (CBM) has set a reference rate range. Exporters are required to convert 35% of export earnings at the official rate within one day.",
      relevance: 0.95
    },
    {
      title: "Mobile Banking Limits",
      content: "KBZPay and Wave Money daily transaction limits have been updated to 1,000,000 MMK for Level 1 accounts to curb speculation.",
      relevance: 0.88
    },
    {
      title: "Gold Market Trends Yangon",
      content: "Yangon gold prices have fluctuated due to global spot prices and local currency volatility. Fire blocks are trading at a premium.",
      relevance: 0.82
    }
  ];

  // Simple keyword matching for the mock
  const relevantDocs = mockKnowledgeBase.filter(doc => 
    query.toLowerCase().includes('rate') || 
    query.toLowerCase().includes('bank') || 
    query.toLowerCase().includes('money') ||
    query.toLowerCase().includes('gold') ||
    query.toLowerCase().includes('policy')
  );

  if (relevantDocs.length === 0) return "";

  const contextString = relevantDocs.map(doc => 
    `Source: ${doc.title}\nContent: ${doc.content}`
  ).join("\n\n");

  return `CONTEXT FROM VECTOR DATABASE:\n${contextString}\n\n`;
};