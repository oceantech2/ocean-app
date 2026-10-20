import type { Idioma, Investimento, Moeda } from '../services/proposalApi';
import { mesesPorExtenso } from './formatoProposta';
import { PREFIXO_MOEDA } from './idioma';

const TZ_SP = 'America/Sao_Paulo';
const DATA_POR_EXTENSO: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };

interface OpcoesTaxa {
  idioma?: Idioma;
  moeda?: Moeda;
}

export function formatarTaxa(
  inv: Pick<Investimento, 'taxa_tipo' | 'taxa'>,
  { idioma = 'pt-BR', moeda = 'BRL' }: OpcoesTaxa = {},
): string {
  const taxa = Number(inv.taxa);
  if (!Number.isFinite(taxa)) return '—';
  if (inv.taxa_tipo === 'percentual') {
    return `${new Intl.NumberFormat(idioma, { maximumFractionDigits: 2 }).format(taxa)}%`;
  }
  const casas = Number.isInteger(taxa) ? 0 : 2;
  const numero = new Intl.NumberFormat(idioma, { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(taxa);
  return `${PREFIXO_MOEDA[moeda]} ${numero}`;
}

// Texto fixo das propostas emitidas antes do imposto mensal (imposto_percentual nulo)
export const IMPOSTO_LEGADO = '19.55';

export function formatarPercentual(valor: string | null | undefined, idioma: Idioma = 'pt-BR'): string {
  const numero = Number(valor ?? IMPOSTO_LEGADO);
  return new Intl.NumberFormat(idioma, { maximumFractionDigits: 2 }).format(numero);
}

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const formatarMesAno = (mes: number, ano: number) => `${MESES_ABREV[mes - 1]}/${ano}`;

export function formatarPagamento(entrada: number | null | undefined): string {
  if (!entrada) return '100% após conclusão';
  if (entrada >= 100) return '100% antecipado';
  return `${entrada}% de entrada + ${100 - entrada}% após conclusão`;
}

export function formatarGarantia(meses: number | null | undefined): string {
  if (!meses) return '—';
  return mesesPorExtenso(meses);
}

export function formatarDataISO(isoData: string | null | undefined, idioma: Idioma = 'pt-BR'): string {
  if (!isoData) return '—';
  const dia = isoData.slice(0, 10);
  if (idioma === 'en-US') {
    return new Date(`${dia}T00:00:00Z`).toLocaleDateString('en-US', { ...DATA_POR_EXTENSO, timeZone: 'UTC' });
  }
  const [a, m, d] = dia.split('-');
  return `${d}/${m}/${a}`;
}

export function formatarDataSP(iso: string | null | undefined, idioma: Idioma = 'pt-BR'): string {
  if (!iso) return '—';
  const opcoes = idioma === 'en-US' ? DATA_POR_EXTENSO : {};
  return new Date(iso).toLocaleDateString(idioma, { ...opcoes, timeZone: TZ_SP });
}

export function dataHoraSP(iso: string, idioma: Idioma = 'pt-BR'): { data: string; hora: string } {
  const dt = new Date(iso);
  const hora: Intl.DateTimeFormatOptions =
    idioma === 'en-US' ? { hour: 'numeric', minute: '2-digit' } : { hour: '2-digit', minute: '2-digit' };
  return {
    data: formatarDataSP(iso, idioma),
    hora: dt.toLocaleTimeString(idioma, { ...hora, timeZone: TZ_SP }),
  };
}

export function digitosTelefone(telefone: string | null | undefined): string {
  return (telefone || '').replace(/\D/g, '');
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function telefoneValido(telefone: string): boolean {
  const n = digitosTelefone(telefone).length;
  return n >= 10 && n <= 13;
}
