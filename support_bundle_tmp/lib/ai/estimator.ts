export type VolumeEstimateInput = {
  inventoryDescription?: string;
  rooms?: number;
  propertySizeM2?: number;
  specialItems?: string[];
};

export type VolumeEstimate = {
  cubicFeet: number;
  cubicMeters: number;
  confidence: number;   // 0..1
  summary: string;
  requirements: string[];
};

function hasApiKey(): boolean {
  // Vite exposes env as import.meta.env.*
  return !!(import.meta as any).env?.VITE_GEMINI_API_KEY;
}

async function askGemini(prompt: string): Promise<string> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    // @ts-ignore
    const key = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
    if (!key) return '';
    const genai = new GoogleGenerativeAI(key);
    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent(prompt);
    return res.response.text();
  } catch (e) {
    console.error('Gemini call failed:', e);
    return '';
  }
}

export async function getVolumeEstimate(input: VolumeEstimateInput): Promise<VolumeEstimate> {
  // Fast offline heuristic if no API key
  if (!hasApiKey()) {
    const base = (input.rooms ?? 3) * 200; // ~200 cu ft per room (very rough)
    const extra = (input.specialItems?.length ?? 0) * 20;
    const cubicFeet = Math.round(base + extra);
    const cubicMeters = Math.round(cubicFeet * 0.0283168);
    return {
      cubicFeet,
      cubicMeters,
      confidence: 0.4,
      summary: 'Offline estimate (no AI key). Add VITE_GEMINI_API_KEY for smarter results.',
      requirements: [],
    };
  }

  const prompt = `Estimate household move volume in both cubic feet and cubic meters.
Input: ${JSON.stringify(input)}
Return a short JSON object with fields: cubicFeet, cubicMeters, summary, requirements (array). No prose.`;
  const text = await askGemini(prompt);

  try {
    const parsed = JSON.parse(text);
    return {
      cubicFeet: Number(parsed.cubicFeet) || 600,
      cubicMeters: Number(parsed.cubicMeters) || Math.round(600 * 0.0283168),
      confidence: 0.7,
      summary: parsed.summary || 'AI estimate generated.',
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
    };
  } catch {
    // Fallback if AI returns non-JSON
    const base = (input.rooms ?? 3) * 220;
    const cubicFeet = Math.round(base);
    const cubicMeters = Math.round(cubicFeet * 0.0283168);
    return {
      cubicFeet,
      cubicMeters,
      confidence: 0.6,
      summary: text || 'AI estimate generated.',
      requirements: [],
    };
  }
}

export async function generateSummaryAndRequirements(input: VolumeEstimateInput): Promise<{ summary: string; requirements: string[] }> {
  if (!hasApiKey()) {
    return {
      summary: 'Offline summary (no AI key).',
      requirements: [],
    };
  }
  const prompt = `Write a one-paragraph summary of this moving job, then a bullet list of key requirements.
Input: ${JSON.stringify(input)}
Format as plain text: first a single-paragraph summary, then a list of bullets (each on its own line, prefixed with "- ").`;
  const text = await askGemini(prompt);
  const lines = (text || '').split('\n').map(s => s.trim()).filter(Boolean);
  const summary = lines.shift() || 'Summary unavailable.';
  const requirements = lines.map(l => l.replace(/^[\-\*\u2022]\s*/, ''));
  return { summary, requirements };
}
