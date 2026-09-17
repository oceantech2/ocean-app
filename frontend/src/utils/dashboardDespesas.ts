/** Agregações de despesa/impostos do Dashboard (features 040, 047, 059, 074). */

export type NaturezaDespesa = 'fixa' | 'variavel' | 'excluida';

export function categoriaEhImpostos(categoria: string | null | undefined): boolean {
  const c = String(categoria || '').trim().toLowerCase();
  return c === 'impostos' || c === 'imposto';
}

export function tipoEhImpostoDas(tipo: string | null | undefined): boolean {
  return String(tipo || '').trim().toLowerCase() === 'imposto_das';
}

/**
 * Helper legado (ex.: saldo): só distingue exclusão de impostos.
 * Cards canônicos de Despesa (059) usam `tipo_despesa`, não esta classificação.
 */
export function naturezaDespesa(categoria: string | null | undefined, tipo?: string | null): NaturezaDespesa {
  if (tipoEhImpostoDas(tipo) || categoriaEhImpostos(categoria)) return 'excluida';
  return 'variavel';
}

export type ContaParaDespesa = {
  categoria?: string | null;
  valor?: number | null;
  tipo_despesa?: 'fixo' | 'variavel' | 'imposto_das' | null;
  data_pagamento?: string | null;
  data_vencimento?: string | null;
  /** Ignorado nos cards canônicos Seção 07 (059). */
  pago?: boolean;
};

export type RecorteDespesa = {
  ano: number;
  /** Mês concreto 1–12, ou null = jan..mesAte (ano completo quando mesAte=12) */
  mes: number | null;
  /** Último mês inclusivo quando mes === null. Default 12. */
  mesAte?: number;
};

function parseAnoMes(s?: string | null): { ano: number; mes: number } | null {
  if (!s || !String(s).trim()) return null;
  const m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  return { ano, mes };
}

function noRecorte(data: { ano: number; mes: number }, recorte: RecorteDespesa): boolean {
  if (data.ano !== recorte.ano) return false;
  if (recorte.mes != null) return data.mes === recorte.mes;
  const ate = recorte.mesAte ?? 12;
  return data.mes >= 1 && data.mes <= ate;
}

function tipoDespesaCanonico(tipo?: string | null): 'fixo' | 'variavel' {
  return String(tipo || '').trim().toLowerCase() === 'fixo' ? 'fixo' : 'variavel';
}

/**
 * Totais canônicos Seção 07: Fixas/Variáveis por tipo + data_pagamento;
 * Pendentes por data_vencimento + pagamento em branco. Flag `pago` irrelevante.
 */
export function totaisDespesa(
  contas: ContaParaDespesa[],
  recorte: RecorteDespesa,
): { fixas: number; variaveis: number; pendentes: number } {
  let fixas = 0;
  let variaveis = 0;
  let pendentes = 0;

  for (const c of contas) {
    if (tipoEhImpostoDas(c.tipo_despesa) || categoriaEhImpostos(c.categoria)) continue;
    const valor = Number(c.valor) || 0;
    if (valor === 0) continue;

    const pag = parseAnoMes(c.data_pagamento);
    if (pag && noRecorte(pag, recorte)) {
      if (tipoDespesaCanonico(c.tipo_despesa) === 'fixo') fixas += valor;
      else variaveis += valor;
      continue;
    }

    if (!pag) {
      const venc = parseAnoMes(c.data_vencimento);
      if (venc && noRecorte(venc, recorte)) pendentes += valor;
    }
  }

  return { fixas, variaveis, pendentes };
}

export type ResultadoCard = {
  valor: number;
  /** null se receita <= 0 (não inventar %). */
  pct: number | null;
};

/**
 * Resultado = receita − despesas_totais (fixas + variáveis; sem pendentes).
 */
export function calcularResultado(receita: number, despesasTotais: number): ResultadoCard {
  const rec = Number(receita) || 0;
  const desp = Number(despesasTotais) || 0;
  const valor = rec - desp;
  if (rec <= 0) return { valor, pct: null };
  return { valor, pct: (valor / rec) * 100 };
}

/** @deprecated Preferir `calcularResultado`; mantido por compat. */
export function lucroCard(
  receitaLiquida: number,
  fixas: number,
  variaveis: number,
): ResultadoCard {
  return calcularResultado(receitaLiquida, (Number(fixas) || 0) + (Number(variaveis) || 0));
}

export type CategoriaCusto = {
  categoria?: string;
  centro_custo?: string;
  valor?: number;
  percentual?: number;
  label?: string;
  [key: string]: unknown;
};

export type RespostaCusto = {
  total?: number;
  categorias?: CategoriaCusto[];
  [key: string]: unknown;
};

/** Remove fatia impostos e recalcula total/% . */
export function filtrarCustoSemImpostos(resposta: RespostaCusto | null | undefined): RespostaCusto | null {
  if (!resposta) return null;
  const cats = (resposta.categorias || []).filter((c) => {
    const cat = String(c.categoria || '').trim();
    const centro = String(c.centro_custo || '').trim();
    return !categoriaEhImpostos(cat) && !categoriaEhImpostos(centro);
  });
  const total = cats.reduce((s, c) => s + (Number(c.valor) || 0), 0);
  const categorias = cats.map((c) => ({
    ...c,
    percentual: total > 0 ? ((Number(c.valor) || 0) / total) * 100 : 0,
  }));
  return { ...resposta, total, categorias };
}

export type NfParaImposto = {
  status?: string | null;
  valor_imposto?: number | null;
  data_emissao?: string | null;
  excluida_em?: string | null;
};

function parseEmissao(s?: string | null): { ano: number; mes: number } | null {
  return parseAnoMes(s);
}

/** Impostos por competência: Σ valor_imposto das NFs pagas no recorte; alíquota ÷ Receita Bruta. */
export function impostosDeNfsPagas(
  nfs: NfParaImposto[],
  mes: number | null,
  ano: number,
  receitaBruta: number,
  mesAte?: number,
): { valor: number; aliquota: number | null } {
  let valor = 0;
  for (const nf of nfs || []) {
    if (String(nf.status || '').trim().toLowerCase() !== 'paga') continue;
    if (nf.excluida_em) continue;
    const em = parseEmissao(nf.data_emissao);
    if (!em || em.ano !== ano) continue;
    if (mes != null) {
      if (em.mes !== mes) continue;
    } else {
      const ate = mesAte ?? 12;
      if (em.mes < 1 || em.mes > ate) continue;
    }
    valor += Number(nf.valor_imposto) || 0;
  }
  const bruto = Number(receitaBruta) || 0;
  if (bruto <= 0) return { valor, aliquota: null };
  return { valor, aliquota: (valor / bruto) * 100 };
}
