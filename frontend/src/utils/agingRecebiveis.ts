/** Previsão de Recebíveis — Dashboard (estoque global). */

import { pctPorVisao, valorPorVisao, type VisaoReceita } from './metaPeriodo';

export type AgingBucketKey = 'a_vencer_lt_30' | 'd1_60' | 'd60_90' | 'd_mais_90';

export type AgingTotais = {
  valor_liquido: number;
  valor_bruto: number;
  percentual_liquido: number | null;
  percentual_bruto: number | null;
};

export type AgingRecebiveis = {
  referencia: string;
  total_aberto: AgingTotais;
  a_vencer_lt_30: AgingTotais;
  d1_60: AgingTotais;
  d60_90: AgingTotais;
  d_mais_90: AgingTotais;
};

const TOTAIS_VAZIO: AgingTotais = {
  valor_liquido: 0,
  valor_bruto: 0,
  percentual_liquido: null,
  percentual_bruto: null,
};

export const AGING_VAZIO: AgingRecebiveis = {
  referencia: '',
  total_aberto: { ...TOTAIS_VAZIO },
  a_vencer_lt_30: { ...TOTAIS_VAZIO },
  d1_60: { ...TOTAIS_VAZIO },
  d60_90: { ...TOTAIS_VAZIO },
  d_mais_90: { ...TOTAIS_VAZIO },
};

function normalizeTotais(raw: Partial<AgingTotais> | undefined): AgingTotais {
  if (!raw) return { ...TOTAIS_VAZIO };
  const pctL = raw.percentual_liquido;
  const pctB = raw.percentual_bruto;
  return {
    valor_liquido: Number(raw.valor_liquido) || 0,
    valor_bruto: Number(raw.valor_bruto) || 0,
    percentual_liquido: pctL == null || !Number.isFinite(Number(pctL)) ? null : Number(pctL),
    percentual_bruto: pctB == null || !Number.isFinite(Number(pctB)) ? null : Number(pctB),
  };
}

export function normalizeAgingRecebiveis(data: any): AgingRecebiveis {
  if (!data) return { ...AGING_VAZIO };
  return {
    referencia: data.referencia != null ? String(data.referencia) : '',
    total_aberto: normalizeTotais(data.total_aberto),
    a_vencer_lt_30: normalizeTotais(data.a_vencer_lt_30),
    d1_60: normalizeTotais(data.d1_60),
    d60_90: normalizeTotais(data.d60_90),
    d_mais_90: normalizeTotais(data.d_mais_90),
  };
}

/** Metadados de apresentação — ordem canônica dos buckets. */
export const AGING_BUCKETS: Array<{
  key: AgingBucketKey;
  rotulo: string;
  acao: string;
  /** borda/accent */
  borderClass: string;
  valorClass: string;
  badgeClass: string;
}> = [
  {
    key: 'a_vencer_lt_30',
    rotulo: 'A vencer · <30d',
    acao: 'Monitorar',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    valorClass: 'text-emerald-700 dark:text-emerald-400',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  },
  {
    key: 'd1_60',
    rotulo: '1–60 dias',
    acao: 'Cobrar ativamente',
    borderClass: 'border-amber-200 dark:border-amber-800',
    valorClass: 'text-amber-700 dark:text-amber-400',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200',
  },
  {
    key: 'd60_90',
    rotulo: '60–90 dias',
    acao: 'Escalar',
    borderClass: 'border-orange-200 dark:border-orange-800',
    valorClass: 'text-orange-700 dark:text-orange-400',
    badgeClass: 'bg-orange-100 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200',
  },
  {
    key: 'd_mais_90',
    rotulo: '+90 dias',
    acao: 'Inadimplência — acionar jurídico',
    borderClass: 'border-red-200 dark:border-red-800',
    valorClass: 'text-red-700 dark:text-red-400',
    badgeClass: 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-200',
  },
];

export function valorAging(totais: AgingTotais, visao: VisaoReceita): number {
  return valorPorVisao(totais.valor_liquido, totais.valor_bruto, visao);
}

export function pctAging(totais: AgingTotais, visao: VisaoReceita): number | null {
  return pctPorVisao(totais.percentual_liquido, totais.percentual_bruto, visao);
}

export function fmtAgingPct(pct: number | null | undefined): string {
  if (pct == null || !Number.isFinite(pct)) return '—';
  return `${pct.toFixed(1).replace('.', ',')}%`;
}
