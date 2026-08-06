/**
 * Extrai uma mensagem legível de erros axios/Pydantic.
 * Pydantic retorna detail como array: [{loc, msg, type}]
 * FastAPI retorna detail como string ou objeto (ex.: NF_NUMERO_DUPLICADO).
 */
export type DetailObjeto = {
  code?: string;
  message?: string;
  nf_id?: number | null;
  numero?: string;
  razao_social?: string | null;
  conflitos?: Array<{ linha?: number; numero?: string; nf_id?: number }>;
};

export function detalheErro(e: any): DetailObjeto | string | any[] | null {
  return e?.response?.data?.detail ?? null;
}

export function detalheObjeto(e: any): DetailObjeto | null {
  const detail = detalheErro(e);
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    return detail as DetailObjeto;
  }
  return null;
}

export function mensagemErro(e: any, fallback = 'Erro ao salvar'): string {
  const detail = detalheErro(e);
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

  // Objeto estruturado (409/422 de duplicidade / import)
  if (typeof detail === 'object' && detail.message) return String(detail.message);

  return fallback;
}
