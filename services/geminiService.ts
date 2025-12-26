import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from "../types";

// NOTE: In a real app, strict server-side environment variables are preferred.
// Here we use the injected process.env.API_KEY as per system instructions.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const callGemini = async (
  prompt: string, 
  context: string, 
  history: Message[], 
  image?: string
): Promise<string> => {
  try {
    const systemInstruction = `You are a Senior Financial Analyst for the Myanmar market. 
    Use the provided CONTEXT to answer questions accurately. 
    If the context is irrelevant, rely on your general knowledge but mention the lack of specific current data.
    You are in "Deep Analysis" mode. Provide detailed, structured reasoning.`;

    const fullPrompt = `${context}\n\nUser Question: ${prompt}`;

    // Prepare contents
    let contents: any = { role: 'user', parts: [] };
    
    if (image) {
      // Clean base64 string if it contains metadata prefix
      const base64Data = image.split(',')[1] || image;
      contents.parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg for simplicity in this demo
          data: base64Data
        }
      });
    }

    contents.parts.push({ text: fullPrompt });

    // Using gemini-2.5-flash as it is the supported model for this SDK/Environment
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: [contents], // In a real chat, we would map `history` to previous turns here
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for analytical/financial tasks
      }
    });

    return response.text || "I analyzed the data but could not generate a textual response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while performing deep analysis with Gemini. Please check your API key or connection.";
  }
};