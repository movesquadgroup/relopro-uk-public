import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Activity, ActivityType, Task, Quote, QuoteStatus, DiaryEvent, ClientStatus, DiaryActivityType } from '../types';
import ActivityTimeline from '../components/ActivityTimeline';
import TaskManagement from '../components/TaskManagement';
import { WarningIcon, CloseIcon, QuoteIcon, DiaryIcon, SurveyIcon, CostingIcon, OperationsIcon, MagicWandIcon, NoteIcon } from '../components/icons/Icons';
import { calculateLeadScore } from '../lib/crmUtils';
import { getAiLeadScore, getTaskSuggestions } from '../lib/ai';
import { features } from '../lib/featureFlags';
import WorkflowPanel from "../components/WorkflowPanel";
import { lazyIfEnabled, safeImport } from '../lib/lazy';

const SendMessageModal = lazyIfEnabled(
  features.commsHubEnabled,
  () => safeImport('../components/SendMessageModal')
);

const AiLeadScoreBadge = lazyIfEnabled(
  features.aiLeadScoringEnabled,
  () => safeImport('../components/AiLeadScoreBadge')
);

const getScoreColor = (score: number) => {
    if (score > 66) return 'bg-green-100 text-green-800 border-green-300';
    if (score > 33) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
};

const LeadScoreBadge: React.FC<{ score?: number; factors?: { description: string, points: number }[] }> = ({ score, factors }) => {
    if (typeof score !== 'number') return null;
    return (
        <div className="relative group">
            <span className={`px-3 py-1 text-sm font-bold leading-5 rounded-full border ${getScoreColor(score)}`}>
                Lead Score: {score}
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
                <h4 className="font-bold border-b border-gray-600 pb-1 mb-1">Score Breakdown</h4>
                <ul className="space-y-1">
                    {factors?.map((factor, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{factor.description}</span>
                            <span>+{factor.points}</span>
                        </li>
                    ))}
                </ul>
                 <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
            </div>
        </div>
    );
};

interface AddressManagerProps {
    addresses: string[];
    title: string;
    onAddressChange: (newAddresses: string[]) => void;
}

const AddressManager: React.FC<AddressManagerProps> = ({ addresses, title, onAddressChange }) => {

    const handleAdd = () => {
        onAddressChange([...addresses, '']);
    };

    const handleRemove = (index: number) => {
        onAddressChange(addresses.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, value: string) => {
        const newAddresses = [...addresses];
        newAddresses[index] = value;
        onAddressChange(newAddresses);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="text-xl font-bold text-gray-800 mb-4 dark:text-gray-100">{title}</h3>
            <div className="space-y-3">
                {addresses.map((address, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <textarea
                            value={address}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="form-input flex-grow dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Enter full address"
                            rows={3}
                        />
                         <a href={`https://www.google.com/maps?q=${encodeURIComponent(address)}&layer=c`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            View on Map
                        </a>
                        <button onClick={() => handleRemove(index)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                            <CloseIcon />
                        </button>
                    </div>
                ))}
            </div>
             <button onClick={handleAdd} className="mt-4 text-sm font-semibold text-brand-primary hover:text-brand-secondary dark:text-blue-400 dark:hover:text-blue-300">
                + Add Address
            </button>
        </div>
    );
};

const statusColorMap: Record<QuoteStatus, string> = {
  [QuoteStatus.Draft]: 'bg-gray-100 text-gray-800 border-gray-300',
  [QuoteStatus.Sent]: 'bg-blue-100 text-blue-800 border-blue-300',
  [QuoteStatus.Accepted]: 'bg-green-100 text-green-800 border-green-300',
  [QuoteStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300',
};

const QuoteStatusBadge: React.FC<{ status: QuoteStatus }> = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full border ${statusColorMap[status]}`}>
    {status}
  </span>
);

const QuickLink: React.FC<{ to: string; state: any; icon: React.ReactNode; label: string }> = ({ to, state, icon, label }) => (
    <Link to={to} state={state} className="flex items-center p-2 bg-gray-100 rounded-md hover:bg-brand-light hover:text-brand-primary transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
        <span className="text-brand-primary dark:text-blue-300">{icon}</span>
        <span className="ml-2 font-medium">{label}</span>
    </Link>
);


const ClientDetailPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
    const [quotes] = useLocalStorage<Quote[]>('quotes', []);
    const [diaryEvents] = useLocalStorage<DiaryEvent[]>('diaryEvents', []);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);

    const client = clients.find(c => c.id === clientId);

    // Local AI lead score (detail page)
    const [localAiScore, setLocalAiScore] = useState<{ score: number; rationale: string } | null>(null);

    useEffect(() => {
      let isMounted = true;
      (async () => {
        if (features.aiLeadScoringEnabled && client) {
          try {
            const res = await getAiLeadScore(client);
            if (isMounted) setLocalAiScore(res);
          } catch (e) {
            console.error("AI lead score (detail) failed:", e);
          }
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [client]);

    const { score, factors } = useMemo(() => client ? calculateLeadScore(client) : { score: 0, factors: [] }, [client]);
    const clientQuotes = useMemo(() => quotes.filter(q => q.clientId === client?.id), [quotes, client]);
    const clientEvents = useMemo(() => diaryEvents.filter(e => e.clientId === client?.id), [diaryEvents, client]);

    const updateClient = (updatedClient: Client) => {
        setClients(prevClients => prevClients.map(c => c.id === clientId ? updatedClient : c));
    };

    const handleAddNote = (noteContent: string) => {
        if (!client) return;
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            type: ActivityType.Note,
            content: noteContent,
            author: 'John Doe', // Assume logged in user
            timestamp: new Date().toISOString(),
        };
        updateClient({ ...client, activities: [newActivity, ...client.activities] });
    };
    
    const handleAddTask = (description: string, dueDate: string) => {
        if (!client) return;
        const newTask: Task = {
            id: `task-${Date.now()}`,
            description,
            dueDate,
            isCompleted: false,
        };
        updateClient({ ...client, tasks: [...client.tasks, newTask] });
    };

    const handleToggleTask = (taskId: string) => {
        if (!client) return;
        const updatedTasks = client.tasks.map(t => 
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        updateClient({ ...client, tasks: updatedTasks });
    };

    const handleAddressChange = (type: 'origin' | 'destination', newAddresses: string[]) => {
        if (!client) return;
        if (type === 'origin') {
            updateClient({ ...client, originAddresses: newAddresses });
        } else {
            updateClient({ ...client, destinationAddresses: newAddresses });
        }
    };

    const handleGenerateSummaryAndTasks = async (summaryText: string) => {
        if (!client || !features.aiSummariesEnabled) return;

        // Provide context so AI suggestions can personalize wording & timing.
        const { tasks: suggestedTasksData } = await getTaskSuggestions(summaryText, {
            client,
            quotes: clientQuotes,
            preferredContact: client.preferredContactMethod,
            moveDate: client.moveDate,
        });

        const newTasks: Task[] = suggestedTasksData.map((t, i) => ({
            id: `task-sug-${Date.now()}-${i}`,
            description: t.description,
            dueDate: t.dueDate,
            isCompleted: false,
            isSuggested: true,
            suggestionSource: 'ai_summary',
        }));

        if (newTasks.length > 0) {
            setSuggestedTasks(prev => [...prev, ...newTasks]);
        }
    };
    
    const handleAcceptSuggestion = (taskToAccept: Task) => {
        if (!client) return;
        const newTask: Task = {
            ...taskToAccept,
            isSuggested: false,
        };
        updateClient({ ...client, tasks: [...client.tasks, newTask] });
        setSuggestedTasks(prev => prev.filter(t => t.id !== taskToAccept.id));
    };

    const getNextBestAction = () => {
        if (!client) return null;

        const actions = {
            scheduleSurvey: {
                text: 'Schedule Survey',
                icon: <SurveyIcon />,
                onClick: () => navigate('/diary', { state: { client } }),
            },
            createQuote: {
                text: 'Create Quote',
                icon: <QuoteIcon />,
                onClick: () => navigate('/quoting', { state: { client } }),
            },
            sendQuote: {
                text: 'Send Quote',
                icon: <MagicWandIcon />, // Placeholder icon
                onClick: () => navigate('/quoting', { state: { client } }),
            },
            sendMessage: {
                text: 'Send Follow-up',
                icon: <MagicWandIcon />, // Placeholder icon
                onClick: () => setIsMessageModalOpen(true),
            },
            scheduleJob: {
                text: 'Schedule Job',
                icon: <OperationsIcon />,
                onClick: () => navigate('/operations', { state: { client } }),
            },
            viewOps: {
                text: 'View Operations Plan',
                icon: <OperationsIcon />,
                onClick: () => navigate('/operations', { state: { client } }),
            },
        };

        // Workflow: Lead -> Survey -> Quote -> Outcome -> Operations
        const hasSurvey = clientEvents.some(e => e.activityType === DiaryActivityType.InPersonSurvey || e.activityType === DiaryActivityType.VirtualSurvey);
        if (!hasSurvey) return actions.scheduleSurvey;

        const hasQuote = clientQuotes.length > 0;
        if (!hasQuote) return actions.createQuote;

        const hasSentQuote = clientQuotes.some(q => q.status === QuoteStatus.Sent || q.status === QuoteStatus.Accepted);
        if (!hasSentQuote) return actions.sendQuote;

        const hasAcceptedQuote = clientQuotes.some(q => q.status === QuoteStatus.Accepted);
        if (!hasAcceptedQuote) return actions.sendMessage;
        
        const isJobScheduled = clientEvents.some(e => e.activityType === DiaryActivityType.BookJob);
        if (!isJobScheduled) return actions.scheduleJob;

        // If all major steps are done, this is the final action.
        return actions.viewOps;
    };
    
    const nextBestAction = getNextBestAction();

    if (!client) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-md text-gray-500 dark:bg-gray-800 dark:text-gray-400">Client not found.</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6 dark:bg-gray-800">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <img className="h-16 w-16 rounded-full object-cover" src={client.avatarUrl || `https://i.pravatar.cc/150?u=${client.id}`} alt="Client Avatar" />
                        <div>
                             <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{client.name}</h2>
                                <LeadScoreBadge score={score} factors={factors} />
                                {features.aiLeadScoringEnabled && (
                                  <AiLeadScoreBadge score={localAiScore?.score} rationale={localAiScore?.rationale} />
                                )}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{client.companyName ? `${client.companyName} - ${client.jobTitle}` : 'Residential Client'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsMessageModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Send Message</button>
                        {nextBestAction && (
                            <button onClick={nextBestAction.onClick} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary flex items-center space-x-2">
                                {nextBestAction.icon}
                                <span>{nextBestAction.text}</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm dark:border-gray-700">
                    <div>
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Contact</h4>
                        <p className="text-gray-800 dark:text-gray-200">{client.email}</p>
                        <p className="text-gray-800 dark:text-gray-200">{client.phone}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Move Date</h4>
                        <p className="text-gray-800 dark:text-gray-200 font-medium text-base">{new Date(client.moveDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Key Info</h4>
                        <p className="text-gray-800 dark:text-gray-200">Est. Volume: {client.estimatedVolume || 'N/A'} cbft</p>
                        {client.keyMoveRequirements && <p className="flex items-center text-yellow-600 dark:text-yellow-400"><WarningIcon /> <span className="ml-2">{client.keyMoveRequirements}</span></p>}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <WorkflowPanel client={client} />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <AddressManager title="Origin Addresses" addresses={client.originAddresses} onAddressChange={(newAddresses) => handleAddressChange('origin', newAddresses)} />
                         <AddressManager title="Destination Addresses" addresses={client.destinationAddresses} onAddressChange={(newAddresses) => handleAddressChange('destination', newAddresses)} />
                    </div>
                    <ActivityTimeline activities={client.activities} onAddNote={handleAddNote} clientName={client.name} onGenerateSummaryAndTasks={handleGenerateSummaryAndTasks} />
                </div>
                <div className="space-y-6">
                    <TaskManagement tasks={client.tasks} onAddTask={handleAddTask} onToggleTask={handleToggleTask} suggestedTasks={suggestedTasks} onAcceptSuggestion={handleAcceptSuggestion} />
                    <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b pb-3 mb-4">Related Records & Quick Links</h3>

                        {/* Quotes Section */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Quotes ({clientQuotes.length})</h4>
                            {clientQuotes.length > 0 ? (
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {clientQuotes.map(quote => (
                                        <li key={quote.id} className="text-sm flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{quote.id} - {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(quote.total)}</span>
                                            <QuoteStatusBadge status={quote.status} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No quotes found for this client.</p>
                            )}
                        </div>

                        {/* Diary Events Section */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Diary & Ops Events ({clientEvents.length})</h4>
                            {clientEvents.length > 0 ? (
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {clientEvents.map(event => (
                                        <li key={event.id} className="text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{event.activityType}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(event.start).toLocaleString('en-GB')}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No diary events found for this client.</p>
                            )}
                        </div>
                        
                        {/* Quick Links Section */}
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Links</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <QuickLink to="/quoting" state={{ client }} icon={<QuoteIcon />} label="Quoting" />
                                <QuickLink to="/diary" state={{ client }} icon={<DiaryIcon />} label="Diary" />
                                <QuickLink to="/survey" state={{ client }} icon={<SurveyIcon />} label="Survey" />
                                <QuickLink to="/costing" state={{ client }} icon={<CostingIcon />} label="Costing" />
                                <QuickLink to="/operations" state={{ client }} icon={<OperationsIcon />} label="Operations" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {features.commsHubEnabled && isMessageModalOpen && client && (
                <SendMessageModal 
                    client={client}
                    onClose={() => setIsMessageModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ClientDetailPage;
