import { mesesPorExtenso } from '../../formatoProposta';
import type { TextosPagina } from './tipos';

const textos: TextosPagina = {
  pagina: {
    titulo: 'Proposta comercial — Ocean Talent Solutions',
    lang: 'pt-BR',
    navegacao: 'Seções',
  },
  capa: {
    titulo: ['Proposta', 'Comercial'],
    preparadaPara: 'Preparada para',
    data: 'Data',
    consultor: 'Consultor',
    atualizadaEm: (data) => `Atualizada em ${data}`,
  },
  nav: {
    servico: 'Serviço',
    investimento: 'Investimento',
    garantias: 'Garantias e condições',
    contato: 'Contato',
  },
  investimento: {
    taxa: 'Taxa',
    taxaSub: 'sobre a remuneração anual',
    pagamento: 'Forma de pagamento',
    tipos: { retainer: 'Retainer', sucesso: 'Sucesso', 'valor-fechado': 'Valor fechado' },
    comEntrada: (entrada, final) => `${entrada}% de entrada + ${final}% após conclusão`,
    semEntrada: '100% após conclusão',
    observacoesTitulo: 'Observações',
  },
  garantias: {
    shortlist: 'Shortlist:',
    sla: 'SLA:',
    garantia: 'Garantia:',
    meses: (n) => mesesPorExtenso(n, 'pt-BR'),
  },
  proximos: {
    titulo: 'Vamos avançar?',
    texto:
      'Agradecemos o seu interesse e nos colocamos à disposição para eventuais esclarecimentos ou negociações. ' +
      'Esperamos desenvolver uma parceria de longo prazo!',
    validadeAte: (data) => `Esta proposta é válida até ${data}.`,
    aceitaEm: (data, hora, nome) => `Proposta aceita em ${data} às ${hora} por ${nome}.`,
    aceitar: 'Aceitar proposta',
    falarConsultor: 'Falar com o consultor',
    baixarPdf: 'Baixar PDF',
  },
  contato: { telefone: 'Telefone', email: 'E-mail', linkedin: 'LinkedIn', site: 'Site' },
  rodape: { texto: (data) => `Ocean Talent Solutions · Proposta comercial · ${data}` },
  aceite: {
    titulo: 'Aceitar proposta',
    texto: 'Ao confirmar, registramos o aceite da proposta comercial e encaminhamos você para o contrato.',
    nome: 'Nome completo',
    email: 'E-mail',
    declaracao: 'Li e aceito os termos desta proposta',
    confirmar: 'Confirmar aceite',
    cancelar: 'Cancelar',
    fechar: 'Fechar',
    erroNome: 'Informe o nome completo',
    erroEmail: 'E-mail inválido',
    erroAceite: 'É necessário aceitar os termos da proposta',
    sucesso: 'Aceite registrado. Nossa equipe enviará o contrato em breve.',
    erro: 'Erro: não foi possível registrar o aceite. Tente novamente ou fale com o consultor.',
    versaoAtualizada: 'Esta proposta foi atualizada. Revise os dados e assine novamente.',
  },
  whatsapp: {
    mensagem: (cliente) => `Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a ${cliente}.`,
  },
  pdf: { nomeArquivo: (cliente) => `Proposta Comercial Ocean${cliente ? ` - ${cliente}` : ''}` },
};

export default textos;
