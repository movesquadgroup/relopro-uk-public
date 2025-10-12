import React from 'react';
import { StaffMember, StaffRole } from '../types';

interface StaffTableProps {
  staff: StaffMember[];
}

const roleColorMap: Record<StaffRole, string> = {
  [StaffRole.Administrator]: 'bg-red-100 text-red-800',
  [StaffRole.Manager]: 'bg-purple-100 text-purple-800',
  [StaffRole.HeadOffice]: 'bg-cyan-100 text-cyan-800',
  [StaffRole.MoveCoordinator]: 'bg-teal-100 text-teal-800',
  [StaffRole.Surveyor]: 'bg-amber-100 text-amber-800',
  [StaffRole.Driver]: 'bg-indigo-100 text-indigo-800',
  [StaffRole.Porter]: 'bg-blue-100 text-blue-800',
  [StaffRole.ThirdPartySupervisor]: 'bg-slate-100 text-slate-800',
};

const statusColorMap: Record<'Active' | 'Inactive', string> = {
    'Active': 'bg-green-500',
    'Inactive': 'bg-gray-400',
};


const StaffTable: React.FC<StaffTableProps> = ({ staff }) => {
    
  if (staff.length === 0) {
      return <div className="text-center p-8 bg-white rounded-lg shadow-md text-gray-500">No staff members found.</div>
  }

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {staff.map((member) => (
              <tr key={member.id} className="text-gray-700 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center text-sm">
                    <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                      <img className="object-cover w-full h-full rounded-full" src={`https://i.pravatar.cc/150?u=${member.id}`} alt="" loading="lazy" />
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                    <p>{member.email}</p>
                    <p className="text-xs text-gray-500">{member.phone}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${roleColorMap[member.role]}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                    <span className="flex items-center">
                        <span className={`w-2.5 h-2.5 mr-2 rounded-full ${statusColorMap[member.status]}`}></span>
                        {member.status}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-brand-primary hover:bg-brand-light focus:outline-none" title="Edit Staff Member">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                    </button>
                     <button className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-red-600 hover:bg-red-100 focus:outline-none" title="Deactivate Staff Member">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;