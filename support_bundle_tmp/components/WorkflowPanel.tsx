import React, { useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  Client,
  Quote,
  QuoteStatus,
  DiaryEvent,
  DiaryActivityType,
  Task,
} from "../types";
import { getAutoTasksForStage } from "../lib/workflowRules";

/**
 * Minimal, self-contained “move order” state machine for one client’s job.
 * Persists in localStorage("moveOrders") to avoid touching the rest of the app.
 */

export type MoveOrderStage =
  | "Lead"
  | "Discovery"
  | "Survey"
  | "Costing"
  | "Quoting"
  | "Accepted"
  | "Rejected"
  | "OperationsPlanning"
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Storage"
  | "PostMove";

export interface MoveOrder {
  id: string;
  clientId: string;
  stage: MoveOrderStage;
  schedule?: { start?: string; end?: string; diaryEventId?: string };
}

const STAGES: MoveOrderStage[] = [
  "Lead",
  "Discovery",
  "Survey",
  "Costing",
  "Quoting",
  "Accepted",
  "Rejected",
  "OperationsPlanning",
  "Scheduled",
  "InProgress",
  "Completed",
  "Storage",
  "PostMove",
];

const allowedTransitions: Record<MoveOrderStage, MoveOrderStage[]> = {
  Lead: ["Discovery"],
  Discovery: ["Survey"],
  Survey: ["Costing"],
  Costing: ["Quoting"],
  Quoting: ["Accepted", "Rejected"],
  Accepted: ["OperationsPlanning"],
  Rejected: [],
  OperationsPlanning: ["Scheduled"],
  Scheduled: ["InProgress"],
  InProgress: ["Completed"],
  Completed: ["Storage", "PostMove"],
  Storage: [],
  PostMove: [],
};

type GateCtx = {
  hasPrimaryContact?: boolean;
  hasSurvey?: boolean;
  hasCostModel?: boolean;
  hasQuote?: boolean;
  quoteAccepted?: boolean;
  plannedResources?: boolean;
  scheduledDate?: string;
};

function gateMessageFor(stage: MoveOrderStage) {
  switch (stage) {
    case "Discovery":
      return "Add a primary contact (email or phone) first.";
    case "Survey":
      return "Add a Survey event (InPerson/Virtual) in the diary.";
    case "Costing":
      return "Enter costing inputs (e.g., estimated volume or budget).";
    case "Quoting":
      return "Create at least one quote.";
    case "Accepted":
      return "Mark a quote as Accepted.";
    case "OperationsPlanning":
      return "Assign staff/vehicle or create a planning record.";
    case "Scheduled":
      return "Pick a move date (create a BookJob diary event).";
    default:
      return undefined;
  }
}

function checkGate(stage: MoveOrderStage, ctx: GateCtx) {
  switch (stage) {
    case "Discovery":
      return !!ctx.hasPrimaryContact;
    case "Survey":
      return !!ctx.hasSurvey;
    case "Costing":
      return !!ctx.hasCostModel;
    case "Quoting":
      return !!ctx.hasQuote;
    case "Accepted":
      return !!ctx.quoteAccepted;
    case "OperationsPlanning":
      return !!ctx.plannedResources;
    case "Scheduled":
      return !!ctx.scheduledDate;
    default:
      return true;
  }
}

function StagePills({ current }: { current: MoveOrderStage }) {
  const idx = STAGES.indexOf(current);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            className={`px-2 py-1 rounded text-[10px] uppercase tracking-wide ${
              i <= idx
                ? "bg-brand-primary text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {s}
          </div>
          {i < STAGES.length - 1 && (
            <span className="mx-1 text-gray-400">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function WorkflowPanel({ client }: { client: Client }) {
  // Related data to auto-check gates
  const [quotes] = useLocalStorage<Quote[]>("quotes", []);
  const [diary] = useLocalStorage<DiaryEvent[]>("diaryEvents", []);
  const [orders, setOrders] = useLocalStorage<MoveOrder[]>("moveOrders", []);

  // We’ll also write auto-tasks into the client record when stages advance
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);

  // Get or create client’s MoveOrder
  const order =
    orders.find((o) => o.clientId === client.id) ||
    (() => {
      const fresh: MoveOrder = {
        id: `mo-${client.id}`,
        clientId: client.id,
        stage: "Lead",
      };
      setOrders((prev) => [fresh, ...prev]);
      return fresh;
    })();

  // Compute context for gates
  const ctx: GateCtx = useMemo(() => {
    const clientQuotes = quotes.filter((q) => q.clientId === client.id);
    const clientDiary = diary.filter((d) => d.clientId === client.id);

    const hasSurvey = clientDiary.some((e) =>
      [DiaryActivityType.InPersonSurvey, DiaryActivityType.VirtualSurvey].includes(
        e.activityType
      )
    );

    const acceptedQuote = clientQuotes.find(
      (q) => q.status === QuoteStatus.Accepted
    );

    const plannedJob = clientDiary.find(
      (e) =>
        e.activityType === DiaryActivityType.BookJob &&
        ((e.assignedVehicleIds && e.assignedVehicleIds.length > 0) ||
          (e.assignedStaffIds && e.assignedStaffIds.length > 0))
    );

    const scheduledJob = clientDiary.find(
      (e) => e.activityType === DiaryActivityType.BookJob && e.start
    );

    return {
      hasPrimaryContact: !!(client.email || client.phone),
      hasSurvey,
      hasCostModel: !!client.estimatedVolume || !!client.budget,
      hasQuote: clientQuotes.length > 0,
      quoteAccepted: !!acceptedQuote,
      plannedResources: !!plannedJob,
      scheduledDate: scheduledJob?.start,
    };
  }, [client, quotes, diary]);

  const nexts = allowedTransitions[order.stage] || [];

  const addAutoTasks = (to: MoveOrderStage) => {
    const templates = getAutoTasksForStage(to, client.name);
    if (!templates.length) return;

    const today = new Date();
    const newTasks: Task[] = templates.map((tpl, i) => {
      const due = new Date(today);
      due.setDate(due.getDate() + (tpl.dueInDays ?? 3));
      return {
        id: `task-auto-${to}-${Date.now()}-${i}`,
        description: tpl.description,
        dueDate: due.toISOString().split("T")[0],
        isCompleted: false,
      };
    });

    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id ? { ...c, tasks: [...(c.tasks || []), ...newTasks] } : c
      )
    );
  };

  const advance = (to: MoveOrderStage) => {
    const ok = checkGate(to, ctx);
    if (!ok) {
      const msg = gateMessageFor(to) || "Missing required info for this stage.";
      alert(msg);
      return;
    }
    // Attach schedule info when moving to Scheduled
    let schedule = order.schedule;
    if (to === "Scheduled") {
      const job = diary.find(
        (e) => e.clientId === client.id && e.activityType === DiaryActivityType.BookJob
      );
      if (job) {
        schedule = { start: job.start, end: job.end, diaryEventId: job.id };
      }
    }
    const updated: MoveOrder = { ...order, stage: to, schedule };
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));

    // Add contextual auto-tasks for the next stage
    addAutoTasks(to);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg dark:bg-gray-800">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Workflow Stage</p>
          <div className="mt-1">
            <StagePills current={order.stage} />
          </div>
        </div>
        {nexts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {nexts.map((to) => {
              const enabled = checkGate(to, ctx);
              return (
                <button
                  key={to}
                  onClick={() => advance(to)}
                  disabled={!enabled}
                  className={`px-3 py-1.5 rounded text-sm font-semibold ${
                    enabled
                      ? "bg-brand-primary text-white hover:bg-brand-secondary"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  }`}
                  title={enabled ? `Advance to ${to}` : gateMessageFor(to)}
                >
                  {to}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Gate checklist */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-sm">
        <GateItem ok={!!ctx.hasPrimaryContact} label="Primary contact" />
        <GateItem ok={!!ctx.hasSurvey} label="Survey captured" />
        <GateItem ok={!!ctx.hasCostModel} label="Cost model ready" />
        <GateItem ok={!!ctx.hasQuote} label="Quote created" />
        <GateItem ok={!!ctx.quoteAccepted} label="Quote accepted" />
        <GateItem ok={!!ctx.plannedResources} label="Ops plan (staff/vehicle)" />
        <GateItem ok={!!ctx.scheduledDate} label="Move date scheduled" />
      </div>

      {order.stage === "Scheduled" && order.schedule?.start && (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
          Scheduled: {new Date(order.schedule.start).toLocaleString()} →
          {order.schedule.end ? ` ${new Date(order.schedule.end).toLocaleString()}` : " (end TBD)"}
        </div>
      )}
    </div>
  );
}

function GateItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          ok ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
      />
      <span className={ok ? "text-gray-800 dark:text-gray-200" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );
}
