import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { initTheme } from './utils/theme';
import { initPalette } from './utils/palette';

// Initialize theme and palette synchronously before React renders
initTheme();
initPalette();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
