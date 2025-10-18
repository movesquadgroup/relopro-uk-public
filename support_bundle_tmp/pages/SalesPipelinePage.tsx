import React, { useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, ClientStatus } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import { calculateLeadScore } from '../lib/crmUtils';
import { lazyIfEnabled, safeImport } from '../lib/lazy';
import { features } from '../lib/featureFlags';
import AddTaskModal from '../components/AddTaskModal';

const SendMessageModal = lazyIfEnabled(
  features.commsHubEnabled,
  () => safeImport('../components/SendMessageModal')
);

const SalesPipelinePage: React.FC = () => {
    const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
    const [clientForMessage, setClientForMessage] = useState<Client | null>(null);
    const [clientForTask, setClientForTask] = useState<Client | null>(null);

    const scoredClients = useMemo(() => {
        return clients.map(client => {
            const { score, factors } = calculateLeadScore(client);
            return { ...client, leadScore: score, leadScoreFactors: factors };
        });
    }, [clients]);

    const salesStatuses = [
        ClientStatus.Lead,
        ClientStatus.Quoted,
        ClientStatus.Booked,
    ];
    
    const handleAddTask = (description: string, dueDate: string) => {
        if (!clientForTask) return;
        
        const newTask = {
            id: `task-${Date.now()}`,
            description,
            dueDate,
            isCompleted: false,
        };

        setClients(prev => prev.map(c => 
            c.id === clientForTask.id
            ? { ...c, tasks: [...(c.tasks || []), newTask] }
            : c
        ));
        setClientForTask(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sales Pipeline</h3>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">Track deals from lead to booked job.</p>
                </div>
                {/* Future actions like 'Add New Deal' could go here */}
            </div>

             <div className="mt-6">
                {/* FIX: Add required onStartMessage and onAddTask props to KanbanBoard. */}
                <KanbanBoard 
                    clients={scoredClients} 
                    setClients={setClients} 
                    statuses={salesStatuses}
                    onStartMessage={(client) => setClientForMessage(client)}
                    onAddTask={(client) => setClientForTask(client)}
                />
            </div>
            
            {clientForMessage && (
                <SendMessageModal
                    client={clientForMessage}
                    onClose={() => setClientForMessage(null)}
                />
            )}
            
            {clientForTask && (
                <AddTaskModal
                    client={clientForTask}
                    onClose={() => setClientForTask(null)}
                    onSave={handleAddTask}
                />
            )}
        </div>
    );
};

export default SalesPipelinePage;