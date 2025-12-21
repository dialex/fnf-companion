import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { themeManager } from './managers/themeManager';

// Initialize theme and palette synchronously before React renders
themeManager.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
