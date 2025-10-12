import { GoogleGenAI } from "@google/genai";

export interface VolumeEstimateItem {
    item: string;
    volume: number; // in cubic feet
    rationale: string;
}

const apiKey = (typeof process !== "undefined" && process.env?.API_KEY) ? process.env.API_KEY : "";
const ai = new GoogleGenAI({ apiKey });
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockEstimate: VolumeEstimateItem[] = [
    { item: '3-seater sofa', volume: 50, rationale: 'Standard sofa size (mock)' },
    { item: 'Double bed with mattress', volume: 60, rationale: 'Bed and mattress (mock)' },
    { item: 'Dining table with 4 chairs', volume: 70, rationale: 'Table and chairs set (mock)' },
    { item: '20 medium boxes', volume: 60, rationale: '20 x 3cbft boxes (mock)' },
];

export async function getVolumeEstimate(inventoryText: string): Promise<VolumeEstimateItem[]> {
    if (!apiKey) {
        console.log("AI estimator (stub) called with inventory:", inventoryText);
        await delay(500);
        return inventoryText.trim() ? mockEstimate : [];
    }

    const systemInstruction = "You are an expert removals volume estimator. The user will provide a list of items. Your task is to analyze the list, identify each item, and estimate its volume in cubic feet (cbft). Group similar items where appropriate (e.g., '10 boxes'). Return ONLY a valid JSON array of objects, where each object has three keys: 'item' (string), 'volume' (number), and 'rationale' (string).";
    const prompt = `Here is the list of items:\n\n${inventoryText}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            }
        });
        const jsonStr = response.text || "[]";
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI getVolumeEstimate failed:", error);
        return mockEstimate; // Fallback to mock data on error
    }
}

export async function generateSummaryAndRequirements(detailsText: string): Promise<string> {
    if (!apiKey) {
        console.log("AI summary (stub) called with details:", detailsText);
        await delay(300);
        return !detailsText.trim() ? "No additional details provided." : "Key requirements (mock): Piano move required, narrow lane access.";
    }

    const prompt = `Summarize the following additional move details into a concise, one-sentence list of key requirements for a removal company. Focus on actionable points like special items, access issues, or packing needs.\n\nDetails: "${detailsText}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful assistant for a removals company, summarizing client notes."
            }
        });
        return response.text?.trim() || "Could not generate a summary.";
    } catch (error) {
        console.error("AI generateSummaryAndRequirements failed:", error);
        return "Error generating summary.";
    }
}
