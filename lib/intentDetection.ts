/**
 * Intent Detection Service
 * Classifies user queries to route to appropriate processing pipeline
 */

export enum QueryIntent {
  KNOWLEDGE = 'knowledge',      // Policies, regulations, explanations → RAG → Groq
  ANALYSIS = 'analysis',        // Calculations, comparisons, ratios → Logic Engine → RAG → Groq
  MIXED = 'mixed',              // Both knowledge and analysis needed
  GREETING = 'greeting',        // Simple greetings
  CLARIFICATION = 'clarification', // Need more info from user
  UNKNOWN = 'unknown'
}

export enum AnalysisType {
  PROFIT_LOSS = 'profit_loss',
  CASH_FLOW = 'cash_flow',
  RATIO = 'ratio',
  GROWTH = 'growth',
  TREND = 'trend',
  BREAK_EVEN = 'break_even',
  COMPARISON = 'comparison',
  GENERAL = 'general'
}

export interface DetectedIntent {
  primary: QueryIntent;
  confidence: number;
  analysisType?: AnalysisType;
  extractedNumbers?: number[];
  extractedEntities?: string[];
  requiresData: boolean;
  suggestedDataFields?: string[];
  language: 'my' | 'en' | 'mixed';
}

// Keywords for intent classification
const ANALYSIS_KEYWORDS = {
  en: [
    'calculate', 'compute', 'analyze', 'analysis', 'profit', 'loss', 'margin',
    'ratio', 'roi', 'return', 'growth', 'trend', 'compare', 'comparison',
    'cash flow', 'cashflow', 'break even', 'breakeven', 'revenue', 'cost',
    'expense', 'income', 'budget', 'forecast', 'projection', 'how much',
    'percentage', 'rate', 'increase', 'decrease', 'total', 'sum', 'average'
  ],
  my: [
    'တွက်', 'ခွဲခြမ်း', 'စိတ်ဖြာ', 'အမြတ်', 'အရှုံး', 'နှုန်း', 'တိုးတက်',
    'လမ်းကြောင်း', 'နှိုင်းယှဉ်', 'ငွေသား', 'စီးဆင်း', 'ဝင်ငွေ', 'ကုန်ကျ',
    'စရိတ်', 'ဘယ်လောက်', 'ရာခိုင်နှုန်း', 'တိုး', 'ကျ', 'စုစုပေါင်း', 'ပျမ်းမျှ',
    'အချိုး', 'ရင်းနှီး', 'မြုပ်နှံ'
  ]
};

const KNOWLEDGE_KEYWORDS = {
  en: [
    'what is', 'what are', 'explain', 'describe', 'tell me about', 'how does',
    'policy', 'regulation', 'rule', 'law', 'guideline', 'requirement',
    'cbm', 'central bank', 'tax', 'license', 'permit', 'compliance',
    'why', 'when', 'where', 'who', 'definition', 'meaning', 'process',
    'procedure', 'step', 'banking', 'forex', 'gold', 'market'
  ],
  my: [
    'ဘာလဲ', 'ဘယ်လို', 'ရှင်းပြ', 'ပြောပြ', 'အကြောင်း', 'မူဝါဒ', 'စည်းမျဉ်း',
    'ဥပဒေ', 'လိုအပ်ချက်', 'ခွင့်ပြုချက်', 'လိုင်စင်', 'အခွန်', 'ဗဟိုဘဏ်',
    'နည်းလမ်း', 'လုပ်ထုံးလုပ်နည်း', 'ဘဏ်', 'ငွေလဲ', 'ရွှေ', 'ဈေးကွက်',
    'အဓိပ္ပါယ်', 'ဖွင့်ဆို'
  ]
};

const GREETING_PATTERNS = {
  en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
  my: ['မင်္ဂလာပါ', 'ဟယ်လို', 'ဟိုင်း']
};

// Number extraction regex
const NUMBER_REGEX = /[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|သန်း|ဘီလီယံ|သိန်း|ကျပ်|MMK|USD|\$|%|percent))?/gi;

export function detectIntent(query: string): DetectedIntent {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Detect language
  const language = detectLanguage(query);
  
  // Check for greetings first
  if (isGreeting(normalizedQuery)) {
    return {
      primary: QueryIntent.GREETING,
      confidence: 0.95,
      requiresData: false,
      language
    };
  }
  
  // Extract numbers from query
  const extractedNumbers = extractNumbers(query);
  
  // Score analysis vs knowledge intent
  const analysisScore = calculateIntentScore(normalizedQuery, ANALYSIS_KEYWORDS);
  const knowledgeScore = calculateIntentScore(normalizedQuery, KNOWLEDGE_KEYWORDS);
  
  // Determine primary intent
  let primary: QueryIntent;
  let confidence: number;
  let analysisType: AnalysisType | undefined;
  let requiresData = false;
  let suggestedDataFields: string[] | undefined;
  
  // If numbers present and analysis keywords, lean towards analysis
  if (extractedNumbers.length > 0 && analysisScore > 0) {
    primary = QueryIntent.ANALYSIS;
    confidence = Math.min(0.95, 0.6 + analysisScore * 0.1 + extractedNumbers.length * 0.05);
    analysisType = detectAnalysisType(normalizedQuery);
    requiresData = extractedNumbers.length < 2; // Likely needs more data
    suggestedDataFields = getSuggestedFields(analysisType);
  } else if (analysisScore > knowledgeScore * 1.5) {
    primary = QueryIntent.ANALYSIS;
    confidence = Math.min(0.9, 0.5 + analysisScore * 0.1);
    analysisType = detectAnalysisType(normalizedQuery);
    requiresData = true;
    suggestedDataFields = getSuggestedFields(analysisType);
  } else if (knowledgeScore > analysisScore * 1.5) {
    primary = QueryIntent.KNOWLEDGE;
    confidence = Math.min(0.9, 0.5 + knowledgeScore * 0.1);
  } else if (analysisScore > 0 && knowledgeScore > 0) {
    primary = QueryIntent.MIXED;
    confidence = 0.7;
    analysisType = detectAnalysisType(normalizedQuery);
    requiresData = extractedNumbers.length < 2;
    suggestedDataFields = getSuggestedFields(analysisType);
  } else {
    primary = QueryIntent.UNKNOWN;
    confidence = 0.3;
  }
  
  // Extract entities (company names, industry terms, etc.)
  const extractedEntities = extractEntities(query);
  
  return {
    primary,
    confidence,
    analysisType,
    extractedNumbers,
    extractedEntities,
    requiresData,
    suggestedDataFields,
    language
  };
}

function detectLanguage(text: string): 'my' | 'en' | 'mixed' {
  // Myanmar Unicode range: \u1000-\u109F
  const myanmarChars = (text.match(/[\u1000-\u109F]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  
  if (myanmarChars > englishChars * 2) return 'my';
  if (englishChars > myanmarChars * 2) return 'en';
  return 'mixed';
}

function isGreeting(query: string): boolean {
  const allGreetings = [...GREETING_PATTERNS.en, ...GREETING_PATTERNS.my];
  return allGreetings.some(g => 
    query === g || 
    query.startsWith(g + ' ') || 
    query.startsWith(g + ',') ||
    query.startsWith(g + '!')
  );
}

function calculateIntentScore(query: string, keywords: { en: string[], my: string[] }): number {
  let score = 0;
  
  for (const keyword of [...keywords.en, ...keywords.my]) {
    if (query.includes(keyword.toLowerCase())) {
      score++;
    }
  }
  
  return score;
}

function extractNumbers(text: string): number[] {
  const matches = text.match(NUMBER_REGEX) || [];
  
  return matches.map(match => {
    // Remove currency symbols and convert to number
    let numStr = match.replace(/[,\s]/g, '').replace(/[^\d.]/g, '');
    let num = parseFloat(numStr) || 0;
    
    // Handle millions/billions
    if (/million|သန်း/i.test(match)) num *= 1_000_000;
    if (/billion|ဘီလီယံ/i.test(match)) num *= 1_000_000_000;
    if (/သိန်း/i.test(match)) num *= 100_000;
    
    return num;
  }).filter(n => n > 0);
}

function detectAnalysisType(query: string): AnalysisType {
  const patterns: Record<AnalysisType, string[]> = {
    [AnalysisType.PROFIT_LOSS]: ['profit', 'loss', 'margin', 'အမြတ်', 'အရှုံး', 'net income'],
    [AnalysisType.CASH_FLOW]: ['cash flow', 'cashflow', 'liquidity', 'ငွေသား', 'စီးဆင်း'],
    [AnalysisType.RATIO]: ['ratio', 'roi', 'roe', 'roa', 'current ratio', 'debt', 'အချိုး'],
    [AnalysisType.GROWTH]: ['growth', 'increase', 'decrease', 'cagr', 'တိုးတက်', 'ကျဆင်း'],
    [AnalysisType.TREND]: ['trend', 'pattern', 'over time', 'monthly', 'yearly', 'လမ်းကြောင်း'],
    [AnalysisType.BREAK_EVEN]: ['break even', 'breakeven', 'break-even', 'cover costs'],
    [AnalysisType.COMPARISON]: ['compare', 'versus', 'vs', 'difference', 'နှိုင်းယှဉ်', 'ကွာခြား'],
    [AnalysisType.GENERAL]: ['analyze', 'calculate', 'compute', 'တွက်', 'ခွဲခြမ်း']
  };
  
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(k => query.includes(k.toLowerCase()))) {
      return type as AnalysisType;
    }
  }
  
  return AnalysisType.GENERAL;
}

function getSuggestedFields(type?: AnalysisType): string[] {
  const fieldMap: Record<AnalysisType, string[]> = {
    [AnalysisType.PROFIT_LOSS]: ['revenue', 'costs', 'expenses'],
    [AnalysisType.CASH_FLOW]: ['cashInflows', 'cashOutflows'],
    [AnalysisType.RATIO]: ['netIncome', 'assets', 'liabilities', 'equity'],
    [AnalysisType.GROWTH]: ['revenue (multiple periods)'],
    [AnalysisType.TREND]: ['revenue (time series)', 'costs (time series)'],
    [AnalysisType.BREAK_EVEN]: ['fixedCosts', 'pricePerUnit', 'variableCostPerUnit'],
    [AnalysisType.COMPARISON]: ['revenue', 'costs'],
    [AnalysisType.GENERAL]: ['revenue', 'costs']
  };
  
  return type ? fieldMap[type] : [];
}

function extractEntities(text: string): string[] {
  const entities: string[] = [];
  
  // Common Myanmar financial entities
  const entityPatterns = [
    /(?:KBZ|AYA|CB|UAB|MAB|MOB|YAM|AGD|SMIDB|MEB)\s*(?:Bank|ဘဏ်)?/gi,
    /(?:CBM|Central Bank|ဗဟိုဘဏ်)/gi,
    /(?:Wave|KBZPay|OK\$|MPT Money)/gi,
    /(?:YGEA|Yangon Gold)/gi,
    /(?:SME|MSME|အသေးစား|အလတ်စား)/gi,
    /(?:FDI|ရင်းနှီးမြုပ်နှံမှု)/gi
  ];
  
  for (const pattern of entityPatterns) {
    const matches = text.match(pattern) || [];
    entities.push(...matches);
  }
  
  return [...new Set(entities)];
}

// Parse financial data from natural language
export function parseFinancialData(query: string): Record<string, number | number[]> | null {
  const data: Record<string, number | number[]> = {};
  const numbers = extractNumbers(query);
  
  if (numbers.length === 0) return null;
  
  // Try to map numbers to fields based on context
  const revenueMatch = query.match(/(?:revenue|sales|income|ဝင်ငွေ|ရောင်းရငွေ)[:\s]+[\d,]+/i);
  const costMatch = query.match(/(?:cost|expense|ကုန်ကျစရိတ်)[:\s]+[\d,]+/i);
  
  if (revenueMatch) {
    const revNum = extractNumbers(revenueMatch[0]);
    if (revNum.length > 0) data.revenue = revNum[0];
  }
  
  if (costMatch) {
    const costNum = extractNumbers(costMatch[0]);
    if (costNum.length > 0) data.costs = costNum[0];
  }
  
  // If we couldn't map specifically, use generic assignment
  if (Object.keys(data).length === 0 && numbers.length >= 2) {
    // Assume first is revenue, second is cost
    data.revenue = numbers[0];
    data.costs = numbers[1];
  } else if (Object.keys(data).length === 0 && numbers.length === 1) {
    data.value = numbers[0];
  }
  
  return Object.keys(data).length > 0 ? data : null;
}

export default {
  detectIntent,
  parseFinancialData,
  QueryIntent,
  AnalysisType
};

