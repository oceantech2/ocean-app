import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useUIStore } from './store';
import Login from './components/Login';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NFs = lazy(() => import('./pages/NFs'));
const Colaboradores = lazy(() => import('./pages/Colaboradores'));
const Contas = lazy(() => import('./pages/Contas'));
const BonusPage = lazy(() => import('./pages/Bonus'));
const FeriasPage = lazy(() => import('./pages/Ferias'));
const DHPage = lazy(() => import('./pages/DH'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Auditoria = lazy(() => import('./pages/Auditoria'));
const Seguranca = lazy(() => import('./pages/Seguranca'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const FluxoCaixa = lazy(() => import('./pages/FluxoCaixa'));
const Impostos = lazy(() => import('./pages/Impostos'));
const Retiradas = lazy(() => import('./pages/Retiradas'));
const Patrimonio = lazy(() => import('./pages/Patrimonio'));

function DarkModeSync() {
  const darkMode = useUIStore((s) => s.darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">Carregando...</div>}>
          {children}
        </Suspense>
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      <DarkModeSync />
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/nfs" element={<Protected><NFs /></Protected>} />
          <Route path="/contas-receber" element={<Navigate to="/nfs" replace />} />
          <Route path="/colaboradores" element={<Protected><Colaboradores /></Protected>} />
          <Route path="/contas" element={<Protected><Contas /></Protected>} />
          <Route path="/bonus" element={<Protected><BonusPage /></Protected>} />
          <Route path="/ferias" element={<Protected><FeriasPage /></Protected>} />
          <Route path="/dh" element={<Protected><DHPage /></Protected>} />
          <Route path="/relatorios" element={<Protected><Relatorios /></Protected>} />
          <Route path="/calendario" element={<Protected><Calendario /></Protected>} />
          <Route path="/auditoria" element={<Protected><Auditoria /></Protected>} />
          <Route path="/seguranca" element={<Protected><Seguranca /></Protected>} />
          <Route path="/configuracoes" element={<Protected><Configuracoes /></Protected>} />
          <Route path="/fluxo-caixa" element={<Protected><FluxoCaixa /></Protected>} />
          <Route path="/impostos" element={<Protected><Impostos /></Protected>} />
          <Route path="/retiradas" element={<Protected><Retiradas /></Protected>} />
          <Route path="/patrimonio" element={<Protected><Patrimonio /></Protected>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </>
  );
}
