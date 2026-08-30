// Colaborador / Fornecedor (cadastro unificado)
export interface Colaborador {
  id: number;
  tipo?: 'colaborador' | 'fornecedor';
  elegivel_equipe?: boolean;
  tipo_fornecedor?: 'fixo' | 'spot';
  tipo_documento?: 'cpf' | 'cnpj';
  documento?: string;
  nome: string;
  cpf: string;
  razao_social?: string | null;
  telefone?: string | null;
  email?: string | null;
  pf_nome?: string | null;
  pf_cpf?: string | null;
  pf_endereco?: string | null;
  pf_data_nascimento?: string | null;
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
  aliquota_imposto?: number | null;
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
  caixa?: string | null;
  origem?: 'manual' | 'maggo' | null;
  anexo_nome?: string | null;
}

// Bônus / Comissões
export interface Bonus {
  id: number;
  colaborador_id: number;
  nf_id?: number | null;
  mes: number;
  ano: number;
  etapa: string;
  atividades?: string[];
  percentual: number;
  valor_bonus: number;
  liberado?: boolean;
  pago?: boolean;
  data_liberacao?: string | null;
  data_pagamento?: string | null;
  cliente?: string;
  posicao?: string;
  numero_nf?: string;
}

export interface ComissaoLinhaForm {
  id?: number;
  colaborador_id: number;
  mes: number;
  ano: number;
  atividades: string[];
  percentual: number;
  liberado?: boolean;
  pago?: boolean;
}

export interface ComissaoLinhaInput {
  id?: number;
  colaborador_id: number;
  mes: number;
  ano: number;
  atividades: string[];
  percentual: number;
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

export type FluxoConta = string;

export interface ContaCorrente {
  id: number;
  codigo: string;
  nome: string;
  banco: string;
  agencia?: string | null;
  numero?: string | null;
  padrao: boolean;
  ativo: boolean;
}

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
  caixa?: string | null;
  comprovante_nome?: string;
  fornecedor_id?: number | null;
  fornecedor_nome?: string | null;
  fornecedor_ativo?: boolean | null;
  tipo_despesa?: 'fixo' | 'variavel';
}

export interface CategoriaOficialItem {
  codigo: string;
  nome: string;
  exige_subcategoria: boolean;
}

export interface CategoriaCadastradaItem {
  id: number;
  codigo: string;
  nome: string;
}

export interface SubcategoriaRhItem {
  codigo: string;
  nome: string;
}

export interface CatalogoCategoriasContas {
  oficiais: CategoriaOficialItem[];
  cadastradas: CategoriaCadastradaItem[];
  subcategorias_rh: SubcategoriaRhItem[];
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
  paginas_visibilidade?: Record<string, boolean>;
}

// API Response
export interface ApiResponse<T> {
  total?: number;
  pagina?: number;
  tamanho_pagina?: number;
  dados?: T[];
  [key: string]: any;
}
