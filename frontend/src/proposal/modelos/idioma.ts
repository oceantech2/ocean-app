import type { Idioma, Moeda } from '../services/proposalApi';

export function idiomaDaMoeda(moeda?: Moeda | null): Idioma {
  return moeda === 'USD' ? 'en-US' : 'pt-BR';
}

export const PREFIXO_MOEDA: Record<Moeda, string> = { BRL: 'R$', USD: 'US$' };

export const MOEDAS_FORM: { moeda: Moeda; rotulo: string }[] = [
  { moeda: 'BRL', rotulo: 'Real (R$) — apresentação em português' },
  { moeda: 'USD', rotulo: 'Dólar (US$) — apresentação em inglês' },
];

export function rotuloMoedaCurto(moeda: Moeda): string {
  return moeda === 'USD' ? 'Dólar · inglês' : 'Real · português';
}

export function rotuloMoedaDetalhe(moeda: Moeda): string {
  return moeda === 'USD' ? 'Dólar (inglês)' : 'Real (português)';
}
