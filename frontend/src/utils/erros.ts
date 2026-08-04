/**
 * Extrai uma mensagem legível de erros axios/Pydantic.
 * Pydantic retorna detail como array: [{loc, msg, type}]
 * FastAPI retorna detail como string em alguns casos.
 */
export function mensagemErro(e: any, fallback = 'Erro ao salvar'): string {
  const detail = e?.response?.data?.detail;
  if (!detail) return fallback;

  // Pydantic 422: detail é um array de objetos
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => {
        const campo = Array.isArray(d.loc) ? d.loc.filter((l: any) => l !== 'body').join('.') : '';
        return campo ? `${campo}: ${d.msg}` : d.msg;
      })
      .join(' | ');
  }

  // FastAPI padrão: detail é string
  if (typeof detail === 'string') return detail;

  return fallback;
}
