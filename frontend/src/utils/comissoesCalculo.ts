/** Preview: (percentual/100) × valor_liquido da conta a receber */
export function calcularValorComissao(percentual: number, valorLiquido: number): number {
  const liquido = Math.max(Number(valorLiquido) || 0, 0);
  const pct = Number(percentual) || 0;
  return Math.round((pct / 100) * liquido * 100) / 100;
}

export function formatarValorComissao(percentual: number, valorLiquido: number): string {
  return calcularValorComissao(percentual, valorLiquido).toFixed(2);
}
