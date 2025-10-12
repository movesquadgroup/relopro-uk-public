import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, CrmIcon, SurveyIcon, OperationsIcon, CostingIcon, QuoteIcon, StaffIcon, AccessIcon, StorageIcon, IntegrationsIcon, SettingsIcon, DiaryIcon, ResourcesIcon, SchedulerIcon, CommsIcon, BiIcon, InsightsIcon, MaintenanceIcon } from './icons/Icons';

interface NavItemProps {
  to: string;
  // FIX: Changed JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 text-gray-200 transition-colors duration-200 transform rounded-lg hover:bg-brand-secondary hover:text-white ${
        isActive ? 'bg-brand-secondary font-semibold text-white' : 'font-medium'
      }`
    }
  >
    {icon}
    <span className="mx-4">{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-brand-primary text-white overflow-y-auto">
      <div className="flex items-center justify-center">
        <h2 className="text-3xl font-bold text-white">ReloPro</h2>
      </div>
      
      <div className="flex flex-col justify-between flex-1 mt-10">
        <nav className="space-y-3">
          <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
          {/* ENHANCEMENT_bi_dashboard: Add BI Dashboard link */}
          <NavItem to="/bi" icon={<BiIcon />} label="BI Dashboard" />
          {/* ENHANCEMENT_move_insights: Add Move Insights link */}
          <NavItem to="/insights" icon={<InsightsIcon />} label="Move Insights" />
          <NavItem to="/crm" icon={<CrmIcon />} label="CRM" />
          <NavItem to="/diary" icon={<DiaryIcon />} label="Diary" />
          <hr className="my-4 border-t border-gray-600" />
          <NavItem to="/survey" icon={<SurveyIcon />} label="Survey (MoveIQ)" />
          <NavItem to="/operations" icon={<OperationsIcon />} label="Operations" />
          <NavItem to="/costing" icon={<CostingIcon />} label="Costing" />
          <NavItem to="/quoting" icon={<QuoteIcon />} label="Quoting" />
          <NavItem to="/resources" icon={<ResourcesIcon />} label="Resources" />
          <NavItem to="/storage" icon={<StorageIcon />} label="Storage" />
          {/* ENHANCEMENT_comms_hub: Add Comms Hub link */}
          <NavItem to="/comms" icon={<CommsIcon />} label="Comms Hub" />
          <NavItem to="/integrations" icon={<IntegrationsIcon />} label="Integrations" />
        </nav>

        <div className="mt-8">
            <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" />
            {/* ENHANCEMENT_maintenance_audit: Add Maintenance link */}
            <NavItem to="/admin/maintenance" icon={<MaintenanceIcon />} label="Maintenance" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;