// ENHANCEMENT_comms_hub: Safe stub for email integration

type SendOptions = {
  clientId?: string;
  metadata?: Record<string, any>;
};

export async function sendEmail(to: string, subject: string, body: string, opts: SendOptions = {}): Promise<{ id?: string; status: "mocked" }> {
  if (!to) throw new Error("Recipient email is required.");
  if (!subject) throw new Error("Email subject is required.");
  if (!body?.trim()) throw new Error("Email body is required.");

  await new Promise(r => setTimeout(r, 300));
  console.info("[EMAIL MOCK] sendEmail", { to, subject, body, opts });

  return { id: `mock-email-${Date.now()}`, status: "mocked" };
}
