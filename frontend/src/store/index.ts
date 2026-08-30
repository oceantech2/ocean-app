import { create } from 'zustand';

// ==================== AUTH ====================
interface AuthState {
  isAuthenticated: boolean;
  usuario: string | null;
  token: string | null;
  papel: 'admin' | 'visualizador' | null;
  permissoes: string | null;
  paginasVisibilidade: Record<string, boolean> | null;
  setAuth: (
    usuario: string,
    token: string,
    papel?: string,
    permissoes?: string | null,
    paginasVisibilidade?: Record<string, boolean> | null,
  ) => void;
  setPaginasVisibilidade: (paginas: Record<string, boolean>) => void;
  logout: () => void;
}

function readPaginasVisibilidade(): Record<string, boolean> | null {
  const raw = localStorage.getItem('paginas_visibilidade');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: !!localStorage.getItem('access_token'),
  usuario: localStorage.getItem('usuario'),
  token: localStorage.getItem('access_token'),
  papel: (localStorage.getItem('papel') as 'admin' | 'visualizador') || 'admin',
  permissoes: localStorage.getItem('permissoes'),
  paginasVisibilidade: readPaginasVisibilidade(),

  setAuth: (usuario, token, papel = 'admin', permissoes = null, paginasVisibilidade = null) => {
    useAuthStore.setState({
      isAuthenticated: true,
      usuario,
      token,
      papel: papel as 'admin' | 'visualizador',
      permissoes,
      paginasVisibilidade,
    });
    localStorage.setItem('usuario', usuario);
    localStorage.setItem('access_token', token);
    localStorage.setItem('papel', papel);
    if (permissoes) localStorage.setItem('permissoes', permissoes);
    else localStorage.removeItem('permissoes');
    if (paginasVisibilidade) {
      localStorage.setItem('paginas_visibilidade', JSON.stringify(paginasVisibilidade));
    } else {
      localStorage.removeItem('paginas_visibilidade');
    }
  },

  setPaginasVisibilidade: (paginas) => {
    useAuthStore.setState({ paginasVisibilidade: paginas });
    localStorage.setItem('paginas_visibilidade', JSON.stringify(paginas));
  },

  logout: () => {
    useAuthStore.setState({
      isAuthenticated: false,
      usuario: null,
      token: null,
      papel: null,
      permissoes: null,
      paginasVisibilidade: null,
    });
    localStorage.removeItem('usuario');
    localStorage.removeItem('access_token');
    localStorage.removeItem('papel');
    localStorage.removeItem('permissoes');
    localStorage.removeItem('paginas_visibilidade');
  },
}));

// ==================== NOTIFICAÇÕES (refresh global) ====================
interface NotifState {
  notifTick: number;
  triggerNotifRefresh: () => void;
  calendarioTick: number;
  triggerCalendarioRefresh: () => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifTick: 0,
  triggerNotifRefresh: () => set((s) => ({ notifTick: s.notifTick + 1 })),
  calendarioTick: 0,
  triggerCalendarioRefresh: () => set((s) => ({ calendarioTick: s.calendarioTick + 1 })),
}));

// ==================== UI (dark mode + sidebar) ====================
// Preferência de sidebar NÃO persiste entre visitas (feature 045-padronizar-icones-menu).
// Estado expandido/colapsado vale só na sessão corrente; sempre inicia expandido.
const sidebarKey = (usuario: string) => `ocean-sidebar-collapsed:${usuario}`;

interface UIState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean, usuario?: string | null) => void;
  toggleSidebarCollapsed: (usuario?: string | null) => void;
  hydrateSidebarCollapsed: (usuario: string | null) => void;
}

export const useUIStore = create<UIState>(() => ({
  darkMode: localStorage.getItem('ocean-dark') === 'true',
  toggleDarkMode: () => {
    useUIStore.setState((state) => {
      const next = !state.darkMode;
      localStorage.setItem('ocean-dark', String(next));
      return { darkMode: next };
    });
  },
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => {
    useUIStore.setState({ sidebarCollapsed: collapsed });
  },
  toggleSidebarCollapsed: () => {
    useUIStore.setState((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  hydrateSidebarCollapsed: (usuario) => {
    if (usuario) {
      try {
        localStorage.removeItem(sidebarKey(usuario));
      } catch {
        /* ignore */
      }
    }
    useUIStore.setState({ sidebarCollapsed: false });
  },
}));

// ==================== FILTRO GLOBAL (mês/ano) ====================
interface FilterState {
  mesAtual: number;
  anoAtual: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
  setPeriodo: (mes: number, ano: number) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  mesAtual: new Date().getMonth() + 1,
  anoAtual: new Date().getFullYear(),
  setMes: (mes) => set({ mesAtual: mes }),
  setAno: (ano) => set({ anoAtual: ano }),
  setPeriodo: (mes, ano) => set({ mesAtual: mes, anoAtual: ano }),
}));

// ==================== FILTROS POR PÁGINA (persistem durante navegação) ====================
const ANO = new Date().getFullYear();
const MES = new Date().getMonth() + 1;

interface PageFiltersState {
  nfsMes: number | '';
  nfsAno: number;
  nfsStatus: string;
  contasCategoria: string;
  contasSubcategoria: string;
  contasPago: '' | 'true' | 'false';
  contasAlertaVencimento: '' | 'hoje' | '7dias' | 'vencida';
  nfsSemNumero: boolean;
  bonusColaboradorId: number | '';
  bonusAno: number;
  bonusRecorte: 'ano' | 'mes' | 'trimestre';
  bonusMes: number;
  bonusTrimestre: number;
  feriasColaboradorId: number | '';
  feriasAno: number;
  dhMes: number | '';
  dhAno: number;
  dhColaborador: string;
  setNfsFilters: (mes: number | '', ano: number, status: string) => void;
  setContasFilters: (categoria: string, pago: '' | 'true' | 'false', subcategoria?: string, alertaVencimento?: '' | 'hoje' | '7dias' | 'vencida') => void;
  setNfsSemNumero: (ligado: boolean) => void;
  setBonusFilters: (
    colaboradorId: number | '',
    ano: number,
    recorte?: 'ano' | 'mes' | 'trimestre',
    mes?: number,
    trimestre?: number,
  ) => void;
  setFeriasFilters: (colaboradorId: number | '', ano: number) => void;
  setDhFilters: (mes: number | '', ano: number, colaborador: string) => void;
}

export const usePageFilters = create<PageFiltersState>((set) => ({
  nfsMes: MES,
  nfsAno: ANO,
  nfsStatus: '',
  contasCategoria: '',
  contasSubcategoria: '',
  contasPago: '',
  contasAlertaVencimento: '',
  nfsSemNumero: false,
  bonusColaboradorId: '',
  bonusAno: ANO,
  bonusRecorte: 'ano',
  bonusMes: MES,
  bonusTrimestre: Math.ceil(MES / 3),
  feriasColaboradorId: '',
  feriasAno: ANO,
  dhMes: MES,
  dhAno: ANO,
  dhColaborador: '',
  setNfsFilters: (mes, ano, status) => set({
    nfsMes: mes,
    nfsAno: ano,
    nfsStatus: status,
    nfsSemNumero: status === 'sem_nf',
  }),
  setContasFilters: (categoria, pago, subcategoria = '', alertaVencimento) =>
    set({
      contasCategoria: categoria,
      contasPago: pago,
      contasSubcategoria: subcategoria,
      ...(alertaVencimento !== undefined ? { contasAlertaVencimento: alertaVencimento } : {}),
    }),
  setNfsSemNumero: (ligado) => set(ligado
    ? { nfsSemNumero: true, nfsMes: '' as const, nfsStatus: 'sem_nf' }
    : { nfsSemNumero: false }),
  setBonusFilters: (colaboradorId, ano, recorte, mes, trimestre) =>
    set((s) => ({
      bonusColaboradorId: colaboradorId,
      bonusAno: Number.isFinite(ano) ? ano : s.bonusAno,
      bonusRecorte: recorte ?? s.bonusRecorte,
      bonusMes: mes ?? s.bonusMes,
      bonusTrimestre: trimestre ?? s.bonusTrimestre,
    })),
  setFeriasFilters: (colaboradorId, ano) => set({ feriasColaboradorId: colaboradorId, feriasAno: ano }),
  setDhFilters: (mes, ano, colaborador) => set({ dhMes: mes, dhAno: ano, dhColaborador: colaborador }),
}));
