import React, { useMemo, useRef, useState } from "react";

type Row = { key: string; size: number; preview: string };

function toCsv(rows: Array<Record<string, any>>): string {
  if (!rows.length) return "";
  const headers = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach(k => set.add(k));
      return set;
    }, new Set<string>())
  );
  const escape = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r?.[h])).join(",")),
  ];
  return lines.join("\n");
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function tryParseJSON(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default function ToolsPage() {
  const [filter, setFilter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const rows: Row[] = useMemo(() => {
    const keys = Object.keys(window.localStorage);
    return keys
      .map((key) => {
        const raw = window.localStorage.getItem(key) ?? "";
        const size = new Blob([raw]).size;
        const parsed = tryParseJSON(raw);
        const preview =
          typeof parsed === "object"
            ? JSON.stringify(parsed, null, 0).slice(0, 120)
            : String(parsed).slice(0, 120);
        return { key, size, preview };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [filter]); // filter triggers recompute via state change

  const filtered = filter
    ? rows.filter((r) => r.key.toLowerCase().includes(filter.toLowerCase()))
    : rows;

  const exportAllJSON = () => {
    const dump: Record<string, any> = {};
    for (const k of Object.keys(localStorage)) {
      const raw = localStorage.getItem(k) ?? "";
      dump[k] = tryParseJSON(raw);
    }
    download(
      `relopro-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`,
      JSON.stringify(dump, null, 2),
      "application/json"
    );
  };

  const exportKeyJSON = (k: string) => {
    const raw = localStorage.getItem(k) ?? "";
    const parsed = tryParseJSON(raw);
    download(`${k}.json`, JSON.stringify(parsed, null, 2), "application/json");
  };

  const exportKeyCSV = (k: string) => {
    const raw = localStorage.getItem(k) ?? "[]";
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      // Fallback: wrap a primitive into an array of objects
      data = [{ value: raw }];
    }
    const arr = Array.isArray(data) ? data : [data];
    const csv = toCsv(arr.map((x) => (typeof x === "object" ? x : { value: x })));
    download(`${k}.csv`, csv, "text/csv");
  };

  const restoreFromJSON = (obj: Record<string, any>) => {
    let wrote = 0;
    for (const [k, v] of Object.entries(obj || {})) {
      try {
        const val = typeof v === "string" ? v : JSON.stringify(v);
        localStorage.setItem(k, val);
        wrote++;
      } catch (e) {
        console.error("Failed to restore", k, e);
      }
    }
    alert(`Restore complete. Keys written: ${wrote}. Reloading…`);
    location.reload();
  };

  const onChooseFile = () => fileRef.current?.click();
  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") {
        alert("Invalid JSON file.");
        return;
      }
      if (!confirm("Restore from this JSON? This will overwrite keys of the same name.")) return;
      restoreFromJSON(parsed as Record<string, any>);
    } catch (err) {
      console.error(err);
      alert("Failed to parse JSON.");
    } finally {
      e.target.value = ""; // reset
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Tools ▸ Backup &amp; Restore</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={exportAllJSON} style={btn}>Backup all (JSON)</button>
        <button onClick={onChooseFile} style={btn}>Restore from JSON…</button>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onFilePicked} />
        <input
          placeholder="Filter keys…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={input}
        />
      </div>

      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 12 }}>
        Tip: Use this page before risky changes. If something breaks, restore your backup and reload.
      </div>

      <div style={{ border: "1px solid var(--rp-border, #CBD5E1)", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--rp-muted-bg, #F1F5F9)" }}>
            <tr>
              <th style={th}>Key</th>
              <th style={th}>Size</th>
              <th style={th}>Preview</th>
              <th style={th}>Export</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.key} style={{ borderTop: "1px solid var(--rp-border, #E2E8F0)" }}>
                <td style={td}>{r.key}</td>
                <td style={td}>{r.size.toLocaleString()} bytes</td>
                <td style={{ ...td, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", opacity: 0.8 }}>
                  {r.preview}
                  {r.preview.length >= 120 ? "…" : ""}
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  <button onClick={() => exportKeyJSON(r.key)} style={btnSm}>JSON</button>{" "}
                  <button onClick={() => exportKeyCSV(r.key)} style={btnSm}>CSV</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td style={td} colSpan={4}>No local data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "8px 12px",
  background: "var(--rp-accent, #2563EB)",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
const btnSm: React.CSSProperties = { ...btn, padding: "6px 10px", borderRadius: 6 };
const input: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid var(--rp-border, #CBD5E1)",
  borderRadius: 8,
  minWidth: 220,
};

const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 13 };
const td: React.CSSProperties = { padding: "10px 12px", fontSize: 13 };
