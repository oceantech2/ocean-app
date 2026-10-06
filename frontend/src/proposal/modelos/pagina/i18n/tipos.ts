import type { TipoInvestimento } from '../../../services/proposalApi';

// Textos comuns a todas as divisões; o que muda por divisão fica em ConteudoDivisao
export interface TextosPagina {
  pagina: { titulo: string; lang: string; navegacao: string };
  capa: {
    titulo: [string, string];
    preparadaPara: string;
    data: string;
    consultor: string;
    atualizadaEm: (data: string) => string;
  };
  // servico: título da 1ª seção quando a versão não usa o título da divisão (Executive Search v1)
  nav: { servico: string; investimento: string; garantias: string; contato: string };
  investimento: {
    taxa: string;
    taxaSub: string;
    pagamento: string;
    tipos: Record<TipoInvestimento, string>;
    comEntrada: (entrada: number, final: number) => string;
    semEntrada: string;
    observacoesTitulo: string;
  };
  garantias: {
    shortlist: string;
    sla: string;
    garantia: string;
    meses: (n: number) => string;
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

export type IconeServico = 'assessment' | 'outplacement' | 'solucoes';

export type SecaoMeio =
  | { tipo: 'metodologia'; id: string; titulo: string; passos: { titulo: string; itens: string[] }[] }
  | { tipo: 'servicos'; id: string; titulo: string; cartoes: { icone: IconeServico; titulo: string; texto: string }[] };

export interface ConteudoDivisao {
  logo: { src: string; alt: string; larga?: boolean };
  tituloDivisao: string;
  textoServico: string;
  secaoMeio: SecaoMeio;
  tituloEscopo: string;
  observacoesInvestimento: string[];
  observacoesGarantias: string[];
  // Executive Search: a seção aparece mesmo sem Shortlist/SLA/Garantia, por causa das Observações
  garantiasSempreVisivel: boolean;
}
