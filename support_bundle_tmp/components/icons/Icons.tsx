import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
    title?: string;
}

// FIX: Destructure title and rest of props to avoid passing invalid 'title' attribute to svg.
// Render a <title> element inside the svg for accessibility.
const Icon: React.FC<React.PropsWithChildren<IconProps>> = ({ children, className, title, ...props }) => (
    <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        {title && <title>{title}</title>}
        {children}
    </svg>
);

export const DashboardIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></Icon>;
export const CrmIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></Icon>;
export const SurveyIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></Icon>;
export const OperationsIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const CostingIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-1c-1.11 0-2.08-.402-2.599-1M12 16c-4.418 0-8-3.134-8-7s3.582-7 8-7 8 3.134 8 7-3.582 7-8 7z" /></Icon>;
export const QuoteIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13h-5" /></Icon>;
export const StaffIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /></Icon>;
export const ResourcesIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0l-8 4-8-4" /></Icon>;
export const AccessIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v10m-2-10a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" /></Icon>;
export const StorageIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></Icon>;
export const DiaryIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></Icon>;
export const IntegrationsIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></Icon>;
export const SettingsIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const RevenueIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-1c-1.11 0-2.08-.402-2.599-1M12 16c-4.418 0-8-3.134-8-7s3.582-7 8-7 8 3.134 8 7-3.582 7-8 7z" /></Icon>;
export const CompletedJobsIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const CloseIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></Icon>;
export const NoteIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></Icon>;
export const QuoteActivityIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></Icon>;
export const StatusChangeIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></Icon>;
export const TaskIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></Icon>;
export const MagicWandIcon: React.FC<IconProps> = (props) => <Icon className="w-5 h-5" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></Icon>;
export const WhatsAppIcon: React.FC<IconProps> = ({className, title, ...props}) => <svg className={`w-10 h-10 ${className}`} fill="currentColor" viewBox="0 0 24 24" {...props}>{title && <title>{title}</title>}<path fillRule="evenodd" clipRule="evenodd" d="M18.416 5.584A9.833 9.833 0 0012 2.167 9.833 9.833 0 002.167 12c0 2.583 1 4.983 2.65 6.783L4 21.5l2.75-1.467a9.833 9.833 0 006.783 2.65A9.833 9.833 0 0021.833 12a9.833 9.833 0 00-3.417-6.416zm-6.417 11.5a8.167 8.167 0 01-4.217-1.217l-.3-.183-3.133.817.833-3.05-.2-.317a8.167 8.167 0 01-1.267-4.383 8.167 8.167 0 018.167-8.167 8.167 8.167 0 018.167 8.167 8.167 8.167 0 01-8.167 8.166zm4.4-5.366c-.233-.117-1.367-.667-1.583-.75s-.367-.117-.517.116c-.15.233-.6.75-.733.9s-.267.167-.5.05c-.233-.117-.983-.367-1.867-1.15s-1.367-1.383-1.533-1.616c-.167-.233-.017-.35.1-.466.1-.1.233-.267.35-.4.116-.133.15-.233.233-.383s.017-.283-.033-.4c-.05-.116-.517-1.233-.7-1.683-.183-.45-.367-.383-.517-.383h-.45c-.15 0-.383.05-.583.283-.2.233-.767.75-.767 1.817s.783 2.1.883 2.25c.1.15 1.55 2.366 3.75 3.3.533.233.95.366 1.283.467.55.166 1.05.15 1.45.1.433-.066 1.367-.566 1.567-1.116.2-.55.2-1.017.15-1.117-.067-.116-.217-.183-.45-.3z" /></svg>;
export const SmsIcon: React.FC<IconProps> = ({className, title, ...props}) => <svg className={`w-10 h-10 ${className}`} fill="currentColor" viewBox="0 0 24 24" {...props}>{title && <title>{title}</title>}<path d="M18 10c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6zm-6-8C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-8h2v2h-2v-2zm-2 0h-2v2h2v-2zm8 0h-2v2h2v-2z" /></svg>;
// ENHANCEMENT_integration_layer: Add integration icons
export const XeroIcon: React.FC<IconProps> = ({ className, title, ...props }) => (
    <svg className={`w-10 h-10 text-blue-500 ${className}`} fill="currentColor" viewBox="0 0 40 40" {...props}>
        {title && <title>{title}</title>}
        <circle cx="20" cy="20" r="20" />
        <text x="50%" y="50%" dy=".3em" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">XE</text>
    </svg>
);
export const QuickBooksIcon: React.FC<IconProps> = ({ className, title, ...props }) => (
    <svg className={`w-10 h-10 text-green-600 ${className}`} fill="currentColor" viewBox="0 0 40 40" {...props}>
        {title && <title>{title}</title>}
        <circle cx="20" cy="20" r="20" />
        <text x="50%" y="50%" dy=".3em" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">QB</text>
    </svg>
);
export const GoogleCalendarIcon: React.FC<IconProps> = ({ className, title, ...props }) => (
    <svg className={`w-10 h-10 text-blue-600 ${className}`} fill="currentColor" viewBox="0 0 24 24" {...props}>
        {title && <title>{title}</title>}
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zM5 8V6h14v2H5z"/>
    </svg>
);
export const GoogleMapsIcon: React.FC<IconProps> = ({ className, title, ...props }) => (
    <svg className={`w-10 h-10 text-red-500 ${className}`} fill="currentColor" viewBox="0 0 24 24" {...props}>
        {title && <title>{title}</title>}
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
);
export const LinkIcon: React.FC<IconProps> = (props) => <Icon className="w-10 h-10" {...props}><path d="M10.59 13.41c.44-.44.44-1.16 0-1.61L9.17 10.38c-.44-.44-1.16-.44-1.61 0-.44.44-.44 1.16 0 1.61l1.42 1.42zM14.83 12l-1.42-1.42c-.44-.44-1.16-.44-1.61 0-.44.44-.44 1.16 0 1.61L13.22 13.6c.44.44 1.16.44 1.61 0zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" /></Icon>;
export const ApiKeyIcon: React.FC<IconProps> = (props) => <Icon className="w-10 h-10" {...props}><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor" /></Icon>;
export const LocationMarkerIcon: React.FC<IconProps> = (props) => <Icon className="w-4 h-4" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const VolumeIcon: React.FC<IconProps> = (props) => <Icon className="w-5 h-5" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></Icon>;
export const ToolsIcon: React.FC<IconProps> = (props) => <Icon className="w-5 h-5" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 003 0m-3 0h3m-3.5 0H2m11 0h3.5m-3.5-6.5a1.5 1.5 0 013 0v6m0 0a1.5 1.5 0 01-3 0m0 0H7.5" /></Icon>;
export const MaterialsIcon: React.FC<IconProps> = (props) => <Icon className="w-5 h-5" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6l-4 12" /></Icon>;
export const RouteIcon: React.FC<IconProps> = (props) => <Icon className="w-5 h-5" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></Icon>;
export const WarningIcon: React.FC<IconProps> = ({className, ...props}) => <Icon className={`w-5 h-5 ${className}`} {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></Icon>;
export const VehicleIcon: React.FC<IconProps> = (props) => <Icon className="w-5 h-5" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.172 18.172a4 4 0 01-5.656 0l-5.656-5.656a4 4 0 115.656-5.656l5.656 5.656a4 4 0 010 5.656z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12L2 22" /></Icon>;
export const SurveyDetailsIcon: React.FC<IconProps> = (props) => <Icon className="w-4 h-4" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7c0-1.1.9-2 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Icon>;
export const PhoneIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></Icon>;
export const MessageIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></Icon>;
// ENHANCEMENT_ops_scheduler: Add SchedulerIcon
export const SchedulerIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 14l2 2 4-4" /></Icon>;
// ENHANCEMENT_comms_hub: Add CommsIcon
export const CommsIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></Icon>;
// ENHANCEMENT_bi_dashboard: Add BiIcon
export const BiIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></Icon>;
// ENHANCEMENT_move_insights: Add InsightsIcon
export const InsightsIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4" /></Icon>;
// ENHANCEMENT_maintenance_audit: Add MaintenanceIcon
export const MaintenanceIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17l2.472-2.472M11.42 15.17L8.948 12.7M15.17 11.42l2.472-2.472M15.17 11.42L12.7 8.948m-1.27.001L8.948 12.7M16.5 4.5l-6 6M4.5 16.5l6-6" /></Icon>;
export const MicrophoneIcon: React.FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></Icon>;


export default Icon;