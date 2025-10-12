import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DiaryEvent, StaffMember, Vehicle, Client, DiaryActivityType, StaffRole } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { assignJobToResource, unassignJobFromVehicle, assignStaffToJob, unassignStaffFromJob } from '../lib/ops/allocator';
import { Link } from 'react-router-dom';

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

// --- Draggable Components ---

const JobCard: React.FC<{ job: DiaryEvent, client?: Client, isDraggable: boolean }> = ({ job, client, isDraggable }) => {
    const content = (
        <div className="bg-white p-3 mb-2 rounded-md shadow-sm border-l-4 border-brand-primary dark:bg-gray-800 dark:border-brand-secondary">
            <p className="font-semibold text-gray-800 dark:text-gray-100 pr-4">{client?.name || job.title}</p>
            <p className="text-sm text-gray-500 truncate dark:text-gray-400">{job.originAddress} → {job.destinationAddress}</p>
            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">Vol: {job.volumeCubicFeet || 'N/A'} cbft</p>
        </div>
    );

    if (!isDraggable) return content;

    return (
        <Draggable draggableId={`job-${job.id}`} index={0}>
            {(provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    {content}
                </div>
            )}
        </Draggable>
    );
};


const StaffCard: React.FC<{ member: StaffMember, index: number }> = ({ member, index }) => (
    <Draggable draggableId={`staff-${member.id}`} index={index}>
        {(provided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md mb-2 dark:bg-gray-700">
                 <div className={`w-6 h-6 rounded-full ${roleColorMap[member.role]} flex items-center justify-center text-white font-bold text-xs border border-white`} title={member.name}>
                    {member.name.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
            </div>
        )}
    </Draggable>
);

// --- Main Page Component ---

const OpsSchedulerPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date('2024-10-06')); // Fixed for demo
    const [diaryEvents, setDiaryEvents] = useLocalStorage<DiaryEvent[]>('diaryEvents', []);
    const [staff] = useLocalStorage<StaffMember[]>('staff', []);
    const [vehicles] = useLocalStorage<Vehicle[]>('vehicles', []);
    const [clients] = useLocalStorage<Client[]>('clients', []);

    const jobsForDay = useMemo(() => diaryEvents.filter(e => 
        new Date(e.start).toDateString() === currentDate.toDateString() && 
        e.activityType === DiaryActivityType.BookJob
    ), [diaryEvents, currentDate]);

    const unassignedJobs = useMemo(() => diaryEvents.filter(e => 
        e.activityType === DiaryActivityType.BookJob && (!e.assignedVehicleIds || e.assignedVehicleIds.length === 0)
    ), [diaryEvents]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const [type, id] = draggableId.split('-');

        if (type === 'job') {
            const jobId = id;
            if (source.droppableId === 'unassigned-jobs' && destination.droppableId.startsWith('timeline-lane-')) {
                const vehicleId = destination.droppableId.replace('timeline-lane-', '');
                const job = diaryEvents.find(e => e.id === jobId);
                if (!job) return;

                const newStart = new Date(currentDate);
                newStart.setHours(8, 0, 0, 0);
                const newEnd = new Date(currentDate);
                newEnd.setHours(17, 0, 0, 0);

                setDiaryEvents(events => assignJobToResource(events, jobId, vehicleId, newStart, newEnd));
            } else if (source.droppableId.startsWith('timeline-lane-') && destination.droppableId === 'unassigned-jobs') {
                const vehicleId = source.droppableId.replace('timeline-lane-', '');
                 setDiaryEvents(events => unassignJobFromVehicle(events, jobId, vehicleId));
            }
        }

        if (type === 'staff') {
            const staffId = id;
            if (destination.droppableId.startsWith('job-staff-')) {
                const jobId = destination.droppableId.replace('job-staff-', '');
                setDiaryEvents(events => assignStaffToJob(events, jobId, staffId));
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Operations Scheduler</h3>
                        <p className="text-gray-600 mt-1 dark:text-gray-400">Drag & drop to plan your day.</p>
                    </div>
                </div>
                
                <div className="flex space-x-6">
                    {/* Left Panel: Resources */}
                    <div className="w-1/4 flex-shrink-0">
                        <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
                           <h4 className="font-bold text-lg mb-3">Resources</h4>
                            {/* Unassigned Jobs */}
                            <Droppable droppableId="unassigned-jobs">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps}>
                                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Unassigned Jobs ({unassignedJobs.length})</h5>
                                        <div className="min-h-[100px] bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md">
                                            {unassignedJobs.map(job => (
                                                <JobCard key={job.id} job={job} client={clients.find(c => c.id === job.clientId)} isDraggable={true}/>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                            {/* Staff */}
                            <Droppable droppableId="staff-list" isDropDisabled={true}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="mt-4">
                                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Staff</h5>
                                        <div className="max-h-96 overflow-y-auto">
                                            {staff.filter(s=>s.status === 'Active').map((member, index) => <StaffCard key={member.id} member={member} index={index}/>)}
                                        </div>
                                         {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                    
                    {/* Right Panel: Timeline */}
                    <div className="w-3/4">
                        <div className="bg-white rounded-lg shadow-lg overflow-x-auto dark:bg-gray-800">
                            <div className="grid grid-cols-[10rem_1fr]" style={{ minWidth: `${10 + TOTAL_HOURS * 4}rem` }}>
                                {/* Header */}
                                <div className="sticky left-0 z-10 p-3 bg-gray-100 border-b border-r font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Vehicle</div>
                                <div className="relative bg-gray-50 border-b grid dark:bg-gray-900/50 dark:border-gray-600" style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, minmax(0, 1fr))` }}>
                                    {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                                        <div key={i} className="text-center p-3 border-r text-sm text-gray-500 dark:text-gray-400 dark:border-gray-600">{TIMELINE_START_HOUR + i}:00</div>
                                    ))}
                                </div>
                                {/* Body */}
                                {vehicles.map(vehicle => (
                                    <React.Fragment key={vehicle.id}>
                                        <div className="sticky left-0 z-10 p-3 border-r border-b flex flex-col justify-center bg-white dark:bg-gray-800 dark:border-gray-600">
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{vehicle.registration}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.type}</p>
                                        </div>
                                        <Droppable droppableId={`timeline-lane-${vehicle.id}`} direction="horizontal">
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className="relative border-b dark:border-gray-600">
                                                    {/* Grid lines */}
                                                    <div className="absolute inset-0 grid h-full" style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, minmax(0, 1fr))` }}>
                                                        {Array.from({ length: TOTAL_HOURS }).map((_, i) => <div key={i} className="border-r h-full dark:border-gray-700"></div>)}
                                                    </div>
                                                    {/* Scheduled Jobs */}
                                                    {jobsForDay.filter(j => j.assignedVehicleIds?.includes(vehicle.id)).map(job => (
                                                        <ScheduledJob key={job.id} job={job} staffList={staff} />
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
};


const getEventStyle = (event: DiaryEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = (start.getHours() - TIMELINE_START_HOUR) * 60 + start.getMinutes();
    const endMinutes = (end.getHours() - TIMELINE_START_HOUR) * 60 + end.getMinutes();
    const totalMinutes = TOTAL_HOURS * 60;
    const left = (startMinutes / totalMinutes) * 100;
    const width = ((endMinutes - startMinutes) / totalMinutes) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
};

const ScheduledJob: React.FC<{ job: DiaryEvent; staffList: StaffMember[] }> = ({ job, staffList }) => {
    const assignedStaff = staffList.filter(s => job.assignedStaffIds.includes(s.id));
    return (
        <div 
            className="absolute top-2 bottom-2 bg-brand-light border-l-4 border-brand-primary rounded-md p-2 overflow-hidden"
            style={getEventStyle(job)}
        >
            <Droppable droppableId={`job-staff-${job.id}`}>
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`h-full ${snapshot.isDraggingOver ? 'bg-brand-secondary/20' : ''}`}>
                        <Link to={`/crm/${job.clientId}`} className="font-semibold text-sm text-brand-primary truncate block">{job.title}</Link>
                        <p className="text-xs text-gray-600 truncate">{job.originAddress}</p>
                        <div className="absolute bottom-1 right-1 flex -space-x-2">
                            {assignedStaff.map(s => (
                                <div key={s.id} className={`w-6 h-6 rounded-full ${roleColorMap[s.role]} flex items-center justify-center text-white font-bold text-xs border border-white`} title={s.name}>
                                    {s.name.charAt(0)}
                                </div>
                            ))}
                        </div>
                        <div className="hidden">{provided.placeholder}</div>
                    </div>
                )}
            </Droppable>
        </div>
    );
};


export default OpsSchedulerPage;
