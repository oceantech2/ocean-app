import type { Txt } from '../idioma';

export type Area = 'financas' | 'tecnologia' | 'comercial' | 'rh' | 'operacoes';
export type Nivel = 'gerencia' | 'diretoria' | 'vp' | 'c-level';

export const AREAS: Record<Area, Txt> = {
  financas: { pt: 'Finanças', en: 'Finance' },
  tecnologia: { pt: 'Tecnologia', en: 'Technology' },
  comercial: { pt: 'Comercial', en: 'Commercial' },
  rh: { pt: 'Recursos Humanos', en: 'Human Resources' },
  operacoes: { pt: 'Operações', en: 'Operations' },
};

export const NIVEIS: Record<Nivel, Txt> = {
  gerencia: { pt: 'Gerência', en: 'Manager' },
  diretoria: { pt: 'Diretoria', en: 'Director' },
  vp: { pt: 'VP', en: 'VP' },
  'c-level': { pt: 'C-Level', en: 'C-Level' },
};

export const INGLES: Record<string, Txt> = {
  basico: { pt: 'Básico', en: 'Basic' },
  intermediario: { pt: 'Intermediário', en: 'Intermediate' },
  avancado: { pt: 'Avançado', en: 'Advanced' },
  fluente: { pt: 'Fluente', en: 'Fluent' },
  nativo: { pt: 'Nativo', en: 'Native' },
};

export const DISPONIBILIDADE: Record<string, Txt> = {
  imediata: { pt: 'Imediata', en: 'Immediate' },
  '15-dias': { pt: '15 dias', en: '15 days' },
  '30-dias': { pt: '30 dias', en: '30 days' },
  'mais-30-dias': { pt: 'Mais de 30 dias', en: 'More than 30 days' },
};

export const MOBILIDADE: Record<string, Txt> = {
  sim: { pt: 'Sim', en: 'Yes' },
  nao: { pt: 'Não', en: 'No' },
  'a-combinar': { pt: 'A combinar', en: 'Negotiable' },
};

/** Vaga aberta como vem da API pública; o conteúdo é exibido como o consultor cadastrou. */
export interface Vaga {
  id: number;
  slug: string;
  titulo: string;
  area: Area;
  nivel: Nivel;
  localidade: string;
  resumo: string;
  descricao: string | null;
  responsabilidades: string | null;
  requisitos: string;
  diferenciais: string | null;
  criado_em: string | null;
}

/** Uma linha por item; marcadores digitados no começo da linha são removidos. */
export function itensDaLista(texto: string | null | undefined): string[] {
  return (texto ?? '')
    .split('\n')
    .map((linha) => linha.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
}

export function paragrafos(texto: string | null | undefined): string[] {
  return (texto ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
