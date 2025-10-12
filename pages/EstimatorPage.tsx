import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, ClientStatus, ActivityType } from '../types';
import { getVolumeEstimate, generateSummaryAndRequirements, VolumeEstimateItem } from '../lib/ai/estimator';
import { MagicWandIcon, CrmIcon, CompletedJobsIcon } from '../components/icons/Icons';

type EstimatorData = {
    name: string;
    email: string;
    phone: string;
    moveDate: string;
    originAddress: string;
    destinationAddress: string;
    inventoryText: string;
    additionalDetails: string;
    estimatedVolume: number;
    keyRequirements: string;
};

const initialState: EstimatorData = {
    name: '',
    email: '',
    phone: '',
    moveDate: new Date().toISOString().split('T')[0],
    originAddress: '',
    destinationAddress: '',
    inventoryText: '3-seater sofa\nDouble bed with mattress\nDining table with 4 chairs\n20 medium boxes',
    additionalDetails: 'We have a piano that needs moving. Access is via a narrow lane.',
    estimatedVolume: 0,
    keyRequirements: '',
};

const EstimatorPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<EstimatorData>(initialState);
    const [volumeItems, setVolumeItems] = useState<VolumeEstimateItem[]>([]);
    const [isEstimating, setIsEstimating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [, setClients] = useLocalStorage<Client[]>('clients', []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGetEstimate = async () => {
        setIsEstimating(true);
        setError(null);
        try {
            const items = await getVolumeEstimate(formData.inventoryText);
            const totalVolume = items.reduce((sum, item) => sum + item.volume, 0);
            setVolumeItems(items);
            setFormData(prev => ({ ...prev, estimatedVolume: Math.round(totalVolume) }));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsEstimating(false);
        }
    };
    
    const handleSubmitEnquiry = async () => {
        setIsEstimating(true); // Reuse loading state for submission
        setError(null);
        try {
            const keyRequirements = await generateSummaryAndRequirements(formData.additionalDetails);

            const newClient: Client = {
                id: `CLI-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                moveDate: formData.moveDate,
                originAddresses: [formData.originAddress],
                destinationAddresses: [formData.destinationAddress],
                status: ClientStatus.Lead,
                createdAt: new Date().toISOString(),
                activities: [{
                    id: `act-${Date.now()}`,
                    type: ActivityType.Note,
                    content: `Lead captured via AI Estimator. Initial volume estimate: ${formData.estimatedVolume} cbft. Client notes summarized as: "${keyRequirements}"`,
                    author: 'AI Estimator',
                    timestamp: new Date().toISOString(),
                }],
                tasks: [],
                accessDetails: { origin: {}, destination: {} },
                estimatedVolume: formData.estimatedVolume,
                keyMoveRequirements: keyRequirements,
                leadSource: 'Website',
            };

            setClients(prev => [newClient, ...prev]);
            setFormData(prev => ({ ...prev, keyRequirements })); // update local state too
            setStep(step + 1); // Move to success step

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsEstimating(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Welcome
                return (
                    <div className="text-center">
                        <MagicWandIcon className="mx-auto h-16 w-16 text-brand-primary" />
                        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">AI Move Estimator</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Get a quick, AI-powered volume estimate for your move in minutes.</p>
                        <button onClick={() => setStep(2)} className="mt-8 primary-btn">Start Estimating</button>
                    </div>
                );
            
            case 2: // Basic Info
                return (
                    <div>
                        <h3 className="form-title">Your Details</h3>
                        <div className="space-y-4">
                            <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                                <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <InputField label="Estimated Move Date" name="moveDate" type="date" value={formData.moveDate} onChange={handleInputChange} />
                            <InputField label="Origin Address" name="originAddress" value={formData.originAddress} onChange={handleInputChange} />
                            <InputField label="Destination Address" name="destinationAddress" value={formData.destinationAddress} onChange={handleInputChange} />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setStep(3)} className="primary-btn">Next: Your Items</button>
                        </div>
                    </div>
                );

            case 3: // Inventory
                return (
                     <div>
                        <h3 className="form-title">Your Items</h3>
                        <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">List the items you need to move. Be as detailed as you like (e.g., "large L-shaped sofa", "king-size bed frame and mattress"). The more detail, the better the estimate.</p>
                        <textarea
                            name="inventoryText"
                            value={formData.inventoryText}
                            onChange={handleInputChange}
                            rows={10}
                            className="form-input"
                            placeholder="e.g.,&#10;1x 3-seater sofa&#10;1x double bed with mattress..."
                        />
                        <button onClick={handleGetEstimate} disabled={isEstimating} className="mt-4 primary-btn w-full flex items-center justify-center space-x-2">
                             <MagicWandIcon />
                             <span>{isEstimating ? 'Estimating...' : 'Get AI Estimate'}</span>
                        </button>

                        {volumeItems.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-lg font-semibold">Estimated Volume: <span className="text-brand-primary">{formData.estimatedVolume} cbft</span></h4>
                                <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Volume (cbft)</th></tr></thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {volumeItems.map((item, i) => <tr key={i}><td className="p-2">{item.item}</td><td className="p-2 text-right">{item.volume}</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                                 <div className="mt-6 flex justify-between">
                                    <button onClick={() => setStep(2)} className="secondary-btn">Back</button>
                                    <button onClick={() => setStep(4)} className="primary-btn">Next: Final Details</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            
            case 4: // Additional Details & Submit
                 return (
                    <div>
                        <h3 className="form-title">Additional Details</h3>
                        <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Is there anything else we should know? Mention access issues, special items, parking restrictions, etc.</p>
                        <textarea
                            name="additionalDetails"
                            value={formData.additionalDetails}
                            onChange={handleInputChange}
                            rows={6}
                            className="form-input"
                        />
                        <div className="mt-6 p-4 bg-brand-light dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-bold text-lg">Your Summary</h4>
                            <p className="text-sm"><strong>Contact:</strong> {formData.name} ({formData.email})</p>
                            <p className="text-sm"><strong>Addresses:</strong> {formData.originAddress} &rarr; {formData.destinationAddress}</p>
                            <p className="text-sm"><strong>Estimated Volume:</strong> {formData.estimatedVolume} cbft</p>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setStep(3)} className="secondary-btn">Back</button>
                            <button onClick={handleSubmitEnquiry} disabled={isEstimating} className="primary-btn flex items-center justify-center space-x-2">
                                <CrmIcon />
                                <span>{isEstimating ? 'Submitting...' : 'Submit Enquiry'}</span>
                            </button>
                        </div>
                    </div>
                );
            
            case 5: // Success
                return (
                     <div className="text-center">
                        <CompletedJobsIcon className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">Enquiry Sent!</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Thank you, {formData.name}. We've received your details and created a new lead record in our system. A member of our team will be in touch shortly.</p>
                        <div className="mt-4 p-4 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                            <p><strong>Lead Ref:</strong> CLI-{Date.now()}</p>
                            <p><strong>Est. Volume:</strong> {formData.estimatedVolume} cbft</p>
                            <p><strong>Key Requirements:</strong> {formData.keyRequirements}</p>
                        </div>
                        <button onClick={() => { setStep(1); setFormData(initialState); setVolumeItems([]); }} className="mt-8 secondary-btn">Start a New Estimate</button>
                    </div>
                );
        }
    };
    
    return (
        <div className="fixed inset-0 z-40 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                        {error && <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>}
                        {renderStep()}
                    </div>
                     <p className="text-center text-sm text-gray-500 mt-4">Powered by ReloPro</p>
                </div>
            </div>
            <style>{`
                .primary-btn { padding: 0.75rem 1.5rem; background-color: #0072BB; color: white; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
                .primary-btn:hover { background-color: #1E91D6; }
                .primary-btn:disabled { background-color: #9ca3af; cursor: not-allowed; }
                .secondary-btn { padding: 0.75rem 1.5rem; background-color: #e5e7eb; color: #1f2937; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
                .secondary-btn:hover { background-color: #d1d5db; }
                .dark .secondary-btn { background-color: #4b5563; color: #f3f4f6; }
                .dark .secondary-btn:hover { background-color: #6b7280; }
                .form-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827; }
                .dark .form-title { color: #f9fafb; }
                .form-input { display: block; width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
                .dark .form-input { background-color: #374151; border-color: #4b5563; color: #f9fafb; }
            `}</style>
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string}> = ({ label, name, value, onChange, type = 'text'}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} required className="form-input" />
    </div>
);

export default EstimatorPage;