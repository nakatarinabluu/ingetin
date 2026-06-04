import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import './styles/index.css'

// ─── SENTRY INITIALIZATION ───
// Fix [L-05]: tracesSampleRate was 1.0 (100%) — too expensive for production
// Fix [CFG-03]: guard against missing VITE_SENTRY_DSN
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Fix [CFG-01]: centralized IS_MOCK constant instead of reading env in multiple files
export const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const renderApp = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        ReactDOM.createRoot(rootElement).render(
          <React.StrictMode>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </React.StrictMode>,
        )
    }
};

if (USE_MOCK) {
    import('@/__mocks__/mocks').then(({ setupMocks }) => {
        import('@/shared/api/client').then(({ default: apiClient }) => {
            setupMocks(apiClient);
            renderApp();
        });
    });
} else {
    renderApp();
}
