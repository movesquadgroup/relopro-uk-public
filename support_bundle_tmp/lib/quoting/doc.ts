/**
 * Generates a mock magic link URL for a client to view and accept a quote.
 * @param quoteId The ID of the quote to generate a link for.
 * @returns A URL string with a mock token.
 */
export function generatePublicQuoteLink(quoteId: string): string {
  const token = `QUOTE_TOKEN_FOR_${quoteId}`;
  return `/#/quote/${quoteId}/public?token=${token}`;
}

/**
 * Validates a mock token from the public quote URL.
 * @param token The token string from the URL search parameters.
 * @param quoteId The quoteId from the URL path to ensure they match.
 * @returns An object with the quoteId if valid, otherwise null.
 */
export function validateQuoteToken(token: string, quoteId: string): { quoteId: string } | null {
  const expectedToken = `QUOTE_TOKEN_FOR_${quoteId}`;
  if (token === expectedToken) {
    return { quoteId };
  }
  return null;
}