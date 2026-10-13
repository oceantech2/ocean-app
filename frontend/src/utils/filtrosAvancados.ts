export type IntervaloData = { campo: string; de: string; ate: string };
export type IntervaloValor = { min: string; max: string };

export const INTERVALO_VALOR_VAZIO: IntervaloValor = { min: '', max: '' };

/** Data ISO (yyyy-mm-dd) local; timestamps são convertidos para o dia local. */
function diaLocal(valor: string): string {
  if (valor.length <= 10) return valor;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return valor.slice(0, 10);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Sem limites: passa tudo. Com limite: registro sem a data fica de fora. */
export function dentroDoIntervaloData(valor: string | null | undefined, de: string, ate: string): boolean {
  if (!de && !ate) return true;
  if (!valor) return false;
  const dia = diaLocal(valor);
  if (de && dia < de) return false;
  if (ate && dia > ate) return false;
  return true;
}

export function dentroDoIntervaloValor(valor: number | null | undefined, { min, max }: IntervaloValor): boolean {
  const v = Number(valor) || 0;
  if (min !== '' && v < Number(min)) return false;
  if (max !== '' && v > Number(max)) return false;
  return true;
}

export function intervaloDataAtivo(i: IntervaloData): boolean {
  return !!(i.de || i.ate);
}

export function intervaloValorAtivo(i: IntervaloValor): boolean {
  return i.min !== '' || i.max !== '';
}

/** Valor de filtro para registros sem o campo preenchido. */
export const SEM_VALOR = '__sem__';

/** Opções de select a partir dos valores presentes nos dados; vazio vira `SEM_VALOR`. */
export function opcoesDistintas(
  valores: (string | null | undefined)[],
  rotulo: (v: string) => string,
  rotuloVazio = 'Não informada',
): { valor: string; rotulo: string }[] {
  return [...new Set(valores.map((v) => v || SEM_VALOR))]
    .map((v) => ({ valor: v, rotulo: v === SEM_VALOR ? rotuloVazio : rotulo(v) }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
}

const dataBR = (iso: string) => iso.split('-').reverse().join('/');
export const moedaBR = (v: string) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function descreverIntervalo(de: string, ate: string, fmt: (v: string) => string = dataBR): string {
  if (de && ate) return `${fmt(de)} a ${fmt(ate)}`;
  if (de) return `a partir de ${fmt(de)}`;
  return `até ${fmt(ate)}`;
}
