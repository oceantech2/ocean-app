/** Alerta de Fluxo de Caixa — Dashboard (banner + limiar + próximo). */

import { valorPorVisao, type VisaoReceita } from './metaPeriodo';

export const LIMIAR_ALERTA_DEFAULT = 60;

/** Inteiro finito em 1..100 (rejeita decimal). */
export function ehLimiarValido(valor: unknown): valor is number {
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isInteger(n) && n >= 1 && n <= 100;
}

export type ProximoRecebimento = {
  referencia: string;
  encontrado: boolean;
  data_vencimento: string | null;
  valor_liquido: number | null;
  valor_bruto: number | null;
  nf_id: number | null;
};

export const PROXIMO_VAZIO: ProximoRecebimento = {
  referencia: '',
  encontrado: false,
  data_vencimento: null,
  valor_liquido: null,
  valor_bruto: null,
  nf_id: null,
};

export function normalizeProximoRecebimento(data: any): ProximoRecebimento {
  if (!data) return { ...PROXIMO_VAZIO };
  const encontrado = Boolean(data.encontrado);
  return {
    referencia: data.referencia != null ? String(data.referencia) : '',
    encontrado,
    data_vencimento: data.data_vencimento != null ? String(data.data_vencimento).slice(0, 10) : null,
    valor_liquido:
      data.valor_liquido == null || !Number.isFinite(Number(data.valor_liquido))
        ? null
        : Number(data.valor_liquido),
    valor_bruto:
      data.valor_bruto == null || !Number.isFinite(Number(data.valor_bruto))
        ? null
        : Number(data.valor_bruto),
    nf_id: data.nf_id == null ? null : Number(data.nf_id),
  };
}

/**
 * % não recebida = (fechado − recebido) / fechado × 100.
 * null se fechado ≤ 0; 0 se recebido > fechado.
 */
export function calcularPctNaoRecebida(fechado: number, recebido: number): number | null {
  if (!Number.isFinite(fechado) || fechado <= 0) return null;
  if (!Number.isFinite(recebido)) return null;
  if (recebido > fechado) return 0;
  return ((fechado - recebido) / fechado) * 100;
}

/** Banner só quando % disponível e estritamente maior que o limiar. */
export function deveExibirBanner(pct: number | null | undefined, limiar: number): boolean {
  if (pct == null || !Number.isFinite(pct)) return false;
  if (!Number.isFinite(limiar)) return false;
  return pct > limiar;
}

export function rotuloSemProximo(): string {
  return 'sem próximo / sem previsão';
}

export function rotuloIndisponivel(): string {
  return 'indisponível';
}

export function valorProximoPorVisao(
  proximo: ProximoRecebimento | null | undefined,
  visao: VisaoReceita,
): number | null {
  if (!proximo?.encontrado) return null;
  const liq = proximo.valor_liquido;
  const bru = proximo.valor_bruto;
  if (liq == null && bru == null) return null;
  return valorPorVisao(liq ?? 0, bru ?? 0, visao);
}

export function fmtPctAlerta(pct: number | null | undefined): string {
  if (pct == null || !Number.isFinite(pct)) return '—';
  return `${pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** Exibição do limiar inteiro (sem casas decimais). */
export function fmtLimiarAlerta(limiar: number): string {
  const n = Number.isInteger(limiar) ? limiar : Math.round(limiar);
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`;
}
