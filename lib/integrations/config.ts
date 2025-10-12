// ENHANCEMENT_integration_layer: Configuration for third-party integrations.
// In a real app, these values would come from environment variables or a secure store.

export const integrationConfig = {
  xero: {
    clientId: 'MOCK_XERO_CLIENT_ID',
    clientSecret: 'MOCK_XERO_CLIENT_SECRET',
  },
  quickbooks: {
    clientId: 'MOCK_QB_CLIENT_ID',
    clientSecret: 'MOCK_QB_CLIENT_SECRET',
  },
  google: {
    apiKey: 'MOCK_GOOGLE_API_KEY',
    calendarId: 'primary',
  },
};
