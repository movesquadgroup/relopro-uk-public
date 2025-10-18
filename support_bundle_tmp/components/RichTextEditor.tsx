import React, { useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    // FIX: Add optional mergeFields prop to satisfy the component's usage in SendMessageModal.
    mergeFields?: string[];
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleCommand = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
    };
    
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Allow drop
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const fieldTag = e.dataTransfer.getData('text/plain');
        if (fieldTag.startsWith('{{') && fieldTag.endsWith('}}')) {
             // Standard way to insert text at cursor position in contentEditable
            document.execCommand('insertText', false, fieldTag);
        }
    };

    return (
        <div className="mt-1 border border-gray-300 rounded-md shadow-sm dark:border-gray-600">
            <div className="flex items-center p-2 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600 flex-wrap gap-1">
                <EditorButton onClick={() => handleCommand('bold')} title="Bold"><strong>B</strong></EditorButton>
                <EditorButton onClick={() => handleCommand('italic')} title="Italic"><em>I</em></EditorButton>
                <EditorButton onClick={() => handleCommand('underline')} title="Underline"><u>U</u></EditorButton>
                <EditorButton onClick={() => handleCommand('insertUnorderedList')} title="Bulleted List">&bull;</EditorButton>
                <EditorButton onClick={() => handleCommand('insertOrderedList')} title="Numbered List">1.</EditorButton>
            </div>
            
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dangerouslySetInnerHTML={{ __html: value }}
                className="w-full p-3 h-64 border-0 focus:ring-0 resize-y overflow-y-auto sm:text-sm dark:bg-gray-800 dark:text-gray-200"
            />
        </div>
    );
};

const EditorButton: React.FC<{ onClick: () => void, children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600 font-mono"
        onMouseDown={e => e.preventDefault()} // Prevent editor from losing focus
    >
        {children}
    </button>
);


export default RichTextEditor;