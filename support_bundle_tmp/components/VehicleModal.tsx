import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, StaffMember, StaffRole } from '../types';
import { CloseIcon } from './icons/Icons';

interface VehicleModalProps {
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
    vehicleToEdit?: Vehicle;
    allStaff: StaffMember[];
}

const emptyVehicle: Omit<Vehicle, 'id'> = {
    registration: '',
    type: '',
    status: 'Available',
    volumeCubicFeet: 0,
    motDueDate: '',
    serviceDueDate: '',
    color: '',
    dimensionsFeet: { length: 0, width: 0, height: 0 },
    dimensionsMeters: { length: 0, width: 0, height: 0 },
    assignedDriverIds: [],
    thumbnailUrl: '',
    costPerMile: 0,
};

const VehicleModal: React.FC<VehicleModalProps> = ({ onClose, onSave, vehicleToEdit, allStaff }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(() => vehicleToEdit || emptyVehicle);

    useEffect(() => {
        if (vehicleToEdit) {
            setFormData(vehicleToEdit);
        } else {
            setFormData(emptyVehicle);
        }
    }, [vehicleToEdit]);
    
    const drivers = useMemo(() => allStaff.filter(s => s.role === StaffRole.Driver && s.status === 'Active'), [allStaff]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };
    
    const handleDimensionChange = (unit: 'Feet' | 'Meters', dim: 'length' | 'width' | 'height', value: string) => {
        const numValue = parseFloat(value) || 0;
        const key = `dimensions${unit}` as 'dimensionsFeet' | 'dimensionsMeters';
        setFormData(prev => ({
            ...prev,
            [key]: { ...prev[key], [dim]: numValue }
        }));
    };

    const handleDriverSelect = (driverId: string) => {
        setFormData(prev => {
            const newAssignedIds = prev.assignedDriverIds.includes(driverId)
                ? prev.assignedDriverIds.filter(id => id !== driverId)
                : [...prev.assignedDriverIds, driverId];
            return { ...prev, assignedDriverIds: newAssignedIds };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicleData: Vehicle = {
            ...formData,
            id: vehicleToEdit?.id || '', // ID will be managed by parent
        };
        onSave(vehicleData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {vehicleToEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </h3>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><CloseIcon /></button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Details */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Registration" name="registration" value={formData.registration} onChange={handleChange} required />
                                <InputField label="Vehicle Type" name="type" placeholder="e.g., 3.5T Luton" value={formData.type} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 form-input w-full">
                                        <option value="Available">Available</option>
                                        <option value="In Use">In Use</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <InputField label="Color" name="color" value={formData.color} onChange={handleChange} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <InputField label="MOT Due Date" name="motDueDate" type="date" value={formData.motDueDate} onChange={handleChange} />
                                <InputField label="Service Due Date" name="serviceDueDate" type="date" value={formData.serviceDueDate} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Volume (cbft)" name="volumeCubicFeet" type="number" value={String(formData.volumeCubicFeet)} onChange={handleChange} />
                                <InputField label="Cost per Mile (£)" name="costPerMile" type="number" value={String(formData.costPerMile || 0)} onChange={handleChange} />
                            </div>
                            <InputField label="Thumbnail Image URL" name="thumbnailUrl" placeholder="https://example.com/image.png" value={formData.thumbnailUrl} onChange={handleChange} />

                            {/* Dimensions */}
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Dimensions</h4>
                                <div className="p-4 border rounded-md space-y-3 bg-gray-50">
                                    <DimensionInputs unit="Meters" values={formData.dimensionsMeters} onChange={handleDimensionChange} />
                                    <DimensionInputs unit="Feet" values={formData.dimensionsFeet} onChange={handleDimensionChange} />
                                </div>
                            </div>
                        </div>

                        {/* Driver Assignment */}
                        <div className="p-4 border rounded-md bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-2 border-b pb-2">Assignable Drivers</h4>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {drivers.map(driver => (
                                    <label key={driver.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={formData.assignedDriverIds.includes(driver.id)}
                                            onChange={() => handleDriverSelect(driver.id)}
                                        />
                                        <span className="text-sm font-medium text-gray-800">{driver.name}</span>
                                    </label>
                                ))}
                                 {drivers.length === 0 && <p className="text-sm text-gray-500 p-2">No active drivers found in Staff.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm">Save Vehicle</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Sub-components for the Modal Form ---

interface InputFieldProps {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string; placeholder?: string; required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', placeholder, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="mt-1 form-input w-full" step={type === 'number' ? 'any' : undefined} />
    </div>
);


interface DimensionInputsProps {
    unit: 'Meters' | 'Feet';
    values: { length: number; width: number; height: number; };
    onChange: (unit: 'Meters' | 'Feet', dim: 'length' | 'width' | 'height', value: string) => void;
}

const DimensionInputs: React.FC<DimensionInputsProps> = ({ unit, values, onChange }) => (
    <div className="grid grid-cols-4 gap-2 items-center">
        <label className="text-sm font-medium text-gray-600 col-span-1">{unit}:</label>
        <input type="number" placeholder="L" value={values.length || ''} onChange={e => onChange(unit, 'length', e.target.value)} className="form-input w-full text-sm" />
        <input type="number" placeholder="W" value={values.width || ''} onChange={e => onChange(unit, 'width', e.target.value)} className="form-input w-full text-sm" />
        <input type="number" placeholder="H" value={values.height || ''} onChange={e => onChange(unit, 'height', e.target.value)} className="form-input w-full text-sm" />
    </div>
);

// Add to index.html or a global CSS file for form styling
// <style>
// .form-input { appearance: none; background-color: #fff; border-color: #d1d5db; border-width: 1px; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 1rem; line-height: 1.5rem; }
// .form-input:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
// .form-checkbox { border-radius: 0.25rem; border-color: #d1d5db; color: #1e3a8a; }
// </style>
export default VehicleModal;