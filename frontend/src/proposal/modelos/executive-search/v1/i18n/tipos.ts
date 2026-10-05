import type { TipoInvestimento } from '../../../../services/proposalApi';

export interface TextosES {
  pagina: { titulo: string; lang: string; navegacao: string };
  capa: {
    titulo: [string, string];
    preparadaPara: string;
    data: string;
    consultor: string;
    atualizadaEm: (data: string) => string;
    logoAlt: string;
  };
  nav: { servico: string; metodologia: string; escopo: string; investimento: string; garantias: string; contato: string };
  // tituloDivisao: título da 1ª seção a partir da versão 2 (na v1 é nav.servico)
  servico: { tituloDivisao: string; texto: string };
  metodologia: { passos: { titulo: string; itens: string[] }[] };
  investimento: {
    taxa: string;
    pagamento: string;
    tipos: Record<TipoInvestimento, string>;
    comEntrada: (entrada: number, final: number) => string;
    semEntrada: string;
    observacoesTitulo: string;
    observacoes: string[];
  };
  garantias: {
    shortlist: string;
    shortlistValor: string;
    sla: string;
    slaValor: string;
    garantia: string;
    meses: (n: number) => string;
    observacoes: string[];
  };
  proximos: {
    titulo: string;
    texto: string;
    validadeAte: (data: string) => string;
    aceitaEm: (data: string, hora: string, nome: string) => string;
    aceitar: string;
    falarConsultor: string;
    baixarPdf: string;
  };
  contato: { telefone: string; email: string; linkedin: string; site: string };
  rodape: { texto: (data: string) => string };
  aceite: {
    titulo: string;
    texto: string;
    nome: string;
    email: string;
    declaracao: string;
    confirmar: string;
    cancelar: string;
    fechar: string;
    erroNome: string;
    erroEmail: string;
    erroAceite: string;
    sucesso: string;
    erro: string;
    versaoAtualizada: string;
  };
  whatsapp: { mensagem: (cliente: string) => string };
  pdf: { nomeArquivo: (cliente: string) => string };
}
