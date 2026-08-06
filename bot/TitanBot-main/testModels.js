import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.DISCORD_TOKEN }); // Wait, DISCORD_TOKEN? No, GEMINI_API_KEY.

async function run() {
    try {
        const ai2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai2.models.list();
        const models = [];
        for await (const model of response) {
            models.push(model.name);
        }
        console.log(models);
    } catch (e) {
        console.error("Error", e.message);
    }
}
run();
