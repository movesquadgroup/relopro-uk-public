import React from 'react';
import { AccessDetails, PropertyAccessDetails } from '../types';

interface AccessFormProps {
    accessDetails: AccessDetails;
    onChange: (newDetails: AccessDetails) => void;
}

const AccessForm: React.FC<AccessFormProps> = ({ accessDetails, onChange }) => {
    
    const handleDetailChange = (
        location: 'origin' | 'destination', 
        field: keyof PropertyAccessDetails, 
        value: string | number
    ) => {
        const newDetails: AccessDetails = JSON.parse(JSON.stringify(accessDetails)); // Deep copy
        
        if (!newDetails[location]) {
            newDetails[location] = {};
        }

        // @ts-ignore
        newDetails[location][field] = value;
        onChange(newDetails);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 dark:text-gray-200 dark:border-gray-700">Property Access Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PropertyAccessFields 
                    title="Origin Access"
                    details={accessDetails.origin}
                    onChange={(field, value) => handleDetailChange('origin', field, value)}
                />
                <PropertyAccessFields 
                    title="Destination Access"
                    details={accessDetails.destination}
                    onChange={(field, value) => handleDetailChange('destination', field, value)}
                />
            </div>
        </div>
    );
};


interface PropertyAccessFieldsProps {
    title: string;
    details: Partial<PropertyAccessDetails>;
    onChange: (field: keyof PropertyAccessDetails, value: string | number) => void;
}

const PropertyAccessFields: React.FC<PropertyAccessFieldsProps> = ({ title, details, onChange }) => {
    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border dark:bg-gray-700/50 dark:border-gray-600">
            <h4 className="font-bold text-gray-700 dark:text-gray-200">{title}</h4>
            
            <TextareaField 
                label="Vehicle Access Notes"
                placeholder="e.g., Low bridge (4m), narrow country lanes, ULEZ zone..."
                value={details.vehicleAccessNotes || ''}
                onChange={(e) => onChange('vehicleAccessNotes', e.target.value)}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parking</label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                    <select 
                        className="form-input dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200" 
                        value={details.parkingType || 'None'}
                        onChange={(e) => onChange('parkingType', e.target.value)}
                    >
                        <option value="None">None</option>
                        <option value="Permit">Permit Required</option>
                        <option value="Private">Private Driveway</option>
                        <option value="Metered">Metered Bay</option>
                    </select>
                    <InputField 
                        label="Long Carry (meters)"
                        type="number"
                        placeholder="e.g., 25"
                        value={String(details.longCarryDistance || '')}
                        onChange={(e) => onChange('longCarryDistance', parseInt(e.target.value, 10) || 0)}
                        srOnlyLabel
                    />
                </div>
            </div>
             <TextareaField 
                label="Parking Notes"
                placeholder="e.g., Permit to be provided by client, park in bay 23..."
                value={details.parkingNotes || ''}
                onChange={(e) => onChange('parkingNotes', e.target.value)}
            />

            <TextareaField 
                label="Property Entry Notes"
                placeholder="e.g., 3 flights of stairs, narrow doorway to kitchen, lift available (dims: 2x2x2.5m)..."
                value={details.propertyEntryNotes || ''}
                onChange={(e) => onChange('propertyEntryNotes', e.target.value)}
            />
             <TextareaField 
                label="Internal Navigation Notes"
                placeholder="e.g., Tight 90-degree turn on first floor landing..."
                value={details.internalNavigationNotes || ''}
                onChange={(e) => onChange('internalNavigationNotes', e.target.value)}
            />

        </div>
    );
};

const TextareaField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder?: string}> = ({label, value, onChange, placeholder}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <textarea
            rows={3}
            className="mt-1 form-input w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
);

const InputField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, srOnlyLabel?: boolean}> = ({label, value, onChange, type="text", placeholder, srOnlyLabel}) => (
    <div>
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${srOnlyLabel ? 'sr-only' : ''}`}>{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="mt-1 form-input w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200" 
        />
    </div>
);

// Minimalistic form-input styling to be used with TailwindCSS.
// Add this to a global CSS or a style tag if not already present.
// .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
// .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }

export default AccessForm;