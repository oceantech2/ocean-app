import type { Idioma } from '../../../services/proposalApi';
import enUS from './en-US';
import ptBR from './pt-BR';
import type { TextosPagina } from './tipos';

const TEXTOS: Record<Idioma, TextosPagina> = { 'pt-BR': ptBR, 'en-US': enUS };

export function textosPagina(idioma: Idioma): TextosPagina {
  return TEXTOS[idioma];
}
