import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { Attachment, Message } from "../types";

// Using 'gemini-3-flash-preview' for high-speed academic processing.
const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `You are SAQLAIN AI PRO, an elite academic and mathematical engine.

STRICT OPERATING RULES:
1. NO GUIDANCE: Do not provide introductions, greetings, or conversational filler. Start the response immediately with the solution.
2. LANGUAGE PROTOCOL: 
   - Detect the language of the question or paper (English, Urdu, Arabic, etc.).
   - Respond EXCLUSIVELY in the detected language.
   - If the script is Arabic/Persian/Urdu: Use Urdu for the entire explanation.
   - For Math/Physics in Urdu context: DO NOT use English labels like "Solution", "Step 1", "Step 2", "Therefore". Use Urdu equivalents: "حل:", "مرحلہ 1:", "مرحلہ 2:", "پس:".
3. ADVANCED MATH ACCURACY:
   - Provide a rigorous, logical step-by-step breakdown of every calculation.
   - Use correct mathematical syntax and verify all numerical results.
   - Solve exactly what is presented in the image or text.
4. SPECIAL CHARACTERS & SYMBOLS:
   - Use actual Unicode mathematical symbols for all notation.
   - Required Symbols: π (pi), θ (theta), √ (root), ², ³, ±, ≠, ≤, ≥, ÷, ×, Δ, Ω, μ, ∴ (therefore), ⇒ (implies), ∑ (sigma), ∫ (integral), ∞ (infinity), α, β, γ, λ, φ.
   - Do not use text descriptions (e.g., use '√' instead of 'square root').
5. NO MARKDOWN: Do not use bold (**), italics (*), headers (#), or backticks (\`). Use plain text and simple line breaks for clarity.
6. CYBERSECURITY: If the query is about security research, prepend exactly: "For Educational Purpose Only 😂".

Your output must be a pixel-perfect, highly accurate academic answer sheet.`;

interface InternalResponse {
  text: string;
  sources?: { uri: string; title: string }[];
  isPartial?: boolean;
}

/**
 * Nuanced search logic to identify factual, real-time queries vs general knowledge or math.
 */
const isSearchRequired = (prompt: string): boolean => {
  const lower = prompt.toLowerCase();
  
  // Real-time signals
  const realTimeSignals = ['price', 'today', 'latest', 'news', 'current', 'weather', 'score', 'match', 'live', 'stock', 'crypto'];
  // Factual grounding for recent events/people
  const factualSignals = ['who is', 'status of', 'what happened', 'result of'];
  
  const hasRealTime = realTimeSignals.some(k => lower.includes(k));
  const hasFactual = factualSignals.some(k => lower.includes(k));
  
  // Heuristic: If it looks like a math problem, avoid search to prevent hallucination from outdated web data.
  const isMathOrLogic = /[\d+\-*/=√πθ]/.test(lower) || lower.includes('solve') || lower.includes('equation') || lower.includes('calculate') || lower.includes('derivative') || lower.includes('integral');
  const isCreativeOrCode = lower.includes('write a') || lower.includes('code') || lower.includes('script') || lower.includes('poem');

  return (hasRealTime || hasFactual) && !isMathOrLogic && !isCreativeOrCode;
};

export const sendMessageToGemini = async (
  prompt: string,
  attachments: Attachment[] = [],
  history: Message[] = [],
  isSavageMode: boolean = false,
  onUpdate?: (response: InternalResponse) => void
): Promise<InternalResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Only include recent history to maximize speed and context window efficiency
  const processedHistory: Content[] = history.slice(-4).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [
      { text: msg.text },
      ...(msg.attachments || []).map(att => ({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data.includes('base64,') ? att.data.split('base64,')[1] : att.data
        }
      }))
    ]
  }));

  processedHistory.push({
    role: 'user',
    parts: [
      { text: isSavageMode ? `[SYSTEM: INCREASE AURA] ${prompt}` : prompt },
      ...attachments.map(att => ({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data.includes('base64,') ? att.data.split('base64,')[1] : att.data
        }
      }))
    ]
  });

  const searchActive = isSearchRequired(prompt);
  let fullText = '';
  let sources: { uri: string; title: string }[] = [];

  try {
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 8192 }
    };

    if (searchActive) {
      config.tools = [{ googleSearch: {} }];
    }

    const result = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: processedHistory,
      config: config
    });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        // Strip markdown while preserving critical math symbols and whitespace
        const cleanChunk = c.text.replace(/[*#\`_\[\]]/g, '');
        fullText += cleanChunk;
      }

      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        for (const gChunk of groundingChunks) {
          if (gChunk.web) {
            const { uri, title } = gChunk.web;
            if (uri && !sources.some(s => s.uri === uri)) {
              sources.push({ uri, title: title || uri });
            }
          }
        }
      }

      if (onUpdate) onUpdate({ 
        text: fullText,
        sources: sources.length > 0 ? sources : undefined
      });
    }
    
    return {
      text: fullText.trim(),
      sources: sources.length > 0 ? sources : undefined
    };

  } catch (error: any) {
    console.error("Gemini Error:", error.message);
    if (fullText.length > 10) return { text: fullText, isPartial: true, sources: sources.length > 0 ? sources : undefined };
    throw error;
  }
};