import type { TextosES } from './tipos';

const textos: TextosES = {
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
    logoAlt: 'Ocean Talent Solutions — Executive Search',
  },
  nav: {
    servico: 'Service',
    metodologia: 'Methodology',
    investimento: 'Investment',
    garantias: 'Guarantees and terms',
    contato: 'Contact',
  },
  servico: {
    texto:
      'We develop market intelligence and find the professionals who make a difference, from technical specialists ' +
      "to the C-level. Our process goes beyond collecting résumés: we actively map the market, approach the " +
      "professionals best suited to your company's challenge, check references and mitigate engagement risks, " +
      'ensuring the right hire.',
  },
  metodologia: {
    passos: [
      {
        titulo: 'Alignment',
        itens: [
          "Understanding of the position and the client's culture",
          'Goals and challenges',
          'Reason for the hire',
          'Timeline definition',
        ],
      },
      {
        titulo: 'Market mapping',
        itens: ['Target company universe', 'Market intelligence', 'Active hunting', 'Referrals'],
      },
      {
        titulo: 'Assessment',
        itens: [
          'Interviews',
          'Technical and behavioral assessment',
          'Alignment of expectations',
          'Comparison between candidates',
        ],
      },
      {
        titulo: 'Candidate presentation',
        itens: ['Long list', 'Short list', 'Summary of selected profiles and recommendations', 'Professional references'],
      },
      {
        titulo: 'Process management',
        itens: [
          'Interview support',
          'Reference checks',
          'Salary negotiation support',
          'Close contact with candidates and managers',
        ],
      },
      {
        titulo: 'Onboarding',
        itens: ["Formal follow-up during the hired professional's first 6 months"],
      },
    ],
  },
  investimento: {
    taxa: 'Fee',
    pagamento: 'Payment terms',
    tipos: { retainer: 'Retainer', sucesso: 'Success fee', 'valor-fechado': 'Fixed fee' },
    comEntrada: (entrada, final) => `${entrada}% upfront + ${final}% upon completion`,
    semEntrada: '100% upon completion',
    observacoesTitulo: 'Notes',
    observacoes: [
      'Annual compensation includes the 13th salary, vacation bonus and bonuses (if applicable);',
      'The initial installment will be calculated based on the estimated compensation. The final installment will ' +
        'be calculated based on the actual compensation, less the initial installment;',
      'Minimum fee of BRL 15,000.00 per project;',
      'Taxes (up to 19.55%) will be added to all amounts stated.',
    ],
  },
  garantias: {
    shortlist: 'Shortlist:',
    shortlistValor: '3 to 5 candidates',
    sla: 'SLA:',
    slaValor: '5 to 10 business days',
    garantia: 'Guarantee:',
    meses: (n) => (n === 1 ? '1 month' : `${n} months`),
    observacoes: [
      'Replacement guarantee period if the hired candidate leaves the company (at no additional cost);',
      "Ocean will not approach the client's employees for 12 months after the last position filled;",
      'The client shall compensate Ocean if it hires any presented candidate within 12 months.',
    ],
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
