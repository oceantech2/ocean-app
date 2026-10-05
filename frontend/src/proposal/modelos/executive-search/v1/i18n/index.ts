import type { Idioma } from '../../../../services/proposalApi';
import enUS from './en-US';
import ptBR from './pt-BR';
import type { TextosES } from './tipos';

const TEXTOS: Record<Idioma, TextosES> = { 'pt-BR': ptBR, 'en-US': enUS };

export function textosES(idioma: Idioma): TextosES {
  return TEXTOS[idioma];
}

export type { TextosES };
