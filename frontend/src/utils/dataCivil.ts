/** Datas civis YYYY-MM-DD (sem comparar Date com o relógio atual). */

export function hojeISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dataISO(data?: string | null): string | null {
  if (data == null) return null;
  const s = String(data).trim();
  if (!s) return null;
  return s.slice(0, 10);
}

export function adicionarDiasISO(iso: string, dias: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + dias);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** -1: antes de hoje; 0: hoje; 1: depois; null: sem data. */
export function compararVencimento(data: string | null | undefined, hoje: string): -1 | 0 | 1 | null {
  const iso = dataISO(data);
  if (!iso) return null;
  if (iso < hoje) return -1;
  if (iso === hoje) return 0;
  return 1;
}

/** Não paga, depois de hoje e antes de hoje+7 (D+1 … D+6). Disjunto de “vence hoje” e de vencidas. */
export function venceEmMenosDe7Dias(data: string | null | undefined, hoje: string): boolean {
  const iso = dataISO(data);
  if (!iso) return false;
  const limite = adicionarDiasISO(hoje, 7);
  return iso > hoje && iso < limite;
}
