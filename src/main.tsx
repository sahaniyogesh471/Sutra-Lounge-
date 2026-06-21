import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedDatabaseIfEmpty } from './firebase';

// Initialize Firebase on app start
seedDatabaseIfEmpty().catch(err => console.warn('[Firebase] Seed initialization delayed:', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
