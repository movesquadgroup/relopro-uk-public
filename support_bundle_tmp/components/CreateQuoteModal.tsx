import React, { useState, useMemo, useEffect } from 'react';
import { Client, Quote, QuoteLineItem, QuoteStatus, TariffSettings } from '../types';
import { CloseIcon } from './icons/Icons';

interface CreateQuoteModalProps {
    onClose: () => void;
    onSave: (quote: Omit<Quote, 'id'>) => void;
    client?: Client;
    allClients: Client[];
    tariffSettings: TariffSettings;
}

const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({ onClose, onSave, client, allClients, tariffSettings }) => {
    const [step, setStep] = useState(1);
    const [selectedClientId, setSelectedClientId] = useState<string | undefined>(client?.id);
    const [jobDetails, setJobDetails] = useState({ volume: 0, distance: 0, laborHours: 0 });
    const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    });

    const selectedClient = useMemo(() => allClients.find(c => c.id === selectedClientId), [selectedClientId, allClients]);

    const baseCost = useMemo(() => {
        const volumeCost = (jobDetails.volume || 0) * (tariffSettings.ratePerVolume || 0);
        const distanceCost = (jobDetails.distance || 0) * (tariffSettings.ratePerDistance || 0);
        const laborCost = (jobDetails.laborHours || 0) * (tariffSettings.ratePerHour || 0);
        return volumeCost + distanceCost + laborCost;
    }, [jobDetails, tariffSettings]);

    useEffect(() => {
        const baseLineItem: QuoteLineItem = {
            id: 'base-service',
            // FIX: Corrected typo from `job.details.laborHours` to `jobDetails.laborHours`.
            description: `Standard Move (${jobDetails.volume} m³, ${jobDetails.distance} miles, ${jobDetails.laborHours} hrs)`,
            quantity: 1,
            unitPrice: baseCost,
            total: baseCost,
        };
        const otherItems = lineItems.filter(item => item.id !== 'base-service');
        if (baseCost > 0) {
            setLineItems([baseLineItem, ...otherItems]);
        } else {
            setLineItems(otherItems);
        }
    }, [baseCost, jobDetails]);


    const total = useMemo(() => lineItems.reduce((acc, item) => acc + item.total, 0), [lineItems]);

    const addLineItem = (type: 'material' | 'custom') => {
        if (type === 'material') {
            const firstMaterial = tariffSettings.materials[0];
            if (!firstMaterial) return;
            setLineItems([...lineItems, {
                id: `mat-${Date.now()}`,
                description: firstMaterial.name,
                quantity: 1,
                unitPrice: firstMaterial.price,
                total: firstMaterial.price,
            }]);
        } else {
             setLineItems([...lineItems, {
                id: `custom-${Date.now()}`,
                description: '',
                quantity: 1,
                unitPrice: 0,
                total: 0,
            }]);
        }
    };
    
    const updateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
        const newLineItems = [...lineItems];
        const item = { ...newLineItems[index] };
        
        if (field === 'description') {
            item.description = value as string;
            const material = tariffSettings.materials.find(m => m.name === value);
            if (material) {
                item.unitPrice = material.price;
            }
        } else if (field === 'quantity') {
            item.quantity = Number(value);
        } else if (field === 'unitPrice') {
            item.unitPrice = Number(value);
        }
        
        item.total = item.quantity * item.unitPrice;
        newLineItems[index] = item;
        setLineItems(newLineItems);
    };
    
    const removeLineItem = (id: string) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    }

    const handleSave = () => {
        if (!selectedClient) {
            alert("Please select a client.");
            return;
        }
        onSave({
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            quoteDate,
            expiryDate,
            total,
            status: QuoteStatus.Draft,
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client</label>
                            <select
                                id="client"
                                value={selectedClientId || ''}
                                onChange={e => setSelectedClientId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                                disabled={!!client}
                            >
                                <option value="" disabled>Select a client</option>
                                {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        {/* FIX: Use `originAddresses[0]` and `destinationAddresses[0]` as per the Client type definition. */}
                        {selectedClient && <p className="text-sm text-gray-500">{(selectedClient.originAddresses || [])[0]} → {(selectedClient.destinationAddresses || [])[0]}</p>}
                        <h4 className="font-semibold pt-4">Job Details</h4>
                        <div className="grid grid-cols-3 gap-4">
                             <InputField label="Volume (m³)" type="number" value={jobDetails.volume} onChange={e => setJobDetails(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0 }))} />
                             <InputField label="Distance (miles)" type="number" value={jobDetails.distance} onChange={e => setJobDetails(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))} />
                             <InputField label="Labor (hours)" type="number" value={jobDetails.laborHours} onChange={e => setJobDetails(prev => ({ ...prev, laborHours: parseFloat(e.target.value) || 0 }))} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Services & Line Items</h4>
                             <div className="space-x-2">
                                <button onClick={() => addLineItem('material')} className="text-sm font-semibold text-brand-primary hover:text-brand-secondary">+ Add Material</button>
                                <button onClick={() => addLineItem('custom')} className="text-sm font-semibold text-brand-primary hover:text-brand-secondary">+ Add Custom</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                        {lineItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6">
                                    {item.id.startsWith('mat-') ? (
                                        <select value={item.description} onChange={e => updateLineItem(index, 'description', e.target.value)} className="w-full form-input">
                                            {tariffSettings.materials.map(mat => <option key={mat.id} value={mat.name}>{mat.name}</option>)}
                                        </select>
                                    ) : (
                                        <input type="text" value={item.description} onChange={e => updateLineItem(index, 'description', e.target.value)} className="w-full form-input" disabled={item.id === 'base-service'} />
                                    )}
                                </div>
                                <div className="col-span-2"><input type="number" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', e.target.value)} className="w-full form-input" disabled={item.id === 'base-service'} /></div>
                                <div className="col-span-2"><input type="number" value={item.unitPrice} onChange={e => updateLineItem(index, 'unitPrice', e.target.value)} className="w-full form-input" disabled={item.id === 'base-service'} /></div>
                                <div className="col-span-1 text-right font-medium">{item.total.toFixed(2)}</div>
                                <div className="col-span-1">{item.id !== 'base-service' && <button onClick={() => removeLineItem(item.id)} className="text-gray-400 hover:text-red-600"><CloseIcon/></button>}</div>
                            </div>
                        ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                     <div>
                        <h4 className="font-semibold text-lg mb-2">Quote Summary</h4>
                        <p><strong>Client:</strong> {selectedClient?.name}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <InputField label="Quote Date" type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} />
                            <InputField label="Expiry Date" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                        </div>
                        <div className="mt-4 border-t pt-4">
                            {lineItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm py-1">
                                    <span>{item.description} (x{item.quantity})</span>
                                    <span>£{item.total.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-lg font-bold mt-2 border-t pt-2">
                                <span>Total</span>
                                <span>£{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 transform transition-all">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">Create New Quote</h3>
                        <p className="text-sm text-gray-500 mt-1">Step {step} of 3 - {step === 1 ? 'Job Details' : step === 2 ? 'Services & Materials' : 'Review & Finalize'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><CloseIcon /></button>
                </div>
                
                <div className="p-6 min-h-[300px]">{renderStep()}</div>
                
                <div className="flex justify-between items-center p-6 bg-gray-50 rounded-b-lg">
                    <div>
                        {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm">Back</button>}
                    </div>
                    <div className="flex items-center space-x-3">
                         <span className="text-xl font-bold">Total: £{total.toFixed(2)}</span>
                        {step < 3 && <button onClick={() => setStep(s => s + 1)} disabled={!selectedClientId} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm disabled:bg-gray-400">Next</button>}
                        {step === 3 && <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm">Save as Draft</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string}> = ({label, value, onChange, type="text"}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} value={value} onChange={onChange} className="mt-1 block w-full form-input" step={type === 'number' ? 'any' : undefined} />
    </div>
);

const FormInput: React.FC<{value: any, onChange: any, type?:string, disabled?: boolean}> = ({value, onChange, type, disabled}) => (
    <input 
        type={type || 'text'} 
        value={value} 
        onChange={onChange} 
        disabled={disabled}
        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm disabled:bg-gray-100"
    />
);


export default CreateQuoteModal;