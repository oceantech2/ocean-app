/** Recorrência de contas a pagar — espelha a regra de datas do servidor (mesmo dia ou último dia do mês). */

export const RECORRENCIA_MAX_MESES = 24;

export function somarMesesISO(iso: string, meses: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const indice = Number(m[2]) - 1 + meses;
  const ano = Number(m[1]) + Math.floor(indice / 12);
  const mes = (indice % 12) + 1;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const dia = Math.min(Number(m[3]), ultimoDia);
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export function mesesRecorrenciaValido(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= RECORRENCIA_MAX_MESES;
}

function mesAno(iso: string): string {
  return `${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

/** Ex.: "Serão criadas mais 3 contas, com vencimentos de 12/2026 a 02/2027". */
export function resumoRecorrencia(vencimento: string, n: number): string | null {
  if (!vencimento || !mesesRecorrenciaValido(n)) return null;
  const primeiro = somarMesesISO(vencimento, 1);
  const ultimo = somarMesesISO(vencimento, n);
  if (!primeiro || !ultimo) return null;
  if (n === 1) return `Será criada mais 1 conta, com vencimento em ${mesAno(primeiro)}`;
  return `Serão criadas mais ${n} contas, com vencimentos de ${mesAno(primeiro)} a ${mesAno(ultimo)}`;
}
