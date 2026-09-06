/** Agregações de despesa/impostos do Dashboard (features 040, 047). */

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
  fixas: number,
  variaveis: number,
): { valor: number; pct: number | null } {
  const liquida = Number(receitaLiquida) || 0;
  const valor = liquida - (Number(fixas) || 0) - (Number(variaveis) || 0);
  if (liquida <= 0) return { valor, pct: null };
  return { valor, pct: (valor / liquida) * 100 };
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
  return parseVencimento(s);
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
