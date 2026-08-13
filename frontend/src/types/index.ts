// Colaborador
export interface Colaborador {
  id: number;
  tipo?: 'colaborador' | 'fornecedor';
  tipo_documento?: 'cpf' | 'cnpj';
  documento?: string;
  nome: string;
  cpf: string;
  razao_social?: string | null;
  telefone?: string | null;
  email?: string | null;
  cargo?: string | null;
  salario?: number | null;
  data_nascimento?: string | null;
  endereco_completo?: string;
  cep?: string;
  data_admissao?: string;
  data_desligamento?: string;
  ativo: boolean;
  observacao?: string;
  beneficio?: string;
}

// NF
export interface NF {
  id: number;
  maggo_id?: string | null;
  numero: string | null;
  razao_social: string;
  posicao?: string;
  candidato?: string;
  valor_bruto: number;
  valor_imposto?: number | null;
  valor_liquido: number;
  data_ent_pgto?: string | null;
  data_emissao: string | null;
  data_vencimento: string | null;
  data_pagamento?: string | null;
  tipo: 'retainer' | 'sucesso' | 'parcelamento';
  tipo_abertura_fechamento?: string;
  status: 'paga' | 'pendente' | 'vencida' | 'cancelada';
  colaborador_lead_id?: number;
  colaborador_conducao_id?: number;
  colaborador_placement_id?: number;
  arquivada?: boolean;
  caixa?: 'corrente' | 'investimento' | null;
  origem?: 'manual' | 'maggo' | null;
}

// Bônus
export interface Bonus {
  id: number;
  colaborador_id: number;
  mes: number;
  ano: number;
  etapa: string;
  percentual: number;
  valor_bonus: number;
  cliente?: string;
  posicao?: string;
  numero_nf?: string;
}

// Usuário do App
export interface UsuarioApp {
  id: number;
  usuario: string;
  papel: string;
  permissoes?: string;
  ativo: boolean;
  criado_em: string;
}

// Férias
export interface Ferias {
  id: number;
  colaborador_id: number;
  ano: number;
  dias_direito: number;
  dias_tirados: number;
  data_inicio?: string;
  data_fim?: string;
  aprovado: boolean;
}

export interface ResumoFeriasAno {
  colaborador_id: number;
  ano: number;
  direito_anual: number;
  total_tirado: number;
  saldo_anual: number;
  tem_pendencia: boolean;
}

export type FluxoConta = 'corrente' | 'investimento';

export type OrigemMovimentoFluxo = 'contas_receber' | 'contas_pagar' | 'manual' | 'transferencia';

export interface MovimentoFluxo {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  origem: OrigemMovimentoFluxo;
  origem_rotulo: 'Contas a Receber' | 'Contas a Pagar' | 'Manual' | 'Transferência';
  desc: string;
  valor: number;
  manual: boolean;
  movId?: number;
  parId?: string | null;
}

// Conta a Pagar
export interface ContaPagar {
  id: number;
  descricao: string;
  categoria: string;
  subcategoria?: string | null;
  categoria_pendente?: boolean;
  valor: number;
  data_vencimento?: string | null;
  data_pagamento?: string;
  pago: boolean;
  comprovante_nome?: string;
  fornecedor_id?: number | null;
  fornecedor_nome?: string | null;
  fornecedor_ativo?: boolean | null;
}

// DH
export interface DH {
  id: number;
  empresa: string;
  posicao: string;
  tipo_fechamento: 'retainer' | 'sucesso' | 'parcelamento';
  tipo_abertura_fechamento?: string;
  colaborador_preencheu: string;
  data_envio: string;
  assunto: string;
  enviado_financeiro: boolean;
  enviado_ceo: boolean;
}

// Auth
export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: string;
  papel?: string;
  permissoes?: string | null;
}

// API Response
export interface ApiResponse<T> {
  total?: number;
  pagina?: number;
  tamanho_pagina?: number;
  dados?: T[];
  [key: string]: any;
}
