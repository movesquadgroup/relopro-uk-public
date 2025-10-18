import './style/tokens.css';
import './style/components.css';
import './style/overrides.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { migrateExistingClientsToOrders } from './lib/workflow/migrate';

// Run once on startup; safe if it already ran
migrateExistingClientsToOrders();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// --- Journey V2 preview (non-invasive, behind flag) ---
import { useJourneyV2 } from './lib/flags/journey';
if (useJourneyV2) {
  import('./components/_router.preview').then(({ JourneyPreviewRouter }) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root2 = ReactDOM.createRoot(div);
    root2.render(<JourneyPreviewRouter />);
    console.log('[journey] V2 preview route available at #/case-v2');
  });
}
