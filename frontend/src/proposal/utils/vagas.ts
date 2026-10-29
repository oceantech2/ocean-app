import { urlSite } from '../dominios';
import type { AreaVaga, NivelVaga, Vaga } from '../services/proposalApi';

export const AREAS_VAGA: Record<AreaVaga, string> = {
  financas: 'Finanças',
  tecnologia: 'Tecnologia',
  comercial: 'Comercial',
  rh: 'Recursos Humanos',
  operacoes: 'Operações',
};

export const NIVEIS_VAGA: Record<NivelVaga, string> = {
  gerencia: 'Gerência',
  diretoria: 'Diretoria',
  vp: 'VP',
  'c-level': 'C-Level',
};

export const INGLES: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  fluente: 'Fluente',
  nativo: 'Nativo',
};

export const DISPONIBILIDADE: Record<string, string> = {
  imediata: 'Imediata',
  '15-dias': '15 dias',
  '30-dias': '30 dias',
  'mais-30-dias': 'Mais de 30 dias',
};

export const MOBILIDADE: Record<string, string> = { sim: 'Sim', nao: 'Não', 'a-combinar': 'A combinar' };

export function linkVagaNoSite(vaga: Pick<Vaga, 'id' | 'slug'>): string {
  return `${urlSite()}/vagas/${vaga.slug}-${vaga.id}`;
}

export function itensDaLista(texto: string | null | undefined): string[] {
  return (texto ?? '')
    .split('\n')
    .map((linha) => linha.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
}

export function formatarReais(valor: string): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
