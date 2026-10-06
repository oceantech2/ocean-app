import { mesesPorExtenso } from '../../formatoProposta';
import type { TextosPagina } from './tipos';

const textos: TextosPagina = {
  pagina: {
    titulo: 'Commercial proposal — Ocean Talent Solutions',
    lang: 'en',
    navegacao: 'Sections',
  },
  capa: {
    titulo: ['Commercial', 'Proposal'],
    preparadaPara: 'Prepared for',
    data: 'Date',
    consultor: 'Consultant',
    atualizadaEm: (data) => `Updated on ${data}`,
  },
  nav: {
    servico: 'Service',
    investimento: 'Investment',
    garantias: 'Guarantees and terms',
    contato: 'Contact',
  },
  investimento: {
    taxa: 'Fee',
    taxaSub: 'of annual compensation',
    pagamento: 'Payment terms',
    tipos: { retainer: 'Retainer', sucesso: 'Success fee', 'valor-fechado': 'Fixed fee' },
    comEntrada: (entrada, final) => `${entrada}% upfront + ${final}% upon completion`,
    semEntrada: '100% upon completion',
    observacoesTitulo: 'Notes',
  },
  garantias: {
    shortlist: 'Shortlist:',
    sla: 'SLA:',
    garantia: 'Guarantee:',
    meses: (n) => mesesPorExtenso(n, 'en-US'),
  },
  proximos: {
    titulo: 'Shall we move forward?',
    texto:
      'Thank you for your interest. We are available for any questions or negotiations. ' +
      'We look forward to building a long-term partnership!',
    validadeAte: (data) => `This proposal is valid until ${data}.`,
    aceitaEm: (data, hora, nome) => `Proposal accepted on ${data} at ${hora} by ${nome}.`,
    aceitar: 'Accept proposal',
    falarConsultor: 'Talk to the consultant',
    baixarPdf: 'Download PDF',
  },
  contato: { telefone: 'Phone', email: 'Email', linkedin: 'LinkedIn', site: 'Website' },
  rodape: { texto: (data) => `Ocean Talent Solutions · Commercial proposal · ${data}` },
  aceite: {
    titulo: 'Accept proposal',
    texto: 'By confirming, we will record your acceptance of this commercial proposal and follow up with the contract.',
    nome: 'Full name',
    email: 'Email',
    declaracao: 'I have read and accept the terms of this proposal',
    confirmar: 'Confirm acceptance',
    cancelar: 'Cancel',
    fechar: 'Close',
    erroNome: 'Please enter your full name',
    erroEmail: 'Invalid email address',
    erroAceite: 'You must accept the terms of this proposal',
    sucesso: 'Acceptance recorded. Our team will send you the contract shortly.',
    erro: 'Error: we could not record your acceptance. Please try again or contact the consultant.',
    versaoAtualizada: 'This proposal has been updated. Please review the details and accept again.',
  },
  whatsapp: {
    mensagem: (cliente) => `Hello, I would like to talk about Ocean Talent Solutions' commercial proposal for ${cliente}.`,
  },
  pdf: { nomeArquivo: (cliente) => `Ocean Commercial Proposal${cliente ? ` - ${cliente}` : ''}` },
};

export default textos;
