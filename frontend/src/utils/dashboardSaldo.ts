/** Saldo por conta corrente no Dashboard (feature 041). */

import type { ContaPagar, FluxoConta, NF } from '../types';
import {
  elegivelPagar,
  elegivelReceber,
  fluxoDePagar,
  fluxoDeReceber,
  ultimoSaldoHistorico,
  type MovimentoManualOrigem,
  type SaldoHistorico,
} from './fluxoCaixaMovimentos';
import { naturezaDespesa } from './dashboardDespesas';

export type RecorteSaldo = {
  ano: number;
  /** Mês concreto 1–12, ou null = jan..mesAte */
  mes: number | null;
  mesAte?: number;
};

function parseDataIso(s?: string | null): { ano: number; mes: number } | null {
  if (!s || !String(s).trim()) return null;
  const iso = String(s).trim().slice(0, 10);
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 };
}

function contaManual(conta: string | null | undefined, padrao: string): FluxoConta {
  if (conta === 'investimento') return 'investimento';
  if (!conta) return padrao;
  return conta;
}

function noRecortePagamento(data: { ano: number; mes: number }, recorte: RecorteSaldo): boolean {
  if (data.ano !== recorte.ano) return false;
  if (recorte.mes != null) return data.mes === recorte.mes;
  const ate = recorte.mesAte ?? 12;
  return data.mes >= 1 && data.mes <= ate;
}

/**
 * Saldo exibido por conta corrente: saldo registrado até o recorte
 * + receita bruta alocada − impostos (bruto − líquido NF) − despesas pagas operacionais.
 */
export function saldoCorrenteDashboard(
  conta: FluxoConta,
  saldos: SaldoHistorico[],
  nfs: NF[],
  contasPagas: ContaPagar[],
  manuais: MovimentoManualOrigem[],
  padrao: string,
  recorte: RecorteSaldo,
): number {
  const ultimo = ultimoSaldoHistorico(saldos, conta);
  const saldoBase = ultimo ? Number(ultimo.saldo) || 0 : 0;

  let receitaBruta = 0;
  let impostos = 0;

  for (const nf of nfs) {
    if (!elegivelReceber(nf)) continue;
    if (fluxoDeReceber(nf.caixa, padrao) !== conta) continue;
    const dt = parseDataIso(nf.data_pagamento);
    if (!dt || !noRecortePagamento(dt, recorte)) continue;
    const bruto = Number(nf.valor_bruto) || 0;
    const liquido = Number(nf.valor_liquido) || 0;
    receitaBruta += bruto;
    impostos += Math.max(0, bruto - liquido);
  }

  let despesas = 0;

  for (const c of contasPagas) {
    if (!elegivelPagar(c)) continue;
    if (fluxoDePagar(c.caixa, padrao) !== conta) continue;
    if (naturezaDespesa(c.categoria) === 'excluida') continue;
    const dt = parseDataIso(c.data_pagamento);
    if (!dt || !noRecortePagamento(dt, recorte)) continue;
    despesas += Number(c.valor) || 0;
  }

  for (const m of manuais) {
    if (contaManual(m.conta, padrao) !== conta) continue;
    const dt = parseDataIso(m.data_movimento);
    if (!dt || !noRecortePagamento(dt, recorte)) continue;
    const valor = Number(m.valor) || 0;
    if (m.tipo === 'receita') receitaBruta += valor;
    else if (m.tipo === 'despesa') despesas += valor;
  }

  return saldoBase + receitaBruta - impostos - despesas;
}
