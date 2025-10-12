import React from 'react';

interface WorkflowPlaceholderPageProps {
  title: string;
  steps: string[];
}

const WorkflowPlaceholderPage: React.FC<WorkflowPlaceholderPageProps> = ({ title, steps }) => {
  return (
    <div className="text-center p-10 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h3 className="text-4xl font-bold text-brand-primary mb-4 dark:text-blue-300">{title}</h3>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
        This module will guide you through the entire {title.replace(' Workflow', '').toLowerCase()} process. 
        Below are the planned stages for this workflow.
      </p>
      
      <div className="mt-10 max-w-md mx-auto">
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
          {steps.map((step, index) => (
            <li key={index} className="mb-8 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-light rounded-full -left-4 ring-4 ring-white dark:ring-gray-800 dark:bg-blue-900">
                <svg className="w-4 h-4 text-brand-primary dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              </span>
              <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{step}</h4>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Functionality to be implemented here.</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default WorkflowPlaceholderPage;