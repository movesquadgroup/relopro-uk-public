// ENHANCEMENT_workflow_v2: Rules for the new state-aware workflow engine.

import { WorkflowV2, QuoteStatus, DiaryActivityType } from '../../types';

export const workflowsV2: WorkflowV2[] = [
    {
        id: 'WF2-001',
        name: 'Auto-Create Job from Accepted Quote',
        description: 'When a quote status changes from Sent to Accepted, automatically create a new Booked Job in the diary.',
        isEnabled: true,
        trigger: {
            type: 'RECORD_UPDATE',
            recordType: 'Quote',
            field: 'status',
            from: QuoteStatus.Sent,
            to: QuoteStatus.Accepted,
        },
        action: {
            type: 'CREATE_DIARY_EVENT',
            eventType: DiaryActivityType.BookJob,
        },
    },
    // Future V2 workflows can be added here
];
