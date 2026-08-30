import { CHAVE_SEM_VENCIMENTO, chaveMesVencimento } from './contasPagarAgrupamento';

export function anosPermitidosContasPagar(anoCorrente: number): number[] {
  const anos: number[] = [];
  for (let y = anoCorrente - 5; y <= anoCorrente + 5; y += 1) {
    anos.push(y);
  }
  return anos;
}

export function mesesDisponiveis(): number[] {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

export function passaFiltroMesAno(
  conta: { data_vencimento?: string | null },
  mes: number,
  ano: number,
  todos: boolean,
): boolean {
  if (todos) return true;
  const chave = chaveMesVencimento(conta.data_vencimento);
  if (chave === CHAVE_SEM_VENCIMENTO) return false;
  const alvo = `${ano}-${String(mes).padStart(2, '0')}`;
  return chave === alvo;
}
