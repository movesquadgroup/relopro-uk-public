import React, { useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Client } from "../types";
import { MoveOrder, MoveOrderStage } from "./WorkflowPanel";
import { Link } from "react-router-dom";

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

export default function WorkflowBoard() {
  const [orders] = useLocalStorage<MoveOrder[]>("moveOrders", []);
  const [clients] = useLocalStorage<Client[]>("clients", []);

  const byStage = useMemo(() => {
    const map = new Map<MoveOrderStage, { order: MoveOrder; client?: Client }[]>();
    STAGES.forEach((s) => map.set(s, []));
    orders.forEach((o) => {
      const c = clients.find((x) => x.id === o.clientId);
      if (map.has(o.stage)) {
        map.get(o.stage)!.push({ order: o, client: c });
      }
    });
    return map;
  }, [orders, clients]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 pb-4">
        {STAGES.map((stage) => {
          const items = byStage.get(stage) || [];
          return (
            <div key={stage} className="bg-white dark:bg-gray-800 rounded-lg p-3 w-64 md:w-72 shadow-md flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-200">{stage}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 h-full overflow-y-auto" style={{maxHeight: 'calc(100vh - 20rem)'}}>
                {items.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-8">No clients</div>
                )}
                {items.map(({ order, client }) => (
                  <Link
                    key={order.id}
                    to={`/crm/${order.clientId}`}
                    className="block p-3 text-sm rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                  >
                    <div className="font-semibold text-gray-800 dark:text-gray-100">
                      {client?.name || order.clientId}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {client?.originAddresses?.[0] || "—"} →{" "}
                      {client?.destinationAddresses?.[0] || "—"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
