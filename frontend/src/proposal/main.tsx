import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { redirecionarParaPainelSeNecessario } from './dominios';
import '../index.css';

if (!redirecionarParaPainelSeNecessario()) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
