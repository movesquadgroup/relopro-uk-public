import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Quote, QuoteStatus, Client, TariffSettings, Activity, ActivityType } from '../types';
import QuoteTable from '../components/QuoteTable';
import CreateQuoteModal from '../components/CreateQuoteModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

const mockQuotes: Quote[] = [
    { id: 'Q-001', clientId: 'CLI002', clientName: 'Bob Williams', quoteDate: '2024-06-06', expiryDate: '2024-07-06', total: 4500.00, status: QuoteStatus.Sent },
    { id: 'Q-002', clientId: 'CLI001', clientName: 'Alice Johnson', quoteDate: '2024-05-20', expiryDate: '2024-06-20', total: 3250.50, status: QuoteStatus.Accepted },
    { id: 'Q-003', clientId: 'CLI005', clientName: 'Ethan Hunt', quoteDate: '2024-06-13', expiryDate: '2024-07-13', total: 8900.00, status: QuoteStatus.Draft },
    { id: 'Q-004', clientId: 'CLI006', clientName: 'Fiona Glenanne', quoteDate: '2024-06-09', expiryDate: '2024-07-09', total: 5100.75, status: QuoteStatus.Rejected },
];

const QuotingWorkflowPlaceholder: React.FC = () => (
  <div className="p-4 bg-brand-light border border-brand-accent rounded-lg mb-6 dark:bg-gray-800 dark:border-brand-primary">
    <h4 className="font-bold text-brand-primary dark:text-blue-300">Quoting Workflow</h4>
    <div className="flex items-center space-x-2 text-sm text-gray-700 mt-2 dark:text-gray-300">
      <span>1. Review Costs</span>
      <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
      <span>2. Apply Margin</span>
      <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
      <span>3. Generate Document</span>
      <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
      <span>4. Send to Client</span>
    </div>
  </div>
);

const QuotingPage: React.FC = () => {
    const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', mockQuotes);
    const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
    const [tariffs] = useLocalStorage<TariffSettings>('tariffs', { ratePerVolume: 0, ratePerDistance: 0, ratePerHour: 0, materials: [] });
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [selectedClientForQuote, setSelectedClientForQuote] = useState<Client | undefined>(undefined);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const clientFromCrm = location.state?.client as Client | undefined;
        if (clientFromCrm) {
            setSelectedClientForQuote(clientFromCrm);
            setIsQuoteModalOpen(true);
            // Clear the state from location so the modal doesn't re-open on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleOpenQuoteModal = (client?: Client) => {
        setSelectedClientForQuote(client);
        setIsQuoteModalOpen(true);
    };

    const handleSaveQuote = (newQuote: Omit<Quote, 'id'>) => {
        const quoteId = `Q-${String(quotes.length + 1).padStart(3, '0')}`;
        const quoteWithId: Quote = {
            ...newQuote,
            id: quoteId,
        };
        setQuotes(prevQuotes => [quoteWithId, ...prevQuotes]);
        
        // Add activity to client timeline
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            type: ActivityType.QuoteCreated,
            content: `Quote ${quoteId} created for a total of £${newQuote.total.toFixed(2)}.`,
            author: 'John Doe', // This would be the logged-in user
            timestamp: new Date().toISOString(),
        };

        setClients(prevClients => 
            prevClients.map(c => 
                c.id === newQuote.clientId 
                ? { ...c, activities: [newActivity, ...c.activities] }
                : c
            )
        );

        setIsQuoteModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Quote Management</h3>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">Create, send, and track all client quotes.</p>
                </div>
                <button 
                    onClick={() => handleOpenQuoteModal()}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Create New Quote
                </button>
            </div>
            
            <div className="mt-6">
              <QuotingWorkflowPlaceholder />
            </div>

            <div className="mt-6">
                <QuoteTable quotes={quotes} />
            </div>

            {isQuoteModalOpen && (
                <CreateQuoteModal
                    onClose={() => setIsQuoteModalOpen(false)}
                    onSave={handleSaveQuote}
                    client={selectedClientForQuote}
                    allClients={clients}
                    tariffSettings={tariffs}
                />
            )}
        </div>
    );
};

export default QuotingPage;