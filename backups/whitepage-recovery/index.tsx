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
import JourneyAutoStage from './lib/workflow/journeyAutoStage';

// Run once on startup; safe if it already ran
try {
  migrateExistingClientsToOrders();
} catch {
  // If the helper was removed, ignore—keeps boot stable
}

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
          {/* This tiny component auto-updates the journey based on the current route */}
          <JourneyAutoStage />
          <App />
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
