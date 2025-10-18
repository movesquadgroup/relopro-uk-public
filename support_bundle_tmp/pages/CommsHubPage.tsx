import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Message, ChannelType } from '../types';
import { WhatsAppIcon, SmsIcon, MessageIcon as EmailIcon } from '../components/icons/Icons';
import { sendEmail } from '../lib/integrations/email';
import { sendSms } from '../lib/integrations/sms';
import { sendWhatsAppMessage } from '../lib/integrations/whatsapp';

const mockMessages: Message[] = [
    { id: 'msg-1', clientId: 'CLI001', channel: ChannelType.Email, direction: 'outbound', timestamp: '2024-06-01T10:05:00Z', author: 'John Doe', subject: 'Your Move Quotation', content: '<p>Hi Alice, please find your quotation attached.</p>' },
    { id: 'msg-2', clientId: 'CLI001', channel: ChannelType.Email, direction: 'inbound', timestamp: '2024-06-02T14:20:00Z', author: 'Alice Johnson', subject: 'Re: Your Move Quotation', content: '<p>Thanks, John. This looks great. Can we add packing services?</p>' },
    { id: 'msg-3', clientId: 'CLI002', channel: ChannelType.WhatsApp, direction: 'outbound', timestamp: '2024-06-05T11:35:00Z', author: 'Jane Smith', content: 'Hi Bob, confirming your booking for Aug 5th. Our team will arrive between 8-9 AM.' },
    { id: 'msg-4', clientId: 'CLI002', channel: ChannelType.WhatsApp, direction: 'inbound', timestamp: '2024-06-05T11:38:00Z', author: 'Bob Williams', content: 'Perfect, thanks!' },
    { id: 'msg-5', clientId: 'CLI004', channel: ChannelType.SMS, direction: 'outbound', timestamp: '2024-06-12T14:02:00Z', author: 'System', content: 'ReloPro: A surveyor has been assigned to your enquiry. They will contact you shortly to arrange a visit.' },
];

const CommsHubPage: React.FC = () => {
    const [clients] = useLocalStorage<Client[]>('clients', []);
    const [messages, setMessages] = useLocalStorage<Message[]>('messages', mockMessages);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);

    const conversations = useMemo(() => {
        const convos = new Map<string, { client: Client; lastMessage: Message }>();
        messages.forEach(msg => {
            const client = clients.find(c => c.id === msg.clientId);
            if (client) {
                const existing = convos.get(client.id);
                if (!existing || msg.timestamp > existing.lastMessage.timestamp) {
                    convos.set(client.id, { client, lastMessage: msg });
                }
            }
        });
        // Add clients with no messages yet
        clients.forEach(client => {
            if (!convos.has(client.id)) {
                 convos.set(client.id, { client, lastMessage: { id: '', clientId: client.id, channel: ChannelType.Email, direction: 'outbound', timestamp: client.createdAt, content: 'No messages yet', author: '' } });
            }
        });
        return Array.from(convos.values()).sort((a, b) => b.lastMessage.timestamp.localeCompare(a.lastMessage.timestamp));
    }, [clients, messages]);

    const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

    const selectedThread = useMemo(() => {
        if (!selectedClientId) return [];
        return messages.filter(m => m.clientId === selectedClientId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    }, [messages, selectedClientId]);

    const handleSendMessage = (channel: ChannelType, subject: string, content: string) => {
        if (!selectedClient || !content.trim()) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            clientId: selectedClient.id,
            channel,
            direction: 'outbound',
            timestamp: new Date().toISOString(),
            author: 'John Doe', // Logged in user
            content,
            subject: channel === ChannelType.Email ? subject : undefined,
        };
        setMessages(prev => [...prev, newMessage]);
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            <div className="mb-4">
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Communication Hub</h3>
                <p className="text-gray-600 mt-1 dark:text-gray-400">Unified inbox for all client conversations.</p>
            </div>
            <div className="flex-grow grid grid-cols-12 gap-6 h-full">
                {/* Conversations List */}
                <div className="col-span-3 h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 space-y-1">
                    {conversations.map(({ client, lastMessage }) => (
                        <ConversationItem key={client.id} client={client} lastMessage={lastMessage} isSelected={selectedClientId === client.id} onClick={() => setSelectedClientId(client.id)} />
                    ))}
                </div>

                {/* Message Thread & Composer */}
                <div className="col-span-9 h-full flex flex-col md:flex-row gap-6">
                    {selectedClient ? (
                        <>
                            <ThreadPanel thread={selectedThread} client={selectedClient} />
                            <ComposerPanel client={selectedClient} onSend={handleSendMessage} />
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <p className="text-gray-500">Select a conversation to view messages.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConversationItem: React.FC<{ client: Client; lastMessage: Message; isSelected: boolean; onClick: () => void }> = ({ client, lastMessage, isSelected, onClick }) => (
    <button onClick={onClick} className={`w-full text-left p-3 rounded-lg transition-colors ${isSelected ? 'bg-brand-light dark:bg-brand-secondary/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
        <div className="flex justify-between items-center">
            <p className={`font-semibold ${isSelected ? 'text-brand-primary dark:text-gray-100' : 'text-gray-800 dark:text-gray-200'}`}>{client.name}</p>
            <p className="text-xs text-gray-400">{new Date(lastMessage.timestamp).toLocaleDateString()}</p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lastMessage.content.replace(/<[^>]+>/g, '')}</p>
    </button>
);

const ThreadPanel: React.FC<{ thread: Message[]; client: Client }> = ({ thread, client }) => {
    const threadEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    return (
        <div className="w-full md:w-2/3 h-full bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
                <h4 className="font-bold text-lg">{client.name}</h4>
                <p className="text-sm text-gray-500">{client.email} &bull; {client.phone}</p>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {thread.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                <div ref={threadEndRef} />
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isOutbound = message.direction === 'outbound';
    const channelIcons: Record<ChannelType, React.ReactNode> = {
        [ChannelType.Email]: <EmailIcon className="w-4 h-4" />,
        [ChannelType.SMS]: <SmsIcon className="w-4 h-4" />,
        [ChannelType.WhatsApp]: <WhatsAppIcon className="w-4 h-4" />,
    };

    return (
        <div className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${isOutbound ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                {message.subject && <p className="font-bold text-sm mb-1">{message.subject}</p>}
                {message.channel === ChannelType.Email ? (
                    <div className="text-sm prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: message.content }} />
                ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                {channelIcons[message.channel]}
                <span>{message.author} &bull; {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
    );
};

const ComposerPanel: React.FC<{ client: Client; onSend: (channel: ChannelType, subject: string, body: string) => void }> = ({ client, onSend }) => {
    const [channel, setChannel] = useState<ChannelType>(ChannelType.Email);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendClick = async () => {
        setIsSending(true);
        try {
            if (channel === ChannelType.Email) await sendEmail(client.email, subject, body, { clientId: client.id });
            if (channel === ChannelType.SMS) await sendSms(client.phone, body, { clientId: client.id });
            if (channel === ChannelType.WhatsApp) await sendWhatsAppMessage(client.phone, body, { clientId: client.id });
            
            onSend(channel, subject, body);
            setSubject('');
            setBody('');
        } catch (error) {
            console.error("Failed to send message:", error);
            alert(`Error sending ${channel}: ${(error as Error).message}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full md:w-1/3 h-full bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
            <div className="p-3 border-b dark:border-gray-700">
                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                    {(Object.values(ChannelType)).map(c => (
                        <button key={c} onClick={() => setChannel(c)} className={`flex-1 px-2 py-1.5 text-sm font-semibold rounded-md transition-colors ${channel === c ? 'bg-white text-brand-primary shadow-sm dark:bg-gray-700 dark:text-gray-100' : 'text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow p-3 space-y-3 flex flex-col">
                {channel === ChannelType.Email && (
                    <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="form-input" />
                )}
                <textarea placeholder={`Message to ${client.name}...`} value={body} onChange={e => setBody(e.target.value)} className="form-input flex-grow" />
            </div>
            <div className="p-3 border-t dark:border-gray-700">
                <button onClick={handleSendClick} disabled={isSending || !body.trim()} className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md disabled:bg-gray-400">
                    {isSending ? 'Sending...' : `Send ${channel}`}
                </button>
            </div>
            <style>{`.form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; } .dark .form-input { background-color: #374151; border-color: #4b5563; color: #f9fafb; }`}</style>
        </div>
    );
};

export default CommsHubPage;