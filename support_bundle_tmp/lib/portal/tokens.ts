/**
 * Generates a mock magic link URL for a client to access their portal.
 * In a real application, this would generate a secure, single-use token and email it.
 * @param clientId The ID of the client to generate a link for.
 * @returns A URL string with a mock token.
 */
export function generateMagicLink(clientId: string): string {
  // The token is predictable for this mock implementation.
  const token = `MAGIC_TOKEN_FOR_${clientId}`;
  // Uses the hash-based routing structure of the app.
  return `/#/portal?token=${token}`;
}

/**
 * Validates a mock token from the portal URL.
 * In a real application, this would involve a backend call to verify the token's validity.
 * @param token The token string from the URL search parameters.
 * @returns An object with the clientId if valid, otherwise null.
 */
export function validateToken(token: string): { clientId: string } | null {
  const match = token.match(/^MAGIC_TOKEN_FOR_(.*)$/);
  if (match && match[1]) {
    return { clientId: match[1] };
  }
  return null;
}
