import React from 'react';

interface MergeFieldPaletteProps {
    mergeFields: string[];
}

const MergeField: React.FC<{ field: string }> = ({ field }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const fieldTag = `{{${field}}}`;
        e.dataTransfer.setData('text/plain', fieldTag);
    };

    return (
        <div
            draggable="true"
            onDragStart={handleDragStart}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-mono cursor-grab hover:bg-brand-light hover:text-brand-primary transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            title={`Drag to add {{${field}}}`}
        >
            {field}
        </div>
    );
};

const MergeFieldPalette: React.FC<MergeFieldPaletteProps> = ({ mergeFields }) => {
    return (
        <div className="p-4 border rounded-lg bg-gray-50 h-full dark:bg-gray-900/50 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200">Available Fields</h4>
            <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">Drag and drop fields into your message body.</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {mergeFields.map(field => (
                    <MergeField key={field} field={field} />
                ))}
            </div>
        </div>
    );
};

export default MergeFieldPalette;