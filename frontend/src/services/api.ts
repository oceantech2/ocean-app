import axios from 'axios';
import { LoginResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta: redireciona para login somente quando o token está ausente/expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail ?? '';
    // Só desloga se for 401 real de sessão expirada (não 2FA_REQUIRED, não 403 admin)
    if (status === 401 && detail !== '2FA_REQUIRED') {
      const token = localStorage.getItem('access_token');
      // Só redireciona se havia um token (sessão expirou), ignorando erros de rotas sem token
      if (token) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (username: string, password: string, totpCode?: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    if (totpCode) formData.append('totp_code', totpCode);

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('usuario', response.data.usuario);

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Colaboradores
export const colaboradoresService = {
  listar: (skip = 0, limit = 100, ativo?: boolean) =>
    api.get('/colaboradores', { params: { skip, limit, ativo } }),

  obter: (id: number) =>
    api.get(`/colaboradores/${id}`),

  criar: (dados: any) =>
    api.post('/colaboradores', dados),

  atualizar: (id: number, dados: any) =>
    api.put(`/colaboradores/${id}`, dados),

  deletar: (id: number) =>
    api.delete(`/colaboradores/${id}`),

  excluirPermanente: (id: number) =>
    api.delete(`/colaboradores/${id}/permanente`),

  importarXlsx: (arquivo: File) => {
    const fd = new FormData();
    fd.append('file', arquivo);
    return api.post('/colaboradores/importar-xlsx', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportarXlsx: async () => {
    const res = await api.get('/colaboradores/exportar-xlsx', { responseType: 'blob' });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colaboradores_ocean.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// NFs
function normalizarPayloadNf(dados: Record<string, unknown>) {
  const out = { ...dados };
  for (const k of ['numero', 'data_emissao', 'data_vencimento', 'data_ent_pgto', 'data_pagamento']) {
    if (k in out && (out[k] === '' || out[k] === undefined)) out[k] = null;
  }
  if ('valor_imposto' in out && (out.valor_imposto === '' || out.valor_imposto === undefined)) {
    out.valor_imposto = null;
  }
  return out;
}

export const nfsService = {
  listar: (skip = 0, limit = 100, mes?: number, ano?: number, status?: string, incluir_arquivadas = false) =>
    api.get('/nfs', { params: { skip, limit, mes, ano, status_filtro: status, incluir_arquivadas } }),

  arquivar: (id: number, arquivada: boolean) =>
    api.put(`/nfs/${id}`, { arquivada }),

  obter: (id: number) =>
    api.get(`/nfs/${id}`),

  criar: (dados: any) =>
    api.post('/nfs', normalizarPayloadNf(dados)),

  atualizar: (id: number, dados: any) =>
    api.put(`/nfs/${id}`, normalizarPayloadNf(dados)),

  deletar: (id: number) =>
    api.delete(`/nfs/${id}`),

  resumo: (mes?: number, ano?: number) =>
    api.get('/nfs/resumo/total', { params: { mes, ano } }),

  importarXlsx: (arquivo: File, on_conflict?: 'reject' | 'update') => {
    const fd = new FormData();
    fd.append('file', arquivo);
    return api.post<{ ok: number; atualizados: number; erros: Array<{ linha?: number; numero?: string; motivo?: string }> }>(
      '/nfs/importar-xlsx',
      fd,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: on_conflict ? { on_conflict } : undefined,
      },
    );
  },

  deletarTodas: (params?: { mes?: number; ano?: number }) =>
    api.delete('/nfs/todas', { params }),

  exportarXlsx: async (params?: { mes?: number; ano?: number }) => {
    const res = await api.get('/nfs/exportar-xlsx', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nfs_ocean.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// Contas
export type ContaPagarCreatePayload = {
  descricao: string;
  categoria: string;
  subcategoria?: string | null;
  valor: number;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
};

export type ContaPagarUpdatePayload = Partial<ContaPagarCreatePayload> & {
  pago?: boolean;
};

export const contasService = {
  listar: (skip = 0, limit = 100, categoria?: string, pago?: boolean, subcategoria?: string) =>
    api.get('/contas', { params: { skip, limit, categoria, pago, subcategoria } }),

  obter: (id: number) =>
    api.get(`/contas/${id}`),

  criar: (dados: ContaPagarCreatePayload) =>
    api.post('/contas', dados),

  atualizar: (id: number, dados: ContaPagarUpdatePayload) =>
    api.put(`/contas/${id}`, dados),

  deletar: (id: number) =>
    api.delete(`/contas/${id}`),

  importarXlsx: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/contas/importar-xlsx', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  exportarXlsx: async (params?: { mes?: number; ano?: number }) => {
    const res = await api.get('/contas/exportar-xlsx', { params, responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `contas_${params?.ano || 'todos'}${params?.mes ? '_' + String(params.mes).padStart(2, '0') : ''}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },

  uploadComprovante: (contaId: number, arquivo: File) => {
    const fd = new FormData();
    fd.append('arquivo', arquivo);
    return api.post(`/contas/${contaId}/comprovante`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  downloadComprovante: async (contaId: number, nome: string) => {
    const res = await api.get(`/contas/${contaId}/comprovante`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  },

  removerComprovante: (contaId: number) =>
    api.delete(`/contas/${contaId}/comprovante`),
};

// Bônus
export const bonusService = {
  listar: (skip = 0, limit = 100, colaborador_id?: number, mes?: number, ano?: number) =>
    api.get('/bonus', { params: { skip, limit, colaborador_id, mes, ano } }),

  obter: (id: number) =>
    api.get(`/bonus/${id}`),

  criar: (dados: any) =>
    api.post('/bonus', dados),

  atualizar: (id: number, dados: any) =>
    api.put(`/bonus/${id}`, dados),

  deletar: (id: number) =>
    api.delete(`/bonus/${id}`),
};

// Férias
export const feriasService = {
  listar: (skip = 0, limit = 100, colaborador_id?: number, ano?: number) =>
    api.get('/ferias', { params: { skip, limit, colaborador_id, ano } }),

  obter: (id: number) =>
    api.get(`/ferias/${id}`),

  criar: (dados: any) =>
    api.post('/ferias', dados),

  atualizar: (id: number, dados: any) =>
    api.put(`/ferias/${id}`, dados),

  deletar: (id: number) =>
    api.delete(`/ferias/${id}`),
};

// DH
export const dhService = {
  listar: (skip = 0, limit = 100, mes?: number, ano?: number, colaborador?: string) =>
    api.get('/dh', { params: { skip, limit, mes, ano, colaborador } }),

  obter: (id: number) =>
    api.get(`/dh/${id}`),

  criar: (dados: any) =>
    api.post('/dh', dados),

  deletar: (id: number) =>
    api.delete(`/dh/${id}`),

  marcarEnviado: (id: number, enviado_para: 'financeiro' | 'ceo') =>
    api.put(`/dh/${id}/marcar-enviado`, {}, { params: { enviado_para } }),
};

// Relatórios
export const relatoriosService = {
  faturamentoLiquidoMes: (ano: number) =>
    api.get('/relatorios/faturamento-liquido-mes', { params: { ano } }),

  fechamentosPorTipo: (ano?: number, mes?: number) =>
    api.get('/relatorios/fechamentos-por-tipo', { params: { ano, mes } }),

  faturamentoPorCliente: (ano?: number, limite?: number) =>
    api.get('/relatorios/faturamento-por-cliente', { params: { ano, limite } }),

  bonusMensal: (ano: number) =>
    api.get('/relatorios/bonus-mensal', { params: { ano } }),

  propostasEnviadas: (ano?: number) =>
    api.get('/relatorios/propostas-enviadas', { params: { ano } }),

  contratosAssinados: (ano?: number) =>
    api.get('/relatorios/contratos-assinados', { params: { ano } }),

  placementPorConsultor: (ano?: number) =>
    api.get('/relatorios/placement-por-consultor', { params: { ano } }),

  resumoFinanceiro: (ano?: number, mes?: number) =>
    api.get('/relatorios/resumo-financeiro', { params: { ano, mes } }),

  dreMensal: (ano: number) =>
    api.get('/relatorios/dre-mensal', { params: { ano } }),

  custoPorCategoria: (ano: number, mesAte: number, mesDe: number = 1) =>
    api.get('/relatorios/custo-por-categoria', {
      params: { ano, mes_ate: mesAte, mes_de: mesDe },
    }),
};

// Auditoria
export const auditoriaService = {
  listar: (skip = 0, limit = 100, entidade?: string, usuario?: string, acao?: string) =>
    api.get('/auditoria', { params: { skip, limit, entidade, usuario, acao } }),
  limpar: () => api.delete('/auditoria'),
};

// Metas financeiras
export const metasService = {
  listar: (ano?: number) =>
    api.get('/metas', { params: { ano } }),

  progresso: (mes: number, ano: number) =>
    api.get('/metas/progresso', { params: { mes, ano } }),

  definir: (mes: number, ano: number, valor_meta: number) =>
    api.put('/metas', { mes, ano, valor_meta }),
};

// Documentos do colaborador
export const documentosService = {
  listar: (colaboradorId: number) =>
    api.get(`/documentos/colaborador/${colaboradorId}`),

  upload: (colaboradorId: number, arquivo: File) => {
    const fd = new FormData();
    fd.append('arquivo', arquivo);
    return api.post(`/documentos/colaborador/${colaboradorId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Retorna a URL de download (com o token embutido não é possível via <a>, então baixamos via blob)
  download: async (documentoId: number, nomeOriginal: string) => {
    const res = await api.get(`/documentos/download/${documentoId}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeOriginal;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  deletar: (documentoId: number) =>
    api.delete(`/documentos/${documentoId}`),
};

// Alertas
export const alertasService = {
  preview: () => api.get('/alertas'),
  enviar: () => api.post('/alertas/enviar'),
};

// Configurações (usuários do app)
export const configuracoesService = {
  listar: () => api.get('/configuracoes'),
  criar: (dados: any) => api.post('/configuracoes', dados),
  atualizar: (id: number, dados: any) => api.put(`/configuracoes/${id}`, dados),
  deletar: (id: number) => api.delete(`/configuracoes/${id}`),
};

// Saldos (Fluxo de Caixa / Conta Investimento)
export const saldosService = {
  listar: (mes?: number, ano?: number, conta?: string) =>
    api.get('/saldos', { params: { mes, ano, conta } }),
  criar: (dados: any) => api.post('/saldos', dados),
  atualizar: (id: number, dados: any) => api.put(`/saldos/${id}`, dados),
  deletar: (id: number) => api.delete(`/saldos/${id}`),
};

// Impostos
export const impostosService = {
  listar: (ano?: number) => api.get('/impostos', { params: { ano } }),
  deContas: (ano: number) => api.get('/impostos/de-contas', { params: { ano } }),
  criar: (dados: any) => api.post('/impostos', dados),
  atualizar: (id: number, dados: any) => api.put(`/impostos/${id}`, dados),
  deletar: (id: number) => api.delete(`/impostos/${id}`),
};

// 2FA
export const twofaService = {
  status: () => api.get('/auth/2fa/status'),
  setup: () => api.post('/auth/2fa/setup'),
  ativar: (codigo: string) => {
    const fd = new FormData();
    fd.append('codigo', codigo);
    return api.post('/auth/2fa/ativar', fd, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  desativar: () => api.post('/auth/2fa/desativar'),
};

// Patrimônio
export const patrimonioService = {
  listar: (params?: { colaborador_id?: number; status?: string; tipo?: string }) =>
    api.get('/patrimonio', { params }),

  criar: (dados: any) =>
    api.post('/patrimonio', dados),

  atualizar: (id: number, dados: any) =>
    api.put(`/patrimonio/${id}`, dados),

  deletar: (id: number) =>
    api.delete(`/patrimonio/${id}`),
};

// Fluxo de Caixa — Movimentos Manuais
export const fluxoMovimentosService = {
  listar: (mes?: number, ano?: number) =>
    api.get('/fluxo-movimentos', { params: { mes, ano } }),

  criar: (dados: { tipo: 'receita' | 'despesa'; descricao: string; valor: number; data_movimento: string }) =>
    api.post('/fluxo-movimentos', dados),

  deletar: (id: number) =>
    api.delete(`/fluxo-movimentos/${id}`),
};

// Histórico Colaboradores
export const historicoService = {
  listar: (colaboradorId: number) =>
    api.get(`/historico/${colaboradorId}`),

  criar: (colaboradorId: number, dados: { cargo: string; salario: number; data_inicio: string; data_fim?: string; observacao?: string }) =>
    api.post(`/historico/${colaboradorId}`, dados),

  deletar: (historicoId: number) =>
    api.delete(`/historico/${historicoId}`),
};

// Arquivos NFs
export const arquivosNfsService = {
  listar: () => api.get('/arquivos-nfs/'),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/arquivos-nfs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadUrl: (nome: string) => `${API_BASE_URL}/arquivos-nfs/download/${encodeURIComponent(nome)}`,
  deletar: (nome: string) => api.delete(`/arquivos-nfs/${encodeURIComponent(nome)}`),
};

// Comprovantes de Pagamento
export const comprovantesService = {
  listar: () => api.get('/arquivos-comprovantes/'),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/arquivos-comprovantes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadUrl: (nome: string) => `${API_BASE_URL}/arquivos-comprovantes/download/${encodeURIComponent(nome)}`,
  deletar: (nome: string) => api.delete(`/arquivos-comprovantes/${encodeURIComponent(nome)}`),
};

export default api;
