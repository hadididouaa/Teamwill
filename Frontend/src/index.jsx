// frontend/src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode> {/* StrictMode: helps detect potential issues during development */}
    <App />
  </React.StrictMode>
);

reportWebVitals(); //Optional performance reporting (Lighthouse)
