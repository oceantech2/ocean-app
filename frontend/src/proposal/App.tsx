import { ReactNode, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useProposalAuthStore } from './store';
import Login from './pages/Login';
import Lista from './pages/Lista';
import Nova from './pages/Nova';
import Detalhe from './pages/Detalhe';
import Editar from './pages/Editar';
import Perfil from './pages/Perfil';
import PropostaPublica from './pages/PropostaPublica';
import Entrar from './pages/Entrar';
import Convite from './pages/Convite';
import Modelos from './pages/Modelos';
import ModeloEditor from './pages/ModeloEditor';
import ModeloVer from './pages/ModeloVer';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useProposalAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function LoginRoute() {
  const isAuthenticated = useProposalAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
}

const TITULO_PAINEL = 'Consultant Panel · Ocean';

// A página do cliente (/p/) define o próprio título; o resto é o painel do consultor
function TituloDaAba() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith('/p/')) document.title = TITULO_PAINEL;
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <TituloDaAba />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/p/:codigo" element={<PropostaPublica />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/convite" element={<Convite />} />
        <Route path="/" element={<ProtectedRoute><Lista /></ProtectedRoute>} />
        <Route path="/nova" element={<ProtectedRoute><Nova /></ProtectedRoute>} />
        <Route path="/propostas/:id" element={<ProtectedRoute><Detalhe /></ProtectedRoute>} />
        <Route path="/propostas/:id/editar" element={<ProtectedRoute><Editar /></ProtectedRoute>} />
        <Route path="/modelos" element={<ProtectedRoute><Modelos /></ProtectedRoute>} />
        <Route path="/modelos/novo" element={<ProtectedRoute><ModeloEditor /></ProtectedRoute>} />
        <Route path="/modelos/:id" element={<ProtectedRoute><ModeloVer /></ProtectedRoute>} />
        <Route path="/modelos/:id/editar" element={<ProtectedRoute><ModeloEditor /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
