import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, ClientStatus, StaffMember, StaffRole } from '../types';
import ClientTable from '../components/ClientTable';
import AddClientModal from '../components/AddClientModal';
import { calculateLeadScore } from '../lib/crmUtils';

const mockClients: Client[] = [
  { id: 'CLI001', name: 'Alice Johnson', email: 'alice.j@email.com', phone: '07123456781', moveDate: '2024-07-20', originAddresses: ['123 Oak St, Springfield'], destinationAddresses: ['456 Maple Ave, Shelbyville'], status: ClientStatus.Quoted, createdAt: '2024-06-01T10:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} }, companyName: 'Springfield Nuclear', jobTitle: 'Safety Inspector', leadSource: 'Referral', estimatedVolume: 1200, budget: 5000, clientType: 'Commercial', enquiryType: 'Office Relocation' },
  { id: 'CLI002', name: 'Bob Williams', email: 'bob.w@email.com', phone: '07123456782', moveDate: '2024-08-05', originAddresses: ['789 Pine Ln, Springfield'], destinationAddresses: ['101 Birch Rd, Capital City'], status: ClientStatus.Booked, createdAt: '2024-06-05T11:30:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} }, companyName: 'Capital City Movers', jobTitle: 'Logistics Manager', leadSource: 'Existing Customer' },
  { id: 'CLI003', name: 'Charlie Brown', email: 'charlie.b@email.com', phone: '07123456783', moveDate: '2024-07-25', originAddresses: ['222 Elm Ct, Springfield'], destinationAddresses: ['333 Cedar Dr, Ogdenville'], status: ClientStatus.Completed, createdAt: '2024-06-10T09:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} }, clientType: 'Residential', leadSource: 'Website', estimatedVolume: 800 },
  { id: 'CLI004', name: 'Diana Prince', email: 'diana.p@email.com', phone: '07123456784', moveDate: '2024-09-01', originAddresses: ['444 Spruce Way, Shelbyville'], destinationAddresses: ['555 Willow Path, North Haverbrook'], status: ClientStatus.Lead, createdAt: '2024-06-12T14:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} }, clientType: 'Residential', leadSource: 'Google' },
  { id: 'CLI005', name: 'Ethan Hunt', email: 'ethan.h@email.com', phone: '07123456785', moveDate: '2024-08-15', originAddresses: ['555 Aspen Blvd, Capital City'], destinationAddresses: ['666 Redwood Dr, Springfield'], status: ClientStatus.InProgress, createdAt: '2024-06-15T16:45:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} }, companyName: 'IMF', jobTitle: 'Field Agent', clientType: 'Commercial', enquiryType: 'International', estimatedVolume: 2500, budget: 15000 },
  { id: 'CLI006', name: 'Fiona Glenanne', email: 'fiona.g@email.com', phone: '07123456786', moveDate: '2024-07-30', originAddresses: ['777 Fir Pl, Ogdenville'], destinationAddresses: ['888 Poplar Cir, Shelbyville'], status: ClientStatus.Cancelled, createdAt: '2024-06-20T12:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} }, clientType: 'Residential' },
];

const mockStaff: StaffMember[] = [
    { id: 'staff-1', name: 'John Doe', email: 'john.d@relopro.co.uk', phone: '07700900001', role: StaffRole.Administrator, status: 'Active' },
    { id: 'staff-2', name: 'Jane Smith', email: 'jane.s@relopro.co.uk', phone: '07700900002', role: StaffRole.Manager, status: 'Active' },
    { id: 'staff-3', name: 'Sarah Connor', email: 'sarah.c@relopro.co.uk', phone: '07700900003', role: StaffRole.HeadOffice, status: 'Active' },
    { id: 'staff-4', name: 'Mike Ross', email: 'mike.r@relopro.co.uk', phone: '07700900004', role: StaffRole.MoveCoordinator, status: 'Active' },
    { id: 'staff-5', name: 'David Brent', email: 'david.b@relopro.co.uk', phone: '07700900005', role: StaffRole.Surveyor, status: 'Active' },
    { id: 'staff-driver-adrian', name: 'Adrian', email: 'adrian@relopro.co.uk', phone: '07700900101', role: StaffRole.Driver, status: 'Active' },
    { id: 'staff-porter-dave', name: 'Dave', email: 'dave@relopro.co.uk', phone: '07700900102', role: StaffRole.Porter, status: 'Active' },
];


const CrmPage: React.FC = () => {
    const [clients, setClients] = useLocalStorage<Client[]>('clients', mockClients);
    const [staff] = useLocalStorage<StaffMember[]>('staff', mockStaff);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

    const scoredClients = useMemo(() => {
        return clients.map(client => {
            const { score, factors } = calculateLeadScore(client);
            return { ...client, leadScore: score, leadScoreFactors: factors };
        });
    }, [clients]);

    const handleAddClient = (newClientData: Omit<Client, 'id' | 'createdAt' | 'activities' | 'tasks' | 'accessDetails'>) => {
        const newClient: Client = {
            ...newClientData,
            id: `CLI${String(clients.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            activities: [],
            tasks: [],
            accessDetails: { origin: {}, destination: {} },
        };
        setClients(prevClients => [newClient, ...prevClients]);
        setIsAddClientModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Client Management (CRM)</h3>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">Manage all your client interactions and move statuses.</p>
                </div>
                <button
                    onClick={() => setIsAddClientModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add New Client
                </button>
            </div>

            <div className="mt-8">
                <ClientTable clients={scoredClients} />
            </div>
            
            {isAddClientModalOpen && (
                <AddClientModal
                    onClose={() => setIsAddClientModalOpen(false)}
                    onSave={handleAddClient}
                    staff={staff}
                />
            )}
        </div>
    );
};

export default CrmPage;