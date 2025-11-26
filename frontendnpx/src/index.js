// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// 🟢 THIS IS THE FIX: The path should be from 'src', not 'src/index.js'
import { AuthProvider } from './context/AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* This will now work */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();