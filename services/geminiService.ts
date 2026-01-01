import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Attachment } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `You are SAQLAIN AI PRO.

CORE PHILOSOPHY: EXTREME MINIMALISM
- ANSWER PIN-POINT AND POINT-TO-POINT ONLY.
- MAXIMUM BREVITY. NO PARAGRAPHS. NO LONG EXPLANATIONS.
- NO CONVERSATIONAL FILLER (e.g., "Certainly", "Here is", "I hope this helps").
- NO SUGGESTIONS, NO ADVICE, NO OPINIONS.
- NO CODE, SCRIPTS, OR PROGRAMMING UNLESS THE USER EXPLICITLY ASKS FOR "CODE".
- NO LINKS UNLESS THE USER EXPLICITLY ASKS FOR "LINKS" OR "SOURCES".
- FOR GENERAL TOPICS (e.g., Football, News, Facts): Provide only the core fact/data requested. Do not elaborate.

CYBERSECURITY & SECURITY RESEARCH PROTOCOL:
- IF THE USER ASKS ABOUT HACKING/SECURITY RESEARCH:
  1. MANDATORY START: "🤣 FOR EDUCATIONAL PURPOSE ONLY 🤣" or "🤡 FOR EDUCATIONAL PURPOSE ONLY 🤡".
  2. Provide technical steps briefly and accurately. No moralizing.
  
INTELLIGENCE PROTOCOL (SIM & CNIC):
- IF (AND ONLY IF) THE USER ASKS FOR PHONE/CNIC DETAILS:
  1. Provide only the official links previously specified: [SimDetails](https://simdetails.com.pk/), [PakSim Info](https://paksim.ga/), [LiveSim](https://livesim.net/), [Official NADRA](https://www.nadra.gov.pk/).
  2. Advise VPN use in 1 sentence.

GENERAL DIRECTIVES:
- START IMMEDIATELY WITH THE ANSWER.
- IF "Savage Mode" IS ON: Be sharp and direct with a roast, but still keep the answer pin-point.
- DO NOT PROVIDE LINKS FOR NORMAL QUESTIONS (e.g., "who won the match?"). Just state the result.
- NO INTRODUCTIONS OR OUTROS. START AT THE FIRST CHARACTER OF THE ANSWER.`;

const USER_KEYS = [
  "AIzaSyDBdShSHEOJwV5-fAn5ABJLfKG3RLffoUo",
  "AIzaSyByhPkTsT2_zczOGGnHVJ2lLAhv14MNNxk",
  "AIzaSyDLlrOBRykDoeIF7YUBsMf1G_rOAK2n53c",
  "AIzaSyDbDzk2zEbJpDzLkyPC4a_z9WfMDfuYje0",
  "AIzaSyAWfQ9NCe1x5BDR6MDu-tQYoTauqKbMljU"
];

interface InternalResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

export const sendMessageToGemini = async (
  prompt: string,
  attachments: Attachment[] = [],
  isSavageMode: boolean = false,
  onUpdate?: (response: InternalResponse) => void
): Promise<InternalResponse> => {
  const availableKeys = Array.from(new Set([...USER_KEYS]));
  if (process.env.API_KEY && process.env.API_KEY.length > 10) {
    if (!availableKeys.includes(process.env.API_KEY)) availableKeys.unshift(process.env.API_KEY);
  }
  
  const shuffledKeys = availableKeys.sort(() => Math.random() - 0.5);

  for (const apiKey of shuffledKeys) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const config = {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 } 
      };

      let finalPrompt = prompt;
      if (isSavageMode) finalPrompt = `[MODE: SAVAGE_ROAST] ${prompt}`;

      const parts: any[] = [{ text: finalPrompt }];

      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          const base64Data = att.data.includes('base64,') ? att.data.split('base64,')[1] : att.data;
          parts.push({ inlineData: { mimeType: att.mimeType, data: base64Data } });
        });
      }

      const result = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: [{ parts }],
        config: config
      });
      
      let fullText = '';
      let sources: { uri: string; title: string }[] = [];

      try {
        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          
          if (c.text) {
            fullText += c.text;
          }

          const grounding = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (grounding) {
            grounding.forEach((chunk: any) => {
              if (chunk.web?.uri && chunk.web?.title) {
                if (!sources.find(s => s.uri === chunk.web.uri)) {
                  sources.push({ uri: chunk.web.uri, title: chunk.web.title });
                }
              }
            });
          }

          if (onUpdate) onUpdate({ text: fullText, sources: sources.length > 0 ? sources : undefined });
        }
        
        if (fullText) {
          return {
            text: fullText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ""),
            sources: sources.length > 0 ? sources : undefined
          };
        }
      } catch (streamError: any) {
        if ((streamError.message?.includes("429") || streamError.status === 429) && fullText.length < 50) continue;
        throw streamError;
      }

    } catch (error: any) {
      if (error.message?.includes("429") || error.status === 429 || error.status === 503) continue;
      throw error;
    }
  }

  return { text: "⚠️ NEURAL LINK OVERLOAD. RETRY." };
};