// ENHANCEMENT_comms_hub: Safe stub for SMS integration

type SendOptions = {
  clientId?: string;
  metadata?: Record<string, any>;
};

export async function sendSms(to: string, body: string, opts: SendOptions = {}): Promise<{ id?: string; status: "mocked" }> {
  if (!to) throw new Error("Recipient phone number is required.");
  if (!body?.trim()) throw new Error("SMS body is required.");

  await new Promise(r => setTimeout(r, 200));
  console.info("[SMS MOCK] sendSms", { to, body, opts });

  return { id: `mock-sms-${Date.now()}`, status: "mocked" };
}
