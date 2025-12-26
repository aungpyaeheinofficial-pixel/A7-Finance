import { Message } from "../types";

// In a real deployment, this key would be in a secure backend environment variable.
// For this demo, we assume it's available or user provided.
// Since the system prompt only guarantees process.env.API_KEY (usually for Gemini),
// We will use a placeholder logic or share the key if the platform supports it.
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_placeholder'; 

export const callGroq = async (
  prompt: string, 
  context: string, 
  history: Message[]
): Promise<string> => {
  
  const systemMessage = {
    role: "system",
    content: `You are a helpful Financial Assistant for Myanmar. 
    Answer quickly and concisely. Use the provided context.`
  };

  const userMessage = {
    role: "user",
    content: `Context:\n${context}\n\nQuestion: ${prompt}`
  };

  try {
    // Using standard fetch for Groq to avoid heavy LangChain deps in pure frontend
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [systemMessage, userMessage],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
        // Fallback for demo if no Groq Key is actually present
        console.warn("Groq API call failed (likely missing key). Simulating response.");
        return `[Simulated Groq Response] (Llama 3.3-70b): Based on the retrieval, the market in Myanmar is currently fluctuating. ${context ? 'I found relevant policy documents.' : ''}`;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response from Groq.";

  } catch (error) {
    console.error("Groq Service Error:", error);
    return "Error connecting to Groq accelerator.";
  }
};