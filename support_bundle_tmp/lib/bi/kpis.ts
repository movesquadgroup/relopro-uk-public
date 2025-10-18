// ENHANCEMENT_bi_dashboard: Logic for calculating KPIs and chart data

import { Client, Quote, QuoteStatus, ClientStatus } from '../../types';

// --- KPI Summary Calculations ---
export interface KpiSummary {
    totalLeads: number;
    conversionRate: number;
    totalRevenue: number;
    averageJobValue: number;
}

export function calculateKpiSummary(clients: Client[], quotes: Quote[]): KpiSummary {
    const totalLeads = clients.length;
    const bookedClients = clients.filter(c => c.status === ClientStatus.Booked || c.status === ClientStatus.InProgress || c.status === ClientStatus.Completed).length;
    const conversionRate = totalLeads > 0 ? (bookedClients / totalLeads) * 100 : 0;

    const acceptedQuotes = quotes.filter(q => q.status === QuoteStatus.Accepted);
    const totalRevenue = acceptedQuotes.reduce((sum, q) => sum + q.total, 0);
    const averageJobValue = acceptedQuotes.length > 0 ? totalRevenue / acceptedQuotes.length : 0;

    return {
        totalLeads,
        conversionRate,
        totalRevenue,
        averageJobValue,
    };
}

// --- Chart Data Calculations ---

export type LeadsBySourceData = { source: string; count: number }[];
// FIX: Explicitly type the accumulator in reduce to ensure correct type inference. This resolves errors where `count` was inferred as `unknown`.
export function getLeadsBySourceData(clients: Client[]): LeadsBySourceData {
    const counts = clients.reduce<Record<string, number>>((acc, client) => {
        const source = client.leadSource || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);
}

export type RevenueOverTimeData = { month: string; revenue: number }[];
// FIX: Explicitly type the accumulator in reduce to ensure correct type inference. This resolves an error where `revenue` was inferred as `unknown`.
export function getRevenueOverTimeData(quotes: Quote[]): RevenueOverTimeData {
    const monthlyRevenue = quotes
        .filter(q => q.status === QuoteStatus.Accepted)
        .reduce<Record<string, number>>((acc, quote) => {
            const month = new Date(quote.quoteDate).toISOString().slice(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + quote.total;
            return acc;
        }, {});

    return Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month));
}

export type JobStatusDistributionData = { status: string; count: number }[];
// FIX: Explicitly type the accumulator in reduce to ensure correct type inference. This resolves errors where `count` was inferred as `unknown`.
export function getJobStatusDistributionData(clients: Client[]): JobStatusDistributionData {
     const counts = clients.reduce<Record<string, number>>((acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);
}