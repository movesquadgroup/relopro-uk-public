import { Client, LeadScoreSetting } from '../types';

const DEFAULT_LEAD_SCORE_SETTINGS: LeadScoreSetting[] = [
    { id: '1', key: 'enquiryType_International', description: 'Enquiry Type: International', points: 30 },
    { id: '2', key: 'enquiryType_Office Relocation', description: 'Enquiry Type: Office Relocation', points: 20 },
    { id: '3', key: 'clientType_Business', description: 'Client Type: Business', points: 15 },
    { id: '4', key: 'data_hasBudget', description: 'Data: Budget Provided', points: 15 },
    { id: '5', key: 'data_hasVolume', description: 'Data: Volume Provided', points: 10 },
    { id: '6', key: 'source_highQuality', description: 'Source: High Quality', points: 10 },
];

function getLeadScoreSettings(): LeadScoreSetting[] {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem('leadScoreSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                console.error("Failed to parse lead score settings from localStorage", e);
            }
        }
    }
    return DEFAULT_LEAD_SCORE_SETTINGS;
}


interface LeadScoreResult {
    score: number;
    factors: { description: string, points: number }[];
}

export const calculateLeadScore = (client: Client): LeadScoreResult => {
    let score = 0;
    const factors: { description: string, points: number }[] = [];

    if (!client) {
        return { score: 0, factors: [] };
    }

    const rules = getLeadScoreSettings();

    rules.forEach(rule => {
        let conditionMet = false;
        switch (rule.key) {
            case 'enquiryType_International':
                conditionMet = client.enquiryType === 'International';
                break;
            case 'enquiryType_Office Relocation':
                conditionMet = client.enquiryType === 'Office Relocation';
                break;
            case 'clientType_Business':
                conditionMet = client.clientType === 'Commercial' || client.clientType === 'Government';
                break;
            case 'data_hasBudget':
                conditionMet = !!client.budget && client.budget > 0;
                break;
            case 'data_hasVolume':
                conditionMet = !!client.estimatedVolume && client.estimatedVolume > 0;
                break;
            case 'source_highQuality':
                conditionMet = client.leadSource === 'Referral' || client.leadSource === 'Existing Customer';
                break;
            default:
                // Handle simple key-value pairs if needed in the future
                const [field, value] = rule.key.split('_');
                if (field in client && value && client[field as keyof Client] === value) {
                    conditionMet = true;
                }
        }

        if (conditionMet) {
            score += rule.points;
            factors.push({ description: rule.description, points: rule.points });
        }
    });

    return { score, factors };
};