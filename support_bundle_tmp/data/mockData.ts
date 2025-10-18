import { Vehicle } from '../types';

export const MOCK_VEHICLES: Vehicle[] = [
    { 
        id: 'veh-1', 
        registration: 'PE12 TUU', 
        type: '12T Truck', 
        status: 'Available', 
        volumeCubicFeet: 2000, 
        motDueDate: '2025-03-15', 
        serviceDueDate: '2024-11-20', 
        color: 'White', 
        dimensionsFeet: { length: 24, width: 8, height: 9 }, 
        dimensionsMeters: { length: 7.3, width: 2.4, height: 2.7 }, 
        assignedDriverIds: ['staff-driver-adrian', 'staff-driver-martyn'], 
        thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PE12+TUU',
        costPerMile: 1.50
    },
    { 
        id: 'veh-2', 
        registration: 'PO23 YDM', 
        type: '3.5T Luton', 
        status: 'Available', 
        volumeCubicFeet: 600, 
        motDueDate: '2024-10-25', 
        serviceDueDate: '2025-01-10', 
        color: 'Blue', 
        dimensionsFeet: { length: 14, width: 7, height: 8 }, 
        dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, 
        assignedDriverIds: ['staff-driver-adrian', 'staff-driver-ray', 'staff-driver-dayle'], 
        thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDM',
        costPerMile: 0.85
    },
    { 
        id: 'veh-3', 
        registration: 'PO23 YDP', 
        type: '3.5T Luton', 
        status: 'Maintenance', 
        volumeCubicFeet: 600, 
        motDueDate: '2025-05-01', 
        serviceDueDate: '2025-02-18', 
        color: 'White', 
        dimensionsFeet: { length: 14, width: 7, height: 8 }, 
        dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, 
        assignedDriverIds: ['staff-driver-ray', 'staff-driver-dayle'], 
        thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDP',
        costPerMile: 0.85
    },
    { 
        id: 'veh-4', 
        registration: 'PO23 YDN', 
        type: '3.5T Luton', 
        status: 'Available', 
        volumeCubicFeet: 600, 
        motDueDate: '2025-06-12', 
        serviceDueDate: '2024-12-05', 
        color: 'Silver', 
        dimensionsFeet: { length: 14, width: 7, height: 8 }, 
        dimensionsMeters: { length: 4.2, width: 2.1, height: 2.4 }, 
        assignedDriverIds: ['staff-driver-adrian', 'staff-driver-martyn', 'staff-driver-dayle'], 
        thumbnailUrl: 'https://placehold.co/300x200/1e3a8a/white?text=PO23+YDN',
        costPerMile: 0.90
    },
];