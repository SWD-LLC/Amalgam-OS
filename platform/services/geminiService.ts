
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, ClipSuggestion } from "../types";

const isQuotaError = (error: any): boolean => {
  if (!error) return false;
  const code = error.status || error.statusCode || error.code || error.error?.code;
  const status = error.statusText || error.error?.status;
  
  if (code === 429 || status === "RESOURCE_EXHAUSTED") return true;
  
  const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
  return (
    errorStr.includes('429') || 
    errorStr.toLowerCase().includes('resource_exhausted') ||
    errorStr.toLowerCase().includes('quota') ||
    errorStr.toLowerCase().includes('rate limit')
  );
};

/**
 * Generates a video using Veo 3.1 models.
 * Handles operation polling and download link preparation.
 */
export const generateVideo = async (
  prompt: string, 
  config: { aspectRatio: '16:9' | '9:16', resolution: '720p' | '1080p' },
  onProgress: (status: string) => void
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    onProgress("Initiating Video Gen-Core...");
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio
      }
    });

    onProgress("Synthesizing Neural Latents...");
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      onProgress(Math.random() > 0.5 ? "Ingesting Temporal Frames..." : "Refining Motion Vectors...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgress("Finalizing Hype-Trace...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No download link returned.");

    // The response.body contains the MP4 bytes. Append API key when fetching.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Error:", error);
    return null;
  }
};

export const getNeuralTalkingPoints = async (topic: string): Promise<{ 
  points: string[]; 
  sources: { title: string; uri: string }[];
  errorType?: 'quota' | 'other';
}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 3 trending news items or talking points for a live streamer about: ${topic}. Focus on breaking news from the last 24 hours.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const points = text.split('\n').filter(line => line.trim().length > 10).slice(0, 3);
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.map((c: any) => ({
      title: c.web?.title || "Source",
      uri: c.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#");

    return { points, sources };
  } catch (error) {
    const isQuota = isQuotaError(error);
    if (!isQuota) {
      console.error("Talking Points Error:", error);
    }
    // Never invent live news or claim researched suggestions when the server-side integration is unavailable.
    return { points: [], sources: [], errorType: isQuota ? 'quota' : 'other' };
  }
};

export const moderateMessage = async (message: string): Promise<{ isSafe: boolean; reason?: string; autoResponse?: string; errorType?: 'quota' | 'other' }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this live chat message for toxicity or spam. Context: Amalgam Creatorverse. Respond in JSON. If safe and an FAQ, provide a short friendly answer. Message: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            autoResponse: { type: Type.STRING },
          },
          required: ["isSafe"],
        }
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    return { isSafe: false, reason: 'Automated moderation is unavailable. Manual review is required.', errorType: isQuotaError(error) ? 'quota' : 'other' };
  }
};

export const optimizeProductListing = async (rawTitle: string, rawPrice: string): Promise<{ title: string; description: string; category: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transform this basic product idea into a premium, futuristic brand listing for a streamer's marketplace. Product: "${rawTitle}" at ${rawPrice}. Make it sound high-end, cyberpunk, or creator-centric. Respond in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["title", "description", "category"],
        }
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    return { title: rawTitle, description: "A premium creator asset from the Amalgam ecosystem.", category: "General" };
  }
};

export const analyzeStreamVitals = async (chatLog: Message[]): Promise<{ sentiment: 'positive' | 'neutral' | 'negative', burnoutRisk: 'low' | 'moderate' | 'high', coachingTip: string; errorType?: 'quota' | 'other' }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chatText = chatLog.slice(-40).map(m => `${m.user}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze Amalgam stream vitals based on this chat log:\n${chatText}\nRespond in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
            burnoutRisk: { type: Type.STRING, enum: ["low", "moderate", "high"] },
            coachingTip: { type: Type.STRING },
          },
          required: ["sentiment", "burnoutRisk", "coachingTip"],
        }
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    return { sentiment: 'neutral', burnoutRisk: 'low', coachingTip: 'Keep consistent energy levels!', errorType: isQuotaError(error) ? 'quota' : 'other' };
  }
};

export const detectClippableMoments = async (chatLog: Message[]): Promise<ClipSuggestion[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chatText = chatLog.slice(-30).map(m => `${m.user}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify engagement peaks for clipping from this chat log:\n${chatText}\nRespond in JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              reason: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              title: { type: Type.STRING },
            },
            required: ["id", "startTime", "endTime", "reason", "confidence", "title"],
          }
        }
      }
    });
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
};

export const visualStreamAnalysis = async (base64Image: string): Promise<{ 
  description: string; 
  detectedObjects: string[]; 
  hypeLevel: number;
  error?: string;
  errorType?: 'quota' | 'other';
}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Analyze this stream frame. Describe the scene, list key objects, and estimate current "hype level" (0.0 to 1.0) based on visual energy. Respond in JSON with keys: "description", "detectedObjects" (array of strings), and "hypeLevel" (number).' }
        ]
      }
    });
    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const rawJson = jsonMatch ? jsonMatch[0] : '{"description": "Searching...", "detectedObjects": [], "hypeLevel": 0.5}';
    let parsed: any;
    try { parsed = JSON.parse(rawJson); } catch (e) { parsed = {}; }
    return {
      description: parsed.description || "Visual feed analysis complete.",
      detectedObjects: Array.isArray(parsed.detectedObjects) ? parsed.detectedObjects : ["Host", "Display", "Environment"],
      hypeLevel: typeof parsed.hypeLevel === 'number' ? parsed.hypeLevel : 0.5
    };
  } catch (error) {
    const isQuota = isQuotaError(error);
    return { description: isQuota ? "Rate limit reached." : "Visual processing offline.", detectedObjects: [], hypeLevel: 0, errorType: isQuota ? 'quota' : 'other' };
  }
};

export const generateAIVoiceClip = async (textToSpeak: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};
