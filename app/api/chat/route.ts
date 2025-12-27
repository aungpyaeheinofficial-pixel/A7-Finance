/**
 * Myanmar AI Business Advisor - Chat API
 * 
 * Architecture:
 * - OFF: User → RAG → Groq → Answer (Fast Mode)
 * - ON:  User → Gemini (Plan) → Logic Engine → RAG (Context) → Groq (Explain)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Import Logic Engine and Intent Detection
import { 
  runAnalysis, 
  calculateProfit, 
  calculateGrowthRate,
  calculateROI,
  formatMMK,
  FinancialData,
  AnalysisOutput
} from '../../../lib/logicEngine';
import { 
  detectIntent, 
  parseFinancialData, 
  QueryIntent, 
  AnalysisType 
} from '../../../lib/intentDetection';

export const runtime = 'edge';

// System prompts for different modes
const SYSTEM_PROMPTS = {
  fast: `You are a Senior Financial Advisor for Myanmar businesses.
LANGUAGE: Default to Burmese (Myanmar) unless the user writes in English.
TONE: Professional, calm, banker-level. No emojis. No slang.

RULES:
- Use provided CONTEXT from the database to answer accurately
- If context is missing, state assumptions clearly
- Never guess financial figures
- Explain numbers step-by-step
- If data is needed, ask for it

CONTEXT:
{context}`,

  deepThink: `You are analyzing a complex financial query for Myanmar businesses.
Your role is to PLAN the analysis approach.

Identify:
1. What type of analysis is needed (profit, cash flow, ratios, trends)
2. What data points are mentioned or required
3. What calculations should be performed
4. What context from regulations/policies is relevant

Return a JSON analysis plan:
{
  "analysisType": "profit|cashflow|ratio|growth|trend|comparison",
  "extractedData": { "revenue": number, "costs": number, ... },
  "requiredCalculations": ["profit", "margin", ...],
  "contextNeeded": ["CBM policy", "tax regulations", ...],
  "missingData": ["field1", "field2", ...]
}`,

  explain: `You are a Senior Financial Advisor explaining analysis results to Myanmar business owners.
LANGUAGE: Default to Burmese (Myanmar) unless the user writes in English.
TONE: Professional, calm, banker-level. No emojis. No slang.

RULES:
- Explain the calculation results clearly and step-by-step
- Reference the CONTEXT for regulatory/policy relevance
- Use Myanmar Kyat formatting where appropriate
- Provide actionable insights
- If assumptions were made, state them clearly

CALCULATION RESULTS:
{calculations}

CONTEXT:
{context}

Provide a clear, professional explanation of these results.`
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { message, history, useComplexModel, image } = await req.json();

    // Validate environment
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PRIVATE_KEY) {
      throw new Error("Missing Supabase credentials");
    }
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Missing GOOGLE_API_KEY");
    }

    // Initialize Supabase client
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PRIVATE_KEY
    );

    // Initialize embeddings
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

    // Detect intent
    const intent = detectIntent(message);
    console.log(`[Intent] ${intent.primary} (${(intent.confidence * 100).toFixed(0)}%)`);

    // Route based on mode
    if (useComplexModel || image) {
      // ============ DEEP THINK / ANALYZE MODE ============
      return await handleDeepThinkMode({
        message,
        image,
        intent,
        vectorStore,
        embeddings
      });
    } else {
      // ============ FAST MODE ============
      return await handleFastMode({
        message,
        intent,
        vectorStore,
        startTime
      });
    }

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { 
        text: `စနစ်အမှား: ${error.message}`, 
        provider: 'System',
        error: true
      },
      { status: 500 }
    );
  }
}

// ============ FAST MODE HANDLER ============
async function handleFastMode({
  message,
  intent,
  vectorStore,
  startTime
}: {
  message: string;
  intent: ReturnType<typeof detectIntent>;
  vectorStore: SupabaseVectorStore;
  startTime: number;
}) {
  // 1. RAG Retrieval
  let contextText = "";
  let citations: any[] = [];
  
  try {
    const searchResults = await vectorStore.similaritySearch(message, 3);
    contextText = searchResults.map(doc => doc.pageContent).join('\n\n');
    citations = searchResults.map(doc => ({
      title: doc.metadata?.title || 'Document',
      source: doc.metadata?.source || 'Vector DB',
      relevance: doc.metadata?.relevance || 0.8
    }));
    console.log(`[RAG] Retrieved ${searchResults.length} docs`);
  } catch (e) {
    console.warn("[RAG] Retrieval failed:", e);
  }

  // 2. Check if simple calculation is needed
  let analysisResult = null;
  const parsedData = parseFinancialData(message);
  
  if (intent.primary === QueryIntent.ANALYSIS && parsedData) {
    // Quick calculation for simple queries
    const analysis = runQuickAnalysis(parsedData, intent.analysisType);
    if (analysis) {
      analysisResult = {
        type: 'calculation',
        calculations: analysis.calculations.map(c => ({
          label: c.type,
          value: typeof c.value === 'number' ? formatValue(c.value, c.type) : c.value,
          trend: c.trend
        })),
        summary: analysis.summary,
        assumptions: analysis.assumptions,
        trend: analysis.calculations[0]?.trend
      };
    }
  }

  // 3. Generate response with Groq
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  let responseText = '';
  let providerName = '';

  if (hasGroq) {
    providerName = 'Groq (Llama 3.3)';
    
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.3-70b-versatile",
      temperature: 0.4,
    });

    const systemPrompt = SYSTEM_PROMPTS.fast.replace('{context}', contextText || 'No specific context available.');
    
    let userMessage = message;
    if (analysisResult) {
      userMessage = `${message}\n\n[Calculation Results: ${analysisResult.summary}]`;
    }

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userMessage)
    ]);

    responseText = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
  } else {
    // Fallback to Gemini
    providerName = 'Gemini 2.5 Flash';
    
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.3,
    });

    const systemPrompt = SYSTEM_PROMPTS.fast.replace('{context}', contextText || 'No specific context available.');

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message)
    ]);

    responseText = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
  }

  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    text: responseText,
    provider: providerName,
    analysisResult,
    citations: citations.length > 0 ? citations : undefined,
    processingTime
  });
}

// ============ DEEP THINK MODE HANDLER ============
async function handleDeepThinkMode({
  message,
  image,
  intent,
  vectorStore,
  embeddings
}: {
  message: string;
  image?: string;
  intent: ReturnType<typeof detectIntent>;
  vectorStore: SupabaseVectorStore;
  embeddings: GoogleGenerativeAIEmbeddings;
}) {
  // 1. Gemini Planning Phase
  console.log('[DeepThink] Phase 1: Gemini Planning');
  
  const geminiModel = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY!,
    temperature: 0.2,
  });

  const contentParts: any[] = [{ type: 'text', text: message }];
  if (image) {
    contentParts.push({
      type: 'image_url',
      image_url: image,
    });
  }

  const planResponse = await geminiModel.invoke([
    new SystemMessage(SYSTEM_PROMPTS.deepThink),
    new HumanMessage({ content: contentParts })
  ]);

  let analysisPlan: any = null;
  try {
    const planText = typeof planResponse.content === 'string' 
      ? planResponse.content 
      : JSON.stringify(planResponse.content);
    
    // Extract JSON from response
    const jsonMatch = planText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysisPlan = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.warn('[DeepThink] Failed to parse plan, using intent-based fallback');
    analysisPlan = {
      analysisType: intent.analysisType || 'general',
      extractedData: parseFinancialData(message) || {},
      requiredCalculations: [],
      contextNeeded: [],
      missingData: intent.suggestedDataFields || []
    };
  }

  console.log('[DeepThink] Plan:', analysisPlan);

  // 2. Logic Engine Calculations
  console.log('[DeepThink] Phase 2: Logic Engine');
  
  let analysisOutput: AnalysisOutput | null = null;
  if (analysisPlan?.extractedData && Object.keys(analysisPlan.extractedData).length > 0) {
    const data: FinancialData = analysisPlan.extractedData;
    
    // Map analysis type
    let analysisType: 'profit' | 'cashflow' | 'ratio' | 'growth' | 'trend' | 'comparison' | 'breakeven' = 'profit';
    if (analysisPlan.analysisType) {
      const typeMap: Record<string, 'profit' | 'cashflow' | 'ratio' | 'growth' | 'trend' | 'comparison' | 'breakeven'> = {
        'profit': 'profit',
        'profit_loss': 'profit',
        'cashflow': 'cashflow',
        'cash_flow': 'cashflow',
        'ratio': 'ratio',
        'growth': 'growth',
        'trend': 'trend',
        'comparison': 'comparison',
        'break_even': 'breakeven'
      };
      analysisType = typeMap[analysisPlan.analysisType] || 'profit';
    }
    
    analysisOutput = runAnalysis({
      type: analysisType,
      data,
      options: {}
    });
    
    console.log('[DeepThink] Analysis:', analysisOutput);
  }

  // 3. RAG Context Retrieval
  console.log('[DeepThink] Phase 3: RAG Context');
  
  let contextText = "";
  let citations: any[] = [];
  
  try {
    // Build enhanced query from plan
    const contextQuery = analysisPlan?.contextNeeded?.length > 0
      ? `${message} ${analysisPlan.contextNeeded.join(' ')}`
      : message;
    
    const searchResults = await vectorStore.similaritySearch(contextQuery, 4);
    contextText = searchResults.map(doc => doc.pageContent).join('\n\n');
    citations = searchResults.map(doc => ({
      title: doc.metadata?.title || 'Document',
      source: doc.metadata?.source || 'Vector DB',
      relevance: doc.metadata?.relevance || 0.8
    }));
    console.log(`[RAG] Retrieved ${searchResults.length} docs`);
  } catch (e) {
    console.warn("[RAG] Retrieval failed:", e);
  }

  // 4. Groq Explanation Phase
  console.log('[DeepThink] Phase 4: Groq Explanation');
  
  let responseText = '';
  let providerName = 'Gemini 2.5 Flash'; // Default
  
  const calculationsText = analysisOutput 
    ? JSON.stringify(analysisOutput, null, 2)
    : 'No calculations performed.';
  
  const explainPrompt = SYSTEM_PROMPTS.explain
    .replace('{calculations}', calculationsText)
    .replace('{context}', contextText || 'No specific context available.');

  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  
  if (hasGroq) {
    providerName = 'Groq (Llama 3.3)';
    
    const groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.3-70b-versatile",
      temperature: 0.4,
    });

    const response = await groqModel.invoke([
      new SystemMessage(explainPrompt),
      new HumanMessage(message)
    ]);

    responseText = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
  } else {
    // Use Gemini for explanation too
    const response = await geminiModel.invoke([
      new SystemMessage(explainPrompt),
      new HumanMessage(message)
    ]);

    responseText = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
  }

  // Build analysis result for UI
  let analysisResult = null;
  if (analysisOutput && analysisOutput.calculations.length > 0) {
    analysisResult = {
      type: analysisPlan?.analysisType || 'analysis',
      calculations: analysisOutput.calculations.map(c => ({
        label: c.type.charAt(0).toUpperCase() + c.type.slice(1).replace(/([A-Z])/g, ' $1'),
        value: formatValue(c.value, c.type),
        trend: c.trend,
        breakdown: c.breakdown
      })),
      summary: analysisOutput.summary,
      assumptions: analysisOutput.assumptions,
      trend: analysisOutput.calculations[0]?.trend
    };
  }

  return NextResponse.json({
    text: responseText,
    provider: providerName,
    analysisResult,
    citations: citations.length > 0 ? citations : undefined,
    processingTime: Date.now()
  });
}

// ============ HELPER FUNCTIONS ============

function runQuickAnalysis(
  data: Record<string, number | number[]>, 
  analysisType?: AnalysisType
): AnalysisOutput | null {
  const revenue = data.revenue as number;
  const costs = data.costs as number;
  
  if (revenue && costs) {
    return runAnalysis({
      type: 'profit',
      data: { revenue: [revenue], costs: [costs] }
    });
  }
  
  return null;
}

function formatValue(value: number | string, type: string): string {
  if (typeof value === 'string') return value;
  
  // Check if it's a ratio or percentage
  if (type.includes('ratio') || type.includes('Ratio')) {
    return value.toFixed(2);
  }
  if (type.includes('margin') || type.includes('roi') || type.includes('roe') || type.includes('roa') || type.includes('rate') || type.includes('growth')) {
    return `${value.toFixed(2)}%`;
  }
  
  // Default to MMK formatting
  return formatMMK(value);
}
