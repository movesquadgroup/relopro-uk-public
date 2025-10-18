import React, { useState } from 'react';
import { Activity, ActivityType } from '../types';
import { NoteIcon, QuoteActivityIcon, StatusChangeIcon, TaskIcon, MagicWandIcon, CompletedJobsIcon } from './icons/Icons';
import { generateText, getConversationSummary } from '../lib/ai';
import { features } from '../lib/featureFlags';


interface ActivityTimelineProps {
    activities: Activity[];
    onAddNote: (note: string) => void;
    clientName: string;
    onGenerateSummaryAndTasks: (summary: string) => void;
}

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const iconMap: Record<ActivityType, { icon: React.ReactNode, color: string }> = {
        [ActivityType.Note]: { icon: <NoteIcon />, color: 'bg-yellow-500' },
        [ActivityType.QuoteCreated]: { icon: <QuoteActivityIcon />, color: 'bg-purple-500' },
        [ActivityType.StatusChange]: { icon: <StatusChangeIcon />, color: 'bg-green-500' },
        [ActivityType.TaskCompleted]: { icon: <TaskIcon />, color: 'bg-blue-500' },
        [ActivityType.EmailSent]: { icon: <NoteIcon />, color: 'bg-gray-500' },
        [ActivityType.QuoteAccepted]: { icon: <CompletedJobsIcon />, color: 'bg-green-600' },
    };

    const { icon, color } = iconMap[type] || iconMap[ActivityType.Note];

    return (
        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${color}`}>
            {icon}
        </span>
    );
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, onAddNote, clientName, onGenerateSummaryAndTasks }) => {
    const [note, setNote] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const handleGenerateNote = async () => {
      setIsGenerating(true);
      try {
        const prompt = `Write a brief follow-up note for a client named ${clientName}.`;
        const generatedNote = await generateText(prompt);
        setNote(generatedNote);
      } catch (e) {
        console.error("Generate note failed:", e);
      } finally {
        setIsGenerating(false);
      }
    };
    
    const handleGenerateSummary = async () => {
      setIsGeneratingSummary(true);
      try {
        const { summary: summaryText } = await getConversationSummary(activities);
        setSummary(summaryText);
        onGenerateSummaryAndTasks(summaryText);
      } catch (e) {
        console.error("Generate summary failed:", e);
      } finally {
        setIsGeneratingSummary(false);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddNote(note);
        setNote('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Activity Timeline</h3>
            
            {features.aiSummariesEnabled && (
                <div className="mb-4 p-3 bg-brand-light rounded-md dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-brand-primary dark:text-blue-300">AI Summary</h4>
                        <button
                            onClick={handleGenerateSummary}
                            disabled={isGeneratingSummary}
                            className="text-sm font-medium text-brand-primary hover:text-brand-secondary disabled:text-gray-400 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                        </button>
                    </div>
                    {summary ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
                    ) : (
                        <p className="text-sm text-gray-500 italic dark:text-gray-400">Generate a summary of the conversation.</p>
                    )}
                </div>
            )}

            {/* Add Note Form */}
            <form onSubmit={handleSubmit} className="mb-6 relative">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note, log a call, or mention a team member..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-accent focus:border-brand-accent text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    rows={3}
                    disabled={isGenerating}
                ></textarea>
                 <div className="flex justify-between items-center mt-2">
                    <button 
                        type="button" 
                        onClick={handleGenerateNote}
                        disabled={isGenerating}
                        className="flex items-center text-sm font-medium text-brand-primary hover:text-brand-secondary disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        <MagicWandIcon />
                        <span className="ml-1">{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                    </button>
                    <button 
                        type="submit" 
                        className="px-4 py-1.5 bg-brand-primary text-white text-sm rounded-lg hover:bg-brand-secondary font-semibold shadow"
                        disabled={!note.trim()}
                    >
                        Add Note
                    </button>
                </div>
            </form>

            {/* Timeline */}
            <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {activities.map((activity, activityIdx) => (
                        <li key={activity.id}>
                            <div className="relative pb-8">
                                {activityIdx !== activities.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <ActivityIcon type={activity.type} />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5">
                                        <div className="text-sm text-gray-500">
                                            <span className="font-medium text-gray-900">{activity.author}</span> added a <span className="font-medium">{activity.type}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded-md">{activity.content}</p>
                                        <div className="mt-1 text-xs text-gray-400">
                                            <time dateTime={activity.timestamp}>{new Date(activity.timestamp).toLocaleString()}</time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             {activities.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No activities logged yet.</p>}
        </div>
    );
};

export default ActivityTimeline;