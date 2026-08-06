import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(modelName) {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: 'say hi',
        });
        console.log(`[SUCCESS] ${modelName} works: ${response.text}`);
        return true;
    } catch (e) {
        console.log(`[FAILED] ${modelName}: ${e.message}`);
        return false;
    }
}

async function run() {
    const candidates = [
        'gemini-flash-latest',
        'gemini-2.5-flash',
        'gemini-2.0-flash-lite',
        'gemini-3.5-flash',
        'gemma-4-31b-it',
        'gemini-pro-latest'
    ];
    for (const model of candidates) {
        const success = await testModel(model);
        if (success) {
            console.log(`\nFound working model: ${model}`);
            break;
        }
    }
}
run();
