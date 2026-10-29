import type { Vaga } from './dados/vagas';

const API = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8001/api';

export class ErroApi extends Error {
  constructor(
    public status: number,
    public detalhe: unknown,
  ) {
    super(typeof detalhe === 'string' ? detalhe : `HTTP ${status}`);
  }
}

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API}${caminho}`, init);
  } catch {
    throw new ErroApi(0, null);
  }
  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new ErroApi(resposta.status, corpo?.detail ?? null);
  return corpo as T;
}

export function listarVagas() {
  return requisitar<Vaga[]>('/public/vagas/');
}

export function obterVaga(id: number) {
  return requisitar<Vaga>(`/public/vagas/${id}`);
}

export function enviarCandidatura(vagaId: number, dados: FormData) {
  return requisitar<{ ok: true }>(`/public/vagas/${vagaId}/candidaturas`, { method: 'POST', body: dados });
}
