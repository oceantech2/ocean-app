import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const TOKEN_KEY = 'proposal_access_token';
export const USUARIO_KEY = 'proposal_usuario';
export const PAPEL_KEY = 'proposal_papel';

export type StatusProposta = 'aguardando' | 'visualizada' | 'assinada' | 'cancelada' | 'expirada';

export type ModeloId = 'executive-search' | 'offshore-talent' | 'outsourcing' | 'outplacement-development';
export type SetorId = 'oil-gas' | 'energia' | 'infraestrutura' | 'mineracao' | 'tecnologia' | 'industria-servicos';
export type TipoInvestimento = 'retainer' | 'sucesso' | 'valor-fechado';
export type TaxaTipo = 'percentual' | 'valor';
export type Moeda = 'BRL' | 'USD';
export type Idioma = 'pt-BR' | 'en-US';

export interface Investimento {
  tipo: TipoInvestimento;
  taxa_tipo: TaxaTipo;
  taxa: string;
  entrada: number | null;
}

export interface Projeto {
  nome: string;
  investimentos: Investimento[];
}

export interface PropostaListItem {
  id: number;
  codigo: string;
  modelo: ModeloId | 'simples';
  modelo_nome: string;
  moeda: Moeda | null;
  idioma: Idioma | null;
  cliente_nome: string;
  // Formato novo: nome do primeiro projeto
  projeto_nome: string | null;
  projetos_total: number;
  data_proposta: string | null;
  cnpj: string | null;
  total: string | null;
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

export interface AlteracaoCampo {
  campo: string;
  anterior: string | number | boolean | Investimento | Projeto | null;
  novo: string | number | boolean | Investimento | Projeto | null;
}

export interface PropostaEdicao {
  versao: number;
  editada_em: string;
  editado_por_usuario: string;
  alteracoes: AlteracaoCampo[];
}

export interface Proposta extends PropostaListItem {
  modelo_versao: number | null;
  setor: SetorId | null;
  consultor_nome: string | null;
  consultor_cargo: string | null;
  consultor_telefone: string | null;
  consultor_email: string | null;
  projeto_escopo: string | null;
  // Formato antigo (Executive Search v1/v2)
  garantia_meses: number | null;
  investimentos: Investimento[] | null;
  // Formato novo
  projetos: Projeto[] | null;
  shortlist: string | null;
  sla: string | null;
  garantia: string | null;
  validade_dias: number | null;
  // Imposto vigente no último salvamento; null = proposta anterior ao imposto mensal (exibe 19,55%)
  imposto_percentual: string | null;
  valor: string | null;
  imposto_ativo: boolean;
  aliquota: string | null;
  valor_imposto: string | null;
  visualizada_em: string | null;
  cancelada_em: string | null;
  assinatura: PropostaAssinatura | null;
  versao: number;
  atualizada_em: string | null;
  versao_visualizada_em: string | null;
  edicoes: PropostaEdicao[];
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

export interface PropostaModeloPayload {
  modelo: ModeloId;
  idioma: Idioma;
  moeda: Moeda;
  cliente_nome: string;
  data_proposta: string;
  setor: SetorId | '';
  consultor_nome: string;
  consultor_cargo: string;
  consultor_telefone: string;
  consultor_email: string;
  projeto_escopo: string | null;
  projetos: Projeto[];
  shortlist: string | null;
  sla: string | null;
  garantia: string | null;
  validade_dias: number;
}

export interface ConsultorPublico {
  nome: string;
  cargo: string;
  telefone: string;
  telefone_digitos: string;
  email: string;
}

export interface PropostaPublicaData {
  status: StatusProposta;
  pode_assinar: boolean;
  mensagem?: string;
  modelo?: ModeloId | 'simples';
  modelo_versao?: number;
  moeda?: Moeda;
  idioma?: Idioma | null;
  data_proposta?: string;
  setor?: SetorId;
  consultor?: ConsultorPublico;
  projeto_nome?: string | null;
  projeto_escopo?: string | null;
  garantia_meses?: number | null;
  investimentos?: Investimento[] | null;
  projetos?: Projeto[] | null;
  shortlist?: string | null;
  sla?: string | null;
  garantia?: string | null;
  imposto_percentual?: string | null;
  cliente_nome?: string;
  cnpj?: string;
  valor?: string;
  imposto_ativo?: boolean;
  aliquota?: string | null;
  valor_imposto?: string | null;
  total?: string;
  emitida_em?: string;
  validade?: string;
  versao?: number;
  atualizada_em?: string | null;
  assinatura?: { nome: string; assinada_em: string } | null;
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

export async function entrarSso(codigo: string): Promise<LoginResponse> {
  const { data } = await publicHttp.post<LoginResponse>('/proposal/auth/sso', { codigo });
  return data;
}

export async function consultarConvite(token: string): Promise<{ usuario: string }> {
  const { data } = await publicHttp.post<{ usuario: string }>('/proposal/auth/convite/consultar', { token });
  return data;
}

export async function aceitarConvite(token: string, senha: string): Promise<LoginResponse> {
  const { data } = await publicHttp.post<LoginResponse>('/proposal/auth/convite/aceitar', { token, senha });
  return data;
}

export async function criarProposta(payload: PropostaModeloPayload): Promise<Proposta> {
  const { data } = await proposalHttp.post<Proposta>('/proposal/propostas/', payload);
  return data;
}

export async function obterProposta(id: number | string): Promise<Proposta> {
  const { data } = await proposalHttp.get<Proposta>(`/proposal/propostas/${id}`);
  return data;
}

export interface FiltrosPropostas {
  status: StatusProposta | '';
  empresa: string;
  modelo: ModeloId | 'simples' | '';
  projeto: string;
  data_de: string;
  data_ate: string;
  criado_por: string;
}

export async function listarPropostas(
  params: Partial<FiltrosPropostas> & { page?: number } = {},
): Promise<PropostaListResponse> {
  const { page, ...filtros } = params;
  const query = Object.fromEntries(
    Object.entries(filtros)
      .map(([chave, valor]) => [chave, typeof valor === 'string' ? valor.trim() : valor])
      .filter(([, valor]) => valor),
  );
  const { data } = await proposalHttp.get<PropostaListResponse>('/proposal/propostas/', {
    params: { ...query, page: page || 1 },
  });
  return data;
}

export async function listarAutores(): Promise<string[]> {
  const { data } = await proposalHttp.get<string[]>('/proposal/propostas/autores');
  return data;
}

export async function excluirProposta(id: number | string): Promise<void> {
  await proposalHttp.delete(`/proposal/propostas/${id}`);
}

export async function editarProposta(
  id: number | string,
  payload: PropostaPayload | PropostaModeloPayload,
): Promise<Proposta & { alterada: boolean }> {
  const { data } = await proposalHttp.put<Proposta & { alterada: boolean }>(`/proposal/propostas/${id}`, payload);
  return data;
}

export interface ImpostoVigente {
  percentual: string;
  ano: number | null;
  mes: number | null;
  origem: 'mes' | 'anterior' | 'padrao';
}

export async function obterImpostoVigente(): Promise<ImpostoVigente> {
  const { data } = await proposalHttp.get<ImpostoVigente>('/proposal/propostas/imposto-vigente');
  return data;
}

export async function cancelarProposta(id: number | string): Promise<Proposta> {
  const { data } = await proposalHttp.post<Proposta>(`/proposal/propostas/${id}/cancelar`);
  return data;
}

export interface ModeloPropostaPayload {
  divisao: ModeloId;
  nome: string;
  idioma: Idioma;
  moeda: Moeda;
  setor: SetorId | '';
  projeto_escopo: string | null;
  projetos: Projeto[];
  shortlist: string | null;
  sla: string | null;
  garantia: string | null;
  validade_dias: number;
}

export interface ModeloProposta extends Omit<ModeloPropostaPayload, 'setor'> {
  id: number;
  divisao_nome: string;
  setor: SetorId | null;
  criado_por_usuario: string;
  criado_em: string | null;
  atualizado_por_usuario: string | null;
  atualizado_em: string | null;
}

export interface ModeloPropostaListResponse {
  items: ModeloProposta[];
  total: number;
  page: number;
  page_size: number;
}

export async function listarModelosProposta(
  params: { divisao?: ModeloId | ''; nome?: string; page?: number; page_size?: number } = {},
): Promise<ModeloPropostaListResponse> {
  const query = Object.fromEntries(
    Object.entries(params)
      .map(([chave, valor]) => [chave, typeof valor === 'string' ? valor.trim() : valor])
      .filter(([, valor]) => valor),
  );
  const { data } = await proposalHttp.get<ModeloPropostaListResponse>('/proposal/modelos/', { params: query });
  return data;
}

export async function obterModeloProposta(id: number | string): Promise<ModeloProposta> {
  const { data } = await proposalHttp.get<ModeloProposta>(`/proposal/modelos/${id}`);
  return data;
}

export async function criarModeloProposta(payload: ModeloPropostaPayload): Promise<ModeloProposta> {
  const { data } = await proposalHttp.post<ModeloProposta>('/proposal/modelos/', payload);
  return data;
}

export async function editarModeloProposta(id: number | string, payload: ModeloPropostaPayload): Promise<ModeloProposta> {
  const { data } = await proposalHttp.put<ModeloProposta>(`/proposal/modelos/${id}`, payload);
  return data;
}

export async function excluirModeloProposta(id: number | string): Promise<void> {
  await proposalHttp.delete(`/proposal/modelos/${id}`);
}

export interface PerfilConsultor {
  nome: string | null;
  cargo: string | null;
  telefone: string | null;
  email: string | null;
  atualizado_em?: string | null;
}

export async function obterPerfil(): Promise<PerfilConsultor> {
  const { data } = await proposalHttp.get<PerfilConsultor>('/proposal/perfil');
  return data;
}

export async function salvarPerfil(payload: PerfilConsultor): Promise<PerfilConsultor> {
  const { data } = await proposalHttp.put<PerfilConsultor>('/proposal/perfil', payload);
  return data;
}

export async function consultarPublica(codigo: string): Promise<PropostaPublicaData> {
  // Com sessão do Proposal na mesma origem, a abertura pela Ocean não conta como visualização do cliente
  const token = localStorage.getItem(TOKEN_KEY);
  const { data } = await publicHttp.get<PropostaPublicaData>(`/public/propostas/${encodeURIComponent(codigo)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

export async function assinarPublica(
  codigo: string,
  payload: { nome: string; email: string; aceite: boolean; versao: number | undefined },
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
