import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './app';
import initializeSegment from './segment';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
initializeSegment();
