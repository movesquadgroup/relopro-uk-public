// CRM & Client Management
export enum ClientStatus {
    Lead = 'Lead',
    Quoted = 'Quoted',
    Booked = 'Booked',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
}

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    secondaryPhone?: string;
    companyName?: string;
    jobTitle?: string;
    moveDate: string;
    originAddresses: string[]; // Changed from string to string[]
    destinationAddresses: string[]; // Changed from string to string[]
    status: ClientStatus;
    createdAt: string;
    activities: Activity[];
    tasks: Task[];
    avatarUrl?: string;
    
    // Extended CRM Fields
    leadSource?: 'Website' | 'Referral' | 'Google' | 'Existing Customer' | 'Other';
    clientType?: 'Residential' | 'Commercial' | 'Government';
    enquiryType?: 'Domestic Move' | 'Office Relocation' | 'Storage Only' | 'International';
    propertyTypeOrigin?: 'Flat' | 'Detached House' | 'Office Building' | 'Warehouse';
    propertyTypeDestination?: 'Flat' | 'Detached House' | 'Office Building' | 'Warehouse';
    moveCoordinatorId?: string; // Links to a StaffMember ID
    nextFollowUpDate?: string;
    estimatedVolume?: number; // in cbft or m³
    budget?: number;
    keyMoveRequirements?: string; // For critical notes like 'Piano transport'
    preferredContactMethod?: 'Email' | 'Phone' | 'WhatsApp';
    
    // Integrated Access Details
    accessDetails: AccessDetails;

    // Lead Scoring
    leadScore?: number;
    leadScoreFactors?: { description: string, points: number }[];
    requiresStorage?: boolean;
}

// Quoting
export enum QuoteStatus {
    Draft = 'Draft',
    Sent = 'Sent',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
}

export interface QuoteLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Quote {
    id:string;
    clientId: string;
    clientName: string;
    quoteDate: string;
    expiryDate: string;
    total: number;
    status: QuoteStatus;
}

// Activity & Tasks
export enum ActivityType {
    Note = 'Note',
    QuoteCreated = 'Quote Created',
    QuoteAccepted = 'Quote Accepted', // ENHANCEMENT: Added for e-sign workflow
    StatusChange = 'Status Change',
    TaskCompleted = 'Task Completed',
    EmailSent = 'Email Sent',
}

export interface Activity {
    id: string;
    type: ActivityType;
    content: string;
    author: string;
    timestamp: string;
}

export interface Task {
    id: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    isSuggested?: boolean;
    suggestionSource?: string;
}


// Settings
export interface Material {
    id: string;
    name: string;
    price: number;
}

export interface TariffSettings {
    ratePerVolume: number;
    ratePerDistance: number;
    ratePerHour: number;
    materials: Material[];
}

export interface CompanyProfile {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    vatNumber: string;
}

export interface LeadScoreSetting {
    id: string;
    key: string;
    description: string;
    points: number;
}

// Templates
export interface EmailTemplate {
    id: string;
    title: string;
    body: string; // HTML content
}

export interface SmsTemplate {
    id: string;
    title: string;
    body: string; // Plain text content
}

export interface WhatsAppTemplate {
    id: string;
    title: string;
    body: string; // Plain text content
}


// Automated Workflows
export enum WorkflowTriggerType {
    ClientStatusChanged = 'ClientStatusChanged',
}

export enum WorkflowActionType {
    CreateTask = 'CreateTask',
}

export interface WorkflowTrigger {
    type: WorkflowTriggerType;
    // For ClientStatusChanged, this would be the 'to' status
    value: ClientStatus; 
}

export interface WorkflowAction {
    type: WorkflowActionType;
    // For CreateTask
    taskDescription?: string;
    taskDueDateDays?: number; // Days from trigger
}

export interface Workflow {
    id: string;
    name: string;
    trigger: WorkflowTrigger;
    action: WorkflowAction;
    isEnabled: boolean;
}


// Diary & Operations
export enum DiaryActivityType {
    InPersonSurvey = 'In-Person Survey',
    VirtualSurvey = 'Virtual Survey',
    MaterialsDelivery = 'Materials Delivery',
    BookJob = 'Booked Job',
    QualityVisit = 'Quality Visit',
    SiteInspection = 'Site Inspection',
    BusinessMeeting = 'Business Meeting',
}

export enum DiaryActivityCategory {
    Survey = 'Survey',
    Job = 'Job',
    Meeting = 'Meeting',
}

export interface PropertyAccessDetails {
    vehicleAccessNotes: string;
    parkingType: 'None' | 'Permit' | 'Private' | 'Metered';
    longCarryDistance: number;
    parkingNotes: string;
    propertyEntryNotes: string;
    internalNavigationNotes: string;
}

export interface AccessDetails {
    origin: Partial<PropertyAccessDetails>;
    destination: Partial<PropertyAccessDetails>;
}

export interface DiaryEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    clientId: string;
    activityType: DiaryActivityType;
    assignedStaffIds: string[];
    originAddress: string;
    destinationAddress?: string;
    service?: string;
    volumeCubicFeet?: number;
    assignedVehicleIds?: string[];
    fuelCost?: number;
    dismantlingNotes?: string;
    materialsNotes?: string;
    accessDetails?: AccessDetails;
}


// Resources (Staff & Vehicles)
export enum StaffRole {
    Administrator = 'Administrator',
    Manager = 'Manager',
    HeadOffice = 'Head Office',
    MoveCoordinator = 'Move Coordinator',
    Surveyor = 'Surveyor',
    Driver = 'Driver',
    Porter = 'Porter',
    ThirdPartySupervisor = 'Third Party Supervisor',
}

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: StaffRole;
    status: 'Active' | 'Inactive';
}

export type ActivityRoleMapping = Record<DiaryActivityType, StaffRole[]>;

export interface Vehicle {
    id: string;
    registration: string;
    type: string;
    status: 'Available' | 'In Use' | 'Maintenance';
    volumeCubicFeet: number;
    motDueDate: string;
    serviceDueDate: string;
    color: string;
    dimensionsFeet: { length: number; width: number; height: number };
    dimensionsMeters: { length: number; width: number; height: number };
    assignedDriverIds: string[];
    thumbnailUrl: string;
    costPerMile: number;
}

export interface EnrichmentSuggestion {
    field: string;
    suggestedValue: string;
    rationale: string;
    source: string;
}

// ENHANCEMENT_storage_module: Add types for Storage and Billing
export interface StorageItem {
    id: string;
    description: string;
    quantity: number;
    notes?: string;
}

export interface StorageUnit {
    id: string;
    clientId: string;
    clientName: string;
    moveInDate: string;
    volumeCubicFeet: number;
    monthlyRate: number;
    status: 'Active' | 'Pending' | 'Vacated';
    nextBillingDate: string;
    inventory: StorageItem[];
}

export interface RecurringInvoice {
    id: string;
    storageUnitId: string;
    clientId: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

// ENHANCEMENT_comms_hub: Add types for Communication Hub
export enum ChannelType {
    Email = 'Email',
    SMS = 'SMS',
    WhatsApp = 'WhatsApp',
}

export interface Message {
    id: string;
    clientId: string;
    channel: ChannelType;
    direction: 'inbound' | 'outbound';
    timestamp: string;
    content: string; // Can be simple text or HTML for email
    author: string; // e.g., 'John Doe' or 'Client'
    subject?: string; // For emails
}

// ENHANCEMENT_workflow_v2: Types for the new state-aware workflow engine
export type RecordType = 'Client' | 'Quote' | 'DiaryEvent';

export interface TriggerV2 {
    type: 'RECORD_UPDATE';
    recordType: RecordType;
    field: keyof Quote | keyof Client; // Extend as needed
    from: any;
    to: any;
}

export interface ActionV2 {
    type: 'CREATE_DIARY_EVENT';
    eventType: DiaryActivityType;
    // We can add more details here later, like assigning a specific coordinator
}

export interface WorkflowV2 {
    id: string;
    name: string;
    description: string;
    trigger: TriggerV2;
    action: ActionV2;
    isEnabled: boolean;
}

export interface EngineLog {
    timestamp: string;
    message: string;
    level: 'info' | 'action' | 'warn' | 'error';
}

// ENHANCEMENT_maintenance_audit: Types for Maintenance and Auditing
export interface AuditLog {
    id: string;
    timestamp: string;
    author: string; // e.g., 'John Doe' or 'System'
    action: string; // e.g., 'ENABLED_MAINTENANCE_MODE', 'CREATED_SNAPSHOT'
    details?: string; // e.g., 'Rolled back to snapshot from 2024-10-06'
}

export interface SystemSnapshot {
    id: string;
    timestamp: string;
    data: Record<string, any>; // Store stringified localStorage values
}
