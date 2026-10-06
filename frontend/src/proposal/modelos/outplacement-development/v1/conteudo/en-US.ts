import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: {
    src: '/propostas/outplacement-development/logo-divisao.png',
    alt: 'Ocean Talent Solutions — Development & Outplacement',
    larga: true,
  },
  tituloDivisao: 'Development & Outplacement',
  textoServico:
    'For companies that want to value and develop the people already on their team and, when necessary, handle ' +
    'terminations responsibly, preserving the employer brand and the trust of their teams. We assess profiles and ' +
    'competencies, support the development of people and leaders, and conduct outplacement processes with a ' +
    'structured methodology, respect and transparency, preparing professionals for the next step in their careers.',
  secaoMeio: {
    tipo: 'servicos',
    id: 'principais-servicos',
    titulo: 'Key services',
    cartoes: [
      {
        icone: 'assessment',
        titulo: 'Assessment',
        texto:
          'Assessment of professionals (internal or candidates), processes and complete organizational structures, ' +
          'with in-depth diagnosis, interviews and an executive report to support decision-making and performance ' +
          'improvement.',
      },
      {
        icone: 'outplacement',
        titulo: 'Outplacement',
        texto:
          'Individual program of up to 6 months, with 8 sessions in three stages: Think (self-awareness), Plan ' +
          '(résumé, LinkedIn and interviews) and Practice (networking and opportunity network).',
      },
      {
        icone: 'solucoes',
        titulo: 'Tailored Solutions',
        texto:
          'Every company has a unique challenge. We develop tailored solutions for specific HR needs, always with a ' +
          'clear strategy and results-oriented execution.',
      },
    ],
  },
  tituloEscopo: 'Scope',
  observacoesInvestimento: [
    'Minimum fee of BRL 10,000.00 per project;',
    'Taxes (up to 19.55%) will be added to all amounts stated.',
  ],
  observacoesGarantias: [],
  garantiasSempreVisivel: false,
};

export default conteudo;
