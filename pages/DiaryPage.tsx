import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DiaryEvent, DiaryActivityType, DiaryActivityCategory, StaffMember, Vehicle } from '../types';
import { StaffIcon, LocationMarkerIcon } from '../components/icons/Icons';

type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';

// FIX: The MOCK_VEHICLES array was missing several required properties from the Vehicle type. This has been updated with the complete mock data to match the Vehicle interface and fix the TypeScript errors.
const MOCK_VEHICLES: Vehicle[] = [
    { id: 'veh-1', registration: 'PE12 TUU', type: '12T Truck', status: 'Available', volumeCubicFeet: 2000, motDueDate: '2025-03-15', serviceDueDate: '2024-11-20', color: 'White', dimensionsFeet: { length: 24, width: 8, height: 9 }, dimensionsMeters: { length: 7.3, width: 2.4, height: 2.7 }, assignedDriverIds: ['staff-driver-adrian', 'staff-driver-martyn'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PE12+TUU', costPerMile: 1.50 },
    { id: 'veh-2', registration: 'PO23 YDM', type: '3.5T Luton', status: 'Available', volumeCubicFeet: 600, motDueDate: '2024-10-25', serviceDueDate: '2025-01-10', color: 'Blue', dimensionsFeet: { length: 14, width: 7, height: 8 }, dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, assignedDriverIds: ['staff-driver-adrian', 'staff-driver-ray', 'staff-driver-dayle'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDM', costPerMile: 0.85 },
    { id: 'veh-3', registration: 'PO23 YDP', type: '3.5T Luton', status: 'Maintenance', volumeCubicFeet: 600, motDueDate: '2025-05-01', serviceDueDate: '2025-02-18', color: 'White', dimensionsFeet: { length: 14, width: 7, height: 8 }, dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, assignedDriverIds: ['staff-driver-ray', 'staff-driver-dayle'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDP', costPerMile: 0.85 },
    { id: 'veh-4', registration: 'PO23 YDN', type: '3.5T Luton', status: 'Available', volumeCubicFeet: 600, motDueDate: '2025-06-12', serviceDueDate: '2024-12-05', color: 'Silver', dimensionsFeet: { length: 14, width: 7, height: 8 }, dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, assignedDriverIds: ['staff-driver-adrian', 'staff-driver-martyn', 'staff-driver-dayle'], thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDN', costPerMile: 0.90 },
];


// Note: Mock staff IDs are used here. These should correspond to the IDs in mockStaff in StaffPage.tsx
const MOCK_EVENTS: DiaryEvent[] = [
    { id: 'evt1', title: 'Alice Johnson', start: '2024-10-06T09:00:00', end: '2024-10-06T10:30:00', clientId: 'CLI001', activityType: DiaryActivityType.InPersonSurvey, assignedStaffIds: ['staff-5'], originAddress: '123 Oak St, Springfield' },
    { id: 'evt2', title: 'Bob Williams', start: '2024-10-07T11:00:00', end: '2024-10-07T12:00:00', clientId: 'CLI002', activityType: DiaryActivityType.VirtualSurvey, assignedStaffIds: ['staff-2'], originAddress: '789 Pine Ln, Springfield' },
    { id: 'evt3', title: 'Charlie Brown', start: '2024-10-08T14:00:00', end: '2024-10-08T15:30:00', clientId: 'CLI003', activityType: DiaryActivityType.BusinessMeeting, assignedStaffIds: ['staff-1', 'staff-3'], originAddress: '222 Elm Ct, Springfield' },
    
    // --- Ops View Data for Monday 6th October ---
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
      fuelCost: 115, // 90 + 25
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

const activityCategoryMap: Record<DiaryActivityType, DiaryActivityCategory> = {
    [DiaryActivityType.InPersonSurvey]: DiaryActivityCategory.Survey,
    [DiaryActivityType.VirtualSurvey]: DiaryActivityCategory.Survey,
    [DiaryActivityType.MaterialsDelivery]: DiaryActivityCategory.Job,
    [DiaryActivityType.BookJob]: DiaryActivityCategory.Job,
    [DiaryActivityType.QualityVisit]: DiaryActivityCategory.Job,
    [DiaryActivityType.SiteInspection]: DiaryActivityCategory.Job,
    [DiaryActivityType.BusinessMeeting]: DiaryActivityCategory.Meeting,
};

const categoryColorMap: Record<DiaryActivityCategory, { border: string, bg: string, text: string }> = {
    [DiaryActivityCategory.Survey]: { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200' },
    [DiaryActivityCategory.Job]: { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200' },
    [DiaryActivityCategory.Meeting]: { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200' },
};

const DiaryPage: React.FC = () => {
    const [events] = useLocalStorage<DiaryEvent[]>('diaryEvents', MOCK_EVENTS);
    const [staff] = useLocalStorage<StaffMember[]>('staff', []);
    const [currentDate, setCurrentDate] = useState(new Date('2024-10-06')); // Fixed date for consistent mock data view
    const [viewMode, setViewMode] = useState<ViewMode>('Week');
    const [activeFilter, setActiveFilter] = useState<DiaryActivityCategory | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const categoryMatch = activeFilter === 'All' || activityCategoryMap[event.activityType] === activeFilter;
            
            if (!categoryMatch) return false;

            if (searchTerm === '') return true;
            
            const lowercasedTerm = searchTerm.toLowerCase();
            const assignedStaffNames = event.assignedStaffIds
                .map(id => staff.find(s => s.id === id)?.name || '')
                .join(' ')
                .toLowerCase();

            return (
                event.title.toLowerCase().includes(lowercasedTerm) ||
                event.clientId.toLowerCase().includes(lowercasedTerm) ||
                event.activityType.toLowerCase().includes(lowercasedTerm) ||
                assignedStaffNames.includes(lowercasedTerm)
            );
        });
    }, [events, activeFilter, searchTerm, staff]);

    const changeDate = (amount: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'Day') newDate.setDate(newDate.getDate() + amount);
        else if (viewMode === 'Week') newDate.setDate(newDate.getDate() + (amount * 7));
        else if (viewMode === 'Month') newDate.setMonth(newDate.getMonth() + amount);
        else if (viewMode === 'Year') newDate.setFullYear(newDate.getFullYear() + amount);
        setCurrentDate(newDate);
    };
    
    const renderCalendarView = () => {
        if (viewMode === 'Week') {
             return <DiaryWeekView date={currentDate} events={filteredEvents} staffList={staff} />;
        }
        return <div className="text-center p-10 bg-white rounded-lg shadow-inner text-gray-500 dark:bg-gray-800 dark:text-gray-400">{viewMode} view is under construction.</div>
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Company Diary</h3>
                    <p className="text-gray-600 mt-1 dark:text-gray-400">Schedule and view all company activities.</p>
                </div>
                 <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors duration-300 font-semibold shadow-md flex items-center">
                    + New Entry
                </button>
            </div>

            {/* Calendar Controls */}
            <div className="p-4 bg-white rounded-lg shadow-md mb-6 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Today</button>
                         <div className="flex items-center">
                             <button onClick={() => changeDate(-1)} className="p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">&lt;</button>
                             <button onClick={() => changeDate(1)} className="p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">&gt;</button>
                         </div>
                         <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                         </h4>
                    </div>
                     <div className="flex items-center border border-gray-300 rounded-lg text-sm font-medium dark:border-gray-600">
                        {(['Week', 'Month'] as ViewMode[]).map(v => (
                           <button key={v} onClick={() => setViewMode(v)} className={`px-3 py-1.5 rounded-md ${viewMode === v ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{v}</button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 border-t pt-4 flex justify-between items-center dark:border-gray-700">
                     <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50 w-min dark:bg-gray-900 dark:border-gray-700">
                        {(['All', DiaryActivityCategory.Survey, DiaryActivityCategory.Job, DiaryActivityCategory.Meeting] as const).map(f => (
                            <button 
                                key={f} 
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeFilter === f ? 'bg-white text-brand-primary shadow-sm dark:bg-gray-700 dark:text-gray-100' : 'text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none"><path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search diary..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                </div>
            </div>

            <div>{renderCalendarView()}</div>
        </div>
    );
};


// --- Week View Component ---
interface DiaryWeekViewProps {
    date: Date;
    events: DiaryEvent[];
    staffList: StaffMember[];
}

const HOUR_HEIGHT = 60; // 60px per hour
const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 19;

const DiaryWeekView: React.FC<DiaryWeekViewProps> = ({ date, events, staffList }) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Monday as start of week

    const days = Array.from({ length: 7 }).map((_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });

    const timelineHours = Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 }, (_, i) => TIMELINE_START_HOUR + i);

    const getEventsForDay = (day: Date) => {
        return events.filter(e => new Date(e.start).toDateString() === day.toDateString());
    };
    
    return (
        <div className="bg-white rounded-lg shadow-lg dark:bg-gray-800">
            {/* Header */}
            <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700">
                <div className="p-3"></div> {/* Spacer for timeline */}
                {days.map(day => (
                    <div key={day.toISOString()} className="p-3 text-center font-semibold text-sm text-gray-700 border-l dark:text-gray-300 dark:border-gray-700">
                        {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                        <span className={`block text-xl font-bold ${day.toDateString() === new Date().toDateString() ? 'text-brand-primary' : 'text-gray-800 dark:text-gray-100'}`}>
                            {day.getDate()}
                        </span>
                    </div>
                ))}
            </div>
            {/* Body */}
            <div className="grid grid-cols-[4rem_repeat(7,1fr)] h-[70vh] overflow-y-auto">
                {/* Timeline Hours */}
                <div className="relative">
                    {timelineHours.map(hour => (
                        <div key={hour} className="relative text-right pr-2 text-xs text-gray-400 dark:text-gray-500" style={{ height: `${HOUR_HEIGHT}px` }}>
                            <span className="absolute -top-2 right-2">{hour}:00</span>
                        </div>
                    ))}
                </div>
                 {/* Event Columns */}
                 {days.map(day => (
                    <div key={day.toISOString()} className="relative border-l dark:border-gray-700">
                        {/* Hour lines */}
                         {timelineHours.map(hour => (
                            <div key={hour} className="border-b border-gray-100 dark:border-gray-700/50" style={{ height: `${HOUR_HEIGHT}px` }}></div>
                        ))}
                        {/* Events */}
                        {getEventsForDay(day).map(event => (
                            <EventCard key={event.id} event={event} staffList={staffList} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

const EventCard: React.FC<{event: DiaryEvent; staffList: StaffMember[]}> = ({ event, staffList }) => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    const top = ((start.getHours() - TIMELINE_START_HOUR) * HOUR_HEIGHT) + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    const height = durationMinutes * (HOUR_HEIGHT / 60);

    // Prevent events from overflowing the timeline
    if (top < 0 || top > ((TIMELINE_END_HOUR - TIMELINE_START_HOUR) * HOUR_HEIGHT)) return null;

    const category = activityCategoryMap[event.activityType];
    const colors = categoryColorMap[category] || categoryColorMap[DiaryActivityCategory.Meeting];
    
    const assignedStaffNames = event.assignedStaffIds
        .map(id => staffList.find(s => s.id === id)?.name || 'Unknown Staff')
        .join(', ');

    return (
        <div 
            className={`absolute w-full px-2 py-1 rounded-lg border-l-4 overflow-hidden ${colors.border} ${colors.bg} ${colors.text}`}
            style={{ top: `${top}px`, height: `${height}px`, left: '2px', width: 'calc(100% - 4px)' }}
        >
            <p className="font-bold text-sm truncate">{event.title}</p>
            <p className="text-xs truncate">{event.activityType}</p>
            {height > 40 && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                    <div className="flex items-center">
                        <StaffIcon />
                        <span className="ml-1 truncate">{assignedStaffNames}</span>
                    </div>
                    {height > 65 && (
                         <div className="flex items-center">
                            <LocationMarkerIcon />
                            <span className="ml-1 truncate">{event.originAddress}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


export default DiaryPage;