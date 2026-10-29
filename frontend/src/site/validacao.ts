const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(v: string) {
  return EMAIL.test(v) && v.length <= 180;
}

export function urlValida(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Aceita formatos pt e en ("15.000,50", "15,000.50", "R$ 15.000"): o último separador só é decimal
 * quando seguido de 1 ou 2 dígitos; os demais separam milhares. null se não houver número.
 */
export function valorMonetario(texto: string): number | null {
  const limpo = texto.replace(/[^\d.,]/g, '');
  const decimal = limpo.match(/[.,](\d{1,2})$/);
  const inteiro = (decimal ? limpo.slice(0, decimal.index) : limpo).replace(/[.,]/g, '');
  if (!inteiro) return null;
  return Number(decimal ? `${inteiro}.${decimal[1]}` : inteiro);
}

export function tamanhoEntre(v: string, min: number, max: number) {
  return v.length >= min && v.length <= max;
}
