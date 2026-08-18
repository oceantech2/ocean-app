/** Alíquota efetiva do mês (mesmo “% Imposto” de Impostos) para tooltip em Contas a Receber. */

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const TEXTO_ALIQUOTA_INDISPONIVEL = 'Alíquota do mês indisponível';

export type Competencia = { ano: number; mes: number };

export type NfCompetencia = {
  data_emissao?: string | null;
  data_vencimento?: string | null;
};

export type ItemDeContas = {
  mes: number;
  ano: number;
  percentual_imposto?: number | null;
};

function parseDataIso(s?: string | null): { ano: number; mes: number } | null {
  if (!s || !String(s).trim()) return null;
  const m = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  return { ano, mes };
}

/** Competência: emissão; se vazia, vencimento. */
export function competenciaNf(nf: NfCompetencia): Competencia | null {
  return parseDataIso(nf.data_emissao) || parseDataIso(nf.data_vencimento);
}

export function chaveCompetencia(ano: number, mes: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}`;
}

export function anosCompetencia(nfs: NfCompetencia[]): number[] {
  const set = new Set<number>();
  for (const nf of nfs) {
    const c = competenciaNf(nf);
    if (c) set.add(c.ano);
  }
  return [...set].sort((a, b) => a - b);
}

export function mapaAliquotas(itens: ItemDeContas[]): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const it of itens) {
    if (it.mes == null || it.ano == null) continue;
    mapa[chaveCompetencia(it.ano, it.mes)] = Number(it.percentual_imposto) || 0;
  }
  return mapa;
}

export function textoTooltipAliquota(nf: NfCompetencia, mapa: Record<string, number>): string {
  const c = competenciaNf(nf);
  if (!c) return TEXTO_ALIQUOTA_INDISPONIVEL;
  const pct = mapa[chaveCompetencia(c.ano, c.mes)];
  if (pct == null || pct <= 0) return TEXTO_ALIQUOTA_INDISPONIVEL;
  const mesNome = MESES_ABREV[c.mes - 1];
  const fmt = pct.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `Alíquota do mês (${mesNome}/${c.ano}): ${fmt}%`;
}
