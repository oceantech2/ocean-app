import { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore, usePageFilters } from '../store';
import { useNotificacoes } from '../hooks/useNotificacoes';
import { getNavIcon, ChevronLeftIcon, ChevronRightIcon } from './navIcons';

interface LayoutProps {
  children: ReactNode;
}

const MENU = [
  { label: 'Dashboard', path: '/dashboard', desc: 'Visão geral financeira', permKey: 'dashboard' },
  { label: 'Calendário', path: '/calendario', desc: 'Vencimentos de NFs e contas', permKey: 'calendario' },
  { label: 'Contas a Receber', path: '/nfs', desc: 'Valores a receber (Maggo)', notifKey: 'nfsVencidas', permKey: 'nfs' },
  { label: 'Contas a Pagar', path: '/contas', desc: 'Despesas por categorias', notifKey: 'contasAlertasTotal', permKey: 'contas' },
  { label: 'Fluxo de Caixa', path: '/fluxo-caixa', desc: 'Saldo corrente e investimento', permKey: 'fluxo_caixa' },
  { label: 'Impostos', path: '/impostos', desc: 'Acompanhamento mensal de impostos', permKey: 'impostos' },
  { label: 'Retiradas (Sócios)', path: '/retiradas', desc: 'Retiradas de lucro dos sócios', permKey: 'retiradas' },
  { label: 'Bônus', path: '/bonus', desc: 'Bônus por colaborador', permKey: 'bonus' },
  { label: 'DH', path: '/dh', desc: 'Documentos de Horas', permKey: 'dh' },
  { label: 'Colaboradores', path: '/colaboradores', desc: 'Equipe e salários', permKey: 'colaboradores' },
  { label: 'Férias', path: '/ferias', desc: 'Gestão de férias', notifKey: 'feriasAguardando', permKey: 'ferias' },
  { label: 'Patrimônio', path: '/patrimonio', desc: 'Equipamentos por colaborador', permKey: 'patrimonio' },
  { label: 'Auditoria', path: '/auditoria', desc: 'Histórico de alterações', adminOnly: true },
  { label: 'Segurança', path: '/seguranca', desc: 'Autenticação em duas etapas', adminOnly: true },
  { label: 'Configurações', path: '/configuracoes', desc: 'Usuários e permissões', adminOnly: true },
];

export default function Layout({ children }: LayoutProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const papel = useAuthStore((s) => s.papel);
  const permissoes = useAuthStore((s) => s.permissoes);
  const logout = useAuthStore((s) => s.logout);
  const darkMode = useUIStore((s) => s.darkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const hydrateSidebarCollapsed = useUIStore((s) => s.hydrateSidebarCollapsed);
  const navigate = useNavigate();
  const location = useLocation();
  const notif = useNotificacoes();
  const setNfsFilters = usePageFilters((s) => s.setNfsFilters);
  const setContasFilters = usePageFilters((s) => s.setContasFilters);
  const setNfsSemNumero = usePageFilters((s) => s.setNfsSemNumero);

  const [buscaAberta, setBuscaAberta] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState('');
  const buscaRef = useRef<HTMLInputElement>(null);
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const alertasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateSidebarCollapsed(usuario);
  }, [usuario, hydrateSidebarCollapsed]);

  useEffect(() => {
    if (buscaAberta) {
      setTimeout(() => buscaRef.current?.focus(), 50);
    } else {
      setBuscaTexto('');
    }
  }, [buscaAberta]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !buscaAberta && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setBuscaAberta(true);
      }
      if (e.key === 'Escape') { setBuscaAberta(false); setAlertasAbertos(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [buscaAberta]);

  useEffect(() => {
    const onClickFora = (e: MouseEvent) => {
      if (alertasRef.current && !alertasRef.current.contains(e.target as Node)) setAlertasAbertos(false);
    };
    document.addEventListener('mousedown', onClickFora);
    return () => document.removeEventListener('mousedown', onClickFora);
  }, []);

  const permsObj: Record<string, boolean> = (() => {
    if (papel === 'admin') return {};
    try { return permissoes ? JSON.parse(permissoes) : {}; } catch { return {}; }
  })();

  const menuVisivel = MENU.filter((m) => {
    if ((m as any).adminOnly) return papel === 'admin';
    if (papel === 'admin') return true;
    const key = (m as any).permKey;
    return key ? permsObj[key] === true : true;
  });

  const resultados = buscaTexto.trim()
    ? menuVisivel.filter((m) =>
        m.label.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        m.desc.toLowerCase().includes(buscaTexto.toLowerCase())
      )
    : menuVisivel;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotifCount = (key?: string): number => {
    if (!key) return 0;
    return (notif as any)[key] ?? 0;
  };

  const alertas = [
    { label: 'NFs vencidas', count: notif.nfsVencidas, ir: () => { setNfsFilters('', 0, 'vencida'); navigate('/nfs'); } },
    { label: 'Contas a vencer em menos de 1 dia', count: notif.contasVenceHoje, ir: () => { setContasFilters('', 'false', '', 'hoje'); navigate('/contas'); } },
    { label: 'Contas a vencer em menos de 7 dias', count: notif.contasVence7Dias, ir: () => { setContasFilters('', 'false', '', '7dias'); navigate('/contas'); } },
    { label: 'Contas vencidas', count: notif.contasVencidas, ir: () => { setContasFilters('', 'false', '', 'vencida'); navigate('/contas'); } },
    { label: 'Contas com nota fiscal pendente', count: notif.nfsSemNumero, ir: () => { setNfsSemNumero(true); navigate('/nfs'); } },
    { label: 'Férias aguardando aprovação', count: notif.feriasAguardando, ir: () => navigate('/ferias') },
  ].filter((a) => a.count > 0);

  const irParaAlerta = (ir: () => void) => { ir(); setAlertasAbertos(false); };

  const handleMainClick = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true, usuario);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center shrink-0">
            <img src="/logo.png" alt="Ocean Talent Solutions" className="h-16 w-auto" />
          </Link>

          {/* Busca global */}
          <div className="flex-1 max-w-md relative">
            <button
              onClick={() => setBuscaAberta(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Buscar... <kbd className="ml-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-1">/</kbd></span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Notificações */}
            <div className="relative" ref={alertasRef}>
              {notif.total > 0 ? (
                <button
                  onClick={() => setAlertasAbertos((v) => !v)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">{notif.total} alertas</span>
                </button>
              ) : null}

              {alertasAbertos && alertas.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-40">
                  <div className="px-4 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
                    Alertas pendentes
                  </div>
                  <ul>
                    {alertas.map((a) => (
                      <li key={a.label}>
                        <button
                          onClick={() => irParaAlerta(a.ir)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
                        >
                          <span>{a.label}</span>
                          <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                            {a.count}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

            <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              <span className="font-medium dark:text-gray-200">{usuario}</span>
              {papel === 'visualizador' && (
                <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                  Visualizador
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Modal de busca */}
      {buscaAberta && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-start justify-center pt-24"
          onClick={() => setBuscaAberta(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={buscaRef}
                type="text"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Buscar página..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
              <kbd className="text-xs text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-1.5">Esc</kbd>
            </div>
            <ul className="py-1 max-h-64 overflow-y-auto">
              {resultados.map((item) => {
                const count = getNotifCount(item.notifKey);
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => { navigate(item.path); setBuscaAberta(false); }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                    >
                      <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{item.label}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</span>
                      {count > 0 && (
                        <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                          {count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
              {resultados.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Nenhum resultado</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-56'
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shrink-0 flex flex-col transition-[width] duration-200 sticky top-[5.5rem] h-[calc(100vh-5.5rem)] self-start`}
        >
          <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
            {menuVisivel.map((item) => {
              const ativo = location.pathname === item.path;
              const count = getNotifCount(item.notifKey);
              const Icon = getNavIcon(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-label={sidebarCollapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3 rounded-lg text-sm transition ${
                    sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } ${
                    ativo
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="relative flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                    {sidebarCollapsed && count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-0.5">
                        {count}
                      </span>
                    )}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {count > 0 && (
                        <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full px-1 shrink-0">
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => toggleSidebarCollapsed(usuario)}
              aria-expanded={!sidebarCollapsed}
              aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
              title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
              className={`w-full flex items-center gap-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
              }`}
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeftIcon className="w-5 h-5 shrink-0" />
                  <span>Recolher</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 p-6 min-w-0" onClick={handleMainClick}>
          {children}
        </main>
      </div>
    </div>
  );
}
