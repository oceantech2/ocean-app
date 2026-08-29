/** Trimestres civis: 1º jan–mar, 2º abr–jun, 3º jul–set, 4º out–dez. */

export type BonusRecorte = 'ano' | 'mes' | 'trimestre';

export function mesesDoTrimestre(trimestre: number): number[] {
  const t = Math.min(4, Math.max(1, Math.trunc(trimestre) || 1));
  const inicio = (t - 1) * 3 + 1;
  return [inicio, inicio + 1, inicio + 2];
}

export function trimestreDoMes(mes: number): number {
  return Math.ceil(Math.min(12, Math.max(1, mes)) / 3);
}

export function comissaoNoRecorte(
  mes: number,
  recorte: BonusRecorte,
  mesSelecionado: number,
  trimestreSelecionado: number,
): boolean {
  if (recorte === 'ano') return true;
  if (recorte === 'mes') return mes === mesSelecionado;
  return mesesDoTrimestre(trimestreSelecionado).includes(mes);
}
