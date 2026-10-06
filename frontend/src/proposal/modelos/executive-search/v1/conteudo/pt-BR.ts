import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: { src: '/propostas/executive-search/logo-divisao.png', alt: 'Ocean Talent Solutions — Executive Search' },
  tituloDivisao: 'Executive Search',
  textoServico:
    'Desenvolvemos inteligência de mercado e encontramos os profissionais que fazem a diferença, do especialista ' +
    'técnico ao C-level. Nosso processo vai além da captação de currículos: mapeamos o mercado ativamente, abordamos ' +
    'os profissionais mais aderentes ao desafio da sua empresa, checamos referências e mitigamos riscos de ' +
    'engajamento, garantindo uma contratação assertiva.',
  secaoMeio: {
    tipo: 'metodologia',
    id: 'metodologia',
    titulo: 'Metodologia',
    passos: [
      {
        titulo: 'Alinhamento',
        itens: [
          'Entendimento da posição e cultura do cliente',
          'Objetivos e desafios',
          'Motivo da contratação',
          'Definição do cronograma',
        ],
      },
      {
        titulo: 'Mapeamento de mercado',
        itens: ['Universo de empresas target', 'Inteligência de mercado', 'Hunting ativo', 'Indicações'],
      },
      {
        titulo: 'Avaliação',
        itens: [
          'Entrevistas',
          'Avaliação técnica e comportamental',
          'Alinhamento de expectativas',
          'Comparação entre os candidatos',
        ],
      },
      {
        titulo: 'Apresentação dos candidatos',
        itens: ['Long list', 'Short list', 'Resumo dos perfis selecionados e recomendações', 'Referências profissionais'],
      },
      {
        titulo: 'Condução do processo',
        itens: [
          'Suporte nas entrevistas',
          'Checagem de referências',
          'Suporte na negociação salarial',
          'Proximidade dos candidatos e gestores',
        ],
      },
      {
        titulo: 'Onboarding',
        itens: ['Monitoramento formal pelos 6 primeiros meses do profissional contratado'],
      },
    ],
  },
  tituloEscopo: 'Escopo do Projeto',
  observacoesInvestimento: [
    'Remuneração anual inclui 13º salário, adicional de férias e bônus (se aplicável);',
    'A parcela inicial será calculada com base na remuneração estimada. A parcela final será calculada com base ' +
      'na remuneração praticada, descontando-se a parcela inicial;',
    'Valor mínimo de R$ 15.000,00 por projeto;',
    'Impostos (até 19,55%) serão adicionados a todos os valores informados.',
  ],
  observacoesGarantias: [
    'Prazo de garantia para reposição caso o candidato contratado deixe a empresa (sem custo adicional);',
    'A Ocean não abordará profissionais do cliente por 12 meses após a última posição atendida;',
    'O cliente deverá reembolsar a Ocean se contratar candidatos apresentados em até 12 meses.',
  ],
  garantiasSempreVisivel: true,
};

export default conteudo;
