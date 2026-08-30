export type ActionVariant =
  | 'importar'
  | 'exportar-csv'
  | 'exportar-xlsx'
  | 'exportar-pdf'
  | 'criar'
  | 'auxiliar'
  | 'docs'
  | 'historico'
  | 'anexar'
  | 'fluxo'
  | 'liberar'
  | 'rejeitar'
  | 'editar'
  | 'arquivar'
  | 'exibir'
  | 'desativar'
  | 'reativar'
  | 'excluir';

export type ActionContext = 'header' | 'row';

/** Ordem canônica: importar → exportar → criar */
export const HEADER_ACTION_ORDER: ActionVariant[] = [
  'importar',
  'exportar-csv',
  'exportar-xlsx',
  'exportar-pdf',
  'criar',
];

/** Ordem canônica: auxiliar → fluxo → editar → arquivar/desativar → excluir */
export const ROW_ACTION_ORDER: ActionVariant[] = [
  'docs',
  'historico',
  'anexar',
  'auxiliar',
  'fluxo',
  'liberar',
  'rejeitar',
  'editar',
  'arquivar',
  'exibir',
  'desativar',
  'reativar',
  'excluir',
];

const ROW_BASE = 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed';

const ROW_VARIANTS: Record<ActionVariant, string> = {
  importar: ROW_BASE,
  'exportar-csv': ROW_BASE,
  'exportar-xlsx': ROW_BASE,
  'exportar-pdf': ROW_BASE,
  criar: ROW_BASE,
  auxiliar: `${ROW_BASE} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`,
  docs: `${ROW_BASE} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`,
  historico: `${ROW_BASE} bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/60`,
  anexar: `${ROW_BASE} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`,
  fluxo: `${ROW_BASE} bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60`,
  liberar: `${ROW_BASE} bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60`,
  rejeitar: `${ROW_BASE} bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/60`,
  editar: `${ROW_BASE} bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60`,
  arquivar: `${ROW_BASE} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`,
  exibir: `${ROW_BASE} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`,
  desativar: `${ROW_BASE} bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/60`,
  reativar: `${ROW_BASE} bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60`,
  excluir: `${ROW_BASE} bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60`,
};

const HEADER_BASE = 'inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed';

const HEADER_VARIANTS: Record<ActionVariant, string> = {
  importar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  'exportar-csv': `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  'exportar-xlsx': `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  'exportar-pdf': `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  criar: `${HEADER_BASE} px-5 bg-blue-600 text-white hover:bg-blue-700 font-medium`,
  auxiliar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  docs: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  historico: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  anexar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  fluxo: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  liberar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  rejeitar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  editar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  arquivar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  exibir: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  desativar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  reativar: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
  excluir: `${HEADER_BASE} border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`,
};

export function getActionButtonClasses(variant: ActionVariant, context: ActionContext): string {
  return context === 'header' ? HEADER_VARIANTS[variant] : ROW_VARIANTS[variant];
}
