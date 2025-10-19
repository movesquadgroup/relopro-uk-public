import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DiaryEvent, StaffMember, Vehicle, DiaryActivityType, StaffRole, Client, ClientStatus } from '../types';
import OperationsTable from '../components/OperationsTable';
import DailyDispatchView from '../components/DiaryOpsView';
import AddJobModal from '../components/AddJobModal';
import { seedOpsDataIfEmpty } from '../lib/dev/seedOpsData';
import { features } from '../lib/featureFlags';

// Sample data is now included directly in this page to ensure content is always available on load.
const MOCK_STAFF: StaffMember[] = [
    { id: 'staff-1', name: 'John Doe', email: 'john.d@relopro.co.uk', phone: '07700900001', role: StaffRole.Administrator, status: 'Active' },
    { id: 'staff-2', name: 'Jane Smith', email: 'jane.s@relopro.co.uk', phone: '07700900002', role: StaffRole.Manager, status: 'Active' },
    { id: 'staff-3', name: 'Sarah Connor', email: 'sarah.c@relopro.co.uk', phone: '07700900003', role: StaffRole.HeadOffice, status: 'Active' },
    { id: 'staff-5', name: 'David Brent', email: 'david.b@relopro.co.uk', phone: '07700900005', role: StaffRole.Surveyor, status: 'Active' },
    { id: 'staff-7', name: 'Crew Alpha', email: 'crew.a@relopro.co.uk', phone: '07700900007', role: StaffRole.Porter, status: 'Inactive' },
    { id: 'staff-driver-adrian', name: 'Adrian', email: 'adrian@relopro.co.uk', phone: '07700900101', role: StaffRole.Driver, status: 'Active' },
    { id: 'staff-porter-dave', name: 'Dave', email: 'dave@relopro.co.uk', phone: '07700900102', role: StaffRole.Porter, status: 'Active' },
    { id: 'staff-driver-martyn', name: 'Martyn', email: 'martyn@relopro.co.uk', phone: '07700900103', role: StaffRole.Driver, status: 'Active' },
    { id: 'staff-driver-ray', name: 'Ray', email: 'ray@relopro.co.uk', phone: '07700900104', role: StaffRole.Driver, status: 'Active' },
    { id: 'staff-porter-joe', name: 'Joe', email: 'joe@relopro.co.uk', phone: '07700900105', role: StaffRole.Porter, status: 'Active' },
    { id: 'staff-driver-dayle', name: 'Dayle', email: 'dayle@relopro.co.uk', phone: '07700900106', role: StaffRole.Driver, status: 'Active' },
    { id: 'staff-porter-alfie', name: 'Alfie', email: 'alfie@relopro.co.uk', phone: '07700900107', role: StaffRole.Porter, status: 'Active' },
];

const MOCK_EVENTS: DiaryEvent[] = [
    { id: 'evt1', title: 'Alice Johnson', start: '2024-10-06T09:00:00', end: '2024-10-06T10:30:00', clientId: 'CLI001', activityType: DiaryActivityType.InPersonSurvey, assignedStaffIds: ['staff-5'], originAddress: '123 Oak St, Springfield' },
    { id: 'evt2', title: 'Bob Williams', start: '2024-10-07T11:00:00', end: '2024-10-07T12:00:00', clientId: 'CLI002', activityType: DiaryActivityType.VirtualSurvey, assignedStaffIds: ['staff-2'], originAddress: '789 Pine Ln, Springfield' },
    { id: 'evt3', title: 'Charlie Brown', start: '2024-10-08T14:00:00', end: '2024-10-08T15:30:00', clientId: 'CLI003', activityType: DiaryActivityType.BusinessMeeting, assignedStaffIds: ['staff-1', 'staff-3'], originAddress: '222 Elm Ct, Springfield' },
    { 
      id: 'ops-1', 
      title: 'Roberto Hita', 
      start: '2024-10-06T08:00:00', 
      end: '2024-10-06T17:00:00', 
      clientId: 'CLI007', 
      activityType: DiaryActivityType.BookJob, 
      assignedStaffIds: ['staff-driver-adrian', 'staff-porter-dave', 'staff-driver-martyn'], 
      originAddress: 'BL1 7LE', 
      destinationAddress: 'NN3 7UZ',
      service: 'SIRVA',
      volumeCubicFeet: 1900,
      assignedVehicleIds: ['veh-1', 'veh-2'],
      fuelCost: 115,
      dismantlingNotes: 'All beds and wardrobes.',
    },
    { 
      id: 'ops-2', 
      title: 'PAES', 
      start: '2024-10-06T09:00:00', 
      end: '2024-10-06T17:00:00', 
      clientId: 'CLI008', 
      activityType: DiaryActivityType.BookJob, 
      assignedStaffIds: ['staff-driver-ray', 'staff-porter-joe'], 
      originAddress: 'EX STORE', 
      destinationAddress: 'COS @ 9AM',
      service: 'SIRVA',
      volumeCubicFeet: 320,
      assignedVehicleIds: ['veh-3'],
      fuelCost: 25,
      materialsNotes: '3 wardrobe boxes, 10 standard.',
    },
     { 
      id: 'ops-3', 
      title: 'Emma Louise Chamberlain', 
      start: '2024-10-06T10:00:00', 
      end: '2024-10-06T18:00:00', 
      clientId: 'CLI009', 
      activityType: DiaryActivityType.BookJob, 
      assignedStaffIds: ['staff-driver-dayle', 'staff-porter-alfie'], 
      originAddress: 'COS @10am', 
      destinationAddress: 'DE55 2BL',
      service: 'EMS',
      volumeCubicFeet: 1822,
      assignedVehicleIds: ['veh-4'],
      fuelCost: 80,
    },
];

const MOCK_VEHICLES: Vehicle[] = [
    { id: 'veh-1', registration: 'PE12 TUU', type: '12T Truck', status: 'Available', volumeCubicFeet: 2000, motDueDate: '2025-03-15', serviceDueDate: '2024-11-20', color: 'White', dimensionsFeet: { length: 24, width: 8, height: 9 }, dimensionsMeters: { length: 7.3, width: 2.4, height: 2.7 }, assignedDriverIds: ['staff-driver-adrian', 'staff-driver-martyn'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PE12+TUU', costPerMile: 1.50 },
    { id: 'veh-2', registration: 'PO23 YDM', type: '3.5T Luton', status: 'Available', volumeCubicFeet: 600, motDueDate: '2024-10-25', serviceDueDate: '2025-01-10', color: 'Blue', dimensionsFeet: { length: 14, width: 7, height: 8 }, dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, assignedDriverIds: ['staff-driver-adrian', 'staff-driver-ray', 'staff-driver-dayle'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDM', costPerMile: 0.85 },
    { id: 'veh-3', registration: 'PO23 YDP', type: '3.5T Luton', status: 'Maintenance', volumeCubicFeet: 600, motDueDate: '2025-05-01', serviceDueDate: '2025-02-18', color: 'White', dimensionsFeet: { length: 14, width: 7, height: 8 }, dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, assignedDriverIds: ['staff-driver-ray', 'staff-driver-dayle'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDP', costPerMile: 0.85 },
    { id: 'veh-4', registration: 'PO23 YDN', type: '3.5T Luton', status: 'Available', volumeCubicFeet: 600, motDueDate: '2025-06-12', serviceDueDate: '2024-12-05', color: 'Silver', dimensionsFeet: { length: 14, width: 7, height: 8 }, dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, assignedDriverIds: ['staff-driver-adrian', 'staff-driver-martyn', 'staff-driver-dayle'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDN', costPerMile: 0.90 },
];

const MOCK_CLIENTS: Client[] = [
  { id: 'CLI001', name: 'Alice Johnson', email: 'alice.j@email.com', phone: '07123456781', moveDate: '2024-07-20', originAddresses: ['123 Oak St, Springfield'], destinationAddresses: ['456 Maple Ave, Shelbyville'], status: ClientStatus.Quoted, createdAt: '2024-06-01T10:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} } },
  { id: 'CLI003', name: 'Charlie Brown', email: 'charlie.b@email.com', phone: '07123456783', moveDate: '2024-07-25', originAddresses: ['222 Elm Ct, Springfield'], destinationAddresses: ['333 Cedar Dr, Ogdenville'], status: ClientStatus.Booked, createdAt: '2024-06-10T09:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} } },
  { id: 'CLI007', name: 'Roberto Hita', email: 'roberto.h@email.com', phone: '07123456787', moveDate: '2024-10-06', originAddresses: ['BL1 7LE'], destinationAddresses: ['NN3 7UZ'], status: ClientStatus.Booked, createdAt: '2024-09-15T10:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} } },
  { id: 'CLI008', name: 'PAES', email: 'contact@paes.com', phone: '07123456788', moveDate: '2024-10-06', originAddresses: ['EX STORE'], destinationAddresses: ['COS @ 9AM'], status: ClientStatus.InProgress, createdAt: '2024-09-16T11:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} } },
  { id: 'CLI009', name: 'Emma Louise Chamberlain', email: 'emma.c@email.com', phone: '07123456789', moveDate: '2024-10-06', originAddresses: ['COS @10am'], destinationAddresses: ['DE55 2BL'], status: ClientStatus.Booked, createdAt: '2024-09-17T12:00:00Z', activities: [], tasks: [], accessDetails: { origin: {}, destination: {} } },
];


const OperationsPage: React.FC = () => {
    useEffect(() => {
        // Ensure the scheduler always has working demo data if storage is empty.
        seedOpsDataIfEmpty();
    }, []);

    const [events, setEvents] = useLocalStorage<DiaryEvent[]>('diaryEvents', MOCK_EVENTS);
    const [staff] = useLocalStorage<StaffMember[]>('staff', MOCK_STAFF);
    const [vehicles] = useLocalStorage<Vehicle[]>('vehicles', MOCK_VEHICLES);
    const [clients] = useLocalStorage<Client[]>('clients', MOCK_CLIENTS);
    const [currentDate, setCurrentDate] = useState(new Date('2024-10-06')); // Fixed date for consistent mock data view
    const [viewMode, setViewMode] = useState<'table' | 'dispatch'>('table');
    const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

    const changeDate = (amount: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + amount);
        setCurrentDate(newDate);
    };
    
    const handleSaveJob = (jobData: Omit<DiaryEvent, 'id' | 'activityType'>) => {
        const newJob: DiaryEvent = {
            ...jobData,
            id: `ops-${Date.now()}`,
            activityType: DiaryActivityType.BookJob,
        };
        setEvents(prevEvents => [...prevEvents, newJob]);
        setIsAddJobModalOpen(false);
    };

    const handleUpdateJob = (updatedJob: DiaryEvent) => {
        setEvents(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
    };


    const renderContent = () => {
        switch (viewMode) {
            case 'table':
                return <OperationsTable date={currentDate} events={events} staff={staff} vehicles={vehicles} />;
            case 'dispatch':
                return <DailyDispatchView date={currentDate} events={events} staff={staff} vehicles={vehicles} />;
            default:
                return null;
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Operations Hub</h3>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">Daily planning, resource allocation, and job monitoring.</p>
                </div>
                 <button 
                    onClick={() => setIsAddJobModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center"
                 >
                    + New Job
                </button>
            </div>

            {/* Date Controls */}
            <div className="p-4 bg-white rounded-lg shadow-md mb-6 dark:bg-gray-800">
                 <div className="flex items-center justify-between flex-wrap gap-y-4">
                     <div className="flex items-center space-x-2">
                         <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Today</button>
                         <div className="flex items-center">
                             <button onClick={() => changeDate(-1)} className="p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Previous Day">&lt;</button>
                             <button onClick={() => changeDate(1)} className="p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Next Day">&gt;</button>
                         </div>
                         <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {currentDate.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                         </h4>
                    </div>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none"><path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Filter jobs..."
                            className="w-full pl-9 pr-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                    </div>
                </div>
                <div className="mt-4 border-t pt-4 flex items-center dark:border-gray-700">
                     <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                        <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${viewMode === 'table' ? 'bg-white text-brand-primary shadow-sm dark:bg-gray-700 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>Daily List</button>
                        <button onClick={() => setViewMode('dispatch')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${viewMode === 'dispatch' ? 'bg-white text-brand-primary shadow-sm dark:bg-gray-700 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>Dispatch View</button>
                    </div>
                </div>
            </div>

            {renderContent()}

            {isAddJobModalOpen && (
                <AddJobModal
                    onClose={() => setIsAddJobModalOpen(false)}
                    onSave={handleSaveJob}
                    clients={clients}
                    staff={staff}
                    vehicles={vehicles}
                    selectedDate={currentDate}
                />
            )}
        </div>
    );
};

export default OperationsPage;