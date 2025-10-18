import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Quote, QuoteStatus, DiaryEvent, DiaryActivityType } from '../types';
import { getQuoteWinProbability, QuoteWinPrediction, getCrewEfficiencyForecast, EfficiencyForecast, getStorageDemandForecast, StorageDemandForecast } from '../lib/ai/insights';
import { MagicWandIcon, CrmIcon, OperationsIcon, StorageIcon } from '../components/icons/Icons';

const InsightsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 border-b pb-3 mb-4 dark:border-gray-700">
            <span className="text-brand-primary">{icon}</span>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
    </div>
);

const QuoteWinPredictor: React.FC = () => {
    const [quotes] = useLocalStorage<Quote[]>('quotes', []);
    const [clients] = useLocalStorage<Client[]>('clients', []);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [prediction, setPrediction] = useState<QuoteWinPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectableQuotes = useMemo(() => quotes.filter(q => q.status === QuoteStatus.Sent), [quotes]);

    useEffect(() => {
        if (selectableQuotes.length > 0 && !selectedQuoteId) {
            setSelectedQuoteId(selectableQuotes[0].id);
        }
    }, [selectableQuotes, selectedQuoteId]);

    useEffect(() => {
        if (!selectedQuoteId) {
            setPrediction(null);
            return;
        };

        const fetchPrediction = async () => {
            const quote = quotes.find(q => q.id === selectedQuoteId);
            const client = clients.find(c => c.id === quote?.clientId);
            if (!quote || !client) return;

            setIsLoading(true);
            try {
                const result = await getQuoteWinProbability(quote, client);
                setPrediction(result);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrediction();
    }, [selectedQuoteId, quotes, clients]);

    return (
        <InsightsCard title="Quote Win Predictor" icon={<CrmIcon />}>
            <select
                value={selectedQuoteId}
                onChange={e => setSelectedQuoteId(e.target.value)}
                className="form-input w-full dark:bg-gray-700 dark:border-gray-600 mb-4"
                disabled={selectableQuotes.length === 0}
            >
                {selectableQuotes.length > 0 ? (
                    selectableQuotes.map(q => <option key={q.id} value={q.id}>{q.id} - {q.clientName}</option>)
                ) : (
                    <option>No quotes available to predict</option>
                )}
            </select>
            {isLoading ? <LoadingSpinner /> : prediction && (
                <div className="space-y-3">
                    <div className="text-center">
                        <p className="text-5xl font-bold text-brand-primary">{prediction.probability.toFixed(0)}%</p>
                        <p className="text-sm font-semibold text-gray-500">Win Probability</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Rationale:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-400 italic">{prediction.rationale}</p>
                    </div>
                </div>
            )}
        </InsightsCard>
    );
};

const CrewEfficiencyForecaster: React.FC = () => {
    const [diaryEvents] = useLocalStorage<DiaryEvent[]>('diaryEvents', []);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [forecast, setForecast] = useState<EfficiencyForecast | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectableJobs = useMemo(() => diaryEvents.filter(e => e.activityType === DiaryActivityType.BookJob), [diaryEvents]);

    useEffect(() => {
        if (selectableJobs.length > 0 && !selectedJobId) {
            setSelectedJobId(selectableJobs[0].id);
        }
    }, [selectableJobs, selectedJobId]);

    useEffect(() => {
        if (!selectedJobId) {
            setForecast(null);
            return;
        }

        const fetchForecast = async () => {
            const job = diaryEvents.find(j => j.id === selectedJobId);
            if (!job) return;

            setIsLoading(true);
            try {
                const result = await getCrewEfficiencyForecast(job);
                setForecast(result);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForecast();
    }, [selectedJobId, diaryEvents]);

    return (
        <InsightsCard title="Crew Efficiency Forecaster" icon={<OperationsIcon />}>
            <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="form-input w-full dark:bg-gray-700 dark:border-gray-600 mb-4"
                disabled={selectableJobs.length === 0}
            >
                {selectableJobs.length > 0 ? (
                    selectableJobs.map(j => <option key={j.id} value={j.id}>{j.title} - {new Date(j.start).toLocaleDateString()}</option>)
                ) : (
                    <option>No jobs available to forecast</option>
                )}
            </select>
            {isLoading ? <LoadingSpinner /> : forecast && (
                <div className="space-y-3">
                    <div className="text-center">
                        <p className="text-5xl font-bold text-yellow-600">{forecast.predictedDelayMinutes > 0 ? `+${forecast.predictedDelayMinutes} min` : 'On Time'}</p>
                        <p className="text-sm font-semibold text-gray-500">Predicted Delay</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Rationale:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-400 italic">{forecast.rationale}</p>
                    </div>
                </div>
            )}
        </InsightsCard>
    );
};

const StorageDemandPredictor: React.FC = () => {
    const [clients] = useLocalStorage<Client[]>('clients', []);
    const [forecast, setForecast] = useState<StorageDemandForecast | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            setIsLoading(true);
            try {
                const result = await getStorageDemandForecast(clients);
                setForecast(result);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForecast();
    }, [clients]);

    return (
        <InsightsCard title="Storage Demand Predictor" icon={<StorageIcon />}>
            {isLoading ? <LoadingSpinner /> : forecast && (
                <div className="space-y-3">
                    <div className="text-center">
                        <p className="text-5xl font-bold text-brand-secondary">{forecast.predictedUnitsNextQuarter}</p>
                        <p className="text-sm font-semibold text-gray-500">Predicted Units Required (Next Quarter)</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Rationale:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-400 italic">{forecast.rationale}</p>
                    </div>
                </div>
            )}
        </InsightsCard>
    );
};


const InsightsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <MagicWandIcon className="w-8 h-8 text-brand-primary" />
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Move Insights AI</h3>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">Leverage AI to make smarter business decisions.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <QuoteWinPredictor />
                <CrewEfficiencyForecaster />
                <StorageDemandPredictor />
            </div>

            <style>{`.form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
        </div>
    );
};

export default InsightsPage;
