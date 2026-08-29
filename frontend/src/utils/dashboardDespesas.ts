/** Agregações de despesa/impostos do Dashboard (feature 040). */

export type NaturezaDespesa = 'fixa' | 'variavel' | 'excluida';

const FIXAS = new Set([
  'adm_financeiro',
  'recursos_humanos',
  'beneficios',
  'tecnologia',
]);

const VARIAVEIS = new Set([
  'operacoes',
  'marketing',
  'comercial',
]);

/** Categorias excluídas dos cards/gráficos de Despesa (incl. aliases legados IMPOSTOS). */
const EXCLUIDAS = new Set(['impostos']);

export function categoriaEhImpostos(categoria: string | null | undefined): boolean {
  const c = String(categoria || '').trim().toLowerCase();
  return c === 'impostos';
}

export function naturezaDespesa(categoria: string | null | undefined): NaturezaDespesa {
  const c = String(categoria || '').trim().toLowerCase();
  if (!c || EXCLUIDAS.has(c)) return 'excluida';
  if (FIXAS.has(c)) return 'fixa';
  if (VARIAVEIS.has(c)) return 'variavel';
  return 'variavel';
}

export type ContaParaDespesa = {
  categoria?: string | null;
  valor?: number | null;
  pago?: boolean;
  data_vencimento?: string | null;
};

export type RecorteDespesa = {
  ano: number;
  /** Mês concreto 1–12, ou null = jan..mesAte (YTD / ano completo) */
  mes: number | null;
  /** Último mês inclusivo quando mes === null (ex.: YTD). Default 12. */
  mesAte?: number;
};

function parseVencimento(s?: string | null): { ano: number; mes: number } | null {
  if (!s || !String(s).trim()) return null;
  const m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  return { ano, mes };
}

function noRecorte(venc: { ano: number; mes: number }, recorte: RecorteDespesa): boolean {
  if (venc.ano !== recorte.ano) return false;
  if (recorte.mes != null) return venc.mes === recorte.mes;
  const ate = recorte.mesAte ?? 12;
  return venc.mes >= 1 && venc.mes <= ate;
}

export function totaisDespesa(
  contas: ContaParaDespesa[],
  recorte: RecorteDespesa,
): { fixas: number; variaveis: number; pendentes: number } {
  let fixas = 0;
  let variaveis = 0;
  let pendentes = 0;

  for (const c of contas) {
    const venc = parseVencimento(c.data_vencimento);
    if (!venc || !noRecorte(venc, recorte)) continue;
    const nat = naturezaDespesa(c.categoria);
    if (nat === 'excluida') continue;
    const valor = Number(c.valor) || 0;
    if (valor === 0) continue;

    if (c.pago) {
      if (nat === 'fixa') fixas += valor;
      else variaveis += valor;
    } else {
      pendentes += valor;
    }
  }

  return { fixas, variaveis, pendentes };
}

export function lucroCard(
  receitaLiquida: number,
  receitaBruta: number,
  fixas: number,
  variaveis: number,
): { valor: number; pct: number | null } {
  const valor = (Number(receitaLiquida) || 0) - (Number(fixas) || 0) - (Number(variaveis) || 0);
  const bruto = Number(receitaBruta) || 0;
  if (bruto <= 0) return { valor, pct: null };
  return { valor, pct: (valor / bruto) * 100 };
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

export type ItemImpostoDeContas = {
  mes: number;
  ano: number;
  valor_imposto?: number | null;
  faturamento?: number | null;
  percentual_imposto?: number | null;
};

export function impostosDoRecorte(
  itens: ItemImpostoDeContas[],
  mes: number | null,
  ano: number,
  mesAte?: number,
): { valor: number; aliquota: number | null } {
  const doAno = (itens || []).filter((i) => Number(i.ano) === ano);
  if (mes != null) {
    const item = doAno.find((i) => Number(i.mes) === mes);
    const valor = Number(item?.valor_imposto) || 0;
    const fat = Number(item?.faturamento) || 0;
    const pctApi = Number(item?.percentual_imposto);
    if (fat > 0) {
      const aliquota = Number.isFinite(pctApi) && pctApi > 0 ? pctApi : (valor / fat) * 100;
      return { valor, aliquota };
    }
    return { valor, aliquota: null };
  }
  const ate = mesAte ?? 12;
  const faixa = doAno.filter((i) => {
    const m = Number(i.mes);
    return m >= 1 && m <= ate;
  });
  const valor = faixa.reduce((s, i) => s + (Number(i.valor_imposto) || 0), 0);
  const fat = faixa.reduce((s, i) => s + (Number(i.faturamento) || 0), 0);
  if (fat <= 0) return { valor, aliquota: null };
  return { valor, aliquota: (valor / fat) * 100 };
}
