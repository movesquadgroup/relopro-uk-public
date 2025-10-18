import React from 'react';
import { ActivityRoleMapping, DiaryActivityType, StaffRole } from '../types';

interface ActivityRoleSettingsProps {
    mapping: ActivityRoleMapping;
    onMappingChange: React.Dispatch<React.SetStateAction<ActivityRoleMapping>>;
}

const ActivityRoleSettings: React.FC<ActivityRoleSettingsProps> = ({ mapping, onMappingChange }) => {

    const handleCheckboxChange = (activity: DiaryActivityType, role: StaffRole, checked: boolean) => {
        onMappingChange(prevMapping => {
            const newMapping = { ...prevMapping };
            const currentRoles = newMapping[activity] || [];

            if (checked) {
                // Add the role if it's not already there
                if (!currentRoles.includes(role)) {
                    newMapping[activity] = [...currentRoles, role];
                }
            } else {
                // Remove the role
                newMapping[activity] = currentRoles.filter(r => r !== role);
            }
            return newMapping;
        });
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800">Diary Activity Role Assignments</h3>
            <p className="text-sm text-gray-500 mt-1">
                Configure which roles can be assigned to specific activities in the company diary.
            </p>

            <div className="mt-6 border-t pt-4">
                <div className="space-y-6">
                    {Object.values(DiaryActivityType).map(activity => (
                        <div key={activity} className="md:flex md:items-center md:justify-between p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors">
                           <div className="md:w-1/3">
                                <p className="font-semibold text-gray-800">{activity}</p>
                           </div>
                           <div className="flex items-center space-x-6 mt-2 md:mt-0">
                                {Object.values(StaffRole).map(role => (
                                    <label key={role} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                                            checked={mapping[activity]?.includes(role) || false}
                                            onChange={(e) => handleCheckboxChange(activity, role, e.target.checked)}
                                        />
                                        <span className="text-sm text-gray-700">{role}</span>
                                    </label>
                                ))}
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityRoleSettings;
