import type { TipoInvestimento } from '../services/proposalApi';

// Ordem de exibição; mantida em sincronia com TIPOS_INVESTIMENTO do backend
export const TIPOS: { tipo: TipoInvestimento; rotulo: string }[] = [
  { tipo: 'retainer', rotulo: 'Retainer' },
  { tipo: 'sucesso', rotulo: 'Sucesso' },
  { tipo: 'valor-fechado', rotulo: 'Valor fechado' },
];

export function rotuloTipo(tipo: string): string {
  return TIPOS.find((t) => t.tipo === tipo)?.rotulo ?? tipo;
}
