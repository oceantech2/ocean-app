/** Abas Por Caixa / Por Competência no Dashboard. */

import { valorPorVisao, type VisaoReceita } from './metaPeriodo';
import type { PipelineEstagioTotais, PipelineReceita } from './pipelineReceita';

export type AbaReceita = 'caixa' | 'competencia';

export type TotaisDual = {
  valor_liquido: number;
  valor_bruto: number;
  contagem: number;
};

export type ReceitaCaixa = {
  ano: number;
  mes: number | null;
  recebido: TotaisDual;
  impostos_recolhidos: number;
  a_receber: TotaisDual;
  a_faturar: TotaisDual;
};

const TOTAIS_VAZIO: TotaisDual = {
  valor_liquido: 0,
  valor_bruto: 0,
  contagem: 0,
};

export const RECEITA_CAIXA_VAZIA: ReceitaCaixa = {
  ano: 0,
  mes: null,
  recebido: { ...TOTAIS_VAZIO },
  impostos_recolhidos: 0,
  a_receber: { ...TOTAIS_VAZIO },
  a_faturar: { ...TOTAIS_VAZIO },
};

function normalizeTotais(raw: Partial<TotaisDual> | undefined): TotaisDual {
  if (!raw) return { ...TOTAIS_VAZIO };
  return {
    valor_liquido: Number(raw.valor_liquido) || 0,
    valor_bruto: Number(raw.valor_bruto) || 0,
    contagem: Number(raw.contagem) || 0,
  };
}

export function normalizeReceitaCaixa(data: any): ReceitaCaixa {
  if (!data) return { ...RECEITA_CAIXA_VAZIA };
  return {
    ano: Number(data.ano) || 0,
    mes: data.mes ?? null,
    recebido: normalizeTotais(data.recebido),
    impostos_recolhidos: Number(data.impostos_recolhidos) || 0,
    a_receber: normalizeTotais(data.a_receber),
    a_faturar: normalizeTotais(data.a_faturar),
  };
}

/** Mapeia Pipeline → métricas da aba Por Competência. */
export function metricasCompetencia(pipeline: PipelineReceita): {
  total_fechado: PipelineEstagioTotais;
  ja_recebido: PipelineEstagioTotais;
  a_receber: PipelineEstagioTotais;
  a_faturar: PipelineEstagioTotais;
} {
  return {
    total_fechado: pipeline.fechado,
    ja_recebido: pipeline.recebido,
    a_receber: pipeline.faturado_ag_pagamento,
    a_faturar: pipeline.a_faturar,
  };
}

/** Numerador da barra de meta conforme aba ativa. */
export function numeradorBarraMeta(
  aba: AbaReceita,
  caixa: ReceitaCaixa,
  pipeline: PipelineReceita,
  visao: VisaoReceita,
): number {
  if (aba === 'caixa') {
    return valorPorVisao(caixa.recebido.valor_liquido, caixa.recebido.valor_bruto, visao);
  }
  return valorPorVisao(pipeline.fechado.valor_liquido, pipeline.fechado.valor_bruto, visao);
}

export function rotuloNumeradorBarra(aba: AbaReceita): 'recebido' | 'fechado' {
  return aba === 'caixa' ? 'recebido' : 'fechado';
}

export const LABELS_CAIXA = {
  recebido: { rotulo: 'Recebido', badge: 'caixa', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', valorClass: 'text-emerald-700 dark:text-emerald-300' },
  impostos: { rotulo: 'Impostos Recolhidos', badge: 'absoluto', badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200', valorClass: 'text-gray-800 dark:text-gray-100' },
  a_receber: { rotulo: 'A Receber · NFs emitidas', badge: 'NF emitida', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', valorClass: 'text-blue-700 dark:text-blue-300' },
  a_faturar: { rotulo: 'A Faturar · sem NF', badge: 'sem NF', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200', valorClass: 'text-amber-700 dark:text-amber-300' },
} as const;

export const LABELS_COMPETENCIA = {
  total_fechado: { rotulo: 'Total Fechado', badge: 'competência', badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100', valorClass: 'text-gray-900 dark:text-gray-100' },
  ja_recebido: { rotulo: 'Já Recebido', badge: 'pago', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', valorClass: 'text-emerald-700 dark:text-emerald-300' },
  a_receber: { rotulo: 'A Receber · NFs emitidas', badge: 'NF emitida', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', valorClass: 'text-blue-700 dark:text-blue-300' },
  a_faturar: { rotulo: 'A Faturar · sem NF', badge: 'sem NF', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200', valorClass: 'text-amber-700 dark:text-amber-300' },
} as const;
