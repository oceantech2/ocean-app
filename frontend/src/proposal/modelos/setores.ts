import type { SetorId } from '../services/proposalApi';

export const FOTO_PADRAO = '/propostas/setores/infraestrutura.jpg';

// Mantido em sincronia com SETORES de backend/app/services/proposta_modelos.py
export const SETORES: { chave: SetorId; rotulo: string; foto: string }[] = [
  { chave: 'oil-gas', rotulo: 'Petróleo & Gás', foto: '/propostas/setores/oil-gas.jpg' },
  { chave: 'energia', rotulo: 'Energia', foto: '/propostas/setores/energia.jpg' },
  { chave: 'infraestrutura', rotulo: 'Infraestrutura', foto: FOTO_PADRAO },
  { chave: 'mineracao', rotulo: 'Mineração', foto: '/propostas/setores/mineracao.jpg' },
  { chave: 'tecnologia', rotulo: 'Tecnologia', foto: '/propostas/setores/tecnologia.jpg' },
  { chave: 'industria-servicos', rotulo: 'Indústria & Serviços', foto: '/propostas/setores/industria-servicos.jpg' },
  // Sem foto: a capa do modelo Ocean fica azul-marinho liso com o símbolo como marca d'água
  { chave: 'outros', rotulo: 'Outros', foto: '' },
];

export function rotuloSetor(chave: string | null | undefined): string {
  return SETORES.find((s) => s.chave === chave)?.rotulo ?? (chave || '—');
}

// '' = setor sem foto ('outros'); setor desconhecido ou ausente cai na foto padrão (propostas antigas)
export function fotoSetor(chave: string | null | undefined): string {
  return SETORES.find((s) => s.chave === chave)?.foto ?? FOTO_PADRAO;
}
