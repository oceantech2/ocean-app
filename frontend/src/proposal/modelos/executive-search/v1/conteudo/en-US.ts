import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: { src: '/propostas/executive-search/logo-divisao.png', alt: 'Ocean Talent Solutions — Executive Search' },
  tituloDivisao: 'Executive Search',
  textoServico:
    'We develop market intelligence and find the professionals who make a difference, from technical specialists ' +
    "to the C-level. Our process goes beyond collecting résumés: we actively map the market, approach the " +
    "professionals best suited to your company's challenge, check references and mitigate engagement risks, " +
    'ensuring the right hire.',
  secaoMeio: {
    tipo: 'metodologia',
    id: 'metodologia',
    titulo: 'Methodology',
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
  tituloEscopo: 'Project Scope',
  observacoesInvestimento: [
    'Annual compensation includes the 13th salary, vacation bonus and bonuses (if applicable);',
    'The initial installment will be calculated based on the estimated compensation. The final installment will ' +
      'be calculated based on the actual compensation, less the initial installment;',
    'Minimum fee of BRL 15,000.00 per project;',
    'Taxes (up to 19.55%) will be added to all amounts stated.',
  ],
  observacoesGarantias: [
    'Replacement guarantee period if the hired candidate leaves the company (at no additional cost);',
    "Ocean will not approach the client's employees for 12 months after the last position filled;",
    'The client shall compensate Ocean if it hires any presented candidate within 12 months.',
  ],
  garantiasSempreVisivel: true,
};

export default conteudo;
