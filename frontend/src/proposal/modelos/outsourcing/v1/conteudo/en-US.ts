import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: {
    src: '/propostas/outsourcing/logo-divisao.png',
    alt: 'Ocean Talent Solutions — Outsourcing',
    largura: 242,
  },
  tituloDivisao: 'Outsourcing',
  textoServico: [
    'The ideal solution for companies that need qualified professionals but do not want to directly take on the ' +
      'entire labor, administrative and operational structure involved in hiring.',
    'We recruit, hire and place the right professional within your operation, and handle all back-office ' +
      'management (payroll, benefits, labor charges and labor compliance) while your company focuses solely on the ' +
      "area's results.",
  ],
  secaoMeio: {
    tipo: 'metodologia',
    id: 'beneficios',
    titulo: 'Benefits',
    passos: [
      {
        titulo: 'Structural flexibility',
        itens: [
          'No permanent increase in headcount',
          'Contract ends with the project',
          'No direct handling of terminations',
        ],
      },
      {
        titulo: 'Transfer of labor operations',
        itens: ['Onboarding, payroll and 13th salary', 'FGTS, INSS and benefits', 'Documentation and termination'],
      },
      {
        titulo: 'Speed to hire',
        itens: [
          'Legal and HR structure in place',
          'Agile recruitment and contracts',
          'Professional placed quickly',
        ],
      },
      {
        titulo: 'Headcount management',
        itens: ['Does not affect your own headcount', 'Fewer corporate approvals'],
      },
      {
        titulo: 'Fixed cost becomes on-demand cost',
        itens: [
          'Payment tied to actual need',
          'Ideal for projects and seasonality',
          'Applicable to IT, engineering and many other areas',
        ],
      },
    ],
  },
  tituloEscopo: 'Scope',
  observacoesInvestimento: [
    'Annual compensation includes the 13th salary, vacation bonus and bonuses (if applicable). In the Retainer ' +
      'model, the initial installment will be calculated based on the estimated compensation and the final ' +
      'installment will be calculated based on the actual compensation, less the initial installment;',
    'Minimum fee of BRL 15,000.00 per project;',
  ],
  observacaoImpostos: (percentual) => `Taxes (up to ${percentual}%) will be added to all amounts stated.`,
  observacoesGarantias: [
    'Replacement guarantee period if the hired candidate leaves the company (at no additional cost);',
    "Ocean will not approach the client's employees for 12 months after the last position filled;",
    'The client shall compensate Ocean if it hires any presented candidate within 12 months.',
  ],
  garantiasSempreVisivel: true,
};

export default conteudo;
