import { dataISO } from './dataCivil';

export const CHAVE_SEM_VENCIMENTO = 'sem-vencimento';

/** YYYY-MM a partir da data civil; sem Date('YYYY-MM-DD') (UTC). */
export function chaveMesVencimento(dataVencimento?: string | null): string {
  const iso = dataISO(dataVencimento);
  if (!iso) return CHAVE_SEM_VENCIMENTO;
  return iso.slice(0, 7);
}

/** Rótulo da coluna Mês/Ano: "Agosto/2026" ou "—". */
export function rotuloMesAnoColuna(dataVencimento?: string | null): string {
  const chave = chaveMesVencimento(dataVencimento);
  if (chave === CHAVE_SEM_VENCIMENTO) return '—';
  const partes = chave.split('-');
  const y = Number(partes[0]);
  const m = Number(partes[1]);
  if (!y || !m || m < 1 || m > 12) return '—';
  const raw = new Date(y, m - 1, 1).toLocaleString('pt-BR', { month: 'long' });
  if (!raw) return '—';
  const mes = raw.charAt(0).toUpperCase() + raw.slice(1);
  return `${mes}/${y}`;
}
