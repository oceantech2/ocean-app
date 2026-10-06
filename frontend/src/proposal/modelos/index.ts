import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { ModeloId, PropostaPublicaData } from '../services/proposalApi';

export interface ModeloPaginaProps {
  dados: PropostaPublicaData;
  codigo: string;
  onRecarregar: () => void;
}

interface ModeloRegistro {
  nome: string;
  disponivel: boolean;
  // Rótulos usados no Proposal interno; a página do cliente tem os seus em conteudo/{idioma}.ts
  rotuloEscopo: string;
  garantiasSempreVisivel: boolean;
  versoes: Partial<Record<number, LazyExoticComponent<ComponentType<ModeloPaginaProps>>>>;
}

// v1 a v3 compartilham o componente; as diferenças ficam em executive-search/v1/versoes.ts
const paginaExecutiveSearch = lazy(() => import('./executive-search/v1/ExecutiveSearchV1'));
const paginaOutplacementDevelopment = lazy(
  () => import('./outplacement-development/v1/OutplacementDevelopmentV1'),
);

// Mantido em sincronia com MODELOS de backend/app/services/proposta_modelos.py
export const MODELOS: Record<ModeloId, ModeloRegistro> = {
  'executive-search': {
    nome: 'Executive Search',
    disponivel: true,
    rotuloEscopo: 'Escopo do Projeto',
    garantiasSempreVisivel: true,
    versoes: {
      1: paginaExecutiveSearch,
      2: paginaExecutiveSearch,
      3: paginaExecutiveSearch,
    },
  },
  'outplacement-development': {
    nome: 'Development & Outplacement',
    disponivel: true,
    rotuloEscopo: 'Escopo',
    garantiasSempreVisivel: false,
    versoes: {
      1: paginaOutplacementDevelopment,
    },
  },
};

export function modelosDisponiveis(): { id: ModeloId; nome: string }[] {
  return (Object.keys(MODELOS) as ModeloId[])
    .filter((id) => MODELOS[id].disponivel)
    .map((id) => ({ id, nome: MODELOS[id].nome }));
}

export function registroDoModelo(modelo: string | undefined): ModeloRegistro {
  return MODELOS[(modelo && modelo in MODELOS ? modelo : 'executive-search') as ModeloId];
}

export function componenteDoModelo(
  modelo: string | undefined,
  versao: number | undefined,
): LazyExoticComponent<ComponentType<ModeloPaginaProps>> | undefined {
  if (!modelo || versao === undefined || !(modelo in MODELOS)) return undefined;
  return MODELOS[modelo as ModeloId].versoes[versao];
}
