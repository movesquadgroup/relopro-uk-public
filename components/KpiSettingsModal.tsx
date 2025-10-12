import React, { useState } from 'react';
import { Kpi } from '../pages/DashboardPage';

interface KpiSettingsModalProps {
  allKpis: Kpi[];
  selectedIds: string[];
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
}

const KpiSettingsModal: React.FC<KpiSettingsModalProps> = ({ allKpis, selectedIds, onClose, onSave }) => {
  const [currentSelection, setCurrentSelection] = useState<Set<string>>(new Set(selectedIds));

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelection = new Set(currentSelection);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setCurrentSelection(newSelection);
  };

  const handleSaveClick = () => {
    onSave(Array.from(currentSelection));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 dark:bg-gray-800">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Configure Dashboard Widgets</h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Select the metrics you want to display on your dashboard.</p>
        </div>
        <div className="p-6 max-h-80 overflow-y-auto">
          <div className="space-y-4">
            {allKpis.map(kpi => (
              <label key={kpi.id} htmlFor={kpi.id} className="flex items-center p-3 -mx-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <input
                  id={kpi.id}
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-accent dark:bg-gray-600 dark:border-gray-500"
                  checked={currentSelection.has(kpi.id)}
                  onChange={(e) => handleCheckboxChange(kpi.id, e.target.checked)}
                />
                <span className="ml-4 text-gray-700 font-medium dark:text-gray-300">{kpi.title}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors font-semibold shadow-md text-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default KpiSettingsModal;