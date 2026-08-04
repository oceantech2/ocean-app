// Colaborador
export interface Colaborador {
  id: number;
  nome: string;
  cpf: string;
  cargo: string;
  salario: number;
  data_nascimento: string;
  endereco_completo?: string;
  cep?: string;
  data_admissao: string;
  data_desligamento?: string;
  ativo: boolean;
  observacao?: string;
  beneficio?: string;
}

// NF
export interface NF {
  id: number;
  numero: string;
  razao_social: string;
  posicao?: string;
  candidato?: string;
  valor_bruto: number;
  valor_liquido: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  tipo: 'retainer' | 'sucesso';
  tipo_abertura_fechamento?: string;
  status: 'paga' | 'pendente' | 'vencida' | 'cancelada';
  colaborador_lead_id?: number;
  colaborador_conducao_id?: number;
  colaborador_placement_id?: number;
  arquivada?: boolean;
  caixa?: 'corrente' | 'investimento' | null;
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
}

// DH
export interface DH {
  id: number;
  empresa: string;
  posicao: string;
  tipo_fechamento: 'retainer' | 'sucesso';
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
