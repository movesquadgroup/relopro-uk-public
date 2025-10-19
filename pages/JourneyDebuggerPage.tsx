import React from "react";
import JourneyHUD from "../components/JourneyHUD";
import { useJourney, useJourneyActions } from "../lib/journey/hooks";

export default function JourneyDebuggerPage() {
  const s = useJourney();
  const { setPointers } = useJourneyActions();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Journey Debugger</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        This page lets you visualize and tweak the journey state without affecting other screens.
      </p>

      <div style={{ marginTop: 16 }}>
        <pre
          style={{
            background: "var(--rp-panel, #0f172a)",
            color: "var(--rp-panel-fg, #e2e8f0)",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
            fontSize: 12,
          }}
        >
{JSON.stringify(s, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12, maxWidth: 520 }}>
        <InputRow label="clientId" value={s.pointers.clientId ?? ""} onChange={(v) => setPointers({ clientId: v || undefined })} />
        <InputRow label="quoteId" value={s.pointers.quoteId ?? ""} onChange={(v) => setPointers({ quoteId: v || undefined })} />
        <InputRow label="jobId" value={s.pointers.jobId ?? ""} onChange={(v) => setPointers({ jobId: v || undefined })} />
      </div>

      <JourneyHUD />
    </div>
  );
}

function InputRow(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{props.label}</span>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={`optional ${props.label}`}
        style={{
          fontSize: 14,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid var(--rp-border, #334155)",
          background: "var(--rp-bg2, #0b1220)",
          color: "var(--rp-fg, #e2e8f0)",
        }}
      />
    </label>
  );
}
