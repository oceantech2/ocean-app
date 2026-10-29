import type { Idioma } from './idioma';

export type Pagina = 'home' | 'solucoes' | 'vagas' | 'noticias';

export const CAMINHOS: Record<Pagina, Record<Idioma, string>> = {
  home: { pt: '/', en: '/en' },
  solucoes: { pt: '/solucoes', en: '/en/solutions' },
  vagas: { pt: '/vagas', en: '/en/jobs' },
  noticias: { pt: '/noticias', en: '/en/news' },
};

export const PAGINAS = Object.keys(CAMINHOS) as Pagina[];

export function idiomaDoCaminho(caminho: string): Idioma {
  return caminho === '/en' || caminho.startsWith('/en/') ? 'en' : 'pt';
}

/** Página de uma vaga: `/vagas/<slug>-<id>` ou `/en/jobs/<slug>-<id>`; a vaga é achada pelo id. */
export function vagaDoCaminho(caminho: string): { id: number; segmento: string } | undefined {
  const m = caminho.match(/^(?:\/vagas|\/en\/jobs)\/([^/]+)\/?$/);
  const id = m?.[1].match(/(?:^|-)(\d+)$/)?.[1];
  return m && id ? { id: Number(id), segmento: m[1] } : undefined;
}

export function caminhoVaga(vaga: { id: number; slug: string }, idioma: Idioma) {
  return `${CAMINHOS.vagas[idioma]}/${vaga.slug}-${vaga.id}`;
}

export function paginaDoCaminho(caminho: string): Pagina | undefined {
  if (vagaDoCaminho(caminho)) return 'vagas';
  const normalizado = caminho.length > 1 ? caminho.replace(/\/+$/, '') : caminho;
  return PAGINAS.find((p) => CAMINHOS[p].pt === normalizado || CAMINHOS[p].en === normalizado);
}
