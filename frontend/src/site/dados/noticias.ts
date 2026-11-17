import type { Txt } from '../idioma';

export type SegmentoNoticia =
  | 'oil-gas'
  | 'offshore'
  | 'energia'
  | 'infraestrutura'
  | 'mineracao'
  | 'industria'
  | 'tecnologia';

export const SEGMENTOS: Record<SegmentoNoticia, Txt> = {
  'oil-gas': { pt: 'Petróleo & Gás', en: 'Oil & Gas' },
  offshore: { pt: 'Offshore', en: 'Offshore' },
  energia: { pt: 'Energia', en: 'Energy' },
  infraestrutura: { pt: 'Infraestrutura', en: 'Infrastructure' },
  mineracao: { pt: 'Mineração', en: 'Mining' },
  industria: { pt: 'Indústria', en: 'Industry' },
  tecnologia: { pt: 'Tecnologia', en: 'Technology' },
};

export interface Noticia {
  id: number;
  slug: string;
  titulo_pt: string;
  titulo_en: string;
  resumo_pt: string;
  resumo_en: string;
  conteudo_pt: string;
  conteudo_en: string;
  segmento: SegmentoNoticia;
  data_publicacao: string;
}

export function tituloNoticia(n: Noticia, idioma: 'pt' | 'en') {
  return idioma === 'en' ? n.titulo_en : n.titulo_pt;
}

export function resumoNoticia(n: Noticia, idioma: 'pt' | 'en') {
  return idioma === 'en' ? n.resumo_en : n.resumo_pt;
}

export function conteudoNoticia(n: Noticia, idioma: 'pt' | 'en') {
  return idioma === 'en' ? n.conteudo_en : n.conteudo_pt;
}

export function paragrafos(texto: string | null | undefined): string[] {
  return (texto || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatarDataNoticia(iso: string, idioma: 'pt' | 'en'): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(idioma === 'en' ? 'en-US' : 'pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
