import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Cabecalho from './components/Cabecalho';
import Rodape from './components/Rodape';
import WhatsAppFlutuante from './components/WhatsAppFlutuante';
import { ehTrocaIdioma, IDIOMAS } from './idioma';
import Home from './pages/Home';
import Noticias from './pages/Noticias';
import Solucoes from './pages/Solucoes';
import Vagas from './pages/Vagas';
import VagaDetalhe from './pages/VagaDetalhe';
import { CAMINHOS, idiomaDoCaminho, PAGINAS, paginaDoCaminho, type Pagina } from './rotas';
import { aplicarSeo } from './seo';

const PAGINA_COMPONENTE: Record<Pagina, () => JSX.Element> = {
  home: Home,
  solucoes: Solucoes,
  vagas: Vagas,
  noticias: Noticias,
};

function RolagemDeRota() {
  const { pathname, hash, state } = useLocation();
  useEffect(() => {
    if (ehTrocaIdioma(state)) return;
    if (paginaDoCaminho(pathname) === 'home' && hash) {
      const id = hash.slice(1);
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, state]);
  return null;
}

function SeoDaRota() {
  const { pathname } = useLocation();
  useEffect(() => {
    aplicarSeo(paginaDoCaminho(pathname) ?? 'home', idiomaDoCaminho(pathname));
  }, [pathname]);
  return null;
}

export function Estrutura() {
  const { pathname } = useLocation();
  const ehHome = paginaDoCaminho(pathname) === 'home';
  return (
    <div className={`flex min-h-screen flex-col${ehHome ? ' home-site-parallax' : ''}`}>
      <RolagemDeRota />
      <SeoDaRota />
      <Cabecalho />
      <main className="flex-1">
        <Routes>
          {PAGINAS.flatMap((pagina) =>
            IDIOMAS.map(({ id }) => {
              const Componente = PAGINA_COMPONENTE[pagina];
              return <Route key={`${pagina}-${id}`} path={CAMINHOS[pagina][id]} element={<Componente />} />;
            }),
          )}
          {IDIOMAS.map(({ id }) => (
            <Route key={`vaga-${id}`} path={`${CAMINHOS.vagas[id]}/:vaga`} element={<VagaDetalhe />} />
          ))}
          <Route path="*" element={<Navigate to={CAMINHOS.home[idiomaDoCaminho(pathname)]} replace />} />
        </Routes>
      </main>
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
