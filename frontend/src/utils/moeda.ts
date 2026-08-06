/** Formatação e parse de valores monetários brasileiros (máscara de input). */

/** Converte dígitos digitados em máscara R$ 1.234,56 (centavos a partir da direita). */
export function formatarMoedaInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  if (Number.isNaN(cents)) return '';
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Converte string mascarada (ou numérica) em number; null se inválida. */
export function parseMoedaInput(masked: string): number | null {
  if (!masked || !masked.trim()) return null;
  const cleaned = masked
    .replace(/R\$\s?/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return null;
  return n;
}

/** True se a máscara representa um montante > 0. */
export function isValorMoedaValido(masked: string): boolean {
  const n = parseMoedaInput(masked);
  return n !== null && n > 0;
}

/** Número → máscara para popular o formulário na edição. */
export function numberParaMoedaInput(n: number): string {
  if (n == null || Number.isNaN(n)) return '';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
