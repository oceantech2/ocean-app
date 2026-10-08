import { Bonus } from '../types';

export type StatusLiberacaoFiltro = 'todos' | 'liberados' | 'nao_liberados';

export function filtrarPorStatusLiberacao(lista: Bonus[], status: StatusLiberacaoFiltro): Bonus[] {
  if (status === 'liberados') return lista.filter((b) => b.liberado);
  if (status === 'nao_liberados') return lista.filter((b) => !b.liberado);
  return lista;
}

export function elegiveisParaLiberar(lista: Bonus[], ids: Set<number>): Bonus[] {
  return lista.filter((b) => ids.has(b.id) && !b.liberado);
}

export function elegiveisParaPagar(lista: Bonus[], ids: Set<number>): Bonus[] {
  return lista.filter((b) => ids.has(b.id) && b.liberado && !b.pago);
}

export function somaValores(lista: Bonus[]): number {
  return lista.reduce((s, b) => s + b.valor_bonus, 0);
}
