import type { StatusProposta } from '../services/proposalApi';

const TZ_SP = 'America/Sao_Paulo';
export const DIAS_VALIDADE_PADRAO = 30;

export function parseNumeroBR(texto: string, casas: number): number | null {
  let t = texto.trim().replace(/\s|R\$|%/g, '');
  if (!t) return null;
  if (t.includes(',')) {
    t = t.replace(/\./g, '').replace(',', '.');
  } else {
    const partes = t.split('.');
    if (!(partes.length === 2 && partes[1].length > 0 && partes[1].length <= casas)) {
      t = t.replace(/\./g, '');
    }
  }
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const [inteiro, fracao = ''] = t.split('.');
  if (fracao.length > casas) return null;
  return Number(inteiro) * 10 ** casas + Number(fracao.padEnd(casas, '0') || '0');
}

export const parseMoedaCentavos = (texto: string) => parseNumeroBR(texto, 2);
export const parseAliquotaCentesimos = (texto: string) => parseNumeroBR(texto, 2);

export function calcularImpostoCentavos(valorCentavos: number, aliquotaCentesimos: number): number {
  const produto = BigInt(valorCentavos) * BigInt(aliquotaCentesimos);
  return Number((produto + BigInt(5000)) / BigInt(10000));
}

export function centavosParaDecimal(centavos: number): string {
  return `${Math.floor(centavos / 100)}.${String(centavos % 100).padStart(2, '0')}`;
}

const fmtMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarMoeda(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') return '—';
  return fmtMoeda.format(Number(valor));
}

export const formatarMoedaCentavos = (centavos: number) => fmtMoeda.format(centavos / 100);

export function formatarAliquota(aliquota: string | null | undefined): string {
  if (!aliquota) return '';
  return `${Number(aliquota).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
}

export function hojeSP(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ_SP }).format(new Date());
}

export function somarDias(isoData: string, dias: number): string {
  const [a, m, d] = isoData.split('-').map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d + dias));
  return dt.toISOString().slice(0, 10);
}

export const validadePadrao = () => somarDias(hojeSP(), DIAS_VALIDADE_PADRAO);

export function formatarData(isoData: string | null | undefined): string {
  if (!isoData) return '—';
  if (isoData.includes('T')) {
    return new Date(isoData).toLocaleDateString('pt-BR', { timeZone: TZ_SP });
  }
  const [a, m, d] = isoData.split('-');
  return `${d}/${m}/${a}`;
}

export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: TZ_SP,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function montarLinkPublico(codigo: string): string {
  const base = (import.meta.env.VITE_PROPOSAL_PUBLIC_URL || window.location.origin).replace(/\/+$/, '');
  return `${base}/p/${codigo}`;
}

export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  }
}

export const STATUS_LABEL: Record<StatusProposta, string> = {
  aguardando: 'Aguardando assinatura',
  visualizada: 'Visualizada',
  assinada: 'Assinada',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
};

export const STATUS_BADGE: Record<StatusProposta, string> = {
  aguardando: 'bg-amber-100 text-amber-800',
  visualizada: 'bg-blue-100 text-blue-800',
  assinada: 'bg-green-100 text-green-800',
  cancelada: 'bg-gray-200 text-gray-700',
  expirada: 'bg-red-100 text-red-800',
};
