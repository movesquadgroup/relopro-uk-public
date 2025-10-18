import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StorageUnit, Client, RecurringInvoice } from '../types';
import { CloseIcon, CostingIcon } from '../components/icons/Icons';
import { generateNextInvoice } from '../lib/storage/billing';
import { features } from '../lib/featureFlags';
import { lazyIfEnabled, safeImport } from '../lib/lazy';

const AddStorageUnitModal = lazyIfEnabled(
  features.storageModuleEnabled,
  () => safeImport('../components/AddStorageUnitModal')
);

const mockStorageUnits: StorageUnit[] = [
    {
        id: 'SU-001',
        clientId: 'CLI003',
        clientName: 'Charlie Brown',
        moveInDate: '2024-06-15',
        volumeCubicFeet: 250,
        monthlyRate: 150.00,
        status: 'Active',
        nextBillingDate: '2024-11-15',
        inventory: [
            { id: 'item-1', description: '20 medium boxes', quantity: 1 },
            { id: 'item-2', description: 'Office chair', quantity: 1 },
        ],
    },
    {
        id: 'SU-002',
        clientId: 'CLI006',
        clientName: 'Fiona Glenanne',
        moveInDate: '2024-07-01',
        volumeCubicFeet: 150,
        monthlyRate: 95.00,
        status: 'Active',
        nextBillingDate: '2024-11-01',
        inventory: [
            { id: 'item-3', description: 'Artwork collection (5 pieces)', quantity: 1 },
            { id: 'item-4', description: 'Antique desk', quantity: 1 },
        ],
    },
];

const StoragePage: React.FC = () => {
    const [storageUnits, setStorageUnits] = useLocalStorage<StorageUnit[]>('storageUnits', mockStorageUnits);
    const [clients] = useLocalStorage<Client[]>('clients', []);
    const [activeTab, setActiveTab] = useState<'inventory' | 'billing'>('inventory');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveUnit = (unitData: Omit<StorageUnit, 'id' | 'clientName' | 'inventory'>) => {
        const client = clients.find(c => c.id === unitData.clientId);
        if (!client) {
            alert('Selected client not found.');
            return;
        }

        const newUnit: StorageUnit = {
            ...unitData,
            id: `SU-${Date.now()}`,
            clientName: client.name,
            inventory: [], // Start with empty inventory
        };
        setStorageUnits(prev => [newUnit, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Storage Management</h3>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">Manage containerized storage, inventory, and recurring billing.</p>
                </div>
                {activeTab === 'inventory' && (
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center">
                        + Add New Storage Unit
                    </button>
                )}
            </div>

            <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <TabButton name="Storage Units" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                    <TabButton name="Recurring Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'inventory' && <StorageUnitsTable units={storageUnits} />}
                {activeTab === 'billing' && <BillingOverview units={storageUnits} />}
            </div>

            {features.storageModuleEnabled && isModalOpen && <AddStorageUnitModal onClose={() => setIsModalOpen(false)} onSave={handleSaveUnit} clients={clients} />}
        </div>
    );
};

const TabButton: React.FC<{ name: string; active: boolean; onClick: () => void }> = ({ name, active, onClick }) => (
    <button onClick={onClick} className={`py-3 px-1 border-b-2 font-semibold text-sm ${ active ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>
        {name}
    </button>
);

const StorageUnitsTable: React.FC<{ units: StorageUnit[] }> = ({ units }) => {
    const statusColorMap = {
        Active: 'bg-green-100 text-green-800 border-green-300',
        Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        Vacated: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return (
        <div className="w-full overflow-hidden rounded-lg shadow-lg">
            <div className="w-full overflow-x-auto">
                <table className="w-full whitespace-no-wrap">
                    <thead className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                        <tr>
                            <th className="px-4 py-3">Unit ID</th>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Move-In Date</th>
                            <th className="px-4 py-3">Volume (cbft)</th>
                            <th className="px-4 py-3">Monthly Rate</th>
                            <th className="px-4 py-3">Next Billing</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y dark:bg-gray-800 dark:divide-gray-700">
                        {units.map(unit => (
                            <tr key={unit.id} className="text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 font-semibold">{unit.id}</td>
                                <td className="px-4 py-3">{unit.clientName}</td>
                                <td className="px-4 py-3">{new Date(unit.moveInDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{unit.volumeCubicFeet}</td>
                                <td className="px-4 py-3 font-medium">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(unit.monthlyRate)}</td>
                                <td className="px-4 py-3">{new Date(unit.nextBillingDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full border ${statusColorMap[unit.status]}`}>{unit.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <button className="px-3 py-1 text-sm font-medium leading-5 text-brand-primary transition-colors duration-150 bg-brand-light border border-transparent rounded-lg hover:bg-brand-secondary hover:text-white">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BillingOverview: React.FC<{ units: StorageUnit[] }> = ({ units }) => {
    const [logs, setLogs] = useState<string[]>([]);
    
    const activeUnits = useMemo(() => units.filter(u => u.status === 'Active'), [units]);
    const totalMonthlyRevenue = useMemo(() => activeUnits.reduce((sum, u) => sum + u.monthlyRate, 0), [activeUnits]);

    const handleRunBilling = () => {
        const newLogs: string[] = [];
        activeUnits.forEach(unit => {
            const invoice = generateNextInvoice(unit);
            newLogs.push(`Generated Draft Invoice ${invoice.id} for ${unit.clientName} (£${invoice.amount.toFixed(2)})`);
        });
        setLogs(prev => [...newLogs, ...prev].slice(0, 50));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Billing Summary</h4>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-500 dark:text-gray-400">Active Storage Units</dt>
                            <dd className="font-semibold text-gray-900 dark:text-gray-100">{activeUnits.length}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500 dark:text-gray-400">Total Monthly Revenue</dt>
                            <dd className="font-semibold text-gray-900 dark:text-gray-100">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totalMonthlyRevenue)}</dd>
                        </div>
                    </dl>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Actions</h4>
                    <button onClick={handleRunBilling} className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md">
                        <CostingIcon />
                        <span>Run Billing Cycle (Dry Run)</span>
                    </button>
                </div>
            </div>
            <div className="md:col-span-2 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Billing Log</h4>
                 <div className="p-3 bg-gray-900 text-gray-200 rounded-md font-mono text-xs h-80 overflow-y-auto">
                    {logs.length > 0 ? logs.map((log, i) => <div key={i}>{`> ${log}`}</div>) : 'Run the billing cycle to see logs here.'}
                </div>
            </div>
        </div>
    );
};

export default StoragePage;
