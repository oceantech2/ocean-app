/** Helpers do toggle Bruto/Líquido e Configuração do Período (Dashboard). */

export type VisaoReceita = 'liquido' | 'bruto';

export function metaBruta(
  metaLiquida: number | null | undefined,
  aliquotaPeriodo: number | null | undefined,
): number | null {
  if (metaLiquida == null || aliquotaPeriodo == null) return null;
  const liq = Number(metaLiquida);
  const aliq = Number(aliquotaPeriodo);
  if (!Number.isFinite(liq) || !Number.isFinite(aliq)) return null;
  if (aliq < 0 || aliq >= 100) return null;
  const denom = 1 - aliq / 100;
  if (denom <= 0) return null;
  return Math.round((liq / denom) * 100) / 100;
}

export function rotuloVisao(visao: VisaoReceita): string {
  return visao === 'bruto' ? 'visão bruta' : 'visão líquida';
}

export function valorPorVisao(
  liquido: number | null | undefined,
  bruto: number | null | undefined,
  visao: VisaoReceita,
): number {
  const v = visao === 'bruto' ? bruto : liquido;
  return Number(v) || 0;
}

export function pctPorVisao(
  pctLiquido: number | null | undefined,
  pctBruto: number | null | undefined,
  visao: VisaoReceita,
): number | null {
  const p = visao === 'bruto' ? pctBruto : pctLiquido;
  if (p == null || !Number.isFinite(p)) return null;
  return p;
}
