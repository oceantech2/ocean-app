import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: {
    src: '/propostas/offshore-talent/logo-divisao.png',
    alt: 'Ocean Talent Solutions — Offshore Talent',
    largura: 240,
  },
  tituloDivisao: 'Offshore Talent',
  textoServico: [
    'The offshore support fleet in Brazilian waters already exceeds 460 vessels, and Petrobras has planned the ' +
      'contracting of around 200 new units by 2028, a volume that further intensifies the competition for ' +
      'certified and available crew members.',
    'We provide technical recruitment across the entire onboard hierarchy, from deck and engine roles to ' +
      'specialized offshore operations, delivering professionals with up-to-date certifications, relevant offshore ' +
      'experience and fit with the rotation schedule of each operation.',
  ],
  secaoMeio: {
    tipo: 'metodologia',
    id: 'areas-cargos',
    titulo: 'Areas and roles',
    passos: [
      {
        titulo: 'Marine & Nautical',
        itens: ['Master', 'Chief Officer', 'Deck Officer (1st, 2nd and 3rd)', 'Bosun', 'Among others'],
      },
      {
        titulo: 'Engine & Engineering',
        itens: [
          'Chief Engineer',
          'Engineer Officer (1st, 2nd and 3rd)',
          'Maintenance Supervisor',
          'Reliability Engineer',
          'Among others',
        ],
      },
      {
        titulo: 'Subsea & ROV',
        itens: ['DPO', 'ROV Supervisor', 'ROV Pilot', 'Subsea Engineer', 'Among others'],
      },
      {
        titulo: 'Drilling',
        itens: ['OIM', 'Drilling Supervisor', 'Rigging Manager', 'Directional Driller', 'Among others'],
      },
      {
        titulo: 'HSEQ & Projects',
        itens: [
          'HSE Superintendent',
          'Quality Manager',
          'Process Safety Engineer',
          'Construction Manager',
          'Among others',
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
