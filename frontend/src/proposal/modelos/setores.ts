import type { SetorId } from '../services/proposalApi';

const FOTO_PADRAO = '/propostas/setores/infraestrutura.jpg';

// Mantido em sincronia com SETORES de backend/app/services/proposta_modelos.py
export const SETORES: { chave: SetorId; rotulo: string; foto: string }[] = [
  { chave: 'oil-gas', rotulo: 'Petróleo & Gás', foto: FOTO_PADRAO },
  { chave: 'energia', rotulo: 'Energia', foto: FOTO_PADRAO },
  { chave: 'infraestrutura', rotulo: 'Infraestrutura', foto: FOTO_PADRAO },
  { chave: 'mineracao', rotulo: 'Mineração', foto: FOTO_PADRAO },
  { chave: 'industria-servicos', rotulo: 'Indústria & Serviços', foto: FOTO_PADRAO },
];

export function rotuloSetor(chave: string | null | undefined): string {
  return SETORES.find((s) => s.chave === chave)?.rotulo ?? (chave || '—');
}

export function fotoSetor(chave: string | null | undefined): string {
  return SETORES.find((s) => s.chave === chave)?.foto ?? FOTO_PADRAO;
}
