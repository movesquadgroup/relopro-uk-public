import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CompanyProfile, EmailTemplate, SmsTemplate, WhatsAppTemplate, Workflow, EngineLog } from '../types';
import WorkflowBuilder from '../components/WorkflowBuilder';
import RichTextEditor from '../components/RichTextEditor';
import { CloseIcon } from '../components/icons/Icons';
import { getMergeFields } from '../lib/emailUtils';
import LeadScoringManager from '../components/LeadScoringManager';
import MergeFieldPalette from '../components/MergeFieldPalette';
import { workflowsV2 } from '../lib/workflows/workflowsV2';
import { runEngine } from '../lib/workflows/engineV2';

type SettingsTab = 'Profile' | 'Workflows' | 'Email' | 'SMS' | 'WhatsApp' | 'Lead Scoring' | 'Workflow Engine V2';

const EmailTemplatesManager: React.FC = () => {
    const [emailTemplates, setEmailTemplates] = useLocalStorage<EmailTemplate[]>('emailTemplates', [
        { id: 'tpl-1', title: 'Quote Follow-Up', body: 'Dear {{name}},<br><br>Just a friendly follow-up regarding your recent quote.<br><br>Best,<br>ReloPro Team' },
        { id: 'tpl-2', title: 'Booking Confirmation', body: 'Dear {{name}},<br><br>Your move on <strong>{{moveDate}}</strong> is confirmed!<br><br>Best,<br>ReloPro Team' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

    const handleAddNew = () => {
        setEditingTemplate({ id: '', title: '', body: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleDelete = (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
        }
    };

    const handleSave = (template: EmailTemplate) => {
        if (template.id) { // Editing existing
            setEmailTemplates(prev => prev.map(t => t.id === template.id ? template : t));
        } else { // Creating new
            setEmailTemplates(prev => [...prev, { ...template, id: `tpl-${Date.now()}` }]);
        }
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Email Templates</h4>
                <button onClick={handleAddNew} className="text-sm font-semibold text-brand-primary hover:text-brand-secondary">+ Add New Template</button>
            </div>
            <div className="space-y-4">
                {emailTemplates.map(template => (
                    <div key={template.id} className="p-4 border rounded-md dark:border-gray-700 group">
                        <div className="flex justify-between items-start">
                             <div>
                                <h5 className="font-semibold dark:text-gray-200">{template.title}</h5>
                                <div className="text-sm text-gray-600 prose-sm dark:text-gray-400 dark:prose-invert" dangerouslySetInnerHTML={{ __html: template.body.substring(0, 100) + '...' }} />
                             </div>
                             <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(template)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</button>
                                <button onClick={() => handleDelete(template.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                             </div>
                        </div>
                    </div>
                ))}
                {emailTemplates.length === 0 && <p className="text-center text-gray-400 italic py-4">No templates created yet.</p>}
            </div>
            {isModalOpen && editingTemplate && (
                <TemplateEditorModal
                    template={editingTemplate}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

interface TemplateEditorModalProps {
    template: EmailTemplate;
    onClose: () => void;
    onSave: (template: EmailTemplate) => void;
}

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ template, onClose, onSave }) => {
    const [title, setTitle] = useState(template.title);
    const [body, setBody] = useState(template.body);
    const mergeFields = getMergeFields();

    const handleSave = () => {
        onSave({ ...template, title, body });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 transform transition-all dark:bg-gray-800">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{template.id ? 'Edit' : 'Create'} Email Template</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><CloseIcon/></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <input
                            type="text"
                            placeholder="Template Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input w-full text-lg font-semibold dark:bg-gray-700 dark:border-gray-600"
                        />
                        <RichTextEditor
                            value={body}
                            onChange={setBody}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <MergeFieldPalette mergeFields={mergeFields} />
                    </div>
                </div>
                 <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm">Save Template</button>
                </div>
            </div>
        </div>
    );
};


interface PlainTextTemplatesManagerProps {
    title: string;
    templates: { id: string; title: string; body: string }[];
    onTemplatesChange: (templates: { id: string; title: string; body: string }[]) => void;
    templateIdPrefix: string;
}

const PlainTextTemplatesManager: React.FC<PlainTextTemplatesManagerProps> = ({ title, templates, onTemplatesChange, templateIdPrefix }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<{ id: string; title: string; body: string } | null>(null);

    const handleAddNew = () => {
        setEditingTemplate({ id: '', title: '', body: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (template: { id: string; title: string; body: string }) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleDelete = (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            onTemplatesChange(templates.filter(t => t.id !== templateId));
        }
    };

    const handleSave = (template: { id: string; title: string; body: string }) => {
        if (template.id) {
            onTemplatesChange(templates.map(t => t.id === template.id ? template : t));
        } else {
            onTemplatesChange([...templates, { ...template, id: `${templateIdPrefix}-${Date.now()}` }]);
        }
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h4>
                <button onClick={handleAddNew} className="text-sm font-semibold text-brand-primary hover:text-brand-secondary">+ Add New Template</button>
            </div>
            <div className="space-y-4">
                {templates.map(template => (
                    <div key={template.id} className="p-4 border rounded-md dark:border-gray-700 group">
                        <div className="flex justify-between items-start">
                             <div>
                                <h5 className="font-semibold dark:text-gray-200">{template.title}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{template.body.substring(0, 100) + '...'}</p>
                             </div>
                             <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(template)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Edit</button>
                                <button onClick={() => handleDelete(template.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                             </div>
                        </div>
                    </div>
                ))}
                {templates.length === 0 && <p className="text-center text-gray-400 italic py-4">No templates created yet.</p>}
            </div>
            {isModalOpen && editingTemplate && (
                <PlainTextTemplateEditorModal
                    template={editingTemplate}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    title={title}
                />
            )}
        </div>
    );
};

interface PlainTextTemplateEditorModalProps {
    template: { id: string; title: string; body: string };
    onClose: () => void;
    onSave: (template: { id: string; title: string; body: string }) => void;
    title: string;
}

const PlainTextTemplateEditorModal: React.FC<PlainTextTemplateEditorModalProps> = ({ template, onClose, onSave, title }) => {
    const [currentTitle, setCurrentTitle] = useState(template.title);
    const [body, setBody] = useState(template.body);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mergeFields = getMergeFields();

    const handleSave = () => {
        onSave({ ...template, title: currentTitle, body });
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault(); // Allow drop
    };

    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const fieldTag = e.dataTransfer.getData('text/plain');
        if (fieldTag.startsWith('{{') && fieldTag.endsWith('}}')) {
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newBody = body.substring(0, start) + fieldTag + body.substring(end);
                setBody(newBody);
                // Set cursor position after inserted text
                setTimeout(() => {
                    if(textareaRef.current) {
                        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + fieldTag.length;
                        textareaRef.current.focus();
                    }
                }, 0);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 transform transition-all dark:bg-gray-800">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{template.id ? 'Edit' : 'Create'} {title.slice(0, -1)}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><CloseIcon/></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <input
                            type="text"
                            placeholder="Template Title"
                            value={currentTitle}
                            onChange={(e) => setCurrentTitle(e.target.value)}
                            className="form-input w-full text-lg font-semibold dark:bg-gray-700 dark:border-gray-600"
                        />
                        <textarea
                            ref={textareaRef}
                            rows={12}
                            placeholder="Message body... Drag fields from the right."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="form-input w-full text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                     <div className="md:col-span-1">
                        <MergeFieldPalette mergeFields={mergeFields} />
                    </div>
                </div>
                 <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm">Save Template</button>
                </div>
            </div>
        </div>
    );
};

const WorkflowEngineV2Manager: React.FC = () => {
    const [logs, setLogs] = useState<EngineLog[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const handleRunEngine = async () => {
        setIsRunning(true);
        setLogs([]);
        try {
            // The engine defaults to dryRun=true, which is safe.
            const resultLogs = await runEngine();
            setLogs(resultLogs);
        } catch (error) {
            console.error("Workflow Engine V2 failed:", error);
            const errorLog: EngineLog = {
                timestamp: new Date().toISOString(),
                message: `Engine execution failed: ${(error as Error).message}`,
                level: 'error',
            };
            setLogs([errorLog]);
        } finally {
            setIsRunning(false);
        }
    };

    const logColors: Record<EngineLog['level'], string> = {
        info: 'text-gray-400',
        action: 'text-blue-400 font-bold',
        warn: 'text-yellow-400',
        error: 'text-red-500 font-bold',
    };

    return (
         <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 space-y-6">
            <div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">Stateful Workflow Engine (V2)</h4>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                    This engine detects changes between states to trigger powerful automations.
                </p>
            </div>

            <div className="space-y-3">
                <h5 className="font-semibold dark:text-gray-300">Active Rules</h5>
                {workflowsV2.map(wf => (
                    <div key={wf.id} className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{wf.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{wf.description}</p>
                    </div>
                ))}
            </div>

            <div>
                <button onClick={handleRunEngine} disabled={isRunning} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors font-semibold shadow-md disabled:bg-gray-400">
                    {isRunning ? 'Running...' : 'Run Engine (Dry Run)'}
                </button>
            </div>

            <div>
                <h5 className="font-semibold dark:text-gray-300 mb-2">Execution Log</h5>
                <div className="p-3 bg-gray-900 text-gray-200 rounded-md font-mono text-xs h-64 overflow-y-auto">
                    {logs.length > 0 ? logs.map((log, i) => (
                        <div key={i} className={logColors[log.level]}>
                           <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}: </span> {log.message}
                        </div>
                    )) : 'Run the engine to see logs here.'}
                </div>
            </div>
        </div>
    );
};


const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');
    const [companyProfile, setCompanyProfile] = useLocalStorage<CompanyProfile>('companyProfile', {
        companyName: 'ReloPro Ltd',
        address: '123 Move It Street, London, E1 6AN',
        phone: '020 7123 4567',
        email: 'contact@relopro.co.uk',
        website: 'www.relopro.co.uk',
        vatNumber: 'GB123456789',
    });
    const [workflows, setWorkflows] = useLocalStorage<Workflow[]>('workflows', []);
    const [smsTemplates, setSmsTemplates] = useLocalStorage<SmsTemplate[]>('smsTemplates', []);
    const [whatsAppTemplates, setWhatsAppTemplates] = useLocalStorage<WhatsAppTemplate[]>('whatsAppTemplates', []);
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompanyProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const renderTabs = () => (
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-6">
                {(['Profile', 'Lead Scoring', 'Workflows', 'Workflow Engine V2', 'Email', 'SMS', 'WhatsApp'] as SettingsTab[]).map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-1 border-b-2 font-semibold text-sm ${
                            activeTab === tab
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                        }`}
                    >
                        {tab === 'Email' ? 'Email Templates' : tab === 'SMS' ? 'SMS Templates' : tab === 'WhatsApp' ? 'WhatsApp Templates' : tab}
                    </button>
                ))}
            </nav>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 dark:text-gray-200">Company Profile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Company Name" name="companyName" value={companyProfile.companyName} onChange={handleProfileChange} />
                            <InputField label="Email" name="email" value={companyProfile.email} onChange={handleProfileChange} />
                            <InputField label="Phone" name="phone" value={companyProfile.phone} onChange={handleProfileChange} />
                            <InputField label="Website" name="website" value={companyProfile.website} onChange={handleProfileChange} />
                            <InputField label="Address" name="address" value={companyProfile.address} onChange={handleProfileChange} />
                            <InputField label="VAT Number" name="vatNumber" value={companyProfile.vatNumber} onChange={handleProfileChange} />
                        </div>
                    </div>
                );
            case 'Lead Scoring':
                return <LeadScoringManager />;
            case 'Workflows':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                        <WorkflowBuilder workflows={workflows} setWorkflows={setWorkflows} />
                    </div>
                );
            case 'Workflow Engine V2':
                return <WorkflowEngineV2Manager />;
            case 'Email':
                return <EmailTemplatesManager />;
            case 'SMS':
                return <PlainTextTemplatesManager title="SMS Templates" templates={smsTemplates} onTemplatesChange={setSmsTemplates} templateIdPrefix="sms" />;
            case 'WhatsApp':
                 return <PlainTextTemplatesManager title="WhatsApp Templates" templates={whatsAppTemplates} onTemplatesChange={setWhatsAppTemplates} templateIdPrefix="wa" />;
        }
    };

    return (
        <div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Settings</h3>
            <p className="text-gray-600 mt-1 dark:text-gray-400">Manage your company profile, automations, and templates.</p>
            <div className="mt-6">
                {renderTabs()}
                {renderContent()}
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        />
    </div>
);

export default SettingsPage;