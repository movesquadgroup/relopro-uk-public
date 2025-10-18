import React, { useState, useMemo } from 'react';
import { DiaryEvent, DiaryActivityType, AccessDetails } from '../types';
import AccessForm from './AccessForm';

const asArray = (v: any) => (Array.isArray(v) ? v : []);

const STEPS = [
    'Select Job',
    'Confirm Access Details',
    'Review Resources',
    'Finalize & Confirm',
];

const BookingWorkflow: React.FC<any> = (props) => {
    const { onUpdateJob } = (props || {}) || {};

    const {
      clients: clientsProp,
      quotes: quotesProp,
      diaryEvents: diaryEventsProp,
      events: eventsProp,
      jobs: jobsProp,
      vehicles: vehiclesProp,
      teams: teamsProp,
      resources: resourcesProp,
    } = (props || {}) || {};

    const safeClients   = asArray(clientsProp);
    const safeQuotes    = asArray(quotesProp);
    const safeDiary     = asArray(diaryEventsProp);
    const safeEvents    = asArray(eventsProp);
    const safeJobs      = asArray(jobsProp);
    const safeVehicles  = asArray(vehiclesProp);
    const safeTeams     = asArray(teamsProp);
    const safeResources = asArray(resourcesProp);

    React.useEffect(() => {
      console.log('[BookingWorkflow Diagnostics]', {
        clients: safeClients.length,
        quotes: safeQuotes.length,
        diaryEvents: safeDiary.length,
        events: safeEvents.length,
        jobs: safeJobs.length,
        vehicles: safeVehicles.length,
        teams: safeTeams.length,
        resources: safeResources.length,
      });
    }, []);


    const [activeStep, setActiveStep] = useState(0);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const jobsToProcess = useMemo(() => {
        return safeEvents.filter((e: DiaryEvent) => e.activityType === DiaryActivityType.BookJob);
    }, [safeEvents]);

    const selectedJob = useMemo(() => {
        return safeEvents.find((e: DiaryEvent) => e.id === selectedJobId);
    }, [safeEvents, selectedJobId]);

    const handleSelectJob = (jobId: string) => {
        setSelectedJobId(jobId);
        setActiveStep(1);
    };

    const handleAccessDetailsChange = (newAccessDetails: AccessDetails) => {
        if (!selectedJob) return;
        const updatedJob = {
            ...selectedJob,
            accessDetails: newAccessDetails,
        };
        onUpdateJob(updatedJob);
    };

    const renderStepContent = () => {
        if (!selectedJobId || !selectedJob) {
            // Initial Step: Job Selection
            return (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-200">Select a Booked Job to Process</h3>
                    <div className="space-y-3">
                        {jobsToProcess.length > 0 ? jobsToProcess.map((job: DiaryEvent) => (
                            <button 
                                key={job.id} 
                                onClick={() => handleSelectJob(job.id)}
                                className="w-full text-left p-4 bg-white border rounded-lg hover:bg-gray-50 hover:border-brand-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                <p className="font-bold text-brand-primary dark:text-blue-300">{job.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{job.originAddress} &rarr; {job.destinationAddress}</p>
                                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Move Date: {new Date(job.start).toLocaleDateString()}</p>
                            </button>
                        )) : (
                            <p className="text-gray-500 text-center py-8 dark:text-gray-400">No booked jobs found.</p>
                        )}
                    </div>
                </div>
            );
        }

        // Subsequent steps for the selected job
        switch (activeStep) {
            case 1: // Confirm Access Details
                return <AccessForm accessDetails={selectedJob.accessDetails || { origin: {}, destination: {} }} onChange={handleAccessDetailsChange} />;
            case 2: // Review Resources
                return <div className="p-6 bg-white rounded-lg shadow-inner text-center text-gray-500 dark:bg-gray-700 dark:text-gray-400">Resource review will be implemented here.</div>;
            case 3: // Finalize
                 return <div className="p-6 bg-white rounded-lg shadow-inner text-center text-gray-500 dark:bg-gray-700 dark:text-gray-400">Finalization and client confirmation steps will be here.</div>;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            {/* Stepper Navigation */}
            <div className="mb-8">
                <ol className="flex items-center w-full">
                    {STEPS.map((step, index) => (
                        <li key={step} className={`flex w-full items-center ${index < STEPS.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:border-1 after:inline-block dark:after:border-gray-600" : ''}`}>
                            <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${index <= activeStep ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {index + 1}
                            </span>
                        </li>
                    ))}
                </ol>
                <div className="flex justify-between mt-2">
                    {STEPS.map((step, index) => (
                        <span key={step} className={`text-sm font-medium ${index <= activeStep ? 'text-brand-primary dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>{step}</span>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div>
                {renderStepContent()}
            </div>

            {/* Workflow Actions */}
            {selectedJobId && (
                <div className="mt-8 pt-6 border-t flex justify-between items-center dark:border-gray-700">
                    <button 
                        onClick={() => {
                            if (activeStep === 1) setSelectedJobId(null);
                            setActiveStep(s => Math.max(0, s - 1));
                        }}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Back
                    </button>
                     <button 
                        onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))}
                        disabled={activeStep === STEPS.length - 1}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm disabled:bg-gray-400"
                    >
                        Next Step
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingWorkflow;