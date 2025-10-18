import React from 'react';
import CaseHeader from '../../components/journey/CaseHeader';

export default function CasePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <CaseHeader title="Journey V2" subtitle="(preview)" status="lead" />
      <div style={{ padding: 16 }}>
        <p>This is a safe, preview-only shell for the new journey.</p>
        <ul style={{ lineHeight: 1.8 }}>
          <li>Sticky summary header</li>
          <li>We’ll add the state machine & tabs here next</li>
          <li>No existing routes or styles are modified</li>
        </ul>
        <p>When we’re ready, we’ll toggle this on behind a flag.</p>
      </div>
    </div>
  );
}
