import { DiaryEvent } from '../../types';

// ENHANCEMENT_ops_scheduler: Logic for updating job assignments

export function assignJobToResource(
    events: DiaryEvent[],
    jobId: string,
    vehicleId: string,
    newStart: Date,
    newEnd: Date
): DiaryEvent[] {
    return events.map(event => {
        if (event.id === jobId) {
            return {
                ...event,
                assignedVehicleIds: event.assignedVehicleIds?.includes(vehicleId) 
                    ? event.assignedVehicleIds 
                    : [...(event.assignedVehicleIds || []), vehicleId],
                start: newStart.toISOString(),
                end: newEnd.toISOString(),
            };
        }
        return event;
    });
}

export function unassignJobFromVehicle(events: DiaryEvent[], jobId: string, vehicleId: string): DiaryEvent[] {
    return events.map(event => {
        if (event.id === jobId) {
            return {
                ...event,
                assignedVehicleIds: (event.assignedVehicleIds || []).filter(id => id !== vehicleId),
            };
        }
        return event;
    });
}

export function assignStaffToJob(events: DiaryEvent[], jobId: string, staffId: string): DiaryEvent[] {
    return events.map(event => {
        if (event.id === jobId) {
            if (event.assignedStaffIds.includes(staffId)) {
                return event;
            }
            return {
                ...event,
                assignedStaffIds: [...event.assignedStaffIds, staffId],
            };
        }
        return event;
    });
}

export function unassignStaffFromJob(events: DiaryEvent[], jobId: string, staffId: string): DiaryEvent[] {
     return events.map(event => {
        if (event.id === jobId) {
            return {
                ...event,
                assignedStaffIds: event.assignedStaffIds.filter(id => id !== staffId),
            };
        }
        return event;
    });
}