import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const TOKEN_KEY = 'proposal_access_token';
export const USUARIO_KEY = 'proposal_usuario';
export const PAPEL_KEY = 'proposal_papel';

export type StatusProposta = 'aguardando' | 'visualizada' | 'assinada' | 'cancelada' | 'expirada';

export interface PropostaListItem {
  id: number;
  codigo: string;
  cliente_nome: string;
  cnpj: string;
  total: string;
  emitida_em: string;
  validade: string;
  status: StatusProposta;
  criado_por_usuario: string | null;
}

export interface PropostaAssinatura {
  nome: string;
  email: string;
  assinada_em: string;
  ip: string;
  user_agent: string | null;
  conteudo_hash: string;
}

export interface Proposta extends PropostaListItem {
  valor: string;
  imposto_ativo: boolean;
  aliquota: string | null;
  valor_imposto: string | null;
  visualizada_em: string | null;
  cancelada_em: string | null;
  assinatura: PropostaAssinatura | null;
}

export interface PropostaListResponse {
  items: PropostaListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface PropostaPayload {
  cliente_nome: string;
  cnpj: string;
  valor: string;
  imposto_ativo: boolean;
  aliquota: string | null;
  validade: string | null;
}

export interface PropostaPublicaData {
  status: StatusProposta;
  pode_assinar: boolean;
  mensagem?: string;
  cliente_nome?: string;
  cnpj?: string;
  valor?: string;
  imposto_ativo?: boolean;
  aliquota?: string | null;
  valor_imposto?: string | null;
  total?: string;
  emitida_em?: string;
  validade?: string;
  assinatura?: { nome: string; assinada_em: string };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: string;
  papel: string;
}

const proposalHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

proposalHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

proposalHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const semAcesso = status === 403 && detail === 'Usuário sem acesso ao Proposal';
    const isLogin = String(error.config?.url || '').includes('/proposal/auth/token');
    if ((status === 401 || semAcesso) && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      localStorage.removeItem(PAPEL_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

const publicHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function login(username: string, password: string, totpCode?: string): Promise<LoginResponse> {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  if (totpCode) form.append('totp_code', totpCode);
  const { data } = await proposalHttp.post<LoginResponse>('/proposal/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
}

export async function criarProposta(payload: PropostaPayload): Promise<Proposta> {
  const { data } = await proposalHttp.post<Proposta>('/proposal/propostas/', payload);
  return data;
}

export async function obterProposta(id: number | string): Promise<Proposta> {
  const { data } = await proposalHttp.get<Proposta>(`/proposal/propostas/${id}`);
  return data;
}

export async function listarPropostas(params: { status?: StatusProposta | ''; page?: number } = {}): Promise<PropostaListResponse> {
  const { data } = await proposalHttp.get<PropostaListResponse>('/proposal/propostas/', {
    params: { status: params.status || undefined, page: params.page || 1 },
  });
  return data;
}

export async function cancelarProposta(id: number | string): Promise<Proposta> {
  const { data } = await proposalHttp.post<Proposta>(`/proposal/propostas/${id}/cancelar`);
  return data;
}

export async function consultarPublica(codigo: string): Promise<PropostaPublicaData> {
  const { data } = await publicHttp.get<PropostaPublicaData>(`/public/propostas/${encodeURIComponent(codigo)}`);
  return data;
}

export async function assinarPublica(
  codigo: string,
  payload: { nome: string; email: string; aceite: boolean },
): Promise<PropostaPublicaData> {
  const { data } = await publicHttp.post<PropostaPublicaData>(
    `/public/propostas/${encodeURIComponent(codigo)}/assinar`,
    payload,
  );
  return data;
}

export function mensagemErro(error: unknown, padrao: string): string {
  const err = error as { response?: { data?: { detail?: unknown } } };
  if (!err?.response) return 'Não foi possível conectar. Tente novamente.';
  const detail = err.response.data?.detail;
  return typeof detail === 'string' && detail ? detail : padrao;
}
