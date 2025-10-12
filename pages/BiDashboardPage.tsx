// ENHANCEMENT_bi_dashboard: Business Intelligence Dashboard page

import React, { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Quote } from '../types';
import { calculateKpiSummary, getLeadsBySourceData, getRevenueOverTimeData, getJobStatusDistributionData } from '../lib/bi/kpis';

const CHART_COLORS = ['#0072BB', '#1E91D6', '#8FC93A', '#E4CC37', '#E18335', '#6b7280'];

// --- Reusable Components ---

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h4>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h4>
        <div className="h-64">{children}</div>
    </div>
);

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (maxValue === 0) return <p className="text-center text-gray-400">No data</p>;
    
    return (
        <div className="flex justify-around items-end h-full space-x-2">
            {data.map((d, i) => (
                <div key={d.label} className="flex-1 flex flex-col items-center">
                    <div
                        className="w-full rounded-t-md"
                        style={{ height: `${(d.value / maxValue) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        title={`${d.label}: ${d.value}`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return <p className="text-center text-gray-400">No data</p>;

    let cumulative = 0;
    const segments = data.map((d, i) => {
        const percentage = (d.value / total) * 100;
        const strokeDasharray = `${percentage} ${100 - percentage}`;
        const strokeDashoffset = -cumulative;
        cumulative += percentage;
        return { ...d, strokeDasharray, strokeDashoffset, color: CHART_COLORS[i % CHART_COLORS.length] };
    });

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-1/2 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            cx="18" cy="18" r="15.9"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="4"
                            strokeDasharray={seg.strokeDasharray}
                            strokeDashoffset={seg.strokeDashoffset}
                            transform="rotate(-90 18 18)"
                        />
                    ))}
                </svg>
            </div>
            <div className="w-1/2 pl-4">
                <ul className="text-sm space-y-1">
                    {segments.map(seg => (
                        <li key={seg.label} className="flex items-center">
                            <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: seg.color }}></span>
                            <span className="text-gray-700 dark:text-gray-300">{seg.label}:</span>
                            <span className="font-semibold ml-auto">{seg.value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const BiDashboardPage: React.FC = () => {
    const [clients] = useLocalStorage<Client[]>('clients', []);
    const [quotes] = useLocalStorage<Quote[]>('quotes', []);

    const kpiSummary = useMemo(() => calculateKpiSummary(clients, quotes), [clients, quotes]);
    const leadsBySourceData = useMemo(() => getLeadsBySourceData(clients), [clients]);
    const revenueData = useMemo(() => getRevenueOverTimeData(quotes), [quotes]);
    const statusData = useMemo(() => getJobStatusDistributionData(clients), [clients]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Business Intelligence Dashboard</h3>
                <p className="text-gray-600 mt-1 dark:text-gray-400">An overview of your company's performance.</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Leads" value={kpiSummary.totalLeads.toString()} />
                <KpiCard title="Conversion Rate" value={`${kpiSummary.conversionRate.toFixed(1)}%`} />
                <KpiCard title="Total Revenue (Accepted)" value={new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(kpiSummary.totalRevenue)} />
                <KpiCard title="Average Job Value" value={new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(kpiSummary.averageJobValue)} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Leads by Source">
                    <BarChart data={leadsBySourceData.map(d => ({ label: d.source, value: d.count }))} />
                </ChartCard>
                <ChartCard title="Job Status Distribution">
                    <DonutChart data={statusData.map(d => ({ label: d.status, value: d.count }))} />
                </ChartCard>
                <ChartCard title="Monthly Revenue (Accepted Quotes)">
                    {/* Placeholder for Line Chart - for simplicity, we'll reuse BarChart */}
                     <BarChart data={revenueData.map(d => ({ label: d.month, value: d.revenue }))} />
                </ChartCard>
            </div>
        </div>
    );
};

export default BiDashboardPage;
