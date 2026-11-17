/* Ocean Talent Solutions · conteúdo fixo das propostas do modelo Ocean (serviços, rótulos, observações padrão).
   Port de _tmp_propostas_v2/src/content.js (zip de 11/2026). Um único conjunto de textos para todas as propostas.
   Diferença deliberada em relação ao zip: a nota de imposto NÃO tem "até"/"up to" — o {imposto} é o percentual
   gravado na proposta (imposto_percentual), preenchido por preencherImposto() na página. */
import type { Idioma, ServicoId, SetorId } from '../../../services/proposalApi';

export type LayoutServico = 'cols' | 'steps';

export interface BlocoLista {
  title: string;
  items: string[];
}

export interface TextosServico {
  title: string;
  tagline: string;
  text: string;
  // layout "cols": três colunas (o que / para que / como)
  cols?: BlocoLista[];
  // layout "steps": quadro de metodologia numerado
  steps?: BlocoLista[];
}

export interface NotasServico {
  // Observações de Investimento; podem conter {imposto}
  investimento: string[];
  // Observações de Garantias e condições
  garantias: string[];
}

export interface ServicoOcean {
  id: ServicoId;
  layout: LayoutServico;
  textos: Record<Idioma, TextosServico>;
  notas: Record<Idioma, NotasServico>;
}

export interface TextosUiOcean {
  docTitle: string;
  // Duas linhas da capa
  title: [string, string];
  for: string;
  date: string;
  consultant: string;
  method: string;
  scope: string;
  invest: string;
  rate: string;
  payment: string;
  notes: string;
  terms: string;
  shortlist: string;
  sla: string;
  guarantee: string;
  next: string;
  nextText: string;
  // {d} = data
  validUntil: string;
  accept: string;
  talk: string;
  pdf: string;
  phone: string;
  email: string;
  linkedin: string;
  site: string;
  contact: string;
  footer: string;
  types: Record<'retainer' | 'sucesso' | 'valor-fechado', string>;
  rateSub: string;
  payUpfront: string;
  payEnd: string;
  // {a} e {b} = percentuais
  paySplit: string;
  acceptTitle: string;
  acceptText: string;
  acceptConfirm: string;
  cancel: string;
  services: string;
  // {c} = cliente
  whats: string;
}

export interface SetorRotulos {
  chave: SetorId;
  rotulos: Record<Idioma, string>;
}

export const SETORES_ROTULOS: SetorRotulos[] = [
  {
    chave: 'oil-gas',
    rotulos: {
      'pt-BR': 'Petróleo & Gás',
      'en-US': 'Oil & Gas',
    },
  },
  {
    chave: 'energia',
    rotulos: {
      'pt-BR': 'Energia',
      'en-US': 'Energy',
    },
  },
  {
    chave: 'infraestrutura',
    rotulos: {
      'pt-BR': 'Infraestrutura',
      'en-US': 'Infrastructure',
    },
  },
  {
    chave: 'mineracao',
    rotulos: {
      'pt-BR': 'Mineração',
      'en-US': 'Mining',
    },
  },
  {
    chave: 'tecnologia',
    rotulos: {
      'pt-BR': 'Tecnologia',
      'en-US': 'Technology',
    },
  },
  {
    chave: 'industria-servicos',
    rotulos: {
      'pt-BR': 'Indústria & Serviços',
      'en-US': 'Industry & Services',
    },
  },
  {
    chave: 'outros',
    rotulos: {
      'pt-BR': 'Outros',
      'en-US': 'Other',
    },
  },
];

export const SERVICO_ORDER: ServicoId[] = [
  'inteligencia-de-mercado',
  'recrutamento-e-selecao',
  'assessment',
  'outplacement',
  'solucoes-personalizadas',
];

export const SERVICOS: Record<ServicoId, ServicoOcean> = {
  'inteligencia-de-mercado': {
    id: 'inteligencia-de-mercado',
    layout: 'cols',
    textos: {
      'pt-BR': {
        title: 'Inteligência de Mercado',
        tagline: 'Decisões sobre pessoas ficam mais seguras quando partem de dados do mercado.',
        text: 'Mapeamos empresas do seu setor e concorrentes para entender como elas se organizam, quanto pagam, que benefícios oferecem e quem são os profissionais que fazem a diferença em cada posição. Você recebe uma leitura clara do mercado para definir remuneração, desenhar estruturas e planejar a equipe, tenha ou não uma vaga aberta.',
        cols: [
          {
            title: 'O que mapeamos',
            items: ['Cargos e salários', 'Estruturas', 'Benefícios', 'Talentos estratégicos', 'Outros dados'],
          },
          {
            title: 'Para que serve',
            items: [
              'Definir faixas salariais e pacotes de benefícios',
              'Estruturar ou revisar cargos e organogramas',
              'Embasar decisões de contratação e de planejamento de equipe',
              'Entender como o mercado e os concorrentes se organizam',
              'Identificar profissionais-chave para posições futuras',
            ],
          },
          {
            title: 'Como mapeamos',
            items: ['Universo de empresas target', 'Hunting ativo', 'Entrevistas', 'Parecer executivo'],
          },
        ],
      },
      'en-US': {
        title: 'Market Intelligence',
        tagline: 'People decisions are safer when they start from market data.',
        text: 'We map companies in your sector and your competitors to understand how they are organized, what they pay, which benefits they offer and who the professionals are that make a difference in each position. You get a clear reading of the market to set compensation, design structures and plan your team, whether or not you have an open position.',
        cols: [
          {
            title: 'What we map',
            items: ['Positions and salaries', 'Structures', 'Benefits', 'Strategic talent', 'Other data'],
          },
          {
            title: 'What it is for',
            items: [
              'Setting salary ranges and benefit packages',
              'Structuring or reviewing positions and org charts',
              'Supporting hiring and workforce planning decisions',
              'Understanding how the market and competitors are organized',
              'Identifying key professionals for future positions',
            ],
          },
          {
            title: 'How we map',
            items: ['Universe of target companies', 'Active hunting', 'Interviews', 'Executive report'],
          },
        ],
      },
    },
    notas: {
      'pt-BR': {
        investimento: [
          'Valor mínimo de R$ 15.000,00 por projeto;',
          'Impostos ({imposto}) serão adicionados a todos os valores informados.',
        ],
        garantias: [
          'O cliente deverá reembolsar a Ocean se contratar candidatos apresentados em até 12 meses;',
          'Confidencialidade mútua;',
          'Dados agregados e anonimizados.',
        ],
      },
      'en-US': {
        investimento: [
          'Minimum fee of BRL 15,000.00 per project;',
          'Taxes ({imposto}) will be added to all amounts stated.',
        ],
        garantias: [
          'The client shall reimburse Ocean if it hires candidates presented within 12 months;',
          'Mutual confidentiality;',
          'Aggregated and anonymized data.',
        ],
      },
    },
  },
  'recrutamento-e-selecao': {
    id: 'recrutamento-e-selecao',
    layout: 'steps',
    textos: {
      'pt-BR': {
        title: 'Recrutamento e Seleção',
        tagline: 'Encontramos os profissionais que fazem a diferença, do especialista técnico ao C-level.',
        text: 'Nosso processo vai além da captação de currículos. Começamos entendendo a posição, a cultura e os desafios da sua empresa, buscamos ativamente os profissionais mais aderentes e avaliamos cada um em aspectos técnicos, comportamentais e de expectativas. Acompanhamos todas as etapas, das entrevistas à negociação, checamos referências e seguimos próximos nos primeiros meses do contratado, para que a contratação seja assertiva e duradoura.',
        steps: [
          {
            title: 'Alinhamento',
            items: [
              'Entendimento da posição e cultura do cliente',
              'Objetivos e desafios',
              'Motivo da contratação',
              'Definição do cronograma',
            ],
          },
          {
            title: 'Mapeamento',
            items: ['Universo de empresas target', 'Inteligência de mercado', 'Hunting ativo', 'Indicações'],
          },
          {
            title: 'Avaliação',
            items: [
              'Entrevistas',
              'Avaliação técnica e comportamental',
              'Alinhamento de expectativas',
              'Comparação entre os candidatos',
            ],
          },
          {
            title: 'Apresentação',
            items: ['Longlist', 'Shortlist', 'Dados estratégicos e parecer sobre os perfis selecionados'],
          },
          {
            title: 'Condução',
            items: [
              'Suporte nas entrevistas',
              'Checagem de referências',
              'Suporte na negociação salarial',
              'Proximidade dos candidatos e gestores',
            ],
          },
          {
            title: 'Onboarding',
            items: ['Monitoramento formal pelos 3 a 6 primeiros meses do profissional contratado'],
          },
        ],
      },
      'en-US': {
        title: 'Recruitment and Selection',
        tagline: 'We find the professionals who make a difference, from technical specialists to the C-level.',
        text: 'Our process goes beyond collecting résumés. We start by understanding the position, the culture and the challenges of your company, actively search for the best-fit professionals and assess each one on technical, behavioral and expectation aspects. We follow every stage, from interviews to negotiation, check references and stay close during the new hire\'s first months, so the hire is accurate and lasting.',
        steps: [
          {
            title: 'Alignment',
            items: [
              'Understanding the position and the client\'s culture',
              'Goals and challenges',
              'Reason for hiring',
              'Timeline definition',
            ],
          },
          {
            title: 'Mapping',
            items: ['Universe of target companies', 'Market intelligence', 'Active hunting', 'Referrals'],
          },
          {
            title: 'Assessment',
            items: [
              'Interviews',
              'Technical and behavioral assessment',
              'Expectation alignment',
              'Candidate comparison',
            ],
          },
          {
            title: 'Presentation',
            items: ['Longlist', 'Shortlist', 'Strategic data and assessment of the selected profiles'],
          },
          {
            title: 'Process management',
            items: [
              'Interview support',
              'Reference checks',
              'Salary negotiation support',
              'Close contact with candidates and managers',
            ],
          },
          {
            title: 'Onboarding',
            items: ['Formal follow-up during the new hire\'s first 3 to 6 months'],
          },
        ],
      },
    },
    notas: {
      'pt-BR': {
        investimento: [
          'Remuneração anual inclui 13º salário, adicional de férias e bônus (se aplicável). No modelo Retainer, a parcela inicial será calculada com base na remuneração estimada e a parcela final será calculada com base na remuneração praticada, descontando-se a parcela inicial;',
          'Valor mínimo de R$ 15.000,00 por projeto;',
          'Impostos ({imposto}) serão adicionados a todos os valores informados.',
        ],
        garantias: [
          'Prazo de garantia para reposição caso o candidato contratado deixe a empresa (sem custo adicional);',
          'A Ocean não abordará profissionais do cliente por 12 meses após a última posição atendida;',
          'O cliente deverá reembolsar a Ocean se contratar candidatos apresentados em até 12 meses.',
        ],
      },
      'en-US': {
        investimento: [
          'Annual compensation includes 13th salary, vacation bonus and bonus (if applicable). In the Retainer model, the initial installment is calculated on the estimated compensation and the final installment on the actual compensation, less the initial installment;',
          'Minimum fee of BRL 15,000.00 per project;',
          'Taxes ({imposto}) will be added to all amounts stated.',
        ],
        garantias: [
          'Guarantee period for replacement if the hired candidate leaves the company (at no additional cost);',
          'Ocean will not approach the client\'s employees for 12 months after the last position filled;',
          'The client shall reimburse Ocean if it hires candidates presented within 12 months.',
        ],
      },
    },
  },
  assessment: {
    id: 'assessment',
    layout: 'cols',
    textos: {
      'pt-BR': {
        title: 'Assessment',
        tagline: 'Avaliamos pessoas e estruturas para que decisões sobre o time sejam tomadas com clareza.',
        text: 'Analisamos profissionais da sua empresa ou candidatos externos, além de processos e estruturas organizacionais completas. O diagnóstico combina entrevistas e uma análise aprofundada, e termina em um parecer executivo que mostra pontos fortes, lacunas e caminhos. Ele apoia decisões de promoção, sucessão, contratação e reorganização, e ajuda a melhorar a performance.',
        cols: [
          {
            title: 'O que avaliamos',
            items: [
              'Profissionais internos',
              'Candidatos',
              'Lideranças',
              'Processos',
              'Estruturas organizacionais',
            ],
          },
          {
            title: 'Para que serve',
            items: [
              'Embasar promoções e sucessões',
              'Apoiar decisões de contratação',
              'Mapear potencial e prontidão do time',
              'Reorganizar áreas e estruturas',
              'Orientar planos de desenvolvimento e melhorar a performance',
            ],
          },
          {
            title: 'Como avaliamos',
            items: [
              'Alinhamento com o cliente',
              'Diagnóstico',
              'Entrevistas',
              'Aplicação de testes',
              'Parecer executivo',
            ],
          },
        ],
      },
      'en-US': {
        title: 'Assessment',
        tagline: 'We assess people and structures so that team decisions are made with clarity.',
        text: 'We analyze your company\'s professionals or external candidates, as well as complete processes and organizational structures. The diagnosis combines interviews and an in-depth analysis, and ends in an executive report that shows strengths, gaps and paths forward. It supports promotion, succession, hiring and reorganization decisions, and helps improve performance.',
        cols: [
          {
            title: 'What we assess',
            items: ['Internal professionals', 'Candidates', 'Leaders', 'Processes', 'Organizational structures'],
          },
          {
            title: 'What it is for',
            items: [
              'Supporting promotions and succession',
              'Supporting hiring decisions',
              'Mapping team potential and readiness',
              'Reorganizing areas and structures',
              'Guiding development plans and improving performance',
            ],
          },
          {
            title: 'How we assess',
            items: [
              'Alignment with the client',
              'Diagnosis',
              'Interviews',
              'Assessment tests',
              'Executive report',
            ],
          },
        ],
      },
    },
    notas: {
      'pt-BR': {
        investimento: [
          'Valor mínimo de R$ 10.000,00 por projeto;',
          'Impostos ({imposto}) serão adicionados a todos os valores informados.',
        ],
        garantias: [],
      },
      'en-US': {
        investimento: [
          'Minimum fee of BRL 10,000.00 per project;',
          'Taxes ({imposto}) will be added to all amounts stated.',
        ],
        garantias: [],
      },
    },
  },
  outplacement: {
    id: 'outplacement',
    layout: 'steps',
    textos: {
      'pt-BR': {
        title: 'Outplacement',
        tagline: 'Conduzimos desligamentos com responsabilidade e preparamos o profissional para o próximo passo da carreira.',
        text: 'Programa individual de até 6 meses, com 8 sessões divididas em três etapas: entender quem ele é e o que busca, se posicionar para o mercado e partir para as oportunidades. As sessões possuem duração de 1 hora e seguem o ritmo de cada pessoa, com atividades entre os encontros, porque é na prática que a transição acontece. Para a empresa, é uma forma de cuidar de quem sai e preservar a confiança de quem fica.',
        steps: [
          {
            title: 'Pensa',
            items: [
              'Diagnóstico de trajetória e empregabilidade',
              'Perfil comportamental (DISC)',
              'Roda de competências',
              'Definição do objetivo',
            ],
          },
          {
            title: 'Planeja',
            items: ['Análise SWOT', 'Currículo e LinkedIn', 'Pitch pessoal', 'Simulação de entrevistas'],
          },
          {
            title: 'Pratica',
            items: [
              'Networking com empresas target',
              'Contato com headhunters',
              'Negociação de propostas',
              'Plano de desenvolvimento',
            ],
          },
        ],
      },
      'en-US': {
        title: 'Outplacement',
        tagline: 'We handle departures responsibly and prepare professionals for their next career step.',
        text: 'An individual program of up to 6 months, with 8 sessions in three stages: understanding who they are and what they want, positioning themselves for the market and going after opportunities. Sessions last 1 hour and follow each person\'s pace, with activities between meetings, because transition happens in practice. For the company, it is a way to take care of those who leave and preserve the trust of those who stay.',
        steps: [
          {
            title: 'Think',
            items: [
              'Career path and employability diagnosis',
              'Behavioral profile (DISC)',
              'Competency wheel',
              'Goal setting',
            ],
          },
          {
            title: 'Plan',
            items: ['SWOT analysis', 'Résumé and LinkedIn', 'Personal pitch', 'Mock interviews'],
          },
          {
            title: 'Act',
            items: [
              'Networking with target companies',
              'Contact with headhunters',
              'Offer negotiation',
              'Development plan',
            ],
          },
        ],
      },
    },
    notas: {
      'pt-BR': {
        investimento: [
          'Valor mínimo de R$ 10.000,00 por projeto;',
          'Impostos ({imposto}) serão adicionados a todos os valores informados.',
        ],
        garantias: [],
      },
      'en-US': {
        investimento: [
          'Minimum fee of BRL 10,000.00 per project;',
          'Taxes ({imposto}) will be added to all amounts stated.',
        ],
        garantias: [],
      },
    },
  },
  'solucoes-personalizadas': {
    id: 'solucoes-personalizadas',
    layout: 'cols',
    textos: {
      'pt-BR': {
        title: 'Soluções Personalizadas',
        tagline: 'Cada empresa tem um desafio único, e nem todo desafio cabe em um serviço padrão.',
        text: 'Desenvolvemos treinamentos e soluções sob medida para demandas específicas de RH. Partimos de um entendimento profundo do seu contexto, desenhamos a estratégia junto com a sua equipe e conduzimos a execução com foco em resultado.',
        cols: [
          {
            title: 'O que desenvolvemos',
            items: ['Treinamentos', 'Desenvolvimento de pessoas e lideranças', 'Projetos sob medida de RH'],
          },
          {
            title: 'Para que serve',
            items: [
              'Capacitar equipes e lideranças',
              'Resolver desafios específicos de pessoas',
              'Apoiar mudanças e reestruturações',
              'Complementar a atuação do RH interno',
            ],
          },
          {
            title: 'Como desenvolvemos',
            items: [
              'Diagnóstico da demanda',
              'Proposta sob medida',
              'Execução e acompanhamento',
              'Avaliação dos resultados',
            ],
          },
        ],
      },
      'en-US': {
        title: 'Custom Solutions',
        tagline: 'Every company has a unique challenge, and not every challenge fits a standard service.',
        text: 'We develop training programs and tailored solutions for specific HR needs. We start from a deep understanding of your context, design the strategy together with your team and lead the execution with a focus on results.',
        cols: [
          {
            title: 'What we develop',
            items: ['Training programs', 'People and leadership development', 'Tailored HR projects'],
          },
          {
            title: 'What it is for',
            items: [
              'Building team and leadership capabilities',
              'Solving specific people challenges',
              'Supporting change and restructuring',
              'Complementing the in-house HR team',
            ],
          },
          {
            title: 'How we develop',
            items: ['Needs diagnosis', 'Tailored proposal', 'Execution and follow-up', 'Results evaluation'],
          },
        ],
      },
    },
    notas: {
      'pt-BR': {
        investimento: [
          'Valor mínimo de R$ 10.000,00 por projeto;',
          'Impostos ({imposto}) serão adicionados a todos os valores informados.',
        ],
        garantias: [],
      },
      'en-US': {
        investimento: [
          'Minimum fee of BRL 10,000.00 per project;',
          'Taxes ({imposto}) will be added to all amounts stated.',
        ],
        garantias: [],
      },
    },
  },
};

export const UI: Record<Idioma, TextosUiOcean> = {
  'pt-BR': {
    docTitle: 'Proposta Comercial Ocean',
    title: ['Proposta', 'Comercial'],
    for: 'Preparada para',
    date: 'Data',
    consultant: 'Consultor',
    method: 'Metodologia',
    scope: 'Escopo do projeto',
    invest: 'Investimento',
    rate: 'Taxa',
    payment: 'Forma de pagamento',
    notes: 'Observações',
    terms: 'Garantias e condições',
    shortlist: 'Shortlist',
    sla: 'SLA',
    guarantee: 'Garantia',
    next: 'Vamos avançar?',
    nextText: 'Agradecemos o seu interesse e nos colocamos à disposição para eventuais esclarecimentos ou negociações. Esperamos desenvolver uma parceria de longo prazo!',
    validUntil: 'Esta proposta é válida até {d}.',
    accept: 'Aceitar proposta',
    talk: 'Falar com o consultor',
    pdf: 'Baixar PDF',
    phone: 'Telefone',
    email: 'E-mail',
    linkedin: 'LinkedIn',
    site: 'Site',
    contact: 'Contato',
    footer: 'Proposta comercial',
    types: {
      retainer: 'Retainer',
      sucesso: 'Sucesso',
      'valor-fechado': 'Valor fechado',
    },
    rateSub: 'sobre a remuneração anual',
    payUpfront: '100% antecipado',
    payEnd: '100% após conclusão',
    paySplit: '{a}% de entrada + {b}% após conclusão',
    acceptTitle: 'Aceitar proposta',
    acceptText: 'Ao confirmar, registramos o aceite da proposta comercial e encaminhamos você para o contrato.',
    acceptConfirm: 'Confirmar aceite',
    cancel: 'Cancelar',
    services: 'Serviços',
    whats: 'Olá, gostaria de falar sobre a proposta comercial da Ocean Talent Solutions para a {c}.',
  },
  'en-US': {
    docTitle: 'Ocean Commercial Proposal',
    title: ['Commercial', 'Proposal'],
    for: 'Prepared for',
    date: 'Date',
    consultant: 'Consultant',
    method: 'Methodology',
    scope: 'Project scope',
    invest: 'Investment',
    rate: 'Fee',
    payment: 'Payment terms',
    notes: 'Notes',
    terms: 'Guarantees and terms',
    shortlist: 'Shortlist',
    sla: 'SLA',
    guarantee: 'Guarantee',
    next: 'Shall we move forward?',
    nextText: 'Thank you for your interest. We remain available for any questions or negotiations and look forward to building a long-term partnership.',
    validUntil: 'This proposal is valid until {d}.',
    accept: 'Accept proposal',
    talk: 'Talk to the consultant',
    pdf: 'Download PDF',
    phone: 'Phone',
    email: 'E-mail',
    linkedin: 'LinkedIn',
    site: 'Website',
    contact: 'Contact',
    footer: 'Commercial proposal',
    types: {
      retainer: 'Retainer',
      sucesso: 'Success fee',
      'valor-fechado': 'Fixed fee',
    },
    rateSub: 'of annual compensation',
    payUpfront: '100% upfront',
    payEnd: '100% upon completion',
    paySplit: '{a}% upfront + {b}% upon completion',
    acceptTitle: 'Accept proposal',
    acceptText: 'When you confirm, we record your acceptance of this commercial proposal and send you to the contract.',
    acceptConfirm: 'Confirm acceptance',
    cancel: 'Cancel',
    services: 'Services',
    whats: 'Hello, I would like to talk about Ocean Talent Solutions\' commercial proposal for {c}.',
  },
};

/* ---------- helpers ---------- */

export function ehServicoId(valor: unknown): valor is ServicoId {
  return typeof valor === 'string' && valor in SERVICOS;
}

/** Mantém só ids válidos, sem repetição, na ordem canônica da apresentação. */
export function ordenarServicos(ids: readonly unknown[] | null | undefined): ServicoId[] {
  const validos = new Set((ids ?? []).filter(ehServicoId));
  return SERVICO_ORDER.filter((id) => validos.has(id));
}

export function rotuloSetorIdioma(chave: string | null | undefined, idioma: Idioma): string {
  return SETORES_ROTULOS.find((s) => s.chave === chave)?.rotulos[idioma] ?? (chave || '—');
}

const RE_MINIMO = /^(Valor mínimo|Minimum fee)/;
const RE_IMPOSTO = /^(Impostos|Taxes)/;

/**
 * Observações padrão para os serviços escolhidos (equivale a defaultNotes() do app.html do zip):
 * junta as notas dos serviços sem repetir, mantém só o MAIOR valor mínimo e deixa a linha de impostos por último.
 * Os textos continuam com {imposto}: use preencherImposto() ao exibir.
 */
export function observacoesPadrao(
  servicos: readonly ServicoId[],
  idioma: Idioma,
): { investimento: string[]; garantias: string[] } {
  const investimento: string[] = [];
  const garantias: string[] = [];
  let linhaMinimo: string | null = null;
  let valorMinimo = -1;
  let linhaImposto: string | null = null;

  for (const id of servicos) {
    const notas = SERVICOS[id]?.notas[idioma];
    if (!notas) continue;
    for (const nota of notas.investimento) {
      if (RE_MINIMO.test(nota)) {
        const valor = Number(nota.replace(/[^\d]/g, ''));
        if (valor > valorMinimo) {
          valorMinimo = valor;
          linhaMinimo = nota;
        }
        continue;
      }
      if (RE_IMPOSTO.test(nota)) {
        linhaImposto = nota;
        continue;
      }
      if (!investimento.includes(nota)) investimento.push(nota);
    }
    for (const nota of notas.garantias) {
      if (!garantias.includes(nota)) garantias.push(nota);
    }
  }
  if (linhaMinimo) investimento.push(linhaMinimo);
  if (linhaImposto) investimento.push(linhaImposto);
  return { investimento, garantias };
}

/** Substitui {imposto} (ex.: "18,75%") em uma observação; outros {marcadores} ficam como estão. */
export function preencherImposto(texto: string, imposto: string): string {
  return texto.replace(/\{imposto\}/g, imposto);
}

/** Substitui {chave} por valores do mapa (datas, percentuais, nome do cliente). */
export function preencherTexto(texto: string, valores: Record<string, string>): string {
  return texto.replace(/\{(\w+)\}/g, (m, k: string) => (k in valores ? valores[k] : m));
}
