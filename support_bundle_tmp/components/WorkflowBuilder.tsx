import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Workflow, WorkflowTriggerType, WorkflowActionType, ClientStatus } from '../types';

interface WorkflowBuilderProps {
    workflows: Workflow[];
    setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ workflows, setWorkflows }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
        name: '',
        trigger: { type: WorkflowTriggerType.ClientStatusChanged, value: ClientStatus.Quoted },
        action: { type: WorkflowActionType.CreateTask, taskDescription: '', taskDueDateDays: 3 },
        isEnabled: true,
    });

    const handleSave = () => {
        if (!newWorkflow.name || !newWorkflow.trigger || !newWorkflow.action) return;

        const workflowToSave: Workflow = {
            id: `wf-${Date.now()}`,
            name: newWorkflow.name,
            trigger: newWorkflow.trigger,
            action: newWorkflow.action,
            isEnabled: newWorkflow.isEnabled,
        };
        setWorkflows(prev => [...prev, workflowToSave]);
        setIsCreating(false);
        setNewWorkflow({ // Reset for next time
            name: '',
            trigger: { type: WorkflowTriggerType.ClientStatusChanged, value: ClientStatus.Quoted },
            action: { type: WorkflowActionType.CreateTask, taskDescription: '', taskDueDateDays: 3 },
            isEnabled: true,
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this workflow?')) {
            setWorkflows(prev => prev.filter(wf => wf.id !== id));
        }
    };
    
    const renderTriggerValue = (wf: Workflow) => {
        if (wf.trigger.type === WorkflowTriggerType.ClientStatusChanged) {
            return `status changes to ${wf.trigger.value}`;
        }
        return '';
    };

    const renderActionValue = (wf: Workflow) => {
        if (wf.action.type === WorkflowActionType.CreateTask) {
            return `create task "${wf.action.taskDescription}" due in ${wf.action.taskDueDateDays} days`;
        }
        return '';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Workflow Automation</h4>
                {!isCreating && (
                     <button onClick={() => setIsCreating(true)} className="text-sm font-semibold text-brand-primary hover:text-brand-secondary">+ New Workflow</button>
                )}
            </div>
             <p className="text-sm text-gray-500 mt-1 mb-4 dark:text-gray-400">
                Automate repetitive tasks. The system will perform actions for you when certain events happen.
            </p>

            {isCreating && (
                <div className="p-4 border rounded-md bg-gray-50 space-y-4 mb-4 dark:bg-gray-900/50 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder="Workflow Name (e.g., 'Quote Follow-up')"
                        value={newWorkflow.name}
                        onChange={(e) => setNewWorkflow(p => ({...p, name: e.target.value}))}
                        className="form-input w-full dark:bg-gray-700 dark:border-gray-600"
                    />
                    {/* Trigger */}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold dark:text-gray-300">When...</span>
                         <select className="form-input dark:bg-gray-700 dark:border-gray-600" value={newWorkflow.trigger?.value} onChange={e => setNewWorkflow(p => ({...p, trigger: {...p.trigger!, value: e.target.value as ClientStatus}}))}>
                            {Object.values(ClientStatus).map(s => <option key={s} value={s}>{`Client status changes to ${s}`}</option>)}
                        </select>
                    </div>
                     {/* Action */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold dark:text-gray-300">Then...</span>
                             <select className="form-input dark:bg-gray-700 dark:border-gray-600" value={newWorkflow.action?.type} disabled>
                                <option value={WorkflowActionType.CreateTask}>Create a task</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            placeholder="Task description (e.g., 'Follow up on quote')"
                            value={newWorkflow.action?.taskDescription}
                            onChange={(e) => setNewWorkflow(p => ({...p, action: {...p.action!, taskDescription: e.target.value}}))}
                            className="form-input w-full ml-12 dark:bg-gray-700 dark:border-gray-600"
                        />
                         <div className="flex items-center gap-2 ml-12">
                             <span className="text-sm dark:text-gray-400">Due in</span>
                             <input
                                type="number"
                                value={newWorkflow.action?.taskDueDateDays}
                                onChange={(e) => setNewWorkflow(p => ({...p, action: {...p.action!, taskDueDateDays: parseInt(e.target.value, 10) || 0}}))}
                                className="form-input w-20 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm dark:text-gray-400">days.</span>
                         </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-sm bg-white border rounded-md dark:bg-gray-600 dark:border-gray-500">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1 text-sm bg-brand-primary text-white rounded-md">Save Workflow</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {workflows.map(wf => (
                     <div key={wf.id} className="p-3 border rounded-md flex justify-between items-center bg-white dark:bg-gray-800 dark:border-gray-700">
                        <div>
                            <p className="font-bold dark:text-gray-200">{wf.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold">When:</span> {renderTriggerValue(wf)}
                                <span className="font-semibold ml-2">Then:</span> {renderActionValue(wf)}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Toggle switch can be added here later */}
                            <button onClick={() => handleDelete(wf.id)} className="text-sm font-semibold text-red-600">Delete</button>
                        </div>
                    </div>
                ))}
                 {workflows.length === 0 && !isCreating && <p className="text-center text-gray-400 italic py-4">No workflows created yet.</p>}
            </div>
        </div>
    );
};

export default WorkflowBuilder;