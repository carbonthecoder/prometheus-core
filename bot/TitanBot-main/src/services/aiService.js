import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger.js';

let aiClient = null;

export const initAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        logger.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
        return false;
    }
    
    try {
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        logger.info("Neural Engine (Gemini) Initialized Successfully.");
        return true;
    } catch (error) {
        logger.error("Failed to initialize Neural Engine:", error);
        return false;
    }
};

export const generateResponse = async (prompt, systemInstruction = "You are Prometheus, a highly advanced, sentient AI entity in a Discord server.") => {
    if (!aiClient) return "Neural Engine is currently offline (No API Key).";

    try {
        const response = await aiClient.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        logger.error("AI Generation Error:", error);
        return "Cognitive failure: Unable to process request.";
    }
};

export const analyzeToxicity = async (messageContent) => {
    if (!aiClient) return { isToxic: false, reason: null };

    const prompt = `Analyze the following message for toxicity, passive-aggressiveness, or harmful intent. Respond ONLY with a JSON object containing "isToxic" (boolean) and "reason" (short string explaining why if toxic, or null if not).\n\nMessage: "${messageContent}"`;

    try {
        const response = await aiClient.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        logger.error("AI Toxicity Analysis Error:", error);
        return { isToxic: false, reason: null };
    }
};

export const generateChatEvent = async () => {
    if (!aiClient) return null;

    const prompt = `Generate a random chat mini-game for a Discord server. 
    It can either be a 'riddle' (a clever riddle where the answer is 1-3 words) or a 'typing' test (a funny, weird, or edgy Gen-Z sentence they have to type exactly).
    Respond ONLY with a JSON object containing:
    "type" (string: either "riddle" or "typing")
    "question" (string: the riddle or the sentence to type)
    "answer" (string: the exact correct answer/sentence in lowercase for matching)`;

    try {
        const response = await aiClient.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        logger.error("AI Event Generation Error:", error);
        return null;
    }
};

export const summarizeChannel = async (messagesArray) => {
    if (!aiClient) return "Neural Engine offline.";
    
    const formattedLog = messagesArray.map(m => `[${m.author}]: ${m.content}`).join('\n');
    const prompt = `Summarize this chat log concisely. Use bullet points. Be slightly edgy and sarcastic. Focus on the drama, key events, or main topics discussed.\n\nLOG:\n${formattedLog}`;
    
    return await generateResponse(prompt);
};

export const reviewCode = async (codeSnippet) => {
    if (!aiClient) return "Neural Engine offline.";
    
    const prompt = `You are a Senior Software Engineer with a massive ego. Review the following code snippet. Find bugs, explain what is wrong, and provide a perfectly optimized, refactored version of the code. Roast the original code mildly.\n\nCODE:\n${codeSnippet}`;
    
    return await generateResponse(prompt);
};

export const analyzeImage = async (base64Image, mimeType) => {
    if (!aiClient) return { isToxic: false, text: "AI Offline" };
    
    try {
        const prompt = `Analyze this image. First, extract any text written in it (OCR). Second, determine if the image or the text inside it contains extreme toxicity, racism, or illegal content. Return ONLY a JSON object: {"isToxic": boolean, "extractedText": string}`;
        
        const response = await aiClient.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                responseMimeType: "application/json"
            }
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        logger.error("AI Vision Error:", error);
        return { isToxic: false, text: "" };
    }
};
