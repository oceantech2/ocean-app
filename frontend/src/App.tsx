import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useUIStore } from './store';
import Login from './components/Login';
import Layout from './components/Layout';
import PaginaVisivelGuard from './components/PaginaVisivelGuard';
import { PAGINAS_CATALOGO } from './utils/paginasCatalogo';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NFs = lazy(() => import('./pages/NFs'));
const Colaboradores = lazy(() => import('./pages/Fornecedores'));
const Contas = lazy(() => import('./pages/Contas'));
const BonusPage = lazy(() => import('./pages/Bonus'));
const FeriasPage = lazy(() => import('./pages/Ferias'));
const DHPage = lazy(() => import('./pages/DH'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Auditoria = lazy(() => import('./pages/Auditoria'));
const Seguranca = lazy(() => import('./pages/Seguranca'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const FluxoCaixa = lazy(() => import('./pages/FluxoCaixa'));
const Impostos = lazy(() => import('./pages/Impostos'));
const Retiradas = lazy(() => import('./pages/Retiradas'));
const Patrimonio = lazy(() => import('./pages/Patrimonio'));

const PAGE_COMPONENTS: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  dashboard: Dashboard,
  nfs: NFs,
  colaboradores: Colaboradores,
  contas: Contas,
  bonus: BonusPage,
  ferias: FeriasPage,
  dh: DHPage,
  calendario: Calendario,
  auditoria: Auditoria,
  seguranca: Seguranca,
  fluxo_caixa: FluxoCaixa,
  impostos: Impostos,
  retiradas: Retiradas,
  patrimonio: Patrimonio,
};

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

function RotaPagina({ permKey }: { permKey: string }) {
  const Page = PAGE_COMPONENTS[permKey];
  if (!Page) return <Navigate to="/dashboard" replace />;
  return (
    <PaginaVisivelGuard permKey={permKey}>
      <Page />
    </PaginaVisivelGuard>
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
          {PAGINAS_CATALOGO.filter((p) => p.key !== 'dashboard').map((p) => (
            <Route
              key={p.path}
              path={p.path}
              element={<Protected><RotaPagina permKey={p.key} /></Protected>}
            />
          ))}
          <Route path="/colaboradores" element={<Navigate to="/fornecedores" replace />} />
          <Route path="/contas-receber" element={<Navigate to="/nfs" replace />} />
          <Route path="/relatorios" element={<Navigate to="/dashboard" replace />} />
          <Route path="/configuracoes" element={<Protected><Configuracoes /></Protected>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </>
  );
}
