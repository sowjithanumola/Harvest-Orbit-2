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

    private static async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        try {
            return await fn();
        } catch (error: any) {
            const isRetryable = error?.status === 503 || error?.code === 503 || error?.message?.includes("503") || error?.message?.includes("high demand");
            if (retries > 0 && isRetryable) {
                console.warn(`Gemini API 503 error. Retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.withRetry(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    static async analyzeField(prompt: string): Promise<AnalysisResult> {
        return this.withRetry(async () => {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY is not configured on the server.");
            }

            const response: GenerateContentResponse = await this.ai.models.generateContent({
                model: "gemini-3.7-flash",
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
        });
    }

    static async getChatResponse(message: string, history: any[], context: string): Promise<string> {
        return this.withRetry(async () => {
            const chat = this.ai.chats.create({
                model: "gemini-3.7-flash",
                config: {
                    systemInstruction: "You are a helpful assistant for the Harvest Orbit platform.",
                },
            });
            
            const fullPrompt = `Context: ${context}\n\nUser Question: ${message}`;
            const response: GenerateContentResponse = await chat.sendMessage({ message: fullPrompt });
            return response.text || "";
        });
    }

    static async getPlanetarySummary(data: string): Promise<string> {
        return this.withRetry(async () => {
            const response = await this.ai.models.generateContent({
                model: "gemini-3.7-flash",
                contents: `As an expert agronomist, explain why these NASA planetary vital signs matter to a local farmer. Use a tone that builds trust and highlights the reliability of NASA and satellite technology. Focus on practical agricultural impacts like planting windows, water management, and crop resilience.
                
                Data to analyze:
                ${data}
                
                Keep the summary concise (max 3 short paragraphs), professional, and encouraging.`,
                config: {
                    systemInstruction: "You are Harvest Orbit's Trusted Science Advisor. Your goal is to bridge the gap between global space-based telemetry and practical, ground-level farming. Use clear, non-technical language that respects the farmer's expertise while introducing high-tech reliability.",
                }
            });
            return response.text || "";
        });
    }
}
