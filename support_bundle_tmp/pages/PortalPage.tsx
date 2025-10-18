import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateToken } from '../lib/portal/tokens';
import { Client, Quote, DiaryEvent, Task, QuoteStatus, DiaryActivityType } from '../types';
import { CrmIcon, DashboardIcon, DiaryIcon, QuoteIcon, TaskIcon } from '../components/icons/Icons';

// Define a type for all data needed for the portal
interface PortalData {
  client: Client;
  quotes: Quote[];
  events: DiaryEvent[];
  tasks: Task[];
}

// Reusable card component for the portal layout
const PortalCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
            <div className="text-brand-primary dark:text-brand-secondary">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

const PortalPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<PortalData | null>(null);

    // This is a simplified way to access localStorage data without using the hook,
    // as this page is a read-only snapshot.
    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setError('Authentication token is missing. Please use the link provided in your email.');
            setIsLoading(false);
            return;
        }

        const validationResult = validateToken(token);
        if (!validationResult) {
            setError('This link is invalid or has expired. Please request a new one.');
            setIsLoading(false);
            return;
        }

        try {
            const { clientId } = validationResult;
            const allClients: Client[] = JSON.parse(localStorage.getItem('clients') || '[]');
            const allQuotes: Quote[] = JSON.parse(localStorage.getItem('quotes') || '[]');
            const allDiaryEvents: DiaryEvent[] = JSON.parse(localStorage.getItem('diaryEvents') || '[]');

            const client = allClients.find(c => c.id === clientId);

            if (!client) {
                setError('Your client account could not be found.');
                setIsLoading(false);
                return;
            }

            const clientQuotes = allQuotes.filter(q => q.clientId === clientId);
            const clientEvents = allDiaryEvents.filter(e => e.clientId === clientId);
            const incompleteTasks = (client.tasks || []).filter(t => !t.isCompleted);
            
            setData({
                client,
                quotes: clientQuotes,
                events: clientEvents,
                tasks: incompleteTasks
            });
        } catch (e) {
            console.error("Failed to load portal data from localStorage", e);
            setError("An error occurred while loading your data.");
        } finally {
            setIsLoading(false);
        }

    }, [searchParams]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10">Loading your portal...</div>;
        }
        if (error) {
            return (
                <div className="text-center p-10 max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
                </div>
            );
        }
        if (data) {
            const { client, quotes, events, tasks } = data;
            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome, {client.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400">Here is a summary of your move with ReloPro.</p>
                    </header>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <PortalCard title="Key Information" icon={<DashboardIcon />}>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                                    <div>
                                        <dt className="font-medium text-gray-500">Move Date</dt>
                                        <dd className="mt-1 text-gray-900 dark:text-gray-100 font-semibold text-base">{new Date(client.moveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1 text-gray-900 dark:text-gray-100">{client.status}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">Origin Address</dt>
                                        <dd className="mt-1 text-gray-900 dark:text-gray-100">{client.originAddresses.join(', ')}</dd>
                                    </div>
                                     <div>
                                        <dt className="font-medium text-gray-500">Destination Address</dt>
                                        <dd className="mt-1 text-gray-900 dark:text-gray-100">{client.destinationAddresses.join(', ')}</dd>
                                    </div>
                                </dl>
                            </PortalCard>
                            <PortalCard title="Documents & Quotes" icon={<QuoteIcon />}>
                                {quotes.length > 0 ? (
                                    <ul className="space-y-3">
                                        {quotes.map(q => (
                                        <li key={q.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{q.id} - {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(q.total)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Issued: {new Date(q.quoteDate).toLocaleDateString('en-GB')}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full ${q.status === QuoteStatus.Accepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{q.status}</span>
                                                <button onClick={() => console.log(`Download PDF for ${q.id}`)} className="text-sm font-medium text-brand-primary hover:underline">Download PDF</button>
                                            </div>
                                        </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500">No documents are available yet.</p>}
                            </PortalCard>
                        </div>
                        <div className="space-y-6">
                             <PortalCard title="Upcoming Events" icon={<DiaryIcon />}>
                                {events.length > 0 ? (
                                    <ul className="space-y-3">
                                        {events.map(e => (
                                            <li key={e.id}>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{e.activityType}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(e.start).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500">No events scheduled yet.</p>}
                            </PortalCard>
                            <PortalCard title="Your Outstanding Tasks" icon={<TaskIcon />}>
                               {tasks.length > 0 ? (
                                    <ul className="space-y-3 text-sm">
                                        {tasks.map(t => (
                                            <li key={t.id} className="flex items-start space-x-3">
                                                <span className="mt-1 block w-2 h-2 bg-gray-400 rounded-full"></span>
                                                <div>
                                                    <p className="text-gray-800 dark:text-gray-200">{t.description}</p>
                                                    <p className="text-xs text-gray-500">Due: {new Date(t.dueDate).toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                               ) : <p className="text-sm text-gray-500">You have no outstanding tasks.</p>}
                                <p className="mt-4 text-xs text-gray-400 italic">Please contact your Move Coordinator to complete these tasks.</p>
                           </PortalCard>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="min-h-screen flex flex-col">
                <div className="w-full bg-white dark:bg-gray-800 shadow-sm">
                   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                     <h2 className="text-2xl font-bold text-brand-primary">ReloPro</h2>
                     {data && <p className="text-sm text-gray-600 dark:text-gray-300">Client Portal</p>}
                   </div>
                </div>
                <main className="flex-grow">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default PortalPage;
