import type { ContaPagar, FluxoConta, MovimentoFluxo, NF } from '../types';

export type MovimentoManualOrigem = {
  id: number;
  tipo: 'receita' | 'despesa' | string;
  descricao: string;
  valor: number;
  data_movimento: string;
  conta?: FluxoConta | string | null;
  par_id?: string | null;
};

export type SaldoHistorico = {
  conta?: string | null;
  mes: number;
  ano: number;
  saldo: number;
  data_registro: string;
};

export type MovimentoSinalizado = {
  data: string;
  valor: number;
};

function partesData(iso: string | null | undefined): { ano: number; mes: number } | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 };
}

export function noPeriodoPagamento(
  data: string | null | undefined,
  mes: number | '',
  ano: number,
): boolean {
  const p = partesData(data);
  if (!p) return false;
  if (p.ano !== ano) return false;
  if (mes !== '' && p.mes !== mes) return false;
  return true;
}

export function elegivelReceber(nf: NF): boolean {
  if (nf.arquivada) return false;
  if (nf.status === 'cancelada') return false;
  if (!nf.data_pagamento) return false;
  return Number(nf.valor_liquido) > 0;
}

export function elegivelPagar(conta: ContaPagar): boolean {
  if (!conta.data_pagamento) return false;
  if (!conta.pago) return false;
  return Number(conta.valor) > 0;
}

export function fluxoDeReceber(caixa: string | null | undefined): FluxoConta {
  return caixa === 'investimento' ? 'investimento' : 'corrente';
}

function contaManual(conta: string | null | undefined): FluxoConta {
  return conta === 'investimento' ? 'investimento' : 'corrente';
}

function descricaoReceber(nf: NF): string {
  const razao = nf.razao_social || '';
  const numero = nf.numero?.trim();
  if (numero) return `NF ${numero} — ${razao}`;
  return razao;
}

export function mapearMovimentos(
  nfs: NF[],
  contas: ContaPagar[],
  manuais: MovimentoManualOrigem[],
  mes: number | '',
  ano: number,
  fluxo: FluxoConta,
): MovimentoFluxo[] {
  const entradas: MovimentoFluxo[] = nfs
    .filter((nf) => (
      elegivelReceber(nf)
      && noPeriodoPagamento(nf.data_pagamento, mes, ano)
      && fluxoDeReceber(nf.caixa) === fluxo
    ))
    .map((nf) => ({
      id: `receber-${nf.id}`,
      data: nf.data_pagamento as string,
      tipo: 'entrada' as const,
      origem: 'contas_receber' as const,
      origem_rotulo: 'Contas a Receber' as const,
      desc: descricaoReceber(nf),
      valor: Number(nf.valor_liquido),
      manual: false,
    }));

  const saidas: MovimentoFluxo[] = fluxo === 'corrente'
    ? contas
      .filter((c) => elegivelPagar(c) && noPeriodoPagamento(c.data_pagamento, mes, ano))
      .map((c) => ({
        id: `pagar-${c.id}`,
        data: c.data_pagamento as string,
        tipo: 'saida' as const,
        origem: 'contas_pagar' as const,
        origem_rotulo: 'Contas a Pagar' as const,
        desc: c.descricao,
        valor: -Number(c.valor),
        manual: false,
      }))
    : [];

  const manuaisMap: MovimentoFluxo[] = manuais
    .filter((m) => (
      noPeriodoPagamento(m.data_movimento, mes, ano)
      && contaManual(m.conta) === fluxo
    ))
    .map((m) => {
      const entrada = m.tipo === 'receita';
      const transferencia = Boolean(m.par_id);
      return {
        id: `mov-${m.id}`,
        data: m.data_movimento,
        tipo: entrada ? ('entrada' as const) : ('saida' as const),
        origem: transferencia ? ('transferencia' as const) : ('manual' as const),
        origem_rotulo: transferencia ? ('Transferência' as const) : ('Manual' as const),
        desc: m.descricao,
        valor: entrada ? Number(m.valor) : -Number(m.valor),
        manual: !transferencia,
        movId: m.id,
        parId: m.par_id || undefined,
      };
    });

  const porId = new Map<string, MovimentoFluxo>();
  for (const mov of [...entradas, ...saidas, ...manuaisMap]) {
    porId.set(mov.id, mov);
  }
  return [...porId.values()];
}

export function movimentosSinalizadosDaConta(
  nfs: NF[],
  contas: ContaPagar[],
  manuais: MovimentoManualOrigem[],
  fluxo: FluxoConta,
): MovimentoSinalizado[] {
  const cr: MovimentoSinalizado[] = nfs
    .filter((nf) => elegivelReceber(nf) && fluxoDeReceber(nf.caixa) === fluxo)
    .map((nf) => ({ data: nf.data_pagamento as string, valor: Number(nf.valor_liquido) }));

  const cp: MovimentoSinalizado[] = fluxo === 'corrente'
    ? contas
      .filter((c) => elegivelPagar(c))
      .map((c) => ({ data: c.data_pagamento as string, valor: -Number(c.valor) }))
    : [];

  const man: MovimentoSinalizado[] = manuais
    .filter((m) => contaManual(m.conta) === fluxo)
    .map((m) => ({
      data: m.data_movimento,
      valor: m.tipo === 'receita' ? Number(m.valor) : -Number(m.valor),
    }));

  return [...cr, ...cp, ...man];
}

export function ultimoSaldoHistorico(
  saldos: SaldoHistorico[],
  conta: FluxoConta,
): SaldoHistorico | null {
  const daConta = saldos.filter((s) => (s.conta === conta) || (!s.conta && conta === 'corrente'));
  if (daConta.length === 0) return null;
  return [...daConta].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano;
    if (a.mes !== b.mes) return b.mes - a.mes;
    return String(b.data_registro).localeCompare(String(a.data_registro));
  })[0];
}

export function saldoVisivel(
  conta: FluxoConta,
  saldos: SaldoHistorico[],
  movimentos: MovimentoSinalizado[],
): number {
  const ultimo = ultimoSaldoHistorico(saldos, conta);
  if (!ultimo) {
    return movimentos.reduce((acc, m) => acc + m.valor, 0);
  }
  const posteriores = movimentos.filter((m) => m.data > ultimo.data_registro);
  return Number(ultimo.saldo) + posteriores.reduce((acc, m) => acc + m.valor, 0);
}
