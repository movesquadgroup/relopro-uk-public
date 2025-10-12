/**
 * Auto-task templates that trigger when a MoveOrder advances to a stage.
 * Keep this simple & transparent so your team can tune tasks without code changes elsewhere.
 */

export type AutoTaskTemplate = {
  description: string;
  dueInDays?: number; // default 3
};

export function getAutoTasksForStage(
  stage: string,
  clientName: string
): AutoTaskTemplate[] {
  switch (stage) {
    case "Survey":
      return [
        { description: `Prepare costing inputs for ${clientName} (volume, access, packing)`, dueInDays: 2 },
      ];
    case "Costing":
      return [
        { description: `Build cost model & validate transport modal for ${clientName}`, dueInDays: 2 },
      ];
    case "Quoting":
      return [
        { description: `Send quote to ${clientName} & set follow-up`, dueInDays: 1 },
        { description: `Follow up on quote with ${clientName}`, dueInDays: 3 },
      ];
    case "Accepted":
      return [
        { description: `Kick off operations planning for ${clientName}`, dueInDays: 1 },
      ];
    case "OperationsPlanning":
      return [
        { description: `Assign staff/vehicle & confirm resources for ${clientName}`, dueInDays: 2 },
      ];
    case "Scheduled":
      return [
        { description: `Send pre-move checklist & confirm access with ${clientName}`, dueInDays: 1 },
      ];
    case "Completed":
      return [
        { description: `Send post-move survey to ${clientName}`, dueInDays: 1 },
        { description: `Raise invoice / reconcile costs for ${clientName}`, dueInDays: 2 },
      ];
    case "Storage":
      return [
        { description: `Create storage agreement & first invoice for ${clientName}`, dueInDays: 2 },
      ];
    case "PostMove":
      return [
        { description: `Ask ${clientName} for review/testimonial`, dueInDays: 3 },
      ];
    default:
      return [];
  }
}
