import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Vehicle, StaffMember, StaffRole, ActivityRoleMapping, DiaryActivityType, TariffSettings } from '../types';
import { MOCK_VEHICLES as defaultVehicles } from '../data/mockData';
import VehicleModal from '../components/VehicleModal';
import { WarningIcon } from '../components/icons/Icons';
import StaffTable from '../components/StaffTable';
import AddStaffModal from '../components/AddStaffModal';
import ActivityRoleSettings from '../components/ActivityRoleSettings';

// --- VEHICLE MANAGEMENT ---

// Helper function to check if a date is within the next 30 days
const isDateApproaching = (dateString: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return dueDate > today && dueDate <= thirtyDaysFromNow;
};

interface VehicleCardProps {
    vehicle: Vehicle;
    onEdit: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onEdit }) => {
    const isMotDue = isDateApproaching(vehicle.motDueDate);
    const isServiceDue = isDateApproaching(vehicle.serviceDueDate);

    const statusColorMap = {
        Available: 'bg-green-100 text-green-800',
        'In Use': 'bg-blue-100 text-blue-800',
        Maintenance: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group dark:bg-gray-800">
            <img src={vehicle.thumbnailUrl} alt={vehicle.registration} className="w-full h-40 object-cover" />
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{vehicle.registration}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{vehicle.type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[vehicle.status]}`}>{vehicle.status}</span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700 flex-grow dark:text-gray-300">
                    <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-semibold">{vehicle.volumeCubicFeet} cbft</span>
                    </div>
                    <div className={`flex justify-between items-center ${isMotDue ? 'text-red-500 font-bold' : ''}`}>
                        <span>MOT Due:</span>
                        <span className="flex items-center">
                            {isMotDue && <WarningIcon className="w-4 h-4 mr-1" />}
                            {new Date(vehicle.motDueDate).toLocaleDateString()}
                        </span>
                    </div>
                    <div className={`flex justify-between items-center ${isServiceDue ? 'text-red-500 font-bold' : ''}`}>
                        <span>Service Due:</span>
                        <span className="flex items-center">
                             {isServiceDue && <WarningIcon className="w-4 h-4 mr-1" />}
                            {new Date(vehicle.serviceDueDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <button 
                        onClick={() => onEdit(vehicle)}
                        className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Edit Vehicle
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- STAFF MANAGEMENT (Moved from StaffPage) ---
const mockStaff: StaffMember[] = [
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

const initialRoleMapping: ActivityRoleMapping = {
    [DiaryActivityType.InPersonSurvey]: [StaffRole.Administrator, StaffRole.Manager, StaffRole.Surveyor],
    [DiaryActivityType.VirtualSurvey]: [StaffRole.Administrator, StaffRole.Manager, StaffRole.Surveyor, StaffRole.HeadOffice],
    [DiaryActivityType.MaterialsDelivery]: [StaffRole.Driver, StaffRole.Porter],
    [DiaryActivityType.BookJob]: [StaffRole.Manager, StaffRole.Driver, StaffRole.Porter, StaffRole.HeadOffice],
    [DiaryActivityType.QualityVisit]: [StaffRole.Manager],
    [DiaryActivityType.SiteInspection]: [StaffRole.Manager, StaffRole.Surveyor],
    [DiaryActivityType.BusinessMeeting]: [StaffRole.Administrator, StaffRole.Manager, StaffRole.HeadOffice],
};

// --- MATERIALS MANAGEMENT (Moved from SettingsPage) ---
const initialTariffs: TariffSettings = {
    ratePerVolume: 15.50, ratePerDistance: 2.25, ratePerHour: 45.00,
    materials: [
        { id: 'mat-001', name: 'Standard Box (Medium)', price: 3.50 },
        { id: 'mat-002', name: 'Wardrobe Box', price: 12.00 },
        { id: 'mat-003', name: 'Bubble Wrap (per meter)', price: 1.20 },
    ],
};

type ResourceTab = 'Vehicles' | 'Staff' | 'Materials';

// --- MAIN PAGE COMPONENT ---
const ResourcesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ResourceTab>('Vehicles');

    // State for Vehicles
    const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('vehicles', defaultVehicles);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | undefined>(undefined);

    // State for Staff
    const [staff, setStaff] = useLocalStorage<StaffMember[]>('staff', mockStaff);
    const [activityRoles, setActivityRoles] = useLocalStorage<ActivityRoleMapping>('activityRoles', initialRoleMapping);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    
    // State for Materials
    const [tariffs, setTariffs] = useLocalStorage<TariffSettings>('tariffs', initialTariffs);

    // --- Vehicle Handlers ---
    const handleOpenVehicleModal = (vehicle?: Vehicle) => {
        setVehicleToEdit(vehicle);
        setIsVehicleModalOpen(true);
    };
    const handleSaveVehicle = (vehicleData: Vehicle) => {
        if (vehicleToEdit) {
            setVehicles(prev => prev.map(v => v.id === vehicleData.id ? vehicleData : v));
        } else {
            setVehicles(prev => [...prev, { ...vehicleData, id: `veh-${Date.now()}` }]);
        }
        setIsVehicleModalOpen(false);
        setVehicleToEdit(undefined);
    };

    // --- Staff Handlers ---
    const handleAddStaff = (newStaffData: Omit<StaffMember, 'id' | 'status'>) => {
        const newStaffMember: StaffMember = { ...newStaffData, id: `staff-${Date.now()}`, status: 'Active' };
        setStaff(prev => [newStaffMember, ...prev]);
        setIsStaffModalOpen(false);
    };

    // --- Material Handlers ---
    const handleMaterialChange = (index: number, field: 'name' | 'price', value: string | number) => {
        const newMaterials = [...tariffs.materials];
        if (field === 'name') newMaterials[index].name = value as string;
        else newMaterials[index].price = typeof value === 'number' ? value : parseFloat(value) || 0;
        setTariffs(prev => ({ ...prev, materials: newMaterials }));
    };
    const addMaterial = () => setTariffs(prev => ({ ...prev, materials: [...prev.materials, { id: `mat-${Date.now()}`, name: '', price: 0 }]}));
    const removeMaterial = (index: number) => setTariffs(prev => ({ ...prev, materials: prev.materials.filter((_, i) => i !== index)}));

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Resource Management</h3>
                <p className="text-gray-600 mt-1 dark:text-gray-400">Manage your company's fleet, staff, and materials.</p>
            </div>
            {activeTab === 'Vehicles' && (
                <button onClick={() => handleOpenVehicleModal()} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center">
                    + Add New Vehicle
                </button>
            )}
             {activeTab === 'Staff' && (
                <button onClick={() => setIsStaffModalOpen(true)} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center">
                    + Add New Staff
                </button>
            )}
        </div>
    );

    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6">
                {(['Vehicles', 'Staff', 'Materials'] as ResourceTab[]).map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                            activeTab === tab
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
    
    return (
        <div>
            {renderHeader()}
            {renderTabs()}

            <div className="mt-6">
                {activeTab === 'Vehicles' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={handleOpenVehicleModal} />)}
                    </div>
                )}
                {activeTab === 'Staff' && (
                    <div className="space-y-8">
                        <StaffTable staff={staff} />
                        <ActivityRoleSettings mapping={activityRoles} onMappingChange={setActivityRoles} />
                    </div>
                )}
                {activeTab === 'Materials' && (
                    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto dark:bg-gray-800">
                        <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Material Costs</h4>
                            <button type="button" onClick={addMaterial} className="text-sm font-semibold text-brand-primary hover:text-brand-secondary dark:text-blue-400 dark:hover:text-blue-300">+ Add Material</button>
                        </div>
                        <div className="mt-4 space-y-4">
                            {tariffs.materials.map((material, index) => (
                                <div key={material.id} className="grid grid-cols-10 gap-4 items-center">
                                    <div className="col-span-6">
                                        <input type="text" placeholder="Material Name" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={material.name} onChange={e => handleMaterialChange(index, 'name', e.target.value)} />
                                    </div>
                                    <div className="col-span-3">
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">£</span>
                                            <input type="number" step="0.01" placeholder="Price" className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={material.price} onChange={e => handleMaterialChange(index, 'price', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <button type="button" onClick={() => removeMaterial(index)} className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isVehicleModalOpen && (
                <VehicleModal onClose={() => { setIsVehicleModalOpen(false); setVehicleToEdit(undefined); }} onSave={handleSaveVehicle} vehicleToEdit={vehicleToEdit} allStaff={staff} />
            )}
            {isStaffModalOpen && (
                <AddStaffModal onClose={() => setIsStaffModalOpen(false)} onSave={handleAddStaff} />
            )}
        </div>
    );
};

export default ResourcesPage;