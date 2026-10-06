import type { Idioma } from '../../../services/proposalApi';

export interface TextosIndisponivel {
  moldura: string;
  cancelada: string;
  expirada: string;
  carregando: string;
}

// Fora dos dicionários da página: a PropostaPublica importa isto direto, sem puxar o chunk do modelo
const TEXTOS: Record<Idioma, TextosIndisponivel> = {
  'pt-BR': {
    moldura: 'Proposta comercial',
    cancelada: 'Esta proposta não está mais disponível.',
    expirada: 'Esta proposta expirou. Entre em contato com a Ocean para receber uma nova.',
    carregando: 'Carregando proposta…',
  },
  'en-US': {
    moldura: 'Commercial proposal',
    cancelada: 'This proposal is no longer available.',
    expirada: 'This proposal has expired. Please contact Ocean to receive a new one.',
    carregando: 'Loading proposal…',
  },
};

export function textosIndisponivel(idioma: Idioma): TextosIndisponivel {
  return TEXTOS[idioma];
}
