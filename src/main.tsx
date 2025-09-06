import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { theme } from './theme/theme';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import './index.css';

// Add development diagnostics
if ((import.meta as any).env?.DEV) {
  console.log('[APP INIT] Starting application');
}

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has <div id="root"></div>');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={(theme) => ({
          body: {
            backgroundColor: theme.palette.background.default,
          },
        })} />
        <App />
      </ThemeProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);


