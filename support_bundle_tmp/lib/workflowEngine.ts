import { Client, ClientStatus, Workflow, WorkflowTriggerType, WorkflowActionType, Task, Activity, ActivityType } from '../types';

interface WorkflowResult {
    updatedTasks: Task[];
    logs: Activity[];
}

export const executeWorkflows = (client: Client, newStatus: ClientStatus, workflows: Workflow[]): WorkflowResult => {
    const updatedTasks: Task[] = [];
    const logs: Activity[] = [];

    const applicableWorkflows = workflows.filter(wf => 
        wf.isEnabled &&
        wf.trigger.type === WorkflowTriggerType.ClientStatusChanged &&
        wf.trigger.value === newStatus
    );

    if (applicableWorkflows.length === 0) {
        return { updatedTasks, logs };
    }

    applicableWorkflows.forEach(wf => {
        if (wf.action.type === WorkflowActionType.CreateTask) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (wf.action.taskDueDateDays || 0));

            const newTask: Task = {
                id: `task-wf-${Date.now()}`,
                description: wf.action.taskDescription || 'Untitled Task',
                dueDate: dueDate.toISOString().split('T')[0],
                isCompleted: false,
            };
            updatedTasks.push(newTask);

            const newLog: Activity = {
                id: `log-wf-${Date.now()}`,
                type: ActivityType.TaskCompleted, // Using this for visual representation
                content: `Workflow '${wf.name}' created task: "${newTask.description}" for client ${client.name}.`,
                author: 'Automation Bot',
                timestamp: new Date().toISOString(),
            };
            logs.push(newLog);
        }
    });

    return { updatedTasks, logs };
};
