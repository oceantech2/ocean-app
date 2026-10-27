import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Cabecalho from './components/Cabecalho';
import Rodape, { VoltarAoTopo } from './components/Rodape';
import WhatsAppFlutuante from './components/WhatsAppFlutuante';
import Home from './pages/Home';
import Solucoes from './pages/Solucoes';
import Vagas from './pages/Vagas';

function RolagemDeRota() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (pathname === '/' && hash) {
      const id = hash.slice(1);
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function Estrutura() {
  const { pathname } = useLocation();
  const ehHome = pathname === '/';
  return (
    <div className={`flex min-h-screen flex-col${ehHome ? ' home-site-parallax' : ''}`}>
      <RolagemDeRota />
      <Cabecalho />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solucoes" element={<Solucoes />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <VoltarAoTopo />
      <Rodape parallax={ehHome} />
      <WhatsAppFlutuante />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Estrutura />
    </BrowserRouter>
  );
}
