import React, { useState, useEffect, useMemo } from 'react';
import { DiaryEvent, Client, StaffMember, Vehicle, StaffRole } from '../types';
import { CloseIcon } from './icons/Icons';

interface AddJobModalProps {
    onClose: () => void;
    onSave: (jobData: Omit<DiaryEvent, 'id' | 'activityType'>) => void;
    clients: Client[];
    staff: StaffMember[];
    vehicles: Vehicle[];
    selectedDate: Date;
}

type JobFormData = {
    clientId: string;
    start: string;
    end: string;
    originAddress: string;
    destinationAddress: string;
    assignedStaffIds: string[];
    assignedVehicleIds: string[];
    service: string;
    volumeCubicFeet: number;
    dismantlingNotes: string;
    materialsNotes: string;
};

const AddJobModal: React.FC<AddJobModalProps> = ({ onClose, onSave, clients, staff, vehicles, selectedDate }) => {
    const [formData, setFormData] = useState<JobFormData>({
        clientId: '',
        start: '',
        end: '',
        originAddress: '',
        destinationAddress: '',
        assignedStaffIds: [],
        assignedVehicleIds: [],
        service: '',
        volumeCubicFeet: 0,
        dismantlingNotes: '',
        materialsNotes: '',
    });

    useEffect(() => {
        const dateString = selectedDate.toISOString().split('T')[0];
        setFormData(prev => ({
            ...prev,
            start: `${dateString}T08:00`,
            end: `${dateString}T17:00`,
        }));
    }, [selectedDate]);

    const handleClientChange = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        setFormData(prev => ({
            ...prev,
            clientId,
            // FIX: Use `originAddresses[0]` and `destinationAddresses[0]` as per the Client type.
            originAddress: client?.originAddresses[0] || '',
            destinationAddress: client?.destinationAddresses[0] || '',
        }));
    };

    const handleStaffSelect = (staffId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedStaffIds: prev.assignedStaffIds.includes(staffId)
                ? prev.assignedStaffIds.filter(id => id !== staffId)
                : [...prev.assignedStaffIds, staffId],
        }));
    };
    
    const handleVehicleSelect = (vehicleId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedVehicleIds: prev.assignedVehicleIds.includes(vehicleId)
                ? prev.assignedVehicleIds.filter(id => id !== vehicleId)
                : [...prev.assignedVehicleIds, vehicleId],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId) {
            alert('Please select a client.');
            return;
        }
        const selectedClient = clients.find(c => c.id === formData.clientId);
        if (!selectedClient) return;

        onSave({
            title: selectedClient.name,
            ...formData,
            volumeCubicFeet: Number(formData.volumeCubicFeet),
        });
    };
    
    const drivers = useMemo(() => staff.filter(s => s.role === StaffRole.Driver), [staff]);
    const porters = useMemo(() => staff.filter(s => s.role === StaffRole.Porter), [staff]);


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">Schedule New Job</h3>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><CloseIcon /></button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Core Details */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client <span className="text-red-500">*</span></label>
                                <select id="client" value={formData.clientId} onChange={e => handleClientChange(e.target.value)} className="mt-1 form-input w-full" required>
                                    <option value="" disabled>Select a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Start Time" type="datetime-local" value={formData.start} onChange={e => setFormData(p => ({...p, start: e.target.value}))} />
                                <InputField label="End Time" type="datetime-local" value={formData.end} onChange={e => setFormData(p => ({...p, end: e.target.value}))} />
                            </div>
                            
                            <InputField label="Origin Address" value={formData.originAddress} onChange={e => setFormData(p => ({...p, originAddress: e.target.value}))} />
                            <InputField label="Destination Address" value={formData.destinationAddress} onChange={e => setFormData(p => ({...p, destinationAddress: e.target.value}))} />
                           
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Service Type" placeholder="e.g., SIRVA, Private" value={formData.service} onChange={e => setFormData(p => ({...p, service: e.target.value}))} />
                                <InputField label="Volume (cbft)" type="number" value={String(formData.volumeCubicFeet)} onChange={e => setFormData(p => ({...p, volumeCubicFeet: parseInt(e.target.value, 10) || 0}))} />
                            </div>
                             <div>
                                <label htmlFor="dismantlingNotes" className="block text-sm font-medium text-gray-700">Dismantling Notes</label>
                                <textarea id="dismantlingNotes" rows={2} className="mt-1 form-input w-full" value={formData.dismantlingNotes} onChange={e => setFormData(p => ({...p, dismantlingNotes: e.target.value}))}></textarea>
                            </div>
                             <div>
                                <label htmlFor="materialsNotes" className="block text-sm font-medium text-gray-700">Materials Notes</label>
                                <textarea id="materialsNotes" rows={2} className="mt-1 form-input w-full" value={formData.materialsNotes} onChange={e => setFormData(p => ({...p, materialsNotes: e.target.value}))}></textarea>
                            </div>
                        </div>

                        {/* Right Column: Resource Allocation */}
                        <div className="space-y-4">
                            <ResourceSelector title="Assign Drivers" items={drivers} selectedIds={formData.assignedStaffIds} onSelect={handleStaffSelect} />
                            <ResourceSelector title="Assign Porters" items={porters} selectedIds={formData.assignedStaffIds} onSelect={handleStaffSelect} />
                            <ResourceSelector title="Assign Vehicles" items={vehicles.map(v => ({id: v.id, name: `${v.registration} (${v.type})`}))} selectedIds={formData.assignedVehicleIds} onSelect={handleVehicleSelect} />
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm">Save Job</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string}> = ({label, value, onChange, type="text", placeholder}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 form-input w-full" />
    </div>
);

interface ResourceSelectorProps {
    title: string;
    items: { id: string, name: string }[];
    selectedIds: string[];
    onSelect: (id: string) => void;
}
const ResourceSelector: React.FC<ResourceSelectorProps> = ({ title, items, selectedIds, onSelect }) => (
    <div className="p-3 border rounded-md">
        <h4 className="font-semibold text-sm text-gray-800 mb-2">{title}</h4>
        <div className="max-h-32 overflow-y-auto space-y-1">
            {items.map(item => (
                <label key={item.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" className="form-checkbox" checked={selectedIds.includes(item.id)} onChange={() => onSelect(item.id)} />
                    <span className="text-sm text-gray-700">{item.name}</span>
                </label>
            ))}
        </div>
    </div>
);

// Minimalistic form-input styling to be used with TailwindCSS. Add this to a global CSS or a style tag if not already present.
const FormInputStyles = `
.form-input {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #1f2937;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
}
.form-checkbox {
    border-radius: 0.25rem;
    border-color: #d1d5db;
    color: #1e3a8a;
}
.form-checkbox:focus {
    ring-offset: 0;
    ring: #3b82f6;
}
`;
// In a real app, this would go into a CSS file. For this environment, we can inject it or rely on similar existing styles.
// Since we are using Tailwind CDN, these classes should mostly work out of the box. I will add a style tag for form-input in index.html for robustness.
// For now, let's assume Tailwind's form plugin or equivalent custom forms styling is active.

export default AddJobModal;