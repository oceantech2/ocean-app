export interface PaginaCatalogo {
  key: string;
  label: string;
  path: string;
  desc: string;
  ocultavel: boolean;
  adminOnly?: boolean;
  notifKey?: string;
}

/** Páginas navegáveis sujeitas à visibilidade global e/ou permissões por usuário. */
export const PAGINAS_CATALOGO: PaginaCatalogo[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', desc: 'Visão geral financeira', ocultavel: false },
  { key: 'calendario', label: 'Calendário', path: '/calendario', desc: 'Vencimentos de NFs e contas', ocultavel: true },
  { key: 'nfs', label: 'Contas a Receber', path: '/nfs', desc: 'Valores a receber (Maggo)', ocultavel: true, notifKey: 'nfsVencidas' },
  { key: 'contas', label: 'Contas a Pagar', path: '/contas', desc: 'Despesas por categorias', ocultavel: true, notifKey: 'contasAlertasTotal' },
  { key: 'fluxo_caixa', label: 'Fluxo de Caixa', path: '/fluxo-caixa', desc: 'Contas correntes e investimento', ocultavel: true },
  { key: 'impostos', label: 'Impostos', path: '/impostos', desc: 'Acompanhamento mensal de impostos', ocultavel: true },
  { key: 'retiradas', label: 'Retiradas (Sócios)', path: '/retiradas', desc: 'Retiradas de lucro dos sócios', ocultavel: true },
  { key: 'bonus', label: 'Comissões', path: '/comissoes', desc: 'Comissões por pessoa da equipe', ocultavel: true },
  { key: 'dh', label: 'DH', path: '/dh', desc: 'Documentos de Horas', ocultavel: true },
  { key: 'colaboradores', label: 'Fornecedores', path: '/fornecedores', desc: 'Cadastro de fornecedores', ocultavel: true },
  { key: 'ferias', label: 'Férias', path: '/ferias', desc: 'Gestão de férias', ocultavel: true, notifKey: 'feriasAguardando' },
  { key: 'patrimonio', label: 'Patrimônio', path: '/patrimonio', desc: 'Equipamentos por colaborador', ocultavel: true },
  { key: 'auditoria', label: 'Auditoria', path: '/auditoria', desc: 'Histórico de alterações', ocultavel: true, adminOnly: true },
  { key: 'seguranca', label: 'Segurança', path: '/seguranca', desc: 'Autenticação em duas etapas', ocultavel: true, adminOnly: true },
];

/** Item fixo de menu admin-only, fora da lista de ocultáveis. */
export const MENU_CONFIGURACOES: PaginaCatalogo = {
  key: 'configuracoes',
  label: 'Configurações',
  path: '/configuracoes',
  desc: 'Usuários e permissões',
  ocultavel: false,
  adminOnly: true,
};

/** Itens do menu lateral (catálogo + Configurações). */
export const PAGINAS_MENU: PaginaCatalogo[] = [...PAGINAS_CATALOGO, MENU_CONFIGURACOES];

/** Lista para toggles de visibilidade em Configurações (inclui Dashboard desabilitado). */
export const PAGINAS_VISIBILIDADE_UI = PAGINAS_CATALOGO.filter((p) => p.key !== 'configuracoes');

/** Lista para permissões por usuário visualizador (sem admin-only). */
export const PAGINAS_PERMISSOES = PAGINAS_CATALOGO.filter((p) => !p.adminOnly);

export function paginaVisivelGlobal(
  paginasVisibilidade: Record<string, boolean> | null | undefined,
  key: string,
): boolean {
  if (paginasVisibilidade && paginasVisibilidade[key] === false) return false;
  return true;
}

export function permKeyPorPath(path: string): string | undefined {
  return PAGINAS_MENU.find((p) => p.path === path)?.key;
}
