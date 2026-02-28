import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:system-ui;color:#e5e7eb;background:#0f172a;min-height:100vh">Root element #root not found.</div>';
  throw new Error('Root element not found');
}

function showBootstrapError(el: HTMLElement, message: string): void {
  el.innerHTML = `<div style="padding:2rem;font-family:system-ui;color:#e5e7eb;background:#0f172a;min-height:100vh"><h1 style="color:#f87171">Failed to start</h1><pre style="background:#1e293b;padding:1rem;border-radius:8px;overflow:auto">${message}</pre></div>`;
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  showBootstrapError(rootElement, message);
  console.error(err);
}