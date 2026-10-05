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
  versoes: Partial<Record<number, LazyExoticComponent<ComponentType<ModeloPaginaProps>>>>;
}

// Mantido em sincronia com MODELOS de backend/app/services/proposta_modelos.py
export const MODELOS: Record<ModeloId, ModeloRegistro> = {
  'executive-search': {
    nome: 'Executive Search',
    disponivel: true,
    versoes: {
      1: lazy(() => import('./executive-search/v1/ExecutiveSearchV1')),
    },
  },
};

export function modelosDisponiveis(): { id: ModeloId; nome: string }[] {
  return (Object.keys(MODELOS) as ModeloId[])
    .filter((id) => MODELOS[id].disponivel)
    .map((id) => ({ id, nome: MODELOS[id].nome }));
}

export function componenteDoModelo(
  modelo: string | undefined,
  versao: number | undefined,
): LazyExoticComponent<ComponentType<ModeloPaginaProps>> | undefined {
  if (!modelo || versao === undefined || !(modelo in MODELOS)) return undefined;
  return MODELOS[modelo as ModeloId].versoes[versao];
}
