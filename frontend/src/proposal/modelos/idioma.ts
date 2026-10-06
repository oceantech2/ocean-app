import type { Idioma, Moeda } from '../services/proposalApi';

export function idiomaDaMoeda(moeda?: Moeda | null): Idioma {
  return moeda === 'USD' ? 'en-US' : 'pt-BR';
}

// Propostas anteriores à 083 não têm idioma gravado: valia a regra da moeda
export function idiomaDaProposta(dados: { idioma?: Idioma | null; moeda?: Moeda | null }): Idioma {
  return dados.idioma ?? idiomaDaMoeda(dados.moeda);
}

export const PREFIXO_MOEDA: Record<Moeda, string> = { BRL: 'R$', USD: 'US$' };

export const IDIOMAS_FORM: { idioma: Idioma; rotulo: string }[] = [
  { idioma: 'pt-BR', rotulo: 'Português' },
  { idioma: 'en-US', rotulo: 'Inglês' },
];

export const MOEDAS_FORM: { moeda: Moeda; rotulo: string }[] = [
  { moeda: 'BRL', rotulo: 'Real (R$)' },
  { moeda: 'USD', rotulo: 'Dólar (US$)' },
];

export function rotuloIdioma(idioma: Idioma): string {
  return idioma === 'en-US' ? 'Inglês' : 'Português';
}

export function rotuloMoeda(moeda: Moeda): string {
  return moeda === 'USD' ? 'Dólar' : 'Real';
}

export function rotuloIdiomaMoeda(dados: { idioma?: Idioma | null; moeda?: Moeda | null }): string {
  return `${rotuloIdioma(idiomaDaProposta(dados))} · ${rotuloMoeda(dados.moeda ?? 'BRL')}`;
}
