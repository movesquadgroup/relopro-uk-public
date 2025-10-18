import { Client, Quote, DiaryEvent, QuoteStatus } from '../../types';

// Mock API call utility
const mockApiCall = <T,>(data: T, delay = 700): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// --- 1. Quote Win Predictor ---

export interface QuoteWinPrediction {
    probability: number; // 0 to 100
    rationale: string;
}

export function getQuoteWinProbability(quote: Quote, client: Client): Promise<QuoteWinPrediction> {
    let probability = 50;
    const reasons: string[] = [];

    // Simple rule-based logic for mock
    if (client.leadSource === 'Referral' || client.leadSource === 'Existing Customer') {
        probability += 25;
        reasons.push("High-quality lead source (Referral/Existing).");
    }
    if (client.enquiryType === 'International' || client.enquiryType === 'Office Relocation') {
        probability += 15;
        reasons.push("High-value job type.");
    }
    if (quote.total < (client.budget || Infinity)) {
        probability += 10;
        reasons.push("Quote is within client's budget.");
    }
    if (quote.total > 10000) {
        probability -= 10;
        reasons.push("High total value may lead to price sensitivity.");
    }

    const finalProbability = Math.max(10, Math.min(95, probability));
    const rationale = reasons.length > 0 ? reasons.join(' ') : "Based on general historical data for similar jobs.";

    return mockApiCall({ probability: finalProbability, rationale });
}


// --- 2. Crew Efficiency Forecaster ---

export interface EfficiencyForecast {
    predictedDelayMinutes: number; // in minutes
    rationale: string;
}

export function getCrewEfficiencyForecast(job: DiaryEvent): Promise<EfficiencyForecast> {
    let predictedDelayMinutes = 0;
    const reasons: string[] = [];

    if (job.dismantlingNotes && job.dismantlingNotes.toLowerCase().includes('all')) {
        predictedDelayMinutes += 45;
        reasons.push("Extensive dismantling required.");
    }
    if ((job.volumeCubicFeet || 0) > 1500) {
        predictedDelayMinutes += 60;
        reasons.push("Large job volume.");
    }
    if (job.accessDetails?.origin?.longCarryDistance || job.accessDetails?.destination?.longCarryDistance) {
        if ((job.accessDetails.origin.longCarryDistance || 0) > 20 || (job.accessDetails.destination.longCarryDistance || 0) > 20) {
            predictedDelayMinutes += 30;
            reasons.push("Long carry distance noted at property.");
        }
    }

    const rationale = reasons.length > 0 ? `Potential delays due to: ${reasons.join(' ')}` : "No specific risks identified; job expected to run on time.";
    
    return mockApiCall({ predictedDelayMinutes, rationale });
}


// --- 3. Storage Demand Predictor ---

export interface StorageDemandForecast {
    predictedUnitsNextQuarter: number;
    rationale: string;
}

export function getStorageDemandForecast(clients: Client[]): Promise<StorageDemandForecast> {
    // A very simple mock: count clients who have expressed interest in storage
    const interestedClients = clients.filter(c => 
        c.requiresStorage || 
        c.enquiryType === 'Storage Only' ||
        (c.keyMoveRequirements && c.keyMoveRequirements.toLowerCase().includes('storage'))
    ).length;

    // Project this forward with a simple multiplier
    const predictedUnitsNextQuarter = Math.ceil(interestedClients * 1.5);
    const rationale = `Based on ${interestedClients} current clients showing interest in storage, and applying a standard growth projection.`;

    return mockApiCall({ predictedUnitsNextQuarter, rationale });
}
