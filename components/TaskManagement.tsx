import React, { useState } from 'react';
import { Task } from '../types';

interface TaskManagementProps {
    tasks: Task[];
    onAddTask: (description: string, dueDate: string) => void;
    onToggleTask: (taskId: string) => void;
    suggestedTasks: Task[];
    onAcceptSuggestion: (task: Task) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ tasks, onAddTask, onToggleTask, suggestedTasks, onAcceptSuggestion }) => {
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTask(description, dueDate);
        setDescription('');
        setDueDate('');
        setShowForm(false);
    };
    
    const committedTasks = tasks.filter(t => !t.isSuggested);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
             <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-gray-800">Tasks</h3>
                <button onClick={() => setShowForm(!showForm)} className="text-sm font-semibold text-brand-primary hover:text-brand-secondary">
                    {showForm ? '- Cancel' : '+ Add Task'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4 space-y-3 p-3 bg-gray-50 rounded-md">
                    <div>
                        <label htmlFor="task-desc" className="sr-only">Task Description</label>
                        <input
                            id="task-desc"
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g., Follow up on quote"
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            required
                        />
                    </div>
                    <div>
                         <label htmlFor="task-due" className="sr-only">Due Date</label>
                         <input
                            id="task-due"
                            type="date"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-1.5 bg-brand-primary text-white text-sm rounded-lg hover:bg-brand-secondary font-semibold shadow">
                        Save Task
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {committedTasks.map(task => (
                    <div key={task.id} className="flex items-start">
                        <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => onToggleTask(task.id)}
                            className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-accent mt-0.5"
                        />
                        <div className="ml-3 text-sm">
                            <label className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.description}
                            </label>
                            <p className="text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
                {committedTasks.length === 0 && !showForm && <p className="text-center text-sm text-gray-500 py-4">No tasks for this client.</p>}
            </div>

            {suggestedTasks.length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">AI Suggestions</h4>
                    <div className="space-y-3">
                        {suggestedTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-brand-light rounded-md">
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">{task.description}</p>
                                    <p className="text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => onAcceptSuggestion(task)}
                                    className="px-2 py-1 text-xs font-semibold bg-white border border-brand-primary text-brand-primary rounded hover:bg-brand-primary hover:text-white"
                                >
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManagement;