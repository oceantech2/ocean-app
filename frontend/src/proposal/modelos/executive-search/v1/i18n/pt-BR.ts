import type { TextosES } from './tipos';

const textos: TextosES = {
  pagina: {
    titulo: 'Proposta comercial — Ocean Talent Solutions',
    lang: 'pt-BR',
    navegacao: 'Seções',
  },
  capa: {
    titulo: ['Proposta', 'Comercial'],
    preparadaPara: 'Preparada para',
    data: 'Data',
    consultor: 'Consultor',
    atualizadaEm: (data) => `Atualizada em ${data}`,
    logoAlt: 'Ocean Talent Solutions — Executive Search',
  },
  nav: {
    servico: 'Serviço',
    metodologia: 'Metodologia',
    escopo: 'Escopo do Projeto',
    investimento: 'Investimento',
    garantias: 'Garantias e condições',
    contato: 'Contato',
  },
  servico: {
    tituloDivisao: 'Executive Search',
    texto:
      'Desenvolvemos inteligência de mercado e encontramos os profissionais que fazem a diferença, do especialista ' +
      'técnico ao C-level. Nosso processo vai além da captação de currículos: mapeamos o mercado ativamente, abordamos ' +
      'os profissionais mais aderentes ao desafio da sua empresa, checamos referências e mitigamos riscos de ' +
      'engajamento, garantindo uma contratação assertiva.',
  },
  metodologia: {
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
  investimento: {
    taxa: 'Taxa',
    pagamento: 'Forma de pagamento',
    tipos: { retainer: 'Retainer', sucesso: 'Sucesso', 'valor-fechado': 'Valor fechado' },
    comEntrada: (entrada, final) => `${entrada}% de entrada + ${final}% após conclusão`,
    semEntrada: '100% após conclusão',
    observacoesTitulo: 'Observações',
    observacoes: [
      'Remuneração anual inclui 13º salário, adicional de férias e bônus (se aplicável);',
      'A parcela inicial será calculada com base na remuneração estimada. A parcela final será calculada com base ' +
        'na remuneração praticada, descontando-se a parcela inicial;',
      'Valor mínimo de R$ 15.000,00 por projeto;',
      'Impostos (até 19,55%) serão adicionados a todos os valores informados.',
    ],
  },
  garantias: {
    shortlist: 'Shortlist:',
    shortlistValor: '3 a 5 candidatos',
    sla: 'SLA:',
    slaValor: '5 a 10 dias úteis',
    garantia: 'Garantia:',
    meses: (n) => (n === 1 ? '1 mês' : `${n} meses`),
    observacoes: [
      'Prazo de garantia para reposição caso o candidato contratado deixe a empresa (sem custo adicional);',
      'A Ocean não abordará profissionais do cliente por 12 meses após a última posição atendida;',
      'O cliente deverá reembolsar a Ocean se contratar candidatos apresentados em até 12 meses.',
    ],
  },
  proximos: {
    titulo: 'Vamos avançar?',
    texto:
      'Agradecemos o seu interesse e nos colocamos à disposição para eventuais esclarecimentos ou negociações. ' +
      'Esperamos desenvolver uma parceria de longo prazo!',
    validadeAte: (data) => `Esta proposta é válida até ${data}.`,
    aceitaEm: (data, hora, nome) => `Proposta aceita em ${data} às ${hora} por ${nome}.`,
    aceitar: 'Aceitar proposta',
    falarConsultor: 'Falar com o consultor',
    baixarPdf: 'Baixar PDF',
  },
  contato: { telefone: 'Telefone', email: 'E-mail', linkedin: 'LinkedIn', site: 'Site' },
  rodape: { texto: (data) => `Ocean Talent Solutions · Proposta comercial · ${data}` },
  aceite: {
    titulo: 'Aceitar proposta',
    texto: 'Ao confirmar, registramos o aceite da proposta comercial e encaminhamos você para o contrato.',
    nome: 'Nome completo',
    email: 'E-mail',
    declaracao: 'Li e aceito os termos desta proposta',
    confirmar: 'Confirmar aceite',
    cancelar: 'Cancelar',
    fechar: 'Fechar',
    erroNome: 'Informe o nome completo',
    erroEmail: 'E-mail inválido',
    erroAceite: 'É necessário aceitar os termos da proposta',
    sucesso: 'Aceite registrado. Nossa equipe enviará o contrato em breve.',
    erro: 'Erro: não foi possível registrar o aceite. Tente novamente ou fale com o consultor.',
    versaoAtualizada: 'Esta proposta foi atualizada. Revise os dados e assine novamente.',
  },
  whatsapp: {
    mensagem: (cliente) => `Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a ${cliente}.`,
  },
  pdf: { nomeArquivo: (cliente) => `Proposta Comercial Ocean${cliente ? ` - ${cliente}` : ''}` },
};

export default textos;
