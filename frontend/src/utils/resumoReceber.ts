/** Cards de resumo da tela Contas a Receber (Receita Total, Recebido, Pendente, Vencido). */

import { valorPorVisao, type VisaoReceita } from './metaPeriodo';

export type ResumoReceber = {
  total_bruto_pago?: number;
  total_liquido_pago?: number;
  qtd_pagas?: number;
  total_bruto_pendente?: number;
  total_liquido_pendente?: number;
  qtd_pendentes?: number;
  total_bruto_vencido?: number;
  total_liquido_vencido?: number;
  qtd_vencidas?: number;
};

export type ChaveCardReceber = 'total' | 'recebido' | 'pendente' | 'vencido';

export type CardResumoReceber = {
  chave: ChaveCardReceber;
  rotulo: string;
  valor: number;
  quantidade: number;
};

export function cardsResumoReceber(
  resumo: ResumoReceber | null | undefined,
  visao: VisaoReceita,
): CardResumoReceber[] {
  const r = resumo ?? {};
  const recebido = valorPorVisao(r.total_liquido_pago, r.total_bruto_pago, visao);
  const pendente = valorPorVisao(r.total_liquido_pendente, r.total_bruto_pendente, visao);
  const vencido = valorPorVisao(r.total_liquido_vencido, r.total_bruto_vencido, visao);
  const qRecebido = Number(r.qtd_pagas) || 0;
  const qPendente = Number(r.qtd_pendentes) || 0;
  const qVencido = Number(r.qtd_vencidas) || 0;
  return [
    { chave: 'total', rotulo: 'Receita Total', valor: recebido + pendente + vencido, quantidade: qRecebido + qPendente + qVencido },
    { chave: 'recebido', rotulo: 'Recebido', valor: recebido, quantidade: qRecebido },
    { chave: 'pendente', rotulo: 'Pendente', valor: pendente, quantidade: qPendente },
    { chave: 'vencido', rotulo: 'Vencido', valor: vencido, quantidade: qVencido },
  ];
}
