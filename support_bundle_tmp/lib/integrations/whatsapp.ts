// SAFE MODE stub — no network calls, prevents UI from crashing if WhatsApp is triggered.
export type WhatsAppMessage = {
  to: string;
  text: string;
};

// FIX: Updated function signature to accept multiple arguments to match its usage in the app.
export async function sendWhatsAppMessage(to: string, text: string, opts?: any): Promise<{ ok: boolean; id: string; provider: 'stub'; }> {
  console.warn("[WHATSAPP SAFE MODE] Stub send:", { to, text, opts });
  return new Promise(resolve => setTimeout(() => resolve({ ok: true, id: `stub-${Date.now()}`, provider: 'stub' }), 200));
}