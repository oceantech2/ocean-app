import { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useProposalAuthStore } from './store';
import Login from './pages/Login';
import Lista from './pages/Lista';
import Nova from './pages/Nova';
import Detalhe from './pages/Detalhe';
import PropostaPublica from './pages/PropostaPublica';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useProposalAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function LoginRoute() {
  const isAuthenticated = useProposalAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/p/:codigo" element={<PropostaPublica />} />
        <Route path="/" element={<ProtectedRoute><Lista /></ProtectedRoute>} />
        <Route path="/nova" element={<ProtectedRoute><Nova /></ProtectedRoute>} />
        <Route path="/propostas/:id" element={<ProtectedRoute><Detalhe /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
