import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LeadScoreSetting } from '../types';
import { CloseIcon, WarningIcon } from './icons/Icons';

// These are the underlying rules the system knows how to process.
const ALL_POSSIBLE_CRITERIA: Omit<LeadScoreSetting, 'id' | 'points'>[] = [
    { key: 'enquiryType_International', description: 'Enquiry Type: International' },
    { key: 'enquiryType_Office Relocation', description: 'Enquiry Type: Office Relocation' },
    { key: 'clientType_Business', description: 'Client Type: Business (Commercial/Gov)' },
    { key: 'data_hasBudget', description: 'Data: Budget Provided' },
    { key: 'data_hasVolume', description: 'Data: Volume Provided' },
    { key: 'source_highQuality', description: 'Source: High Quality (Referral/Existing)' },
];

const DEFAULT_SETTINGS: LeadScoreSetting[] = [
    { id: '1', key: 'enquiryType_International', description: 'Enquiry Type: International', points: 30 },
    { id: '2', key: 'enquiryType_Office Relocation', description: 'Enquiry Type: Office Relocation', points: 20 },
    { id: '3', key: 'clientType_Business', description: 'Client Type: Business (Commercial/Gov)', points: 15 },
    { id: '4', key: 'data_hasBudget', description: 'Data: Budget Provided', points: 15 },
    { id: '5', key: 'data_hasVolume', description: 'Data: Volume Provided', points: 10 },
    { id: '6', key: 'source_highQuality', description: 'Source: High Quality (Referral/Existing)', points: 10 },
];

const LeadScoringManager: React.FC = () => {
    const [savedSettings, setSavedSettings] = useLocalStorage<LeadScoreSetting[]>('leadScoreSettings', DEFAULT_SETTINGS);
    const [settings, setSettings] = useState<LeadScoreSetting[]>(savedSettings);
    const [newCriterionKey, setNewCriterionKey] = useState<string>('');

    useEffect(() => {
        setSettings(savedSettings);
    }, [savedSettings]);

    const totalPoints = useMemo(() => {
        return settings.reduce((sum, s) => sum + (s.points || 0), 0);
    }, [settings]);

    const availableCriteria = useMemo(() => {
        const usedKeys = new Set(settings.map(s => s.key));
        return ALL_POSSIBLE_CRITERIA.filter(c => !usedKeys.has(c.key));
    }, [settings]);

    const handlePointsChange = (id: string, points: string) => {
        const newPoints = parseInt(points, 10) || 0;
        setSettings(prev => prev.map(s => s.id === id ? { ...s, points: newPoints } : s));
    };

    const handleAddCriterion = () => {
        const criterionToAdd = ALL_POSSIBLE_CRITERIA.find(c => c.key === newCriterionKey);
        if (!criterionToAdd) return;

        setSettings(prev => [
            ...prev,
            { ...criterionToAdd, id: `setting-${Date.now()}`, points: 10 } // Default points
        ]);
        setNewCriterionKey('');
    };

    const handleRemoveCriterion = (id: string) => {
        setSettings(prev => prev.filter(s => s.id !== id));
    };

    const handleSaveChanges = () => {
        if (totalPoints !== 100) {
            alert('Total points must equal 100 before saving.');
            return;
        }
        setSavedSettings(settings);
        alert('Lead score settings saved!');
    };
    
    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset to the default settings?')) {
            setSettings(DEFAULT_SETTINGS);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Lead Scoring Configuration</h4>
            <p className="text-sm text-gray-500 mt-1 mb-4 dark:text-gray-400">
                Define the criteria and points used to calculate a client's lead score. The total points must add up to 100.
            </p>

            <div className="space-y-3 mb-6">
                {settings.map(setting => (
                    <div key={setting.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md dark:bg-gray-700/50">
                        <p className="flex-grow font-medium text-gray-700 dark:text-gray-300">{setting.description}</p>
                        <input
                            type="number"
                            value={setting.points}
                            onChange={(e) => handlePointsChange(setting.id, e.target.value)}
                            className="form-input w-24 text-center dark:bg-gray-800 dark:border-gray-600"
                        />
                        <button onClick={() => handleRemoveCriterion(setting.id)} className="p-2 text-gray-400 hover:text-red-500">
                            <CloseIcon />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center space-x-3 p-3 border-t dark:border-gray-700">
                <select 
                    value={newCriterionKey}
                    onChange={(e) => setNewCriterionKey(e.target.value)}
                    className="form-input flex-grow dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="" disabled>Select a criterion to add...</option>
                    {availableCriteria.map(c => (
                        <option key={c.key} value={c.key}>{c.description}</option>
                    ))}
                </select>
                <button 
                    onClick={handleAddCriterion} 
                    disabled={!newCriterionKey}
                    className="px-4 py-2 text-sm font-semibold text-brand-primary border border-brand-primary rounded-md hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Criterion
                </button>
            </div>
            
            <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className={`text-lg font-bold ${totalPoints === 100 ? 'text-green-600' : 'text-red-600'}`}>
                        Total Points: {totalPoints} / 100
                    </div>
                     {totalPoints !== 100 && (
                        <div className="flex items-center text-sm text-yellow-600">
                            <WarningIcon />
                            <span className="ml-1">Total must be 100 to save.</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                        Reset to Defaults
                    </button>
                    <button 
                        onClick={handleSaveChanges} 
                        disabled={totalPoints !== 100}
                        className="px-6 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

        </div>
    );
};

export default LeadScoringManager;