// ENHANCEMENT_integration_layer: Safe stub for Google Calendar integration.

import { DiaryEvent } from '../../types';

/**
 * Mock function to sync a diary event to Google Calendar.
 * @param event The diary event to sync.
 * @returns A promise that resolves with a mock event ID from Google Calendar.
 */
export async function syncEventToGoogleCalendar(event: DiaryEvent): Promise<{ googleEventId: string }> {
  console.log(`[GCal STUB] Syncing event "${event.title}" (${event.id}) to Google Calendar.`);
  console.log(`[GCal STUB] Time: ${new Date(event.start).toLocaleString()} to ${new Date(event.end).toLocaleString()}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockGoogleEventId = `gcal_${event.id}_${Date.now()}`;
  console.log(`[GCal STUB] Successfully synced event. Mock Google Event ID: ${mockGoogleEventId}`);
  
  return { googleEventId: mockGoogleEventId };
}
