import React, { useState } from 'react';
import { StorageUnit, Client } from '../types';
import { CloseIcon } from './icons/Icons';

interface AddStorageUnitModalProps {
    onClose: () => void;
    onSave: (unitData: Omit<StorageUnit, 'id' | 'clientName' | 'inventory'>) => void;
    clients: Client[];
}

const AddStorageUnitModal: React.FC<AddStorageUnitModalProps> = ({ onClose, onSave, clients }) => {
    const [formData, setFormData] = useState({
        clientId: '',
        moveInDate: new Date().toISOString().split('T')[0],
        nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        volumeCubicFeet: 0,
        monthlyRate: 0,
        status: 'Active' as 'Active' | 'Pending' | 'Vacated',
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all dark:bg-gray-800">
                <form onSubmit={handleSubmit}>
                     <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add New Storage Unit</h3>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><CloseIcon /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <SelectField label="Client" name="clientId" value={formData.clientId} onChange={e => setFormData(p => ({...p, clientId: e.target.value}))} options={clients.map(c => ({ value: c.id, label: c.name }))} required/>
                        <InputField label="Move-In Date" name="moveInDate" type="date" value={formData.moveInDate} onChange={e => setFormData(p => ({...p, moveInDate: e.target.value}))} required />
                        <InputField label="Volume (cbft)" name="volumeCubicFeet" type="number" value={String(formData.volumeCubicFeet)} onChange={e => setFormData(p => ({...p, volumeCubicFeet: parseFloat(e.target.value) || 0}))} />
                        <InputField label="Monthly Rate (£)" name="monthlyRate" type="number" value={String(formData.monthlyRate)} onChange={e => setFormData(p => ({...p, monthlyRate: parseFloat(e.target.value) || 0}))} />
                        <InputField label="First Billing Date" name="nextBillingDate" type="date" value={formData.nextBillingDate} onChange={e => setFormData(p => ({...p, nextBillingDate: e.target.value}))} required />
                    </div>
                    <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm">Save Unit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean}> = ({ label, name, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
    </div>
);

const SelectField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {value: string, label: string}[], required?: boolean}> = ({ label, name, value, onChange, options, required }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label} {required && <span className="text-red-500">*</span>}</label>
        <select id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
            <option value="" disabled>Select...</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

export default AddStorageUnitModal;
