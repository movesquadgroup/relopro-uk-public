import React from 'react';
import { SettingsIcon } from '../components/icons/Icons';

const MaintenanceSplashPage: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-center p-4">
            <div>
                <SettingsIcon className="mx-auto h-24 w-24 text-brand-primary animate-spin" />
                <h1 className="mt-8 text-4xl font-bold text-gray-800 dark:text-gray-100">System Maintenance</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    The ReloPro dashboard is currently undergoing scheduled maintenance.
                </p>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    We'll be back online shortly. Thank you for your patience.
                </p>
            </div>
        </div>
    );
};

export default MaintenanceSplashPage;
