import React, { useState, useMemo } from 'react';
import { Client, EmailTemplate, SmsTemplate, WhatsAppTemplate } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import RichTextEditor from './RichTextEditor';
import { sendEmail, getMergeFields, replaceMergeFields } from '../lib/emailUtils';

interface SendMessageModalProps {
    client: Client;
    onClose: () => void;
}

type Channel = 'Email' | 'SMS' | 'WhatsApp';

const SendMessageModal: React.FC<SendMessageModalProps> = ({ client, onClose }) => {
    const [activeChannel, setActiveChannel] = useState<Channel>('Email');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const [emailTemplates] = useLocalStorage<EmailTemplate[]>('emailTemplates', []);
    const [smsTemplates] = useLocalStorage<SmsTemplate[]>('smsTemplates', []);
    const [whatsAppTemplates] = useLocalStorage<WhatsAppTemplate[]>('whatsAppTemplates', []);

    const templatesForChannel = useMemo(() => {
        if (activeChannel === 'Email') return emailTemplates;
        if (activeChannel === 'SMS') return smsTemplates;
        if (activeChannel === 'WhatsApp') return whatsAppTemplates;
        return [];
    }, [activeChannel, emailTemplates, smsTemplates, whatsAppTemplates]);

    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        const template = templatesForChannel.find(t => t.id === templateId);
        if (template) {
            const body = replaceMergeFields(template.body, client);
            if (activeChannel === 'Email') {
                 setSubject(template.title);
            } else {
                setSubject(''); // No subject for SMS/WhatsApp
            }
            setMessage(body);
        } else {
            setSubject('');
            setMessage('');
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            if (activeChannel === 'Email') {
                await sendEmail(client.email, subject, message);
                alert('Email sent successfully (mocked).');
            } else {
                alert(`${activeChannel} sending is not implemented yet.`);
            }
            onClose();
        } catch (error) {
            console.error("Failed to send message:", error);
            alert('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 transform transition-all dark:bg-gray-800">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Send Message to {client.name}</h3>
                </div>

                <div className="p-6">
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="-mb-px flex space-x-4">
                            {(['Email', 'SMS', 'WhatsApp'] as Channel[]).map(channel => (
                                <button
                                    key={channel}
                                    onClick={() => setActiveChannel(channel)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeChannel === channel
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {channel}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-4">
                        <InputField label="To" value={activeChannel === 'Email' ? client.email : client.phone} readOnly />
                        {activeChannel === 'Email' && (
                            <InputField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                        )}

                        {templatesForChannel.length > 0 && (
                            <select onChange={handleTemplateSelect} className="form-input w-full dark:bg-gray-700 dark:border-gray-600" defaultValue="">
                                <option value="">Select a template...</option>
                                {templatesForChannel.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                            {activeChannel === 'Email' ? (
                                <RichTextEditor 
                                    value={message} 
                                    onChange={setMessage} 
                                    mergeFields={getMergeFields()}
                                />
                            ) : (
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={8}
                                    className="mt-1 form-input w-full dark:bg-gray-700 dark:border-gray-600"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSend} disabled={isSending} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm disabled:bg-gray-400">
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, value: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, readOnly?: boolean}> = ({ label, value, onChange, readOnly }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className="mt-1 form-input w-full read-only:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:read-only:bg-gray-600"
        />
    </div>
);

export default SendMessageModal;