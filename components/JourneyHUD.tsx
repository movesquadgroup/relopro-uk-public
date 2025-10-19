import React from "react";
import { useJourney, useJourneyActions } from "../lib/journey/hooks";
import { JourneyOrder } from "../lib/journey/orchestrator";

export default function JourneyHUD() {
  const s = useJourney();
  const { back, advance, reset } = useJourneyActions();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: "rgba(17,24,39,0.9)",
        color: "white",
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        maxWidth: 360,
        fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Journey (debug)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {JourneyOrder.map((st) => (
          <span
            key={st}
            title={st}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              background: st === s.stage ? "#4f46e5" : "transparent",
              opacity: st === s.stage ? 1 : 0.7,
            }}
          >
            {st}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={back} style={btn}>Back</button>
        <button onClick={advance} style={btn}>Advance</button>
        <button onClick={reset} style={{ ...btn, background: "#991b1b" }}>Reset</button>
      </div>
      <div style={{ fontSize: 11, marginTop: 8, opacity: 0.8 }}>
        clientId: {s.pointers.clientId ?? "—"} · quoteId: {s.pointers.quoteId ?? "—"} · jobId: {s.pointers.jobId ?? "—"}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  fontSize: 12,
  padding: "6px 10px",
  background: "#1f2937",
  color: "white",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  cursor: "pointer",
};
