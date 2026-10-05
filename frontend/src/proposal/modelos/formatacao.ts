import type { Investimento } from '../services/proposalApi';

const fmtPercentual = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const fmtInteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const fmtCentavos = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatarTaxa(inv: Pick<Investimento, 'taxa_tipo' | 'taxa'>): string {
  const taxa = Number(inv.taxa);
  if (!Number.isFinite(taxa)) return '—';
  if (inv.taxa_tipo === 'percentual') return `${fmtPercentual.format(taxa)}%`;
  return Number.isInteger(taxa) ? `R$ ${fmtInteiro.format(taxa)}` : `R$ ${fmtCentavos.format(taxa)}`;
}

export function formatarPagamento(entrada: number | null | undefined): string {
  if (!entrada) return '100% após conclusão';
  return `${entrada}% de entrada + ${100 - entrada}% após conclusão`;
}

export function formatarGarantia(meses: number | null | undefined): string {
  if (!meses) return '—';
  return meses === 1 ? '1 mês' : `${meses} meses`;
}

export function formatarDataISO(isoData: string | null | undefined): string {
  if (!isoData) return '—';
  const [a, m, d] = isoData.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export function dataHoraSP(iso: string): { data: string; hora: string } {
  const dt = new Date(iso);
  return {
    data: dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    hora: dt.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }),
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
