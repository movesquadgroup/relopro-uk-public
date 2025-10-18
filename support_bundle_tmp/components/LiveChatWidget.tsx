import React, { useMemo } from 'react';

function getApiKeyStatus(): { hasKey: boolean; masked: string } {
  const raw = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  const s = String(raw || '');
  if (!s) return { hasKey: false, masked: '' };
  const tail = s.slice(-4);
  return { hasKey: true, masked: `••••••••${tail}` };
}

export default function LiveChatWidget() {
  const { hasKey, masked } = useMemo(getApiKeyStatus, []);

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 1000,
        background: 'var(--rp-card, #0f172a)',
        color: 'var(--rp-fg, #e5e7eb)',
        border: '1px solid var(--rp-border, #334155)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 10px 30px rgba(0,0,0,.25)',
        width: 320,
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <strong>AI Live Chat</strong>
        <span
          style={{
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 999,
            background: hasKey ? '#064e3b' : '#7c2d12',
            color: '#fff',
          }}
        >
          {hasKey ? 'API key detected' : 'No API key'}
        </span>
      </div>

      <p style={{ marginTop: 8, lineHeight: 1.4, fontSize: 14 }}>
        {hasKey ? (
          <>
            You’re good to go. This is a placeholder UI so the app never crashes
            if the SDK changes. When you’re ready, swap in the real integration
            again. Key: <code>{masked}</code>
          </>
        ) : (
          <>
            Set <code>VITE_GEMINI_API_KEY</code> in <code>.env.local</code> to
            enable AI. The app will keep working either way.
          </>
        )}
      </p>

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 8,
        }}
      >
        <input
          placeholder={hasKey ? 'Type a message…' : 'AI disabled'}
          disabled={!hasKey}
          style={{
            height: 36,
            borderRadius: 8,
            border: '1px solid var(--rp-border, #334155)',
            padding: '0 10px',
            background: 'var(--rp-bg, #0b1220)',
            color: 'inherit',
          }}
        />
        <button
          disabled={!hasKey}
          style={{
            height: 36,
            borderRadius: 8,
            padding: '0 12px',
            border: '1px solid var(--rp-border, #334155)',
            background: hasKey ? '#1d4ed8' : '#334155',
            color: '#fff',
            cursor: hasKey ? 'pointer' : 'not-allowed',
          }}
          onClick={() => alert('Placeholder send – wire this to your AI later')}
        >
          Send
        </button>
      </div>
    </div>
  );
}
