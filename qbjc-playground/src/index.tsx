import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import initializeSegment from './segment';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
initializeSegment();
