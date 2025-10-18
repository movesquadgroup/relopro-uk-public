import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { validateQuoteToken } from '../lib/quoting/doc';
import { Client, Quote, QuoteStatus, Activity, ActivityType } from '../types';
import AcceptQuoteModal from '../components/AcceptQuoteModal';
import { CompletedJobsIcon, QuoteIcon } from '../components/icons/Icons';

interface QuoteData {
    quote: Quote;
    client: Client;
}

const QuotePublicView: React.FC = () => {
    const { id: quoteId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<QuoteData | null>(null);
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

    // Use hooks to update data across the app
    const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', []);
    const [clients, setClients] = useLocalStorage<Client[]>('clients', []);

    useEffect(() => {
        if (!quoteId) {
            setError('Quote ID is missing from the URL.');
            setIsLoading(false);
            return;
        }

        const token = searchParams.get('token');
        if (!token) {
            setError('Authentication token is missing. Please use the link provided.');
            setIsLoading(false);
            return;
        }

        const validationResult = validateQuoteToken(token, quoteId);
        if (!validationResult) {
            setError('This link is invalid or has expired. Please request a new one.');
            setIsLoading(false);
            return;
        }

        try {
            const quote = quotes.find(q => q.id === quoteId);
            if (!quote) {
                setError('This quote could not be found.');
                setIsLoading(false);
                return;
            }

            const client = clients.find(c => c.id === quote.clientId);
            if (!client) {
                setError('Associated client account could not be found.');
                setIsLoading(false);
                return;
            }

            setData({ quote, client });

        } catch (e) {
            console.error("Failed to load quote data from localStorage", e);
            setError("An error occurred while loading your quote.");
        } finally {
            setIsLoading(false);
        }
    }, [quoteId, searchParams, quotes, clients]);

    const handleConfirmAcceptance = (signerName: string) => {
        if (!data) return;
        
        // Update Quote status
        const updatedQuotes = quotes.map(q => 
            q.id === data.quote.id ? { ...q, status: QuoteStatus.Accepted } : q
        );
        setQuotes(updatedQuotes);

        // Add Activity to Client timeline
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            type: ActivityType.QuoteAccepted,
            content: `Quote ${data.quote.id} was accepted and digitally signed by ${signerName}.`,
            author: 'Client Portal',
            timestamp: new Date().toISOString(),
        };
        const updatedClients = clients.map(c => 
            c.id === data.client.id 
            ? { ...c, activities: [newActivity, ...c.activities] }
            : c
        );
        setClients(updatedClients);

        // Close modal and update local state to reflect acceptance
        setIsAcceptModalOpen(false);
        setData(prevData => prevData ? { ...prevData, quote: { ...prevData.quote, status: QuoteStatus.Accepted } } : null);
    };


    const renderContent = () => {
        if (isLoading) return <p className="text-center p-10">Loading your quote...</p>;
        if (error) return (
            <div className="text-center p-10 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
            </div>
        );
        if (data) {
            const { quote, client } = data;
            const canBeAccepted = quote.status === QuoteStatus.Sent || quote.status === QuoteStatus.Draft;
            
            return (
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl my-8">
                    {/* Header */}
                    <div className="p-8 border-b dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quotation</h1>
                                <p className="text-brand-primary font-semibold">{quote.id}</p>
                            </div>
                            <h2 className="text-4xl font-bold text-brand-primary">ReloPro</h2>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <p className="font-semibold text-gray-500 dark:text-gray-400">BILLED TO</p>
                                <p className="text-gray-800 dark:text-gray-200 font-bold">{client.name}</p>
                                <p className="text-gray-600 dark:text-gray-300">{client.originAddresses[0]}</p>
                            </div>
                             <div className="text-right">
                                <p className="font-semibold text-gray-500 dark:text-gray-400">Quote Date</p>
                                <p className="text-gray-800 dark:text-gray-200">{new Date(quote.quoteDate).toLocaleDateString('en-GB')}</p>
                                <p className="font-semibold text-gray-500 dark:text-gray-400 mt-2">Expiry Date</p>
                                <p className="text-gray-800 dark:text-gray-200">{new Date(quote.expiryDate).toLocaleDateString('en-GB')}</p>
                             </div>
                        </div>
                    </div>
                    {/* Body - Placeholder for line items */}
                     <div className="p-8">
                         <p className="text-gray-600 dark:text-gray-400">This is a placeholder for detailed quote line items. The full implementation would render a table of services, quantities, and prices here.</p>
                    </div>
                    {/* Footer & Total */}
                    <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                        <div className="flex justify-end items-center">
                            <div className="text-right">
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">Total</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(quote.total)}</p>
                            </div>
                        </div>
                         <div className="mt-8 pt-6 border-t dark:border-gray-700 text-center">
                            {quote.status === QuoteStatus.Accepted ? (
                                <div className="p-4 bg-green-100 text-green-800 rounded-lg inline-flex items-center space-x-3">
                                    <CompletedJobsIcon />
                                    <span className="font-semibold">Thank you! This quote has been accepted.</span>
                                </div>
                            ) : quote.status === QuoteStatus.Rejected ? (
                                <p className="text-red-600 font-semibold">This quote was rejected.</p>
                            ) : (
                                <button 
                                    onClick={() => setIsAcceptModalOpen(true)}
                                    className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                                >
                                    Accept Quote & E-Sign
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="fixed inset-0 z-40 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
            {renderContent()}
            {isAcceptModalOpen && data && (
                <AcceptQuoteModal
                    quoteId={data.quote.id}
                    onClose={() => setIsAcceptModalOpen(false)}
                    onConfirm={handleConfirmAcceptance}
                />
            )}
        </div>
    );
};

export default QuotePublicView;