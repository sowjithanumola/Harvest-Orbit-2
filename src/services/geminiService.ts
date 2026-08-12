import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

export class GeminiService {
    private static ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || "",
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build',
            }
        }
    });

    static async analyzeField(prompt: string): Promise<AnalysisResult> {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured on the server.");
        }

        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are Harvest Orbit's Lead Satellite Agronomist AI. Translate multispectral satellite data and sensor readings into plain-language, professional, and highly actionable farming advice. Always return valid JSON.",
                responseMimeType: "application/json",
            }
        });

        const text = response.text || "";

        try {
            // Clean markdown code fences if present
            const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
            const data = JSON.parse(jsonStr);
            
            // Basic validation of required fields
            if (!data.assessment || !data.alerts) {
                throw new Error("AI response missing critical assessment data");
            }

            return data as AnalysisResult;
        } catch (e) {
            console.error("Gemini JSON parse failed:", text);
            throw new Error("Failed to parse AI analysis. The model may have returned an invalid format.");
        }
    }

    static async getChatResponse(message: string, history: any[], context: string): Promise<string> {
        const chat = this.ai.chats.create({
            model: "gemini-3.6-flash",
            config: {
                systemInstruction: "You are a helpful assistant for the Harvest Orbit platform.",
            },
            // Note: @google/genai chats handle history differently or via session state.
            // But sendMessage handles the current message.
        });

        // The SDK might not support passing history in chats.create easily in the same way.
        // Let's use generateContent for simple history-aware chat if needed, 
        // or follow the SDK pattern exactly.
        
        const fullPrompt = `Context: ${context}\n\nUser Question: ${message}`;
        const response: GenerateContentResponse = await chat.sendMessage({ message: fullPrompt });
        return response.text || "";
    }
}
