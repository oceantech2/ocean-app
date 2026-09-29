export function normalizarCNPJ(cnpj: string): string {
  return cnpj.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14);
}

export function validarCNPJ(cnpj: string): boolean {
  const c = normalizarCNPJ(cnpj);
  if (c.length !== 14 || /^([0-9A-Z])\1{13}$/.test(c)) return false;
  if (!/[0-9]{2}$/.test(c)) return false;
  const valor = (ch: string) => ch.charCodeAt(0) - 48;
  const dv = (corpo: string, pesos: number[]) => {
    const soma = pesos.reduce((s, p, i) => s + valor(corpo[i]) * p, 0);
    const d = 11 - (soma % 11);
    return d >= 10 ? 0 : d;
  };
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return dv(c.slice(0, 12), pesos1) === parseInt(c[12], 10) && dv(c.slice(0, 13), pesos2) === parseInt(c[13], 10);
}

export function formatarCNPJ(cnpj: string): string {
  const c = normalizarCNPJ(cnpj);
  if (c.length <= 2) return c;
  if (c.length <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
  if (c.length <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
  if (c.length <= 12) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8)}`;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}
