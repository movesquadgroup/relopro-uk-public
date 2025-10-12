import React, { useState } from 'react';
import { StaffMember, StaffRole } from '../types';

interface AddStaffModalProps {
    onClose: () => void;
    onSave: (staff: Omit<StaffMember, 'id' | 'status'>) => void;
}

type StaffFormData = Omit<StaffMember, 'id' | 'status' | 'role'> & { role: StaffRole };

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState<StaffFormData>({
        name: '',
        email: '',
        phone: '',
        role: StaffRole.Porter,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof StaffFormData, string>> = {};
        if (!formData.name) newErrors.name = 'Full name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof StaffFormData]) {
             setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold text-gray-800">Add New Staff Member</h3>
                        <p className="text-sm text-gray-500 mt-1">Enter the details for the new user.</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                        <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                        <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} required />
                        
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                            >
                                {Object.values(StaffRole).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors font-semibold shadow-md text-sm"
                        >
                            Save Staff Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Reusable InputField component
interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', required = false, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);


export default AddStaffModal;