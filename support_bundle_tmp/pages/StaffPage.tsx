import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { StaffMember, StaffRole, ActivityRoleMapping, DiaryActivityType } from '../types';
import StaffTable from '../components/StaffTable';
import AddStaffModal from '../components/AddStaffModal';
import ActivityRoleSettings from '../components/ActivityRoleSettings';

const mockStaff: StaffMember[] = [
    { id: 'staff-1', name: 'John Doe', email: 'john.d@relopro.co.uk', phone: '07700900001', role: StaffRole.Administrator, status: 'Active' },
    { id: 'staff-2', name: 'Jane Smith', email: 'jane.s@relopro.co.uk', phone: '07700900002', role: StaffRole.Manager, status: 'Active' },
    { id: 'staff-3', name: 'Sarah Connor', email: 'sarah.c@relopro.co.uk', phone: '07700900003', role: StaffRole.HeadOffice, status: 'Active' },
    { id: 'staff-5', name: 'David Brent', email: 'david.b@relopro.co.uk', phone: '07700900005', role: StaffRole.Surveyor, status: 'Active' },
    { id: 'staff-7', name: 'Crew Alpha', email: 'crew.a@relopro.co.uk', phone: '07700900007', role: StaffRole.Porter, status: 'Inactive' },
    // Staff for Ops View
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


const StaffPage: React.FC = () => {
    const [staff, setStaff] = useLocalStorage<StaffMember[]>('staff', mockStaff);
    const [activityRoles, setActivityRoles] = useLocalStorage<ActivityRoleMapping>('activityRoles', initialRoleMapping);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddStaff = (newStaffData: Omit<StaffMember, 'id' | 'status'>) => {
        const newStaffMember: StaffMember = {
            ...newStaffData,
            id: `staff-${Date.now()}`,
            status: 'Active',
        };
        setStaff(prev => [newStaffMember, ...prev]);
        setIsAddModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800">Staff Management</h3>
                    <p className="text-gray-600 mt-1">Manage users, roles, and permissions.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add New Staff
                </button>
            </div>

            <div className="mt-8">
                <StaffTable staff={staff} />
            </div>

            <div className="mt-12">
                <ActivityRoleSettings 
                    mapping={activityRoles}
                    onMappingChange={setActivityRoles}
                />
            </div>

            {isAddModalOpen && (
                <AddStaffModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddStaff}
                />
            )}
        </div>
    );
};

export default StaffPage;