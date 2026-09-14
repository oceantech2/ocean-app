/** Totais de competência do período (API pipeline-receita) — base de Por Competência / meta / Resultado. */

export type PipelineEstagioTotais = {
  valor_liquido: number;
  valor_bruto: number;
  contagem: number;
  percentual_liquido: number | null;
  percentual_bruto: number | null;
  /** Compat 056 */
  valor?: number;
  percentual?: number | null;
};

export type PipelineReceita = {
  ano: number;
  mes: number | null;
  fechado: PipelineEstagioTotais;
  a_faturar: PipelineEstagioTotais;
  faturado_ag_pagamento: PipelineEstagioTotais;
  recebido: PipelineEstagioTotais;
};

const ESTAGIO_VAZIO: PipelineEstagioTotais = {
  valor_liquido: 0,
  valor_bruto: 0,
  contagem: 0,
  percentual_liquido: null,
  percentual_bruto: null,
  valor: 0,
  percentual: null,
};

export const PIPELINE_VAZIO: PipelineReceita = {
  ano: 0,
  mes: null,
  fechado: { ...ESTAGIO_VAZIO, percentual_liquido: 100, percentual_bruto: 100, percentual: 100 },
  a_faturar: { ...ESTAGIO_VAZIO },
  faturado_ag_pagamento: { ...ESTAGIO_VAZIO },
  recebido: { ...ESTAGIO_VAZIO },
};

function normalizeEstagio(raw: Partial<PipelineEstagioTotais> | undefined): PipelineEstagioTotais {
  if (!raw) return { ...ESTAGIO_VAZIO };
  const valor_liquido = Number(raw.valor_liquido ?? raw.valor ?? 0) || 0;
  const valor_bruto = Number(raw.valor_bruto ?? 0) || 0;
  const percentual_liquido =
    raw.percentual_liquido !== undefined ? raw.percentual_liquido : (raw.percentual ?? null);
  const percentual_bruto = raw.percentual_bruto ?? null;
  return {
    valor_liquido,
    valor_bruto,
    contagem: Number(raw.contagem) || 0,
    percentual_liquido: percentual_liquido == null ? null : Number(percentual_liquido),
    percentual_bruto: percentual_bruto == null ? null : Number(percentual_bruto),
    valor: valor_liquido,
    percentual: percentual_liquido == null ? null : Number(percentual_liquido),
  };
}

/** Normaliza resposta da API (dual-base ou legado 056). */
export function normalizePipelineReceita(data: any): PipelineReceita {
  if (!data) return { ...PIPELINE_VAZIO };
  return {
    ano: Number(data.ano) || 0,
    mes: data.mes ?? null,
    fechado: normalizeEstagio(data.fechado),
    a_faturar: normalizeEstagio(data.a_faturar),
    faturado_ag_pagamento: normalizeEstagio(data.faturado_ag_pagamento),
    recebido: normalizeEstagio(data.recebido),
  };
}
