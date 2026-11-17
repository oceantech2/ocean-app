import { urlSite } from '../dominios';
import type { Noticia, SegmentoNoticia } from '../services/proposalApi';

export const SEGMENTOS_NOTICIA: Record<SegmentoNoticia, string> = {
  'oil-gas': 'Petróleo & Gás',
  offshore: 'Offshore',
  energia: 'Energia',
  infraestrutura: 'Infraestrutura',
  mineracao: 'Mineração',
  industria: 'Indústria',
  tecnologia: 'Tecnologia',
};

export function linkNoticiaNoSite(n: Pick<Noticia, 'id' | 'slug'>): string {
  return `${urlSite()}/noticias/${n.slug}-${n.id}`;
}

export function formatarDataPublicacao(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}
