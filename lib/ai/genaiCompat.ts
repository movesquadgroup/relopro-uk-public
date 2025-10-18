export function hasApiKey() {
  return !!(import.meta.env?.VITE_GEMINI_API_KEY);
}

export async function askGemini(prompt: string): Promise<string> {
  // Soft-fail: always return something instead of throwing
  try {
    if (!hasApiKey()) return "AI temporarily disabled (no API key).";
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const model = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      .getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent(prompt);
    return res.response.text() || "No response.";
  } catch (e) {
    console.error('AI error:', e);
    return "AI unavailable.";
  }
}
