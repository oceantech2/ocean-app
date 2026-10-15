import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: {
    src: '/propostas/outsourcing/logo-divisao.png',
    alt: 'Ocean Talent Solutions — Outsourcing',
    largura: 242,
  },
  tituloDivisao: 'Outsourcing',
  textoServico: [
    'Solução ideal para empresas que precisam de profissionais qualificados, mas não querem assumir diretamente ' +
      'toda a estrutura trabalhista, administrativa e operacional relacionada à contratação.',
    'Recrutamos, contratamos e alocamos o profissional certo dentro da sua operação, e cuidamos de toda a gestão ' +
      'de backoffice (folha, benefícios, encargos e conformidade trabalhista) enquanto a sua empresa foca apenas no ' +
      'resultado da área.',
  ],
  secaoMeio: {
    tipo: 'metodologia',
    id: 'beneficios',
    titulo: 'Benefícios',
    passos: [
      {
        titulo: 'Flexibilidade de estrutura',
        itens: [
          'Sem aumento permanente de quadro',
          'Contrato encerra com o projeto',
          'Sem gestão direta de desligamentos',
        ],
      },
      {
        titulo: 'Transferência da operação trabalhista',
        itens: ['Admissão, folha e 13º', 'FGTS, INSS e benefícios', 'Documentação e rescisão'],
      },
      {
        titulo: 'Velocidade para contratar',
        itens: [
          'Estrutura jurídica e de RH prontas',
          'Recrutamento e contratos ágeis',
          'Profissional alocado rapidamente',
        ],
      },
      {
        titulo: 'Gestão de headcount',
        itens: ['Não impacta headcount próprio', 'Reduz aprovações corporativas'],
      },
      {
        titulo: 'Custo fixo vira custo por demanda',
        itens: [
          'Pagamento vinculado à necessidade',
          'Ideal para projetos e sazonalidade',
          'Aplicável a TI, engenharia e diversas áreas',
        ],
      },
    ],
  },
  tituloEscopo: 'Escopo',
  observacoesInvestimento: [
    'Remuneração anual inclui 13º salário, adicional de férias e bônus (se aplicável). No modelo Retainer, a ' +
      'parcela inicial será calculada com base na remuneração estimada e a parcela final será calculada com base ' +
      'na remuneração praticada, descontando-se a parcela inicial;',
    'Valor mínimo de R$ 15.000,00 por projeto;',
  ],
  observacaoImpostos: (percentual) => `Impostos (até ${percentual}%) serão adicionados a todos os valores informados.`,
  observacoesGarantias: [
    'Prazo de garantia para reposição caso o candidato contratado deixe a empresa (sem custo adicional);',
    'A Ocean não abordará profissionais do cliente por 12 meses após a última posição atendida;',
    'O cliente deverá reembolsar a Ocean se contratar candidatos apresentados em até 12 meses.',
  ],
  garantiasSempreVisivel: true,
};

export default conteudo;
