import type { ConteudoDivisao } from '../../../pagina/i18n/tipos';

const conteudo: ConteudoDivisao = {
  logo: {
    src: '/propostas/offshore-talent/logo-divisao.png',
    alt: 'Ocean Talent Solutions — Offshore Talent',
    largura: 240,
  },
  tituloDivisao: 'Offshore Talent',
  textoServico: [
    'A frota de apoio offshore em águas brasileiras já soma mais de 460 embarcações, e a Petrobras estruturou a ' +
      'contratação de cerca de 200 novas unidades até 2028, volume que intensifica ainda mais a disputa por ' +
      'tripulantes certificados e disponíveis.',
    'Atuamos no recrutamento técnico de toda a hierarquia de bordo, das funções de convés e máquinas às operações ' +
      'offshore especializadas, entregando profissionais com certificação em dia, experiência de embarque ' +
      'compatível e aderência à escala de cada operação.',
  ],
  secaoMeio: {
    tipo: 'metodologia',
    id: 'areas-cargos',
    titulo: 'Áreas e cargos',
    passos: [
      {
        titulo: 'Marítimo & Náutica',
        itens: ['Comandante', 'Imediato', 'Oficial de Náutica (1º, 2º e 3º)', 'Contramestre', 'Entre outros'],
      },
      {
        titulo: 'Máquinas & Engenharia',
        itens: [
          'Chefe de Máquinas',
          'Oficial de Máquinas (1º, 2º e 3º)',
          'Supervisor de Manutenção',
          'Reliability Engineer',
          'Entre outros',
        ],
      },
      {
        titulo: 'Subsea & ROV',
        itens: ['DPO', 'Supervisor de ROV', 'Piloto de ROV', 'Engenheiro Subsea', 'Entre outros'],
      },
      {
        titulo: 'Drilling',
        itens: ['OIM', 'Drilling Supervisor', 'Rigging Manager', 'Directional Driller', 'Entre outros'],
      },
      {
        titulo: 'HSEQ & Projects',
        itens: [
          'Superintendente de HSE',
          'Gerente de Qualidade',
          'Process Safety Engineer',
          'Construction Manager',
          'Entre outros',
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
