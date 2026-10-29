import type { ComponentType } from 'react';
import {
  IconeAlvo,
  IconeBrilho,
  IconeBusca,
  IconeOffshore,
  IconeOutsourcing,
  IconePrancheta,
  IconeRecarregar,
  IconeUsuarios,
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

export type IdSolucao = 'executive-search' | 'offshore-talent' | 'outsourcing' | 'development-outplacement';

export const HASH_SOLUCAO: Record<IdSolucao, string> = {
  'executive-search': 'executive-search',
  'offshore-talent': 'offshore',
  outsourcing: 'outsourcing',
  'development-outplacement': 'development',
};

/** Ícone de cada divisão (o DivisionIcon do Lovable); os de traço usam espessura 1,75. */
export const ICONE_DIVISAO: Record<IdSolucao, { icone: Icone; traco?: number }> = {
  'executive-search': { icone: IconeAlvo, traco: 1.75 },
  'offshore-talent': { icone: IconeOffshore },
  outsourcing: { icone: IconeOutsourcing },
  'development-outplacement': { icone: IconeUsuarios, traco: 1.75 },
};

export const CARDS_SOLUCAO: { id: IdSolucao; titulo: string; descricao: Txt }[] = [
  {
    id: 'executive-search',
    titulo: 'Executive Search',
    descricao: {
      pt: 'Mapeamento de mercado e recrutamento especializado para posições de liderança e alto impacto.',
      en: 'Market mapping and specialized recruitment for leadership and high-impact positions.',
    },
  },
  {
    id: 'offshore-talent',
    titulo: 'Offshore Talent',
    descricao: {
      pt: 'Recrutamento técnico para profissionais offshore no setor de Petróleo & Gás.',
      en: 'Technical recruitment for offshore professionals in the Oil & Gas sector.',
    },
  },
  {
    id: 'outsourcing',
    titulo: 'Outsourcing',
    descricao: {
      pt: 'Alocação e gestão de profissionais terceirizados, com gestão completa de backoffice e compliance.',
      en: 'Allocation and management of outsourced professionals, with full back-office and compliance management.',
    },
  },
  {
    id: 'development-outplacement',
    titulo: 'Development & Outplacement',
    descricao: {
      pt: 'Assessment, desenvolvimento organizacional e desligamento humanizado.',
      en: 'Assessment, organizational development and humanized offboarding.',
    },
  },
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

export interface Grupo {
  titulo: Txt;
  itens: Record<Idioma, string[]>;
}

export interface Solucao {
  id: IdSolucao;
  titulo: string;
  subtitulo: Txt;
  paragrafo: Txt;
  cards?: { icone: Icone; titulo: Txt; descricao: Txt }[];
  cargos?: Grupo[];
  beneficios?: Grupo[];
}

/** Classes de cada divisão nas abas e nos painéis (todas azul-marinho no tema atual). */
export const ESTILO_SOLUCAO: Record<IdSolucao, { titulo: string; cor: string; barra: string; borda: string; barraAba: string }> = {
  'executive-search': {
    titulo: 'text-primary',
    cor: 'text-division-executive',
    barra: 'bg-division-executive',
    borda: 'border-division-executive',
    barraAba: 'bg-tab-executive',
  },
  'offshore-talent': {
    titulo: 'text-division-offshore',
    cor: 'text-division-offshore',
    barra: 'bg-division-offshore',
    borda: 'border-division-offshore',
    barraAba: 'bg-tab-offshore',
  },
  outsourcing: {
    titulo: 'text-division-outsourcing',
    cor: 'text-division-outsourcing',
    barra: 'bg-division-outsourcing',
    borda: 'border-division-outsourcing',
    barraAba: 'bg-tab-outsourcing',
  },
  'development-outplacement': {
    titulo: 'text-division-development',
    cor: 'text-division-development',
    barra: 'bg-division-development',
    borda: 'border-division-development',
    barraAba: 'bg-tab-development',
  },
};

export const SOLUCOES: Solucao[] = [
  {
    id: 'executive-search',
    titulo: 'Executive Search',
    subtitulo: {
      pt: 'Liderança, posições estratégicas e inteligência de mercado',
      en: 'Leadership, strategic positions and market intelligence',
    },
    paragrafo: {
      pt: 'Desenvolvemos inteligência de mercado e encontramos os profissionais que fazem a diferença, do especialista técnico ao C-level. Nosso processo vai além da captação de currículos: mapeamos o mercado ativamente, abordamos os profissionais mais aderentes ao desafio da sua empresa, checamos referências, mitigando riscos e garantindo uma contratação assertiva.',
      en: 'We develop market intelligence and find the professionals who make the difference, from technical specialists to C-level. Our process goes beyond collecting résumés: we actively map the market, approach the professionals who best fit your company’s challenge, and check references — mitigating risks and ensuring an assertive hire.',
    },
    cards: [
      {
        icone: IconeBusca,
        titulo: { pt: 'Mapeamento de Mercado', en: 'Market Mapping' },
        descricao: {
          pt: 'Mapeamento e análise de dados, estruturas, cargos, remuneração e talentos estratégicos para a sua operação.',
          en: 'Mapping and analysis of data, structures, roles, compensation and strategic talent for your operation.',
        },
      },
      {
        icone: IconeAlvo,
        titulo: { pt: 'Executive Search', en: 'Executive Search' },
        descricao: {
          pt: 'Recrutamento e seleção para cargos estratégicos, garantindo o alinhamento entre os perfis dos candidatos e os objetivos organizacionais.',
          en: 'Recruitment and selection for strategic roles, ensuring alignment between candidate profiles and organizational goals.',
        },
      },
    ],
  },
  {
    id: 'offshore-talent',
    titulo: 'Offshore Talent',
    subtitulo: {
      pt: 'Recrutamento técnico para operações marítimas e offshore',
      en: 'Technical recruitment for maritime and offshore operations',
    },
    paragrafo: {
      pt: 'A frota de apoio offshore em águas brasileiras já soma mais de 460 embarcações, e a Petrobras estruturou a contratação de cerca de 200 novas unidades até 2028, volume que intensifica ainda mais a disputa por tripulantes certificados e disponíveis.\n\nAtuamos no recrutamento técnico de toda a hierarquia de bordo, das funções de convés e máquinas às operações offshore especializadas, entregando profissionais com certificação em dia, experiência de embarque compatível e aderência à escala de cada operação.',
      en: 'The offshore support fleet in Brazilian waters already totals more than 460 vessels, and Petrobras has structured the contracting of around 200 new units by 2028 — a volume that further intensifies the competition for certified and available crew.\n\nWe work on the technical recruitment of the entire on-board hierarchy, from deck and engine functions to specialized offshore operations, delivering professionals with up-to-date certifications, compatible embarkation experience and alignment with the schedule of each operation.',
    },
    cargos: [
      {
        titulo: { pt: 'Marítimo & Náutica', en: 'Maritime & Nautical' },
        itens: {
          pt: ['Comandante', 'Imediato', 'Oficial de Náutica (1º, 2º e 3º)', 'Contramestre +'],
          en: ['Master', 'Chief Officer', 'Deck Officer (1st, 2nd and 3rd)', 'Boatswain +'],
        },
      },
      {
        titulo: { pt: 'Máquinas & Engenharia', en: 'Engine & Engineering' },
        itens: {
          pt: ['Chefe de Máquinas', 'Oficial de Máquinas (1º, 2º e 3º)', 'Supervisor de Manutenção', 'Reliability Engineer +'],
          en: ['Chief Engineer', 'Engine Officer (1st, 2nd and 3rd)', 'Maintenance Supervisor', 'Reliability Engineer +'],
        },
      },
      {
        titulo: { pt: 'Subsea & ROV', en: 'Subsea & ROV' },
        itens: {
          pt: ['DPO', 'Supervisor de ROV', 'Piloto de ROV', 'Engenheiro Subsea +'],
          en: ['DPO', 'ROV Supervisor', 'ROV Pilot', 'Subsea Engineer +'],
        },
      },
      {
        titulo: { pt: 'Drilling', en: 'Drilling' },
        itens: {
          pt: ['OIM', 'Drilling Supervisor', 'Rigging Manager', 'Directional Driller +'],
          en: ['OIM', 'Drilling Supervisor', 'Rigging Manager', 'Directional Driller +'],
        },
      },
      {
        titulo: { pt: 'HSEQ & Projects', en: 'HSEQ & Projects' },
        itens: {
          pt: ['Superintendente de HSE', 'Gerente de Qualidade', 'Process Safety Engineer', 'Construction Manager +'],
          en: ['HSE Superintendent', 'Quality Manager', 'Process Safety Engineer', 'Construction Manager +'],
        },
      },
    ],
  },
  {
    id: 'outsourcing',
    titulo: 'Outsourcing',
    subtitulo: {
      pt: 'Alocação e gestão de profissionais, backoffice e conformidade',
      en: 'Workforce allocation and management, back office and compliance',
    },
    paragrafo: {
      pt: 'Solução ideal para empresas que precisam de profissionais qualificados, mas não querem assumir diretamente toda a estrutura trabalhista, administrativa e operacional relacionada à contratação.\n\nRecrutamos, contratamos e alocamos o profissional certo dentro da sua operação, e cuidamos de toda a gestão de backoffice (folha, benefícios, encargos e conformidade trabalhista) enquanto a sua empresa foca apenas no resultado da área.',
      en: 'The ideal solution for companies that need qualified professionals without taking on the full labor, administrative and operational structure of hiring.\n\nWe recruit, hire and allocate the right professional within your operation, and handle all back-office management (payroll, benefits, charges and labor compliance) while your company focuses only on the results of the area.',
    },
    beneficios: [
      {
        titulo: { pt: 'Flexibilidade de estrutura', en: 'Structural flexibility' },
        itens: {
          pt: ['Sem aumento permanente de quadro', 'Contrato encerra com o projeto', 'Sem gestão direta de desligamentos'],
          en: ['No permanent headcount increase', 'Contract ends with the project', 'No direct offboarding management'],
        },
      },
      {
        titulo: { pt: 'Transferência da operação trabalhista', en: 'Payroll operation transfer' },
        itens: {
          pt: ['Admissão, folha e 13º', 'FGTS, INSS e benefícios', 'Documentação e rescisão'],
          en: ['Onboarding, payroll and 13th salary', 'FGTS, social security and benefits', 'Documentation and termination'],
        },
      },
      {
        titulo: { pt: 'Velocidade para contratar', en: 'Speed to hire' },
        itens: {
          pt: ['Estrutura jurídica e de RH prontas', 'Recrutamento e contratos ágeis', 'Profissional alocado rapidamente'],
          en: ['Legal and HR structure in place', 'Agile recruitment and contracts', 'Professional deployed quickly'],
        },
      },
      {
        titulo: { pt: 'Gestão de headcount', en: 'Headcount management' },
        itens: {
          pt: ['Não impacta headcount próprio', 'Reduz aprovações corporativas'],
          en: ['Does not impact your own headcount', 'Reduces corporate approvals'],
        },
      },
      {
        titulo: { pt: 'Custo fixo vira custo por demanda', en: 'Fixed cost becomes cost per demand' },
        itens: {
          pt: ['Pagamento vinculado à necessidade', 'Ideal para projetos e sazonalidade', 'Aplicável a TI, engenharia e diversas áreas'],
          en: ['Payment tied to actual need', 'Ideal for projects and seasonality', 'Applicable to IT, engineering and several areas'],
        },
      },
    ],
  },
  {
    id: 'development-outplacement',
    titulo: 'Development & Outplacement',
    subtitulo: {
      pt: 'Assessment, desenvolvimento organizacional e desligamento humanizado',
      en: 'Assessment, organizational development and humanized offboarding',
    },
    paragrafo: {
      pt: 'Para empresas que querem valorizar e desenvolver quem já está no time e, quando necessário, conduzir desligamentos com responsabilidade, preservando a marca empregadora e a confiança das equipes.\n\nAvaliamos perfis e competências, apoiamos o desenvolvimento de pessoas e lideranças e conduzimos processos de outplacement com metodologia estruturada, respeito e transparência, preparando o profissional para o próximo passo da carreira.',
      en: 'For companies that want to value and develop the people already on their team and, when necessary, conduct offboarding responsibly, preserving the employer brand and the trust of their teams.\n\nWe assess profiles and competencies, support the development of people and leaders and conduct outplacement processes with a structured methodology, respect and transparency, preparing the professional for the next step in their career.',
    },
    cards: [
      {
        icone: IconePrancheta,
        titulo: { pt: 'Assessment', en: 'Assessment' },
        descricao: {
          pt: 'Avaliação de profissionais (internos ou candidatos), processos e estruturas organizacionais completas, com diagnóstico aprofundado, entrevistas e parecer executivo para suporte à tomada de decisão e melhoria de performance.',
          en: 'Assessment of professionals (internal or candidates), processes and complete organizational structures, with in-depth diagnosis, interviews and an executive report to support decision-making and improve performance.',
        },
      },
      {
        icone: IconeRecarregar,
        titulo: { pt: 'Outplacement', en: 'Outplacement' },
        descricao: {
          pt: 'Programa individual de até 6 meses, com 8 sessões em três etapas: Pensar (autoconhecimento), Planejar (CV, LinkedIn e entrevistas) e Praticar (networking e rede de oportunidades).',
          en: 'Individual program of up to 6 months, with 8 sessions in three stages: Think (self-knowledge), Plan (CV, LinkedIn and interviews) and Practice (networking and opportunity network).',
        },
      },
      {
        icone: IconeBrilho,
        titulo: { pt: 'Soluções Personalizadas', en: 'Customized Solutions' },
        descricao: {
          pt: 'Cada empresa tem um desafio único. Desenvolvemos soluções sob medida para demandas específicas de RH, sempre com uma estratégia clara e execução orientada a resultados.',
          en: 'Every company has a unique challenge. We develop tailored solutions for specific HR demands, always with a clear strategy and results-driven execution.',
        },
      },
    ],
  },
];

export const METODOLOGIA: Grupo[] = [
  {
    titulo: { pt: 'Alinhamento', en: 'Alignment' },
    itens: {
      pt: ['Entendimento da posição e cultura do cliente', 'Objetivos e desafios', 'Motivo da contratação', 'Definição do cronograma'],
      en: ["Understanding of the client's position and culture", 'Objectives and challenges', 'Reason for hiring', 'Timeline definition'],
    },
  },
  {
    titulo: { pt: 'Mapeamento de mercado', en: 'Market mapping' },
    itens: {
      pt: ['Universo de empresas target', 'Inteligência de mercado', 'Hunting ativo', 'Indicações'],
      en: ['Universe of target companies', 'Market intelligence', 'Active hunting', 'Referrals'],
    },
  },
  {
    titulo: { pt: 'Avaliação', en: 'Assessment' },
    itens: {
      pt: ['Entrevistas', 'Avaliação técnica e comportamental', 'Alinhamento de expectativas', 'Comparação entre os candidatos'],
      en: ['Interviews', 'Technical and behavioral assessment', 'Expectation alignment', 'Comparison between candidates'],
    },
  },
  {
    titulo: { pt: 'Apresentação de candidatos', en: 'Candidate presentation' },
    itens: {
      pt: ['Longlist', 'Shortlist', 'Resumo dos perfis selecionados e recomendações', 'Referências profissionais'],
      en: ['Longlist', 'Shortlist', 'Summary of selected profiles and recommendations', 'Professional references'],
    },
  },
  {
    titulo: { pt: 'Condução do processo', en: 'Process management' },
    itens: {
      pt: ['Suporte nas entrevistas', 'Checagem de referências', 'Suporte na negociação salarial', 'Proximidade dos candidatos e gestores'],
      en: ['Interview support', 'Reference checks', 'Salary negotiation support', 'Proximity between candidates and managers'],
    },
  },
  {
    titulo: { pt: 'Onboarding', en: 'Onboarding' },
    itens: {
      pt: ['Monitoramento formal pelos 6 primeiros meses do profissional contratado'],
      en: ["Formal monitoring during the hired professional's first six months"],
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
