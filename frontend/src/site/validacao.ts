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

export function tamanhoEntre(v: string, min: number, max: number) {
  return v.length >= min && v.length <= max;
}
