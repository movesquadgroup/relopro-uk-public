import React from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  status?: string;
};

export default function CaseHeader({ title="Case", subtitle, status }: Props) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      padding: '12px 16px',
      background: 'var(--rp-surface, #fff)',
      borderBottom: '1px solid var(--rp-border, #e5e7eb)'
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h1>
        {subtitle && <span style={{ opacity: 0.7 }}>{subtitle}</span>}
        {status && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--rp-muted-bg, #eef2ff)',
            color: 'var(--rp-muted-fg, #3730a3)',
            border: '1px solid var(--rp-border, #e5e7eb)'
          }}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
