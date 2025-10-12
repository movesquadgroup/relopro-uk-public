import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="text-center p-10 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h3 className="text-4xl font-bold text-brand-primary mb-4 dark:text-blue-300">{title}</h3>
      <p className="text-lg text-gray-600 dark:text-gray-300">This module is under construction.</p>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Functionality for the {title.toLowerCase()} module will be implemented here. It will integrate seamlessly with the CRM and other parts of the ReloPro system.
      </p>
      <div className="mt-8">
        <svg className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
    </div>
  );
};

export default PlaceholderPage;