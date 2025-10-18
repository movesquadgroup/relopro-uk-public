import React, { useMemo } from 'react';
import { DiaryEvent, StaffMember, Vehicle, DiaryActivityType, StaffRole } from '../types';
import { useNavigate } from 'react-router-dom';

// Constants for timeline layout
const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 19;
const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

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
    <div className={`w-6 h-6 rounded-full ${roleColorMap[member.role]} flex items-center justify-center text-white font-bold text-xs border border-white`} title={member.name}>
        {member.name.charAt(0)}
    </div>
);

// Function to calculate position and width of an event on the timeline
const getEventStyle = (event: DiaryEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    const startMinutes = (start.getHours() - TIMELINE_START_HOUR) * 60 + start.getMinutes();
    const endMinutes = (end.getHours() - TIMELINE_START_HOUR) * 60 + end.getMinutes();
    
    const totalMinutes = TOTAL_HOURS * 60;

    const left = (startMinutes / totalMinutes) * 100;
    const width = ((endMinutes - startMinutes) / totalMinutes) * 100;

    return {
        left: `${Math.max(0, left)}%`,
        width: `${Math.min(100 - left, width)}%`,
    };
};

interface DailyDispatchViewProps {
    date: Date;
    events: DiaryEvent[];
    staff: StaffMember[];
    vehicles: Vehicle[];
}

const DailyDispatchView: React.FC<DailyDispatchViewProps> = ({ date, events, staff, vehicles }) => {
    const navigate = useNavigate();

    const jobsForDay = useMemo(() => events.filter(e => 
        new Date(e.start).toDateString() === date.toDateString() && 
        e.activityType === DiaryActivityType.BookJob
    ), [events, date]);

    // Group jobs by vehicle for lane allocation
    const jobsByVehicle = useMemo(() => {
        const grouped = new Map<string, DiaryEvent[]>();
        vehicles.forEach(v => grouped.set(v.id, [])); // Initialize lanes for all vehicles
        
        jobsForDay.forEach(job => {
            if (job.assignedVehicleIds && job.assignedVehicleIds.length > 0) {
                // Assign job to the first vehicle's lane
                const vehicleId = job.assignedVehicleIds[0];
                if (grouped.has(vehicleId)) {
                    grouped.get(vehicleId)!.push(job);
                }
            }
        });
        return grouped;
    }, [jobsForDay, vehicles]);

    const handleJobClick = (clientId: string) => {
        navigate(`/crm/${clientId}`);
    };
    
    if (jobsForDay.length === 0) {
        return <div className="text-center p-10 bg-white rounded-lg shadow-inner text-gray-500">No jobs scheduled for this day.</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <div className="grid grid-cols-[12rem_1fr]" style={{ minWidth: `${12 + TOTAL_HOURS * 6}rem` }}>
                {/* Header for resources */}
                <div className="sticky left-0 z-10 p-3 bg-gray-100 border-b border-r font-semibold text-gray-700">Resource</div>
                {/* Header for timeline */}
                <div className="relative bg-gray-50 border-b grid" style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, minmax(0, 1fr))` }}>
                    {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                        <div key={i} className="text-center p-3 border-r text-sm text-gray-500">
                            {TIMELINE_START_HOUR + i}:00
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="col-start-1 col-end-2 row-start-2 row-end-auto">
                    {vehicles.map(vehicle => (
                        <div key={vehicle.id} className="sticky left-0 z-10 h-24 p-3 border-r border-b flex flex-col justify-center bg-white">
                            <p className="font-bold text-gray-800">{vehicle.registration}</p>
                            <p className="text-xs text-gray-500">{vehicle.type}</p>
                        </div>
                    ))}
                </div>

                <div className="col-start-2 col-end-3 row-start-2 row-end-auto relative">
                     {/* Vertical grid lines */}
                    <div className="absolute inset-0 grid h-full" style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, minmax(0, 1fr))` }}>
                         {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                            <div key={i} className="border-r h-full"></div>
                        ))}
                    </div>
                    {/* Lanes with jobs */}
                    {vehicles.map(vehicle => (
                         <div key={vehicle.id} className="relative h-24 border-b">
                            {(jobsByVehicle.get(vehicle.id) || []).map(job => {
                                const jobStyle = getEventStyle(job);
                                const assignedStaff = staff.filter(s => job.assignedStaffIds.includes(s.id));
                                return (
                                    <div 
                                        key={job.id} 
                                        className="absolute top-2 bottom-2 bg-brand-light border-l-4 border-brand-primary rounded-md p-2 overflow-hidden cursor-pointer hover:shadow-lg hover:z-20 transition-shadow"
                                        style={jobStyle}
                                        onClick={() => handleJobClick(job.clientId)}
                                        title={`${job.title}\n${new Date(job.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(job.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                                    >
                                        <p className="font-semibold text-sm text-brand-primary truncate">{job.title}</p>
                                        <p className="text-xs text-gray-600 truncate">{job.originAddress} → {job.destinationAddress}</p>
                                        <div className="absolute bottom-1 right-1 flex -space-x-2">
                                            {assignedStaff.map(s => <StaffAvatar key={s.id} member={s} />)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyDispatchView;