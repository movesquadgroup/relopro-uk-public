// ENHANCEMENT_integration_layer: Safe stub for Xero integration.

import { Quote, Client } from '../../types';

/**
 * Mock function to create an invoice in Xero from a ReloPro quote.
 * @param quote The quote object.
 * @param client The client object.
 * @returns A promise that resolves with a mock invoice ID.
 */
export async function createXeroInvoice(quote: Quote, client: Client): Promise<{ invoiceId: string }> {
  console.log(`[XERO STUB] Creating invoice for Quote ${quote.id} for client ${client.name}.`);
  console.log(`[XERO STUB] Details: Total £${quote.total}, Due Date based on terms.`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const mockInvoiceId = `XERO-INV-${Date.now()}`;
  console.log(`[XERO STUB] Successfully created mock invoice with ID: ${mockInvoiceId}`);
  
  return { invoiceId: mockInvoiceId };
}
