import type { ComponentType } from 'react';
import {
  IconeInteligenciaMercado,
  IconeRecrutamento,
  IconeAssessment,
  IconeOutplacement,
  IconeSolucoesPersonalizadas,
  type IconeProps,
} from '../icones';
import type { Idioma, Txt } from '../idioma';

type Icone = ComponentType<IconeProps>;

const MENSAGEM_WHATSAPP: Txt = {
  pt: 'Olá! Vim pelo site da Ocean e gostaria de saber mais.',
  en: "Hi! I came from Ocean's website and would like to know more.",
};

export const CONTATO = {
  telefone: '+ 55 21 97554-0224',
  telefoneLink: 'tel:+5521975540224',
  email: 'contato@oceantalentsolutions.com',
  linkedin: 'https://www.linkedin.com/company/ocean-talent-solutions/',
  whatsapp: (idioma: Idioma) => `https://wa.me/5521975540224?text=${encodeURIComponent(MENSAGEM_WHATSAPP[idioma])}`,
};

export const NUMEROS: { valor: string; rotulo: Txt }[] = [
  { valor: '500+', rotulo: { pt: 'Projetos conduzidos', en: 'Projects conducted' } },
  { valor: '18+', rotulo: { pt: 'Anos de mercado', en: 'Years in the market' } },
  { valor: 'Boutique', rotulo: { pt: 'Atendimento premium', en: 'Premium service' } },
];

export type IdSolucao =
  | 'inteligencia-de-mercado'
  | 'recrutamento-e-selecao'
  | 'assessment'
  | 'outplacement'
  | 'solucoes-personalizadas';

export const HASH_LISTA_SOLUCOES = 'solucoes-lista';

export const HASH_SOLUCAO: Record<IdSolucao, string> = {
  'inteligencia-de-mercado': 'solution-panel-inteligencia-de-mercado',
  'recrutamento-e-selecao': 'solution-panel-recrutamento-e-selecao',
  'assessment': 'solution-panel-assessment',
  'outplacement': 'solution-panel-outplacement',
  'solucoes-personalizadas': 'solution-panel-solucoes-personalizadas',
};

/** Hashes antigos do site → solução atual. */
export const HASH_SOLUCAO_LEGADO: Record<string, IdSolucao> = {
  'executive-search': 'recrutamento-e-selecao',
  offshore: 'recrutamento-e-selecao',
  'offshore-talent': 'recrutamento-e-selecao',
  outsourcing: 'solucoes-personalizadas',
  development: 'outplacement',
  'development-outplacement': 'outplacement',
};

export const ICONE_SOLUCAO: Record<IdSolucao, Icone> = {
  'inteligencia-de-mercado': IconeInteligenciaMercado,
  'recrutamento-e-selecao': IconeRecrutamento,
  'assessment': IconeAssessment,
  'outplacement': IconeOutplacement,
  'solucoes-personalizadas': IconeSolucoesPersonalizadas,
};

export interface EtapaSolucao {
  numero?: string;
  titulo: Txt;
  itens: Record<Idioma, string[]>;
}

export interface Solucao {
  id: IdSolucao;
  titulo: Txt;
  lead: Txt;
  short: Txt;
  texto: Txt;
  rotuloEtapas?: Txt;
  etapas: EtapaSolucao[];
}

export const SOLUCOES: Solucao[] = [
  {
    id: 'inteligencia-de-mercado',
    titulo: { pt: "Inteligência de Mercado", en: "Market Intelligence" },
    lead: { pt: "Decisões sobre pessoas ficam mais seguras quando partem de dados do mercado.", en: "People decisions are safer when they start from market data." },
    short: { pt: "Mapeamento de dados estratégicos para decisões de capital humano", en: "Strategic data mapping for human capital decisions" },
    texto: { pt: "Mapeamos empresas do seu setor e concorrentes para entender como elas se organizam, quanto pagam, que benefícios oferecem e quem são os profissionais que fazem a diferença em cada posição. Você recebe uma leitura clara do mercado para definir remuneração, desenhar estruturas e planejar a equipe, tenha ou não uma vaga aberta.", en: "We map companies in your sector and competitors to understand how they are organized, what they pay, which benefits they offer and who the professionals are that make a difference in each role. You get a clear reading of the market to set compensation, design structures and plan the team — whether or not you have an open role." },
    etapas: [
      {
        titulo: { pt: "O que mapeamos", en: "What we map" },
        itens: {
          pt: ["Cargos e salários", "Estruturas", "Benefícios", "Talentos estratégicos", "Outros dados"],
          en: ["Roles and salaries", "Structures", "Benefits", "Strategic talent", "Other data"],
        },
      },
      {
        titulo: { pt: "Para que serve", en: "What it is for" },
        itens: {
          pt: ["Definir faixas salariais e pacotes de benefícios", "Estruturar ou revisar cargos e organogramas", "Embasar decisões de contratação e de planejamento de equipe", "Entender como o mercado e os concorrentes se organizam", "Identificar profissionais-chave para posições futuras"],
          en: ["Define salary bands and benefit packages", "Structure or review roles and org charts", "Support hiring and workforce planning decisions", "Understand how the market and competitors are organized", "Identify key professionals for future positions"],
        },
      },
      {
        titulo: { pt: "Como mapeamos", en: "How we map" },
        itens: {
          pt: ["Universo de empresas target", "Hunting ativo", "Entrevistas", "Parecer executivo"],
          en: ["Universe of target companies", "Active hunting", "Interviews", "Executive report"],
        },
      },
    ],
  },
  {
    id: 'recrutamento-e-selecao',
    titulo: { pt: "Recrutamento e Seleção", en: "Recruitment and Selection" },
    lead: { pt: "Encontramos os profissionais que fazem a diferença, do especialista técnico ao C-level.", en: "We find the professionals who make the difference, from technical specialists to C-level." },
    short: { pt: "Para lideranças e posições estratégicas (onshore e offshore)", en: "For leadership and strategic positions (onshore and offshore)" },
    texto: { pt: "Nosso processo vai além da captação de currículos. Começamos entendendo a posição, a cultura e os desafios da sua empresa, buscamos ativamente os profissionais mais aderentes e avaliamos cada um em aspectos técnicos, comportamentais e de expectativas. Acompanhamos todas as etapas, das entrevistas à negociação, checamos referências e seguimos próximos nos primeiros meses do contratado, para que a contratação seja assertiva e duradoura.", en: "Our process goes beyond collecting résumés. We start by understanding the role, culture and challenges of your company, actively seek the most aligned professionals and assess each one on technical, behavioral and expectation aspects. We support every stage, from interviews to negotiation, check references and stay close in the first months after hire, so the placement is assertive and lasting." },
    rotuloEtapas: { pt: "Metodologia", en: "Methodology" },
    etapas: [
      {
        numero: "01",
        titulo: { pt: "Alinhamento", en: "Alignment" },
        itens: {
          pt: ["Entendimento da posição e cultura do cliente", "Objetivos e desafios", "Motivo da contratação", "Definição do cronograma"],
          en: ["Understanding of the client's position and culture", "Objectives and challenges", "Reason for hiring", "Timeline definition"],
        },
      },
      {
        numero: "02",
        titulo: { pt: "Mapeamento", en: "Mapping" },
        itens: {
          pt: ["Universo de empresas target", "Inteligência de mercado", "Hunting ativo", "Indicações"],
          en: ["Universe of target companies", "Market intelligence", "Active hunting", "Referrals"],
        },
      },
      {
        numero: "03",
        titulo: { pt: "Avaliação", en: "Assessment" },
        itens: {
          pt: ["Entrevistas", "Avaliação técnica e comportamental", "Alinhamento de expectativas", "Comparação entre os candidatos"],
          en: ["Interviews", "Technical and behavioral assessment", "Expectation alignment", "Comparison between candidates"],
        },
      },
      {
        numero: "04",
        titulo: { pt: "Apresentação", en: "Presentation" },
        itens: {
          pt: ["Longlist", "Shortlist", "Dados estratégicos e parecer sobre os perfis selecionados"],
          en: ["Longlist", "Shortlist", "Strategic data and opinion on the selected profiles"],
        },
      },
      {
        numero: "05",
        titulo: { pt: "Condução", en: "Process management" },
        itens: {
          pt: ["Suporte nas entrevistas", "Checagem de referências", "Suporte na negociação salarial", "Proximidade dos candidatos e gestores"],
          en: ["Interview support", "Reference checks", "Salary negotiation support", "Proximity between candidates and managers"],
        },
      },
      {
        numero: "06",
        titulo: { pt: "Onboarding", en: "Onboarding" },
        itens: {
          pt: ["Monitoramento formal pelos 3 a 6 primeiros meses do profissional contratado"],
          en: ["Formal monitoring during the hired professional's first 3 to 6 months"],
        },
      },
    ],
  },
  {
    id: 'assessment',
    titulo: { pt: "Assessment", en: "Assessment" },
    lead: { pt: "Avaliamos pessoas e estruturas para que decisões sobre o time sejam tomadas com clareza.", en: "We assess people and structures so team decisions are made with clarity." },
    short: { pt: "Diagnóstico de talentos e competências com parecer executivo", en: "Talent and competency diagnosis with an executive report" },
    texto: { pt: "Analisamos profissionais da sua empresa ou candidatos externos, além de processos e estruturas organizacionais completas. O diagnóstico combina entrevistas e uma análise aprofundada, e termina em um parecer executivo que mostra pontos fortes, lacunas e caminhos. Ele apoia decisões de promoção, sucessão, contratação e reorganização, e ajuda a melhorar a performance.", en: "We analyze professionals in your company or external candidates, as well as complete organizational processes and structures. The diagnosis combines interviews and in-depth analysis, and ends in an executive report that shows strengths, gaps and paths forward. It supports promotion, succession, hiring and reorganization decisions, and helps improve performance." },
    etapas: [
      {
        titulo: { pt: "O que avaliamos", en: "What we assess" },
        itens: {
          pt: ["Profissionais internos", "Candidatos", "Lideranças", "Processos", "Estruturas organizacionais"],
          en: ["Internal professionals", "Candidates", "Leadership", "Processes", "Organizational structures"],
        },
      },
      {
        titulo: { pt: "Para que serve", en: "What it is for" },
        itens: {
          pt: ["Embasar promoções e sucessões", "Apoiar decisões de contratação", "Mapear potencial e prontidão do time", "Reorganizar áreas e estruturas", "Orientar planos de desenvolvimento e melhorar a performance"],
          en: ["Support promotions and succession", "Support hiring decisions", "Map team potential and readiness", "Reorganize areas and structures", "Guide development plans and improve performance"],
        },
      },
      {
        titulo: { pt: "Como avaliamos", en: "How we assess" },
        itens: {
          pt: ["Alinhamento com o cliente", "Diagnóstico", "Entrevistas", "Aplicação de testes", "Parecer executivo"],
          en: ["Alignment with the client", "Diagnosis", "Interviews", "Testing", "Executive report"],
        },
      },
    ],
  },
  {
    id: 'outplacement',
    titulo: { pt: "Outplacement", en: "Outplacement" },
    lead: { pt: "Conduzimos desligamentos com responsabilidade e preparamos o profissional para o próximo passo da carreira.", en: "We conduct offboarding responsibly and prepare the professional for the next career step." },
    short: { pt: "Desligamento humanizado e preparação para o próximo passo de carreira", en: "Humanized offboarding and preparation for the next career step" },
    texto: { pt: "Programa individual de até 6 meses, com 8 sessões divididas em três etapas: entender quem ele é e o que busca, se posicionar para o mercado e partir para as oportunidades. As sessões possuem duração de 1 hora e seguem o ritmo de cada pessoa, com atividades entre os encontros, porque é na prática que a transição acontece. Para a empresa, é uma forma de cuidar de quem sai e preservar a confiança de quem fica.", en: "An individual program of up to 6 months, with 8 sessions in three stages: understanding who they are and what they want, positioning for the market and moving into opportunities. Sessions last 1 hour and follow each person's pace, with activities between meetings, because transition happens in practice. For the company, it is a way to care for those who leave and preserve the trust of those who stay." },
    rotuloEtapas: { pt: "Metodologia", en: "Methodology" },
    etapas: [
      {
        numero: "01",
        titulo: { pt: "Pensa", en: "Think" },
        itens: {
          pt: ["Diagnóstico de trajetória e empregabilidade", "Perfil comportamental (DISC)", "Roda de competências", "Definição do objetivo"],
          en: ["Career and employability diagnosis", "Behavioral profile (DISC)", "Competency wheel", "Goal definition"],
        },
      },
      {
        numero: "02",
        titulo: { pt: "Planeja", en: "Plan" },
        itens: {
          pt: ["Análise SWOT", "Currículo e LinkedIn", "Pitch pessoal", "Simulação de entrevistas"],
          en: ["SWOT analysis", "Résumé and LinkedIn", "Personal pitch", "Interview simulation"],
        },
      },
      {
        numero: "03",
        titulo: { pt: "Pratica", en: "Practice" },
        itens: {
          pt: ["Networking com empresas target", "Contato com headhunters", "Negociação de propostas", "Plano de desenvolvimento"],
          en: ["Networking with target companies", "Contact with headhunters", "Offer negotiation", "Development plan"],
        },
      },
    ],
  },
  {
    id: 'solucoes-personalizadas',
    titulo: { pt: "Soluções Personalizadas", en: "Customized Solutions" },
    lead: { pt: "Cada empresa tem um desafio único, e nem todo desafio cabe em um serviço padrão.", en: "Every company has a unique challenge, and not every challenge fits a standard service." },
    short: { pt: "Treinamentos e soluções sob medida para demandas específicas de RH", en: "Training and tailored solutions for specific HR needs" },
    texto: { pt: "Desenvolvemos treinamentos e soluções sob medida para demandas específicas de RH. Partimos de um entendimento profundo do seu contexto, desenhamos a estratégia junto com a sua equipe e conduzimos a execução com foco em resultado.", en: "We develop training and tailored solutions for specific HR demands. We start from a deep understanding of your context, design the strategy with your team and run the execution with a focus on results." },
    etapas: [
      {
        titulo: { pt: "O que desenvolvemos", en: "What we develop" },
        itens: {
          pt: ["Treinamentos", "Desenvolvimento de pessoas e lideranças", "Projetos sob medida de RH"],
          en: ["Training", "People and leadership development", "Tailored HR projects"],
        },
      },
      {
        titulo: { pt: "Para que serve", en: "What it is for" },
        itens: {
          pt: ["Capacitar equipes e lideranças", "Resolver desafios específicos de pessoas", "Apoiar mudanças e reestruturações", "Complementar a atuação do RH interno"],
          en: ["Upskill teams and leaders", "Solve specific people challenges", "Support change and restructuring", "Complement internal HR"],
        },
      },
      {
        titulo: { pt: "Como desenvolvemos", en: "How we develop" },
        itens: {
          pt: ["Diagnóstico da demanda", "Proposta sob medida", "Execução e acompanhamento", "Avaliação dos resultados"],
          en: ["Demand diagnosis", "Tailored proposal", "Execution and follow-up", "Results evaluation"],
        },
      },
    ],
  },
];

export const CARDS_SOLUCAO = SOLUCOES.map((s) => ({ id: s.id, titulo: s.titulo, descricao: s.short }));

export const INTRO_SOLUCOES = {
  i1: { pt: "Acreditamos que o verdadeiro diferencial competitivo das empresas está nas pessoas.", en: "We believe that the true competitive edge of companies lies in their people." },
  i2: { pt: "Por isso, atuamos como parceiros estratégicos durante todo o ciclo profissional dos seus colaboradores, conectando e desenvolvendo talentos excepcionais para acelerar os resultados da sua operação.", en: "That is why we act as strategic partners throughout the full professional cycle of your employees, connecting and developing exceptional talent to accelerate your operation's results." },
};

export const FRENTES: Txt[] = [
  { pt: "Projetos & Engenharia", en: "Projects & Engineering" },
  { pt: "Recursos Humanos", en: "Human Resources" },
  { pt: "Operações & Manutenção", en: "Operations & Maintenance" },
  { pt: "Construção & Montagem", en: "Construction & Assembly" },
  { pt: "Suprimentos & Logística", en: "Supply & Logistics" },
  { pt: "Tecnologia da Informação", en: "Information Technology" },
  { pt: "QSMS & ESG", en: "HSEQ & ESG" },
  { pt: "Jurídico & Compliance", en: "Legal & Compliance" },
  { pt: "Finanças & Contabilidade", en: "Finance & Accounting" },
  { pt: "Marítimos e Offshore", en: "Maritime and Offshore" },
];

export const VALORES: { titulo: Txt; texto: Txt }[] = [
  {
    titulo: { pt: 'Compromisso', en: 'Commitment' },
    texto: {
      pt: 'Cumprir o combinado e superar expectativas em cada entrega.',
      en: 'Deliver on our promises and exceed expectations in every delivery.',
    },
  },
  {
    titulo: { pt: 'Especialização', en: 'Specialization' },
    texto: {
      pt: 'Atuar com foco e expertise nos setores que dominamos.',
      en: 'Act with focus and expertise in the sectors we dominate.',
    },
  },
  {
    titulo: { pt: 'Dinamismo', en: 'Dynamism' },
    texto: {
      pt: 'Ser proativo em antecipar riscos e encontrar soluções eficazes.',
      en: 'Be proactive in anticipating risks and finding effective solutions.',
    },
  },
  {
    titulo: { pt: 'Agilidade', en: 'Agility' },
    texto: {
      pt: 'Responder rapidamente às demandas do mercado, com eficiência e qualidade.',
      en: 'Respond quickly to market demands, with efficiency and quality.',
    },
  },
  {
    titulo: { pt: 'Transparência', en: 'Transparency' },
    texto: {
      pt: 'Manter uma comunicação clara e ações autênticas em todas as interações.',
      en: 'Maintain clear communication and authentic actions in every interaction.',
    },
  },
];

export interface Consultor {
  nome: string;
  cargo: Txt;
  foto: string;
  linkedin: string;
  bio: Txt;
}

export const EQUIPE: Consultor[] = [
  {
    nome: "Fabio d'Ave",
    cargo: { pt: 'Sócio & Headhunter', en: 'Partner & Headhunter' },
    foto: 'fabio-d-ave',
    linkedin: 'https://www.linkedin.com/in/fabioportodave/',
    bio: {
      pt: 'Mais de 15 anos de experiência dedicados a grandes projetos estratégicos em indústrias críticas, como energia, infraestrutura, mineração e óleo & gás. Founder e Head Comercial da Ocean Talent Solutions.',
      en: 'Over 15 years of experience dedicated to major strategic projects in critical industries such as energy, infrastructure, mining and oil & gas. Founder and Head of Sales at Ocean Talent Solutions.',
    },
  },
  {
    nome: 'Leandro Reis',
    cargo: { pt: 'Advisor', en: 'Advisor' },
    foto: 'leandro-reis',
    linkedin: 'https://www.linkedin.com/in/leandroreis1/',
    bio: {
      pt: 'Head of Operations e Advisor, tem mais de 10 anos de experiência em consultoria de recrutamento, com foco em headhunting, relacionamento com clientes e identificação de talentos estratégicos.',
      en: 'Head of Operations and Advisor with over 10 years of experience in recruitment consulting, focused on headhunting, client relationships and identifying strategic talent.',
    },
  },
  {
    nome: 'Raquel Haddad',
    cargo: { pt: 'Delivery Manager', en: 'Delivery Manager' },
    foto: 'raquel-haddad',
    linkedin: 'https://www.linkedin.com/in/haddad-raquel/',
    bio: {
      pt: 'Gerente de Recrutamento e seleção especialista em posições técnicas e estratégicas em indústrias críticas, com ampla experiência em processos estratégicos para cargos de média e alta gerência em operações.',
      en: 'Recruitment and selection manager specialized in technical and strategic positions in critical industries, with extensive experience in strategic processes for middle and senior operations management roles.',
    },
  },
  {
    nome: 'Carlos Souza',
    cargo: { pt: 'Headhunter', en: 'Headhunter' },
    foto: 'carlos-souza',
    linkedin: 'https://www.linkedin.com/in/souzaca/',
    bio: {
      pt: 'Especialista em posições executivas e no setor financeiro. Ampla experiência na condução de processos para lideranças sêniores em grandes empresas.',
      en: 'Specialist in executive positions and the financial sector. Extensive experience leading searches for senior leadership roles at large companies.',
    },
  },
  {
    nome: 'Mariana Cals',
    cargo: { pt: 'Headhunter', en: 'Headhunter' },
    foto: 'mariana-cals',
    linkedin: 'https://www.linkedin.com/in/marianacals/',
    bio: {
      pt: 'Head of Executive Search da operação da Ocean, possui mais de 25 anos de experiência profissional, com atuação em Executive Search, advisory estratégico e expertise nos setores financeiro e tributário.',
      en: 'Head of Executive Search at Ocean, with over 25 years of professional experience in Executive Search and strategic advisory, and expertise in the financial and tax sectors.',
    },
  },
  {
    nome: 'Eliza Miranda',
    cargo: { pt: 'Headhunter', en: 'Headhunter' },
    foto: 'eliza-miranda',
    linkedin: 'https://www.linkedin.com/in/elizamirandagon/',
    bio: {
      pt: 'Psicóloga com atuação em headhunting e recrutamento especializado, conectando talentos às demandas estratégicas das organizações.',
      en: "Psychologist working in headhunting and specialized recruitment, connecting talent to organizations' strategic needs.",
    },
  },
  {
    nome: 'Valentina Martani',
    cargo: { pt: 'Headhunter', en: 'Headhunter' },
    foto: 'valentina-martani',
    linkedin: 'https://www.linkedin.com/in/valentinamartani/',
    bio: {
      pt: 'Atuação em Executive Search e recrutamento especializado, com foco nos setores de energia, óleo & gás e indústria.',
      en: 'Works in Executive Search and specialized recruitment, focused on the energy, oil & gas and industrial sectors.',
    },
  },
  {
    nome: 'Anna Luiza Reguffe',
    cargo: { pt: 'Headhunter', en: 'Headhunter' },
    foto: 'anna-luiza-reguffe',
    linkedin: 'https://www.linkedin.com/in/anna-luiza-reguffe/',
    bio: {
      pt: 'Atuação em recrutamento e seleção, com foco na identificação de talentos e na conexão entre profissionais e oportunidades de carreira.',
      en: 'Works in recruitment and selection, focused on identifying talent and connecting professionals with career opportunities.',
    },
  },
];

export const CLIENTES = [
  { nome: 'Equatorial', logo: 'equatorial.webp' },
  { nome: 'PRIO', logo: 'prio.webp' },
  { nome: 'Constellation', logo: 'constellation.webp' },
  { nome: 'BW Energy', logo: 'bw-energy.svg' },
  { nome: 'Bunker One', logo: 'bunker-one.webp' },
  { nome: 'Foresea', logo: 'foresea.svg' },
  { nome: 'V. Ships', logo: 'v-ships.webp' },
  { nome: 'Welltec', logo: 'welltec.svg' },
  { nome: 'Salinas Gold', logo: 'salinas-gold.webp' },
  { nome: 'Cladtek', logo: 'cladtek.webp' },
  { nome: 'CNPC Brasil', logo: 'cnpc-brasil.webp' },
  { nome: 'Prosafe', logo: 'prosafe.svg' },
];

export const CASOS: { categoria: Txt; titulo: Txt; texto: Txt }[] = [
  {
    categoria: { pt: 'Petróleo & Gás · Diretoria', en: 'Oil & Gas · Board' },
    titulo: { pt: 'Diretor de Operações', en: 'Operations Director' },
    texto: {
      pt: 'Conduzimos a busca de um Diretor de Operações para uma operadora independente de petróleo no Brasil, em parceria direta com o COO da companhia. O desafio envolveu identificar executivos com histórico no segmento, aderência real ao momento e aos desafios do negócio, além da apresentação sobre o cenário de mercado.\n\nResultado: três candidatos apresentados, decisão difícil entre dois deles, de alto nível. O processo foi concluído com sucesso a partir da primeira shortlist apresentada.',
      en: "We led the search for an Operations Director for an independent oil operator in Brazil, working directly with the company's COO. The challenge involved identifying executives with a track record in the sector, real alignment with the company's current stage and challenges, along with an overview of the market landscape.\n\nResult: three candidates presented, with a difficult decision between two high-level finalists. The process was successfully concluded from the first shortlist presented.",
    },
  },
  {
    categoria: { pt: 'Mineração · C-Level', en: 'Mining · C-Level' },
    titulo: { pt: 'Chief Executive Officer', en: 'Chief Executive Officer' },
    texto: {
      pt: 'Conduzimos a busca de um CEO para uma mineradora em processo de reestruturação, com acionistas canadenses e operação no interior do Brasil. O desafio exigia profundo conhecimento de mercado, mapeamento de executivos com perfil aderente e interlocução direta com o Board, em processo de alta confidencialidade e criticidade.\n\nA posição foi preenchida em 52 dias, com a identificação de um executivo alinhado aos novos desafios estratégicos da companhia.',
      en: "We led the search for a CEO for a mining company undergoing restructuring, with Canadian shareholders and operations in rural Brazil. The challenge required deep market knowledge, mapping of executives with an aligned profile and direct dialogue with the Board, in a highly confidential and critical process.\n\nThe position was filled in 52 days, with the identification of an executive aligned to the company's new strategic challenges.",
    },
  },
  {
    categoria: { pt: 'Infraestrutura · Gerência', en: 'Infrastructure · Management' },
    titulo: { pt: 'Gerente SR de RH', en: 'Senior HR Manager' },
    texto: {
      pt: 'Conduzimos a busca de um Gerente SR de RH para uma construtora de grande porte em expansão, com projetos de infraestrutura em múltiplos estados. O desafio envolveu encontrar um líder capaz de estruturar a área de pessoas em ambiente acelerado, unindo visão estratégica e gestão de alta rotatividade em canteiros de obra.\n\nO executivo escolhido foi identificado em um mercado adjacente e estruturou, nos primeiros 6 meses, um time de HRBP que conseguiu reduzir o turnover de campo em mais de 20%.',
      en: 'We led the search for a Senior HR Manager for a large construction company in expansion, with infrastructure projects across multiple states. The challenge involved finding a leader able to structure the people function in a fast-paced environment, combining strategic vision and hands-on management of high field turnover.\n\nThe chosen executive was identified in an adjacent market and, within the first 6 months, built an HRBP team that reduced field turnover by more than 20%.',
    },
  },
];

export const SETORES: { nome: Txt; imagem: string; descricao: Txt }[] = [
  {
    nome: { pt: 'Petróleo & Gás', en: 'Oil & Gas' },
    imagem: 'oil-gas',
    descricao: {
      pt: 'Empresas de upstream, midstream e downstream — desde operadoras e empresas de serviço até distribuidoras de combustíveis.',
      en: 'Upstream, midstream and downstream companies — from operators and service companies to fuel distributors.',
    },
  },
  {
    nome: { pt: 'Energia', en: 'Energy' },
    imagem: 'energy',
    descricao: {
      pt: 'Geradoras, transmissoras e distribuidoras de energia elétrica, além de empresas de fontes renováveis e comercializadoras.',
      en: 'Power generation, transmission and distribution companies, plus renewable energy players and energy traders.',
    },
  },
  {
    nome: { pt: 'Infraestrutura', en: 'Infrastructure' },
    imagem: 'infrastructure',
    descricao: {
      pt: 'Concessionárias, construtoras, empresas de logística, saneamento e telecomunicações.',
      en: 'Concessionaires, construction firms, logistics, sanitation and telecommunications companies.',
    },
  },
  {
    nome: { pt: 'Mineração', en: 'Mining' },
    imagem: 'mining',
    descricao: {
      pt: 'Mineradoras, siderúrgicas, empresas de metais e fornecedoras de equipamentos e serviços para a cadeia mineral.',
      en: 'Mining companies, steelmakers, metals producers and equipment and service suppliers for the mineral chain.',
    },
  },
  {
    nome: { pt: 'Indústria', en: 'Industry' },
    imagem: 'industry',
    descricao: {
      pt: 'Indústrias de bens de consumo, alimentos e bebidas, química e petroquímica, e manufatura em geral.',
      en: 'Consumer goods, food and beverage, chemical and petrochemical companies, and general manufacturing.',
    },
  },
  {
    nome: { pt: 'Tecnologia', en: 'Technology' },
    imagem: 'technology',
    descricao: {
      pt: 'Empresas de software e SaaS, integradoras, fintechs e áreas de tecnologia de grandes corporações.',
      en: 'Software and SaaS companies, integrators, fintechs and technology areas of large corporations.',
    },
  },
];

export const DIFERENCIAIS: { titulo: Txt; texto: Txt }[] = [
  {
    titulo: { pt: 'Boutique por escolha', en: 'Boutique by choice' },
    texto: {
      pt: 'Atendemos menos clientes para atender melhor. Disponibilizamos uma equipe exclusiva de consultores para cuidar de cada projeto.',
      en: 'We serve fewer clients so we can serve them better. We provide an exclusive team of consultants to take care of every project.',
    },
  },
  {
    titulo: { pt: 'Consultores atenciosos', en: 'Attentive consultants' },
    texto: {
      pt: 'Buscamos entender a fundo o desafio de cada cliente, entregando resultados com humanidade, assertividade e agilidade.',
      en: "We seek to deeply understand each client's challenge, delivering results with humanity, precision and agility.",
    },
  },
  {
    titulo: { pt: 'Processo estruturado', en: 'Structured process' },
    texto: {
      pt: 'Aplicamos metodologias desenvolvidas ao longo de anos de experiência para conduzir cada etapa do processo de forma estruturada e objetiva.',
      en: 'We apply methodologies developed through years of experience to guide every step of the process in a structured and objective way.',
    },
  },
  {
    titulo: { pt: 'Rede de relacionamento', en: 'A network of relationships' },
    texto: {
      pt: 'Nossa equipe se dedica diariamente a conhecer os melhores profissionais em nossas áreas de atuação, criando uma robusta rede de relacionamento.',
      en: 'Our team dedicates itself daily to getting to know the best professionals in our fields of expertise, building a robust network of relationships.',
    },
  },
];
