// SAFE MODE: remove any browser-side SDK imports (which were causing ESM import errors)
// We provide stable, non-networking mocks so the app can render and you can continue work.
import { Client, Activity, EnrichmentSuggestion } from '../types';

const mockApiCall = <T,>(data: T, delay = 300): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

export const generateText = async (prompt: string): Promise<string> => {
    console.warn("[AI SAFE MODE] generateText is returning a mock response. Prompt was:", prompt);
    return `Mock AI response for prompt: "${prompt.slice(0, 80)}..."`;
};

// ENHANCEMENT_ai_lead_scoring
export const getAiLeadScore = (client: Client): Promise<{ score: number; rationale: string; }> => {
    let score = 50;
    let rationale = "Base score. ";
    if (client.enquiryType === 'International') {
        score += 25;
        rationale += "+25 for high-value international move. ";
    }
    if (client.budget && client.budget > 10000) {
        score += 15;
        rationale += "+15 for large budget. ";
    } else {
        score -= 10;
        rationale += "-10 for smaller budget. ";
    }
    return mockApiCall({ score: Math.min(100, Math.max(0, score)), rationale });
};

// ENHANCEMENT_conversation_summary
export const getConversationSummary = (activities: Activity[]): Promise<{ summary: string; }> => {
    if (activities.length === 0) {
        return mockApiCall({ summary: "No activities to summarize." });
    }
    const summary = "Client expressed interest in a multi-location office move. Discussed initial logistics and requested a formal quote. Follow-up task scheduled.";
    return mockApiCall({ summary }, 400);
};

// ENHANCEMENT_suggested_tasks
// FIX: Added optional context parameter to match function call signature in ClientDetailPage.
export const getTaskSuggestions = (summary: string, context?: any): Promise<{ tasks: { description: string; dueDate: string; }[] }> => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const tasks = [
        { description: "Prepare detailed quote for multi-location move.", dueDate: dueDate.toISOString().split('T')[0] },
        { description: "Check availability of international shipping containers.", dueDate: dueDate.toISOString().split('T')[0] },
    ];
    return mockApiCall({ tasks });
};

// ENHANCEMENT_nba
export const getNextBestAction = (client: Client): Promise<{ text: string; rationale: string; icon: string; }> => {
    const action = {
        text: "Send Quote Follow-up",
        rationale: "The quote was sent 3 days ago and has not been viewed. A friendly follow-up is recommended.",
        icon: "QuoteIcon"
    };
    return mockApiCall(action, 350);
};

// ENHANCEMENT_data_hygiene
export const findPotentialDuplicates = (client: Client): Promise<{ clientId: string; clientName: string; confidence: number; }[]> => {
    if (client.name.includes("Alice")) {
        return mockApiCall([{ clientId: 'CLI999', clientName: 'Alice J.', confidence: 85 }]);
    }
    return mockApiCall([]);
};

// ENHANCEMENT_data_hygiene
export const getEnrichmentSuggestions = (client: Client): Promise<EnrichmentSuggestion[]> => {
    const suggestions: EnrichmentSuggestion[] = [];
    if (client.companyName && !client.jobTitle) {
        suggestions.push({
            field: 'jobTitle',
            suggestedValue: 'Logistics Manager',
            rationale: 'Common role for B2B moves.',
            source: 'Internal AI'
        });
    }
    return mockApiCall(suggestions);
};

// ENHANCEMENT_semantic_search
export const performSemanticSearch = (query: string): Promise<{ clientId: string; name: string; snippet: string; }[]> => {
    const results = [
        { clientId: 'CLI005', name: 'Ethan Hunt', snippet: '...details for the ... to London this month, focused on international requirements...' },
        { clientId: 'CLI001', name: 'Alice Johnson', snippet: '...enquired about a potential move from Springfield to London...' }
    ];
    return mockApiCall(results.filter(r => r.snippet.toLowerCase().includes(query.toLowerCase())), 300);
};