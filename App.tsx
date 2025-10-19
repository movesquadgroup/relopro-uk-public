import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import CrmPage from './pages/CrmPage';
import QuotingPage from './pages/QuotingPage';
import QuoteEditorPage from './pages/QuoteEditorPage';
import OperationsPage from './pages/OperationsPage';

function BareLayout({ children }: React.PropsWithChildren) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100dvh' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', padding: 16 }}>
        <strong>Menu</strong>
        <nav style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/crm">CRM</Link>
          <Link to="/quoting">Quoting</Link>
          <Link to="/quote-editor">Quote Editor</Link>
          <Link to="/operations">Operations</Link>
        </nav>
      </aside>
      <main style={{ padding: 16 }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BareLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/quoting" element={<QuotingPage />} />
        <Route path="/quote-editor" element={<QuoteEditorPage />} />
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="*"
          element={
            <div style={{ padding: 24 }}>
              <h2>Not found</h2>
              <p>That route doesn’t exist. Use the menu to navigate.</p>
            </div>
          }
        />
      </Routes>
    </BareLayout>
  );
}
