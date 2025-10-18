import React, { useState } from 'react';
import { Client } from '../types';

interface AddTaskModalProps {
    onClose: () => void;
    onSave: (description: string, dueDate: string) => void;
    client: Client;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ onClose, onSave, client }) => {
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !dueDate) {
            alert("Please fill out all fields.");
            return;
        }
        onSave(description, dueDate);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all dark:bg-gray-800">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add Task for {client.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Create a new task for this client.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <InputField label="Task Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        <InputField label="Due Date" name="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                    </div>
                    <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm">Save Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean}> = ({ label, name, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        />
    </div>
);

export default AddTaskModal;
