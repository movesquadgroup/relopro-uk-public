import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Client, ClientStatus, Workflow, Task, Activity, ActivityType } from '../types';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { executeWorkflows } from '../lib/workflowEngine';
import { PhoneIcon, MessageIcon, TaskIcon } from './icons/Icons';


const getScoreColor = (score: number) => {
    if (score > 66) return 'bg-green-500';
    if (score > 33) return 'bg-yellow-500';
    return 'bg-red-500';
}

interface KanbanCardProps {
    client: Client;
    index: number;
    onStartMessage: (client: Client) => void;
    onAddTask: (client: Client) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ client, index, onStartMessage, onAddTask }) => {
    const navigate = useNavigate();
    const origin = client.originAddresses?.[0] || 'N/A';
    const destination = client.destinationAddresses?.[0] || 'N/A';

    return (
        <Draggable draggableId={client.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-3 mb-3 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-brand-primary dark:bg-gray-800 dark:border-brand-secondary group relative"
                >
                    <div onClick={() => navigate(`/crm/${client.id}`)}>
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-gray-800 dark:text-gray-100 pr-4">{client.name}</p>
                            {typeof client.leadScore === 'number' && (
                                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${getScoreColor(client.leadScore)}`}>
                                    {client.leadScore}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">{origin} → {destination}</p>
                        <p className="text-xs text-gray-400 mt-2 dark:text-gray-500">Move Date: {new Date(client.moveDate).toLocaleDateString()}</p>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`tel:${client.phone}`} onClick={e => e.stopPropagation()} title="Call Client" className="p-1.5 text-gray-500 bg-gray-100 rounded-full hover:text-brand-primary hover:bg-brand-light dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                            <PhoneIcon className="w-4 h-4" />
                        </a>
                        <button onClick={e => { e.stopPropagation(); onStartMessage(client); }} title="Send Message" className="p-1.5 text-gray-500 bg-gray-100 rounded-full hover:text-brand-primary hover:bg-brand-light dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                            <MessageIcon className="w-4 h-4" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); onAddTask(client); }} title="Add Task" className="p-1.5 text-gray-500 bg-gray-100 rounded-full hover:text-brand-primary hover:bg-brand-light dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                            <TaskIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

interface KanbanColumnProps {
    status: ClientStatus;
    clients: Client[];
    onStartMessage: (client: Client) => void;
    onAddTask: (client: Client) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, clients, onStartMessage, onAddTask }) => {
    return (
        <div className="bg-gray-100 rounded-lg p-3 w-64 md:w-72 flex-shrink-0 dark:bg-gray-900/50">
            <h3 className="font-bold text-gray-700 mb-3 px-1 dark:text-gray-300">{status} ({clients.length})</h3>
            <Droppable droppableId={status}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[200px]"
                    >
                        {clients.map((client, index) => (
                            <KanbanCard 
                                key={client.id} 
                                client={client} 
                                index={index}
                                onStartMessage={onStartMessage}
                                onAddTask={onAddTask} 
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

interface KanbanBoardProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    onStartMessage: (client: Client) => void;
    onAddTask: (client: Client) => void;
    statuses?: ClientStatus[]; // Optional: to show only specific statuses
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ clients, setClients, onStartMessage, onAddTask, statuses }) => {
    const [workflows] = useLocalStorage<Workflow[]>('workflows', []);
    const [, setWorkflowLogs] = useLocalStorage<Activity[]>('workflowLogs', []);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const client = clients.find(c => c.id === draggableId);
        const newStatus = destination.droppableId as ClientStatus;
        if (!client || client.status === newStatus) return;

        // --- Workflow Execution ---
        const { updatedTasks, logs } = executeWorkflows(client, newStatus, workflows);

        setClients(prevClients =>
            prevClients.map(c =>
                c.id === draggableId
                    ? { ...c, status: newStatus, tasks: [...c.tasks, ...updatedTasks] }
                    : c
            )
        );

        if (logs.length > 0) {
            setWorkflowLogs(prevLogs => [...logs, ...prevLogs]);
        }
    };

    const columnsToDisplay = statuses || Object.values(ClientStatus);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {columnsToDisplay.map(status => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        clients={clients.filter(c => c.status === status)}
                        onStartMessage={onStartMessage}
                        onAddTask={onAddTask}
                    />
                ))}
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;