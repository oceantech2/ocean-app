import type { Idioma, Investimento, Projeto } from '../services/proposalApi';

// Mantidos em sincronia com TEXTOS_PADRAO_GARANTIAS e MAX_PROJETOS de backend/app/services/proposta_modelos.py
export const TEXTOS_PADRAO_GARANTIAS: Record<Idioma, { shortlist: string; sla: string }> = {
  'pt-BR': { shortlist: '3 a 5 candidatos', sla: '5 a 10 dias úteis' },
  'en-US': { shortlist: '3 to 5 candidates', sla: '5 to 10 business days' },
};

export const LIMITE_PROJETOS = 10;
export const VALIDADE_DIAS_MAX = 365;

interface DadosFormato {
  projetos?: Projeto[] | null;
  projeto_nome?: string | null;
  investimentos?: Investimento[] | null;
  garantia?: string | null;
  garantia_meses?: number | null;
}

/** Formato novo: a lista de projetos; formato antigo (ES v1/v2): o projeto único. */
export function projetosDaProposta(p: DadosFormato): Projeto[] {
  if (p.projetos) return p.projetos;
  if (p.projeto_nome === null || p.projeto_nome === undefined) return [];
  return [{ nome: p.projeto_nome, investimentos: p.investimentos ?? [] }];
}

export function formatoNovo(p: DadosFormato): boolean {
  return Array.isArray(p.projetos);
}

export function mesesPorExtenso(meses: number, idioma: Idioma = 'pt-BR'): string {
  if (idioma === 'en-US') return meses === 1 ? '1 month' : `${meses} months`;
  return meses === 1 ? '1 mês' : `${meses} meses`;
}

/** Texto da Garantia: livre no formato novo, meses no antigo; null quando não há. */
export function garantiaDaProposta(p: DadosFormato, idioma: Idioma = 'pt-BR'): string | null {
  if (formatoNovo(p)) return p.garantia || null;
  return p.garantia_meses ? mesesPorExtenso(p.garantia_meses, idioma) : null;
}

export function resumoProjetos(nomePrimeiro: string | null | undefined, total: number): string {
  if (!nomePrimeiro) return '—';
  return total > 1 ? `${nomePrimeiro} + ${total - 1}` : nomePrimeiro;
}
