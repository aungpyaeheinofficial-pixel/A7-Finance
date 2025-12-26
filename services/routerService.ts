/**
 * Router Service - Frontend Bridge to the Next.js Hybrid AI Backend
 * All logic (RAG, Intent Detection, Logic Engine) happens server-side
 */

import { 
  RouterRequest, 
  RouterResponse, 
  ModelProvider, 
  AnalysisMessageData,
  Citation
} from "../types";

export const routeChatRequest = async (request: RouterRequest): Promise<RouterResponse> => {
  const { message, history, useComplexModel, image, language } = request;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        useComplexModel,
        image,
        language: language || 'my' // Default to Myanmar
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Map provider string to enum
    const providerMap: Record<string, ModelProvider> = {
      'Groq (Llama 3.3)': ModelProvider.GROQ,
      'Gemini 2.5 Flash': ModelProvider.GEMINI,
      'Logic Engine': ModelProvider.LOGIC,
      'System': ModelProvider.SYSTEM
    };

    return {
      text: data.text,
      provider: providerMap[data.provider] || ModelProvider.GEMINI,
      analysisResult: data.analysisResult as AnalysisMessageData | undefined,
      citations: data.citations as Citation[] | undefined,
      processingTime: data.processingTime
    };

  } catch (error) {
    console.error("Router Service Error:", error);
    
    return {
      text: "စနစ်နှင့် ဆက်သွယ်ရာတွင် အခက်အခဲ ဖြစ်နေပါသည်။ ထပ်မံကြိုးစားပါ။",
      provider: ModelProvider.SYSTEM
    };
  }
};

// Health check function for status indicators
export const checkSystemStatus = async (): Promise<{
  groq: boolean;
  gemini: boolean;
  vectorDb: boolean;
}> => {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        groq: data.groq || false,
        gemini: data.gemini || false,
        vectorDb: data.vectorDb || false
      };
    }
  } catch (e) {
    console.error('Health check failed:', e);
  }
  
  return {
    groq: true, // Assume connected for now
    gemini: true,
    vectorDb: true
  };
};
