import type { ContaCorrente } from '../types';
import { codigoPadrao } from './fluxoCaixaMovimentos';

export function calcularImpostoLiquido(
  bruto: number,
  aliquotaPct: number | null | undefined,
): { imposto: number; liquido: number } {
  const pct = aliquotaPct == null || Number.isNaN(aliquotaPct) ? 0 : aliquotaPct;
  if (Number.isNaN(bruto) || bruto < 0) {
    return { imposto: 0, liquido: 0 };
  }
  const imposto = Math.round(bruto * (pct / 100) * 100) / 100;
  const liquido = Math.round((bruto - imposto) * 100) / 100;
  return { imposto, liquido };
}

export function codigoSlot1(contas: ContaCorrente[]): string {
  const ativas = contas.filter((c) => c.ativo);
  return ativas[0]?.codigo || codigoPadrao(contas);
}

export function validarAliquota(valor: string): string | null {
  if (valor.trim() === '') return null;
  const n = parseFloat(valor);
  if (Number.isNaN(n) || n < 0 || n > 100) {
    return 'Alíquota deve estar entre 0 e 100';
  }
  return null;
}

export function aplicarCalculoFiscal(brutoStr: string, aliqStr: string): {
  valor_imposto: string;
  valor_liquido: string;
} {
  const bruto = parseFloat(brutoStr);
  if (!brutoStr.trim() || Number.isNaN(bruto)) {
    return { valor_imposto: '', valor_liquido: '' };
  }
  const aliq = aliqStr.trim() === '' ? null : parseFloat(aliqStr);
  const { imposto, liquido } = calcularImpostoLiquido(bruto, aliq);
  return { valor_imposto: String(imposto), valor_liquido: String(liquido) };
}
