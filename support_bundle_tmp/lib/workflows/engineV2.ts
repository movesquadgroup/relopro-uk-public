// ENHANCEMENT_workflow_v2: Core logic for the state-aware workflow engine.

import { Client, Quote, DiaryEvent, EngineLog, WorkflowV2, DiaryActivityType } from '../../types';
import { workflowsV2 } from './workflowsV2';

const SNAPSHOT_KEY = 'engineV2_snapshot';

interface AppState {
    clients: Client[];
    quotes: Quote[];
    diaryEvents: DiaryEvent[];
}

// Helper to read data from localStorage
function readLocalStorage<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

// Helper to write data to localStorage
function writeLocalStorage<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
}

function createLog(message: string, level: EngineLog['level'] = 'info'): EngineLog {
    return { timestamp: new Date().toISOString(), message, level };
}

/**
 * Runs the state-aware workflow engine.
 * @param {object} options - The options for the engine run.
 * @param {boolean} [options.dryRun=true] - If true, the engine will only log what it would do.
 * @returns {Promise<EngineLog[]>} A promise that resolves with the execution logs.
 */
export async function runEngine({ dryRun = true } = {}): Promise<EngineLog[]> {
    const logs: EngineLog[] = [];
    logs.push(createLog(`Engine starting in ${dryRun ? 'Dry Run' : 'Live'} mode.`));

    // 1. Load current state and previous state snapshot
    const currentState: AppState = {
        clients: readLocalStorage<Client[]>('clients', []),
        quotes: readLocalStorage<Quote[]>('quotes', []),
        diaryEvents: readLocalStorage<DiaryEvent[]>('diaryEvents', []),
    };
    const previousState: AppState = readLocalStorage<AppState>(SNAPSHOT_KEY, { clients: [], quotes: [], diaryEvents: [] });

    logs.push(createLog(`Loaded ${currentState.quotes.length} current quotes and ${previousState.quotes.length} previous quotes.`));

    const activeWorkflows = workflowsV2.filter(wf => wf.isEnabled);
    let actionsToExecute: { action: WorkflowV2['action'], context: any }[] = [];

    // 2. Process triggers by comparing states
    for (const wf of activeWorkflows) {
        if (wf.trigger.type === 'RECORD_UPDATE' && wf.trigger.recordType === 'Quote') {
            const field = wf.trigger.field as keyof Quote;
            logs.push(createLog(`Checking for trigger: Quote.${String(field)} changed from "${wf.trigger.from}" to "${wf.trigger.to}".`));

            const prevQuotesMap = new Map(previousState.quotes.map(q => [q.id, q]));

            for (const currentQuote of currentState.quotes) {
                const prevQuote = prevQuotesMap.get(currentQuote.id);

                if (prevQuote && prevQuote[field] === wf.trigger.from && currentQuote[field] === wf.trigger.to) {
                    logs.push(createLog(`TRIGGERED: Quote ${currentQuote.id} status changed to "${currentQuote.status}".`, 'warn'));
                    actionsToExecute.push({ action: wf.action, context: { quote: currentQuote } });
                }
            }
        }
    }

    if (actionsToExecute.length === 0) {
        logs.push(createLog('No triggers matched. Nothing to do.'));
    }

    // 3. Execute actions
    let newDiaryEvents = [...currentState.diaryEvents];

    for (const { action, context } of actionsToExecute) {
        if (action.type === 'CREATE_DIARY_EVENT' && action.eventType === DiaryActivityType.BookJob) {
            const quote = context.quote as Quote;
            const client = currentState.clients.find(c => c.id === quote.clientId);
            if (!client) {
                logs.push(createLog(`Could not find client ${quote.clientId} for quote ${quote.id}. Skipping action.`, 'error'));
                continue;
            }

            // Prevent creating a duplicate job for the same client on the same day
            const existingJob = currentState.diaryEvents.find(e => 
                e.clientId === client.id && 
                e.activityType === DiaryActivityType.BookJob &&
                new Date(e.start).toDateString() === new Date(client.moveDate).toDateString()
            );

            if (existingJob) {
                logs.push(createLog(`Job already exists for ${client.name} on this move date (${existingJob.id}). Skipping action.`, 'warn'));
                continue;
            }

            const moveDate = new Date(client.moveDate);
            const start = new Date(moveDate.setHours(8, 0, 0, 0)).toISOString();
            const end = new Date(moveDate.setHours(17, 0, 0, 0)).toISOString();

            const newJob: DiaryEvent = {
                id: `job-${Date.now()}`,
                title: client.name,
                clientId: client.id,
                start,
                end,
                activityType: DiaryActivityType.BookJob,
                originAddress: client.originAddresses[0] || 'TBC',
                destinationAddress: client.destinationAddresses[0] || 'TBC',
                assignedStaffIds: [],
                assignedVehicleIds: [],
                volumeCubicFeet: client.estimatedVolume,
            };

            logs.push(createLog(`ACTION: Would create a new Booked Job for ${client.name} on ${new Date(start).toLocaleDateString()}.`, 'action'));
            if (!dryRun) {
                newDiaryEvents.push(newJob);
            }
        }
    }

    // 4. If not a dry run, persist changes and update snapshot
    if (!dryRun) {
        if (newDiaryEvents.length > currentState.diaryEvents.length) {
            writeLocalStorage('diaryEvents', newDiaryEvents);
            logs.push(createLog('Successfully created new diary events and saved to localStorage.', 'info'));
        }
        
        // Update the snapshot to the current state for the next run
        writeLocalStorage(SNAPSHOT_KEY, currentState);
        logs.push(createLog('Saved current state as snapshot for next run.', 'info'));
    } else {
        logs.push(createLog('Dry Run complete. No changes were saved.', 'info'));
    }

    return logs;
}
