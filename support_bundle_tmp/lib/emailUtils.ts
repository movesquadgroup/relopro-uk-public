import { Client } from '../types';

/**
 * Mock function to simulate sending an email.
 * In a real application, this would integrate with an email service provider
 * like SendGrid, Mailgun, or AWS SES.
 *
 * @param to The recipient's email address.
 * @param subject The subject of the email.
 * @param body The HTML or text body of the email.
 * @returns A promise that resolves when the email is "sent".
 */
export const sendEmail = (to: string, subject: string, body: string): Promise<void> => {
    console.log('--- Sending Email (Mock) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML):\n${body}`);
    console.log('---------------------------');

    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 500));
};

// A sample client object to extract keys from for merge fields.
// This ensures we have a predictable structure.
const sampleClient: Client = {
    id: '', name: '', email: '', phone: '', moveDate: '',
    originAddresses: [], destinationAddresses: [], status: '' as any,
    createdAt: '', activities: [], tasks: [], accessDetails: {} as any
};

const clientKeys = Object.keys(sampleClient) as (keyof Client)[];

/**
 * Dynamically gets a list of available merge fields from the Client type.
 * @returns An array of strings representing merge fields.
 */
export const getMergeFields = (): string[] => {
    return clientKeys.filter(key => 
        typeof sampleClient[key] === 'string' || 
        typeof sampleClient[key] === 'number' ||
        Array.isArray(sampleClient[key]) // for addresses
    ).map(key => {
        if (Array.isArray(sampleClient[key])) {
            return `${key}[0]`; // Provide example for arrays
        }
        return key;
    });
};

/**
 * Replaces merge fields in a string with data from a client object.
 * e.g., "Hello {{name}}" becomes "Hello John Doe"
 * @param template The string template with {{field}} placeholders.
 * @param client The client data object.
 * @returns The processed string with data inserted.
 */
export const replaceMergeFields = (template: string, client: Client): string => {
    if (!template) return '';
    
    // Regex to find all {{field}} or {{array[0]}} placeholders
    return template.replace(/{{(.*?)}}/g, (match, key) => {
        const trimmedKey = key.trim();
        
        // Handle array access like originAddresses[0]
        const arrayMatch = trimmedKey.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayKey = arrayMatch[1] as keyof Client;
            const index = parseInt(arrayMatch[2], 10);
            const arrayValue = client[arrayKey];
            if (Array.isArray(arrayValue) && arrayValue[index]) {
                return String(arrayValue[index]);
            }
        }

        // Handle direct property access
        if (trimmedKey in client) {
            const value = client[trimmedKey as keyof Client];
            if (typeof value === 'string' || typeof value === 'number') {
                return String(value);
            }
             if (Array.isArray(value)) {
                return value.join(', '); // Default for arrays if no index specified
            }
        }
        
        return match; // Return the original placeholder if no data found
    });
};