import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: {
    src: '/propostas/outplacement-development/logo-divisao.png',
    alt: 'Ocean Talent Solutions — Development & Outplacement',
    larga: true,
  },
  tituloDivisao: 'Development & Outplacement',
  textoServico:
    'Para empresas que querem valorizar e desenvolver quem já está no time e, quando necessário, conduzir ' +
    'desligamentos com responsabilidade, preservando a marca empregadora e a confiança das equipes. Avaliamos ' +
    'perfis e competências, apoiamos o desenvolvimento de pessoas e lideranças e conduzimos processos de ' +
    'outplacement com metodologia estruturada, respeito e transparência, preparando o profissional para o ' +
    'próximo passo da carreira.',
  secaoMeio: {
    tipo: 'servicos',
    id: 'principais-servicos',
    titulo: 'Principais serviços',
    cartoes: [
      {
        icone: 'assessment',
        titulo: 'Assessment',
        texto:
          'Avaliação de profissionais (internos ou candidatos), processos e estruturas organizacionais completas, ' +
          'com diagnóstico aprofundado, entrevistas e parecer executivo para suporte à tomada de decisão e ' +
          'melhoria de performance.',
      },
      {
        icone: 'outplacement',
        titulo: 'Outplacement',
        texto:
          'Programa individual de até 6 meses, com 8 sessões em três etapas: Pensar (autoconhecimento), Planejar ' +
          '(CV, LinkedIn e entrevista) e Praticar (networking e rede de oportunidades).',
      },
      {
        icone: 'solucoes',
        titulo: 'Soluções Personalizadas',
        texto:
          'Cada empresa tem um desafio único. Desenvolvemos soluções sob medida para demandas específicas de RH, ' +
          'sempre com uma estratégia clara e execução orientada a resultados.',
      },
    ],
  },
  tituloEscopo: 'Escopo',
  observacoesInvestimento: [
    'Valor mínimo de R$ 10.000,00 por projeto;',
    'Impostos (até 19,55%) serão adicionados a todos os valores informados.',
  ],
  observacoesGarantias: [],
  garantiasSempreVisivel: false,
};

export default conteudo;
