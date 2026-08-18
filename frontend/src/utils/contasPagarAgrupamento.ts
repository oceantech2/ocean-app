import { dataISO } from './dataCivil';

export const CHAVE_SEM_VENCIMENTO = 'sem-vencimento';

export type GrupoMensal<T extends { data_vencimento?: string | null; valor: number }> = {
  chave: string;
  rotulo: string;
  contas: T[];
  total: number;
};

/** YYYY-MM a partir da data civil; sem Date('YYYY-MM-DD') (UTC). */
export function chaveMesVencimento(dataVencimento?: string | null): string {
  const iso = dataISO(dataVencimento);
  if (!iso) return CHAVE_SEM_VENCIMENTO;
  return iso.slice(0, 7);
}

export function rotuloGrupoMes(chave: string): string {
  if (chave === CHAVE_SEM_VENCIMENTO) return 'Sem vencimento';
  const partes = chave.split('-');
  const y = Number(partes[0]);
  const m = Number(partes[1]);
  if (!y || !m || m < 1 || m > 12) return chave;
  const raw = new Date(y, m - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  if (!raw) return chave;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function ordenarChavesMes(chaves: string[]): string[] {
  const sem = chaves.filter((c) => c === CHAVE_SEM_VENCIMENTO);
  const datadas = chaves.filter((c) => c !== CHAVE_SEM_VENCIMENTO).sort((a, b) => b.localeCompare(a));
  return [...datadas, ...sem];
}

export function totalGrupo(contas: { valor: number }[]): number {
  return contas.reduce((s, c) => s + (c.valor || 0), 0);
}

/** Primeiro mês datado na lista já ordenada; se só houver sentinela, essa chave. */
export function chaveMesInicialAberta(chavesOrdenadas: string[]): string | null {
  if (chavesOrdenadas.length === 0) return null;
  const datada = chavesOrdenadas.find((c) => c !== CHAVE_SEM_VENCIMENTO);
  return datada ?? chavesOrdenadas[0];
}

export function agruparPorMes<T extends { data_vencimento?: string | null; valor: number }>(
  contas: T[],
): GrupoMensal<T>[] {
  const map = new Map<string, T[]>();
  for (const c of contas) {
    const k = chaveMesVencimento(c.data_vencimento);
    const arr = map.get(k);
    if (arr) arr.push(c);
    else map.set(k, [c]);
  }
  return ordenarChavesMes([...map.keys()]).map((chave) => {
    const grupo = map.get(chave) ?? [];
    return { chave, rotulo: rotuloGrupoMes(chave), contas: grupo, total: totalGrupo(grupo) };
  });
}
