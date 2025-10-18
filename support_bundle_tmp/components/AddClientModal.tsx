import React, { useState, useMemo } from 'react';
import { Client, ClientStatus, StaffMember } from '../types';

interface AddClientModalProps {
    onClose: () => void;
    onSave: (client: Omit<Client, 'id' | 'createdAt' | 'activities' | 'tasks' | 'accessDetails'>) => void;
    staff: StaffMember[];
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSave, staff }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        secondaryPhone: '',
        companyName: '',
        jobTitle: '',
        moveDate: new Date().toISOString().split('T')[0],
        originAddress: '',
        destinationAddress: '',
        status: ClientStatus.Lead,
        moveCoordinatorId: '',
    });

    const activeStaff = useMemo(() => staff.filter(s => s.status === 'Active'), [staff]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { originAddress, destinationAddress, ...rest } = formData;
        onSave({
            ...rest,
            originAddresses: [originAddress],
            destinationAddresses: [destinationAddress],
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 transform transition-all dark:bg-gray-800">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add New Client</h3>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Enter the details for the new client.</p>
                    </div>

                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            <InputField label="Primary Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Company Name" name="companyName" value={formData.companyName || ''} onChange={handleChange} />
                            <InputField label="Job Title" name="jobTitle" value={formData.jobTitle || ''} onChange={handleChange} />
                        </div>
                        <InputField label="Secondary Phone" name="secondaryPhone" type="tel" value={formData.secondaryPhone || ''} onChange={handleChange} />
                        <SelectField
                            label="Move Coordinator"
                            name="moveCoordinatorId"
                            value={formData.moveCoordinatorId || ''}
                            onChange={handleChange}
                            options={activeStaff.map(s => ({ value: s.id, label: s.name }))}
                        />
                        <hr className="my-2 dark:border-gray-600"/>
                        <InputField label="Move Date" name="moveDate" type="date" value={formData.moveDate} onChange={handleChange} required />
                        <InputField label="Origin Address" name="originAddress" value={formData.originAddress} onChange={handleChange} required />
                        <InputField label="Destination Address" name="destinationAddress" value={formData.destinationAddress} onChange={handleChange} required />
                        <SelectField
                            label="Initial Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            options={Object.values(ClientStatus).map(s => ({ value: s, label: s }))}
                        />
                    </div>

                    <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors font-semibold shadow-md text-sm"
                        >
                            Save Client
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Reusable InputField component
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

// Reusable SelectField component
const SelectField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {value: string, label: string}[]}> = ({ label, name, value, onChange, options }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
            <option value="">Select...</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


export default AddClientModal;