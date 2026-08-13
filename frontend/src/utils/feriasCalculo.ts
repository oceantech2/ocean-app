import type { ResumoFeriasAno } from '../types';

export type ParcelaFerias = {
  id?: number;
  colaborador_id: number;
  ano: number;
  dias_direito: number;
  dias_tirados: number;
  data_inicio?: string | null;
  data_fim?: string | null;
  aprovado?: boolean;
};

export function direitoAnual(parcelas: ParcelaFerias[]): number {
  if (parcelas.length === 0) return 0;
  return Math.max(...parcelas.map((p) => p.dias_direito || 0));
}

export function totalTirado(parcelas: ParcelaFerias[]): number {
  return parcelas.reduce((s, p) => s + (p.dias_tirados || 0), 0);
}

export function saldoAnual(parcelas: ParcelaFerias[]): number {
  return direitoAnual(parcelas) - totalTirado(parcelas);
}

export function agruparResumos(parcelas: ParcelaFerias[]): ResumoFeriasAno[] {
  const grupos = new Map<string, ParcelaFerias[]>();
  parcelas.forEach((p) => {
    const k = `${p.colaborador_id}:${p.ano}`;
    const cur = grupos.get(k) ?? [];
    cur.push(p);
    grupos.set(k, cur);
  });
  return Array.from(grupos.values()).map((grupo) => {
    const first = grupo[0];
    return {
      colaborador_id: first.colaborador_id,
      ano: first.ano,
      direito_anual: direitoAnual(grupo),
      total_tirado: totalTirado(grupo),
      saldo_anual: saldoAnual(grupo),
      tem_pendencia: grupo.some((p) => p.aprovado === false),
    };
  });
}

export function parseDateLocal(s: string): Date {
  return new Date(s + 'T00:00:00');
}

export function intervaloInvertido(inicio?: string | null, fim?: string | null): boolean {
  if (!inicio || !fim) return false;
  return parseDateLocal(fim) < parseDateLocal(inicio);
}

/** Dias corridos inclusivos; 0 se faltar data ou intervalo invertido. */
export function diasCorridos(inicio?: string | null, fim?: string | null): number {
  if (!inicio || !fim) return 0;
  if (intervaloInvertido(inicio, fim)) return 0;
  const d =
    Math.round(
      (parseDateLocal(fim).getTime() - parseDateLocal(inicio).getTime()) / 86400000
    ) + 1;
  return d > 0 ? d : 0;
}

export function intervalosSobrepoem(
  aInicio?: string | null,
  aFim?: string | null,
  bInicio?: string | null,
  bFim?: string | null,
): boolean {
  if (!aInicio || !aFim || !bInicio || !bFim) return false;
  return parseDateLocal(aInicio) <= parseDateLocal(bFim) && parseDateLocal(bInicio) <= parseDateLocal(aFim);
}

export function saldoDisponivelForm(opts: {
  periodos: ParcelaFerias[];
  colaboradorId: number;
  ano: number;
  editandoId?: number | null;
  diasDireitoForm: number;
}): { ehBase: boolean; direito: number; totalTiradoOutros: number; disponivel: number } {
  const outros = opts.periodos.filter(
    (p) =>
      p.colaborador_id === opts.colaboradorId &&
      p.ano === opts.ano &&
      p.id !== opts.editandoId,
  );
  const ehBase = outros.length === 0 && !opts.editandoId;
  const maxOutros = outros.length ? direitoAnual(outros) : 0;
  const totalTiradoOutros = totalTirado(outros);
  const direito = ehBase
    ? opts.diasDireitoForm
    : opts.editandoId
      ? Math.max(maxOutros, opts.diasDireitoForm)
      : maxOutros;
  return {
    ehBase,
    direito,
    totalTiradoOutros,
    disponivel: direito - totalTiradoOutros,
  };
}

export function temSobreposicaoComOutros(
  periodos: ParcelaFerias[],
  colaboradorId: number,
  ano: number,
  inicio: string,
  fim: string,
  editandoId?: number | null,
): boolean {
  if (!inicio || !fim || intervaloInvertido(inicio, fim)) return false;
  return periodos.some(
    (p) =>
      p.colaborador_id === colaboradorId &&
      p.ano === ano &&
      p.id !== editandoId &&
      intervalosSobrepoem(inicio, fim, p.data_inicio, p.data_fim),
  );
}

export function pendenciasUnicas(parcelas: ParcelaFerias[]): ParcelaFerias[] {
  const seen = new Set<string>();
  return parcelas.filter((p) => {
    if (p.aprovado !== false) return false;
    const k = `${p.colaborador_id}:${p.ano}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
