import { useLocation } from 'react-router-dom';
import { CAMINHOS, idiomaDoCaminho, paginaDoCaminho, vagaDoCaminho, type Pagina } from './rotas';

export type Idioma = 'pt' | 'en';
export type Txt = Record<Idioma, string>;

export const IDIOMAS: { id: Idioma; sigla: string; nome: string }[] = [
  { id: 'pt', sigla: 'PT', nome: 'Português' },
  { id: 'en', sigla: 'EN', nome: 'English' },
];

/** Estado da navegação de troca de idioma: a página continua onde está, sem rolar. */
export const TROCA_IDIOMA = { trocaIdioma: true } as const;

export function ehTrocaIdioma(estado: unknown) {
  return !!estado && (estado as typeof TROCA_IDIOMA).trocaIdioma === true;
}

export function useIdioma() {
  const { pathname, hash } = useLocation();
  const idioma = idiomaDoCaminho(pathname);

  const caminho = (pagina: Pagina, ancora?: string) => `${CAMINHOS[pagina][idioma]}${ancora ? `#${ancora}` : ''}`;

  const caminhoEm = (outro: Idioma) => {
    const vaga = vagaDoCaminho(pathname);
    if (vaga) return `${CAMINHOS.vagas[outro]}/${vaga.segmento}${hash}`;
    return `${CAMINHOS[paginaDoCaminho(pathname) ?? 'home'][outro]}${hash}`;
  };

  return { idioma, caminho, caminhoEm };
}
