import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DiaryEvent, StaffMember, Vehicle, DiaryActivityType, StaffRole } from '../types';
import { VolumeIcon, ToolsIcon, MaterialsIcon, RouteIcon, WarningIcon, VehicleIcon, CrmIcon, SurveyDetailsIcon } from './icons/Icons';

interface OperationsTableProps {
    date: Date;
    events: DiaryEvent[];
    staff: StaffMember[];
    vehicles: Vehicle[];
}

const roleColorMap: Record<StaffRole, string> = {
  [StaffRole.Administrator]: 'bg-red-500',
  [StaffRole.Manager]: 'bg-purple-500',
  [StaffRole.HeadOffice]: 'bg-cyan-500',
  [StaffRole.MoveCoordinator]: 'bg-teal-500',
  [StaffRole.Surveyor]: 'bg-amber-500',
  [StaffRole.Driver]: 'bg-indigo-500',
  [StaffRole.Porter]: 'bg-blue-500',
  [StaffRole.ThirdPartySupervisor]: 'bg-slate-500',
};

const StaffAvatar: React.FC<{ member: StaffMember }> = ({ member }) => (
    <div className={`w-8 h-8 rounded-full ${roleColorMap[member.role]} flex items-center justify-center text-white font-bold text-sm border-2 border-white`} title={member.name}>
        {member.name.charAt(0)}
    </div>
);

const DetailIcon: React.FC<{ icon: React.ReactNode; tooltip: string | undefined }> = ({ icon, tooltip }) => {
    if (!tooltip) return null;
    return (
        <div className="relative group flex items-center justify-center">
            <span className="text-gray-500 hover:text-brand-primary">{icon}</span>
            <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                {tooltip}
            </div>
        </div>
    );
};

const OperationsTable: React.FC<OperationsTableProps> = ({ date, events, staff, vehicles }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const jobsForDay = useMemo(() => events.filter(e => 
        new Date(e.start).toDateString() === date.toDateString() && 
        e.activityType === DiaryActivityType.BookJob
    ), [events, date]);

    const resourceConflicts = useMemo(() => {
        const conflicts = new Map<string, string[]>(); // resourceId -> [jobId1, jobId2, ...]
        const resourceUsage = new Map<string, { start: Date; end: Date; jobId: string }[]>();

        jobsForDay.forEach(job => {
            const allResourceIds = [...job.assignedStaffIds, ...(job.assignedVehicleIds || [])];
            allResourceIds.forEach(id => {
                if (!resourceUsage.has(id)) resourceUsage.set(id, []);
                resourceUsage.get(id)!.push({ start: new Date(job.start), end: new Date(job.end), jobId: job.id });
            });
        });

        resourceUsage.forEach((usages, resourceId) => {
            if (usages.length < 2) return;
            for (let i = 0; i < usages.length; i++) {
                for (let j = i + 1; j < usages.length; j++) {
                    const u1 = usages[i];
                    const u2 = usages[j];
                    // Check for overlap
                    if (u1.start < u2.end && u1.end > u2.start) {
                        if (!conflicts.has(resourceId)) conflicts.set(resourceId, []);
                        const conflictedJobs = conflicts.get(resourceId)!;
                        if(!conflictedJobs.includes(u1.jobId)) conflictedJobs.push(u1.jobId);
                        if(!conflictedJobs.includes(u2.jobId)) conflictedJobs.push(u2.jobId);
                    }
                }
            }
        });
        
        return conflicts;
    }, [jobsForDay]);

    if (jobsForDay.length === 0) {
        return <div className="text-center p-10 bg-white rounded-lg shadow-inner text-gray-500">No jobs scheduled for this day.</div>;
    }

    const handleRowClick = (clientId: string) => {
        navigate(`/crm/${clientId}`);
    };

    return (
        <div className="w-full overflow-hidden rounded-lg shadow-lg bg-white">
            <table className="w-full text-sm">
                <thead className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50">
                    <tr>
                        <th className="px-4 py-3">Client / Service</th>
                        <th className="px-4 py-3">Route</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">Crew & Vehicles</th>
                        <th className="px-4 py-3">Job Progress</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y">
                    {jobsForDay.map(job => {
                        const assignedDrivers = staff.filter(s => job.assignedStaffIds.includes(s.id) && s.role === StaffRole.Driver);
                        const assignedPorters = staff.filter(s => job.assignedStaffIds.includes(s.id) && s.role === StaffRole.Porter);
                        const assignedVehicles = vehicles.filter(v => job.assignedVehicleIds?.includes(v.id));

                        const start = new Date(job.start);
                        const end = new Date(job.end);
                        const totalDuration = end.getTime() - start.getTime();
                        const elapsedDuration = currentTime.getTime() - start.getTime();
                        const progress = Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100));

                        const jobResourceIds = [...job.assignedStaffIds, ...(job.assignedVehicleIds || [])];
                        const hasConflict = jobResourceIds.some(id => resourceConflicts.get(id)?.includes(job.id));
                        
                        return (
                             <tr key={job.id} className="text-gray-700 hover:bg-gray-50 group cursor-pointer" onClick={() => handleRowClick(job.clientId)}>
                                <td className="px-4 py-3 align-top">
                                    <p className="font-bold text-gray-800 group-hover:text-brand-primary">{job.title}</p>
                                    <p className="text-xs text-gray-500">{job.service || 'Private'}</p>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <div className="flex items-center space-x-2">
                                        <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(job.originAddress)}&destination=${encodeURIComponent(job.destinationAddress || '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1 text-gray-400 hover:text-brand-primary" title="Open in Google Maps">
                                            <RouteIcon />
                                        </a>
                                        <div>
                                            <p className="font-semibold">{job.originAddress}</p>
                                            <p className="text-gray-500">→ {job.destinationAddress || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <div className="flex items-center space-x-4">
                                        <DetailIcon icon={<VolumeIcon />} tooltip={job.volumeCubicFeet ? `${job.volumeCubicFeet} cbft` : undefined} />
                                        <DetailIcon icon={<ToolsIcon />} tooltip={job.dismantlingNotes} />
                                        <DetailIcon icon={<MaterialsIcon />} tooltip={job.materialsNotes} />
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <div className="flex items-center">
                                         {hasConflict && (
                                            <div className="relative group mr-2">
                                                <WarningIcon className="text-yellow-500"/>
                                                <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                                    Resource conflict detected!
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex -space-x-3 mr-4">
                                            {assignedDrivers.map(d => <StaffAvatar key={d.id} member={d} />)}
                                            {assignedPorters.map(p => <StaffAvatar key={p.id} member={p} />)}
                                        </div>
                                        <div className="flex items-center space-x-1 text-gray-500">
                                            {assignedVehicles.map(v => <VehicleIcon key={v.id} title={v.registration} />)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top w-48">
                                    <div className="text-xs text-gray-500 mb-1">{start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-top" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to={`/crm/${job.clientId}`} className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-brand-primary hover:bg-brand-light focus:outline-none" title="View Client">
                                            <CrmIcon />
                                        </Link>
                                         <button className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-brand-primary hover:bg-brand-light focus:outline-none" title="View Survey Details">
                                            <SurveyDetailsIcon />
                                        </button>
                                        <button className="p-2 text-gray-500 bg-gray-100 rounded-md hover:text-brand-primary hover:bg-brand-light focus:outline-none" title="Edit Job">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default OperationsTable;