import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Production Diagnostic Handshake
window.onerror = (message, source, lineno, _colno, _error) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="background: #0F172A; color: #6366F1; font-family: 'Inter', sans-serif; height: 100vh; display: flex; flex-direction: column; items-center; justify-content: center; padding: 2rem; text-align: center;">
        <h1 style="font-weight: 900; letter-spacing: -0.05em; margin-bottom: 1rem; color: #fff;">CRITICAL CORE FAILURE</h1>
        <p style="font-size: 0.875rem; color: #94A3B8; max-width: 400px; margin-bottom: 2rem; line-height: 1.6;">Orin Protocol encountered a fatal initialization error during deployment linkage.</p>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 1rem; text-align: left; font-family: monospace; font-size: 0.75rem; color: #F43F5E;">
          [PROTOCOL_ERROR]: ${message}<br/>
          [SOURCE]: ${source}:${lineno}
        </div>
        <p style="margin-top: 2rem; font-size: 0.75rem; font-weight: 900; color: #475569; letter-spacing: 0.5em;">ADMIN ALPHA INTERVENTION REQUIRED</p>
      </div>
    `;
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
