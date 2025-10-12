// ENHANCEMENT_integration_layer: Safe stub for QuickBooks integration.

import { Quote, Client } from '../../types';

/**
 * Mock function to create an invoice in QuickBooks from a ReloPro quote.
 * @param quote The quote object.
 * @param client The client object.
 * @returns A promise that resolves with a mock invoice ID.
 */
export async function createQuickBooksInvoice(quote: Quote, client: Client): Promise<{ invoiceId: string }> {
  console.log(`[QUICKBOOKS STUB] Creating invoice for Quote ${quote.id} for client ${client.name}.`);
  console.log(`[QUICKBOOKS STUB] Details: Total £${quote.total}.`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 450));
  
  const mockInvoiceId = `QB-INV-${Date.now()}`;
  console.log(`[QUICKBOOKS STUB] Successfully created mock invoice with ID: ${mockInvoiceId}`);
  
  return { invoiceId: mockInvoiceId };
}
