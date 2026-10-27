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

type Icone = ComponentType<IconeProps>;

export const CONTATO = {
  telefone: '+ 55 21 96632-6588',
  telefoneLink: 'tel:+5521966326588',
  email: 'contato@oceantalentsolutions.com',
  linkedin: 'https://www.linkedin.com/company/oceantalentsolutions',
  whatsapp: `https://wa.me/5521966326588?text=${encodeURIComponent('Olá! Vim pelo site da Ocean e gostaria de saber mais.')}`,
};

export const NUMEROS = [
  { valor: '500+', rotulo: 'Projetos conduzidos' },
  { valor: '18+', rotulo: 'Anos de mercado' },
  { valor: 'Boutique', rotulo: 'Atendimento premium' },
];

export type IdSolucao = 'executive-search' | 'offshore-talent' | 'outsourcing' | 'development-outplacement';

export const HASH_SOLUCAO: Record<IdSolucao, string> = {
  'executive-search': 'executive-search',
  'offshore-talent': 'offshore',
  outsourcing: 'outsourcing',
  'development-outplacement': 'development',
};

export const CARDS_SOLUCAO: { id: IdSolucao; icone: Icone; titulo: string; descricao: string }[] = [
  {
    id: 'executive-search',
    icone: IconeAlvo,
    titulo: 'Executive Search',
    descricao: 'Mapeamento de mercado e recrutamento especializado para posições de liderança e alto impacto.',
  },
  {
    id: 'offshore-talent',
    icone: IconeOffshore,
    titulo: 'Offshore Talent',
    descricao: 'Recrutamento técnico para profissionais offshore no setor de Petróleo & Gás.',
  },
  {
    id: 'outsourcing',
    icone: IconeOutsourcing,
    titulo: 'Outsourcing',
    descricao: 'Alocação e gestão de profissionais terceirizados, com gestão completa de backoffice e compliance.',
  },
  {
    id: 'development-outplacement',
    icone: IconeUsuarios,
    titulo: 'Development & Outplacement',
    descricao: 'Assessment, desenvolvimento organizacional e desligamento humanizado.',
  },
];

export const VALORES = [
  { titulo: 'Compromisso', texto: 'Cumprir o combinado e superar expectativas em cada entrega.' },
  { titulo: 'Especialização', texto: 'Atuar com foco e expertise nos setores que dominamos.' },
  { titulo: 'Dinamismo', texto: 'Ser proativo em antecipar riscos e encontrar soluções eficazes.' },
  { titulo: 'Agilidade', texto: 'Responder rapidamente às demandas do mercado, com eficiência e qualidade.' },
  { titulo: 'Transparência', texto: 'Manter uma comunicação clara e ações autênticas em todas as interações.' },
];

export const EQUIPE = [
  { nome: "Fabio d'Ave", cargo: 'Sócio & Headhunter', foto: 'fabio-d-ave', linkedin: 'https://www.linkedin.com/in/fabioportodave/' },
  { nome: 'Leandro Reis', cargo: 'Advisor', foto: 'leandro-reis', linkedin: 'https://www.linkedin.com/in/leandroreis1/' },
  { nome: 'Raquel Haddad', cargo: 'Delivery Manager', foto: 'raquel-haddad', linkedin: 'https://www.linkedin.com/in/haddad-raquel/' },
  { nome: 'Carlos Souza', cargo: 'Headhunter', foto: 'carlos-souza', linkedin: 'https://www.linkedin.com/in/souzaca/' },
  { nome: 'Mariana Cals', cargo: 'Headhunter', foto: 'mariana-cals', linkedin: 'https://www.linkedin.com/in/marianacals/' },
  { nome: 'Eliza Miranda', cargo: 'Headhunter', foto: 'eliza-miranda', linkedin: 'https://www.linkedin.com/in/elizamirandagon/' },
  { nome: 'Valentina Martani', cargo: 'Headhunter', foto: 'valentina-martani', linkedin: 'https://www.linkedin.com/in/valentinamartani/' },
  { nome: 'Anna Luiza Reguffe', cargo: 'Headhunter', foto: 'anna-luiza-reguffe', linkedin: 'https://www.linkedin.com/in/anna-luiza-reguffe/' },
];

export const CLIENTES = [
  { nome: 'Equatorial', logo: 'equatorial' },
  { nome: 'PRIO', logo: 'prio' },
  { nome: 'Constellation', logo: 'constellation' },
  { nome: 'BW Energy', logo: 'bw-energy' },
  { nome: 'Bunker One', logo: 'bunker-one' },
  { nome: 'Foresea', logo: 'foresea' },
  { nome: 'V. Ships', logo: 'v-ships' },
  { nome: 'Welltec', logo: 'welltec' },
  { nome: 'Salinas Gold', logo: 'salinas-gold' },
  { nome: 'Cladtek', logo: 'cladtek' },
  { nome: 'CNPC Brasil', logo: 'cnpc-brasil' },
  { nome: 'Prosafe', logo: 'prosafe' },
];

export const CASOS = [
  {
    categoria: 'Petróleo & Gás · Diretoria',
    titulo: 'Diretor de Operações',
    texto:
      'Conduzimos a busca de um Diretor de Operações para uma operadora independente de petróleo no Brasil, em parceria direta com o COO da companhia. O desafio envolveu identificar executivos com histórico no segmento, aderência real ao momento e aos desafios do negócio, além da apresentação sobre o cenário de mercado.\n\nResultado: três candidatos apresentados, decisão difícil entre dois deles, de alto nível. O processo foi concluído com sucesso a partir da primeira shortlist apresentada.',
  },
  {
    categoria: 'Mineração · C-Level',
    titulo: 'Chief Executive Officer',
    texto:
      'Conduzimos a busca de um CEO para uma mineradora em processo de reestruturação, com acionistas canadenses e operação no interior do Brasil. O desafio exigia profundo conhecimento de mercado, mapeamento de executivos com perfil aderente e interlocução direta com o Board, em processo de alta confidencialidade e criticidade.\n\nA posição foi preenchida em 52 dias, com a identificação de um executivo alinhado aos novos desafios estratégicos da companhia.',
  },
  {
    categoria: 'Infraestrutura · Gerência',
    titulo: 'Gerente SR de RH',
    texto:
      'Conduzimos a busca de um Gerente SR de RH para uma construtora de grande porte em expansão, com projetos de infraestrutura em múltiplos estados. O desafio envolveu encontrar um líder capaz de estruturar a área de pessoas em ambiente acelerado, unindo visão estratégica e gestão de alta rotatividade em canteiros de obra.\n\nO executivo escolhido foi identificado em um mercado adjacente e estruturou, nos primeiros 6 meses, um time de HRBP que conseguiu reduzir o turnover de campo em mais de 20%.',
  },
];

interface Grupo {
  titulo: string;
  itens: string[];
}

export interface Solucao {
  id: IdSolucao;
  icone: Icone;
  titulo: string;
  subtitulo: string;
  paragrafo: string;
  cards?: { icone: Icone; titulo: string; descricao: string }[];
  cargos?: Grupo[];
  beneficios?: Grupo[];
}

export const ESTILO_SOLUCAO: Record<
  IdSolucao,
  { aba: string; tituloAba: string; cor: string; barra: string; borda: string; barraAba: string }
> = {
  'executive-search': {
    aba: 'border-tab-executive bg-tab-executive text-primary-foreground hover:bg-tab-executive hover:text-primary-foreground',
    tituloAba: 'text-primary',
    cor: 'text-division-executive',
    barra: 'bg-division-executive',
    borda: 'border-division-executive',
    barraAba: 'bg-tab-executive',
  },
  'offshore-talent': {
    aba: 'border-tab-offshore bg-tab-offshore text-primary-foreground hover:bg-tab-offshore hover:text-primary-foreground',
    tituloAba: 'text-division-offshore',
    cor: 'text-division-offshore',
    barra: 'bg-division-offshore',
    borda: 'border-division-offshore',
    barraAba: 'bg-tab-offshore',
  },
  outsourcing: {
    aba: 'border-tab-outsourcing bg-tab-outsourcing text-primary-foreground hover:bg-tab-outsourcing hover:text-primary-foreground',
    tituloAba: 'text-division-outsourcing',
    cor: 'text-division-outsourcing',
    barra: 'bg-division-outsourcing',
    borda: 'border-division-outsourcing',
    barraAba: 'bg-tab-outsourcing',
  },
  'development-outplacement': {
    aba: 'border-tab-development bg-tab-development text-primary-foreground hover:bg-tab-development hover:text-primary-foreground',
    tituloAba: 'text-division-development',
    cor: 'text-division-development',
    barra: 'bg-division-development',
    borda: 'border-division-development',
    barraAba: 'bg-tab-development',
  },
};

export const ESTILO_CARDS: Partial<Record<IdSolucao, { iconeFundo: string; hoverFundo: string; hoverSombra: string }>> = {
  'executive-search': {
    iconeFundo: 'bg-division-executive/10',
    hoverFundo: 'hover:bg-division-executive',
    hoverSombra: 'hover:shadow-division-executive/20',
  },
  'development-outplacement': {
    iconeFundo: 'bg-division-development/10',
    hoverFundo: 'hover:bg-division-development',
    hoverSombra: 'hover:shadow-division-development/20',
  },
};

export const SOLUCOES: Solucao[] = [
  {
    id: 'executive-search',
    icone: IconeAlvo,
    titulo: 'Executive Search',
    subtitulo: 'Liderança, posições críticas e inteligência de mercado',
    paragrafo:
      'Desenvolvemos inteligência de mercado e encontramos os profissionais que fazem a diferença, do especialista técnico ao C-level. Nosso processo vai além da captação de currículos: mapeamos o mercado ativamente, abordamos os profissionais mais aderentes ao desafio da sua empresa, checamos referências profissionais, mitigando riscos e garantindo uma contratação assertiva.',
    cards: [
      {
        icone: IconeBusca,
        titulo: 'Mapeamento de Mercado',
        descricao: 'Mapeamento e análise de dados, estruturas, cargos, remuneração e talentos estratégicos para a sua operação.',
      },
      {
        icone: IconeAlvo,
        titulo: 'Executive Search',
        descricao:
          'Recrutamento e seleção para cargos estratégicos, garantindo o alinhamento entre os perfis dos candidatos e os objetivos organizacionais.',
      },
    ],
  },
  {
    id: 'offshore-talent',
    icone: IconeOffshore,
    titulo: 'Offshore Talent',
    subtitulo: 'Recrutamento técnico para operações marítimas e offshore',
    paragrafo:
      'A frota de apoio offshore em águas brasileiras já soma 466 embarcações, e a Petrobras estruturou a contratação de cerca de 200 novas unidades até 2028, volume que intensifica ainda mais a disputa por tripulantes certificados e disponíveis. Atuamos no recrutamento técnico de toda a hierarquia de bordo, das funções de convés e máquinas às operações offshore especializadas, entregando profissionais com certificação em dia, experiência de embarque compatível e aderência à escala de cada operação.',
    cargos: [
      {
        titulo: 'Convés / Náutica',
        itens: ['Comandante', 'Imediato', 'Oficial de Náutica (1º, 2º e 3º)', 'Contramestre', 'Marinheiro de Náutica'],
      },
      {
        titulo: 'Máquinas',
        itens: ['Chefe de Máquinas', 'Oficial de Máquinas (1º, 2º e 3º)', 'Eletrotécnico', 'Marinheiro de Máquinas'],
      },
      {
        titulo: 'Operações Offshore',
        itens: [
          'DPO (Operador de Posicionamento Dinâmico)',
          'Guindasteiro',
          'Piloto de ROV',
          'Supervisor de HSE',
          'Técnico de Manutenção',
        ],
      },
    ],
  },
  {
    id: 'outsourcing',
    icone: IconeOutsourcing,
    titulo: 'Outsourcing',
    subtitulo: 'Alocação e gestão de profissionais, backoffice e conformidade',
    paragrafo:
      'Solução ideal para empresas que precisam de profissionais qualificados, mas não querem assumir diretamente toda a estrutura trabalhista, administrativa e operacional relacionada à contratação. Recrutamos, contratamos e alocamos o profissional certo dentro da sua operação, e cuidamos de toda a gestão de backoffice (folha, benefícios, encargos e conformidade trabalhista) enquanto sua empresa foca no resultado da área.',
    beneficios: [
      {
        titulo: 'Flexibilidade de estrutura',
        itens: ['Sem aumento permanente de quadro', 'Contrato encerra com o projeto', 'Sem gestão direta de desligamentos'],
      },
      {
        titulo: 'Transferência da operação trabalhista',
        itens: ['Admissão, folha, férias e 13º', 'FGTS, INSS e benefícios', 'Documentação e rescisão'],
      },
      {
        titulo: 'Velocidade para contratar',
        itens: ['Estrutura jurídica e de RH prontas', 'Recrutamento e contratos ágeis', 'Profissional alocado rapidamente'],
      },
      {
        titulo: 'Gestão de headcount',
        itens: ['Não impacta headcount próprio', 'Estrutura de contratação separada', 'Reduz aprovações corporativas'],
      },
      {
        titulo: 'Custo fixo vira custo por demanda',
        itens: ['Pagamento vinculado à necessidade', 'Ideal para projetos e sazonalidade', 'Aplicável a TI, engenharia e backoffice'],
      },
    ],
  },
  {
    id: 'development-outplacement',
    icone: IconeUsuarios,
    titulo: 'Development & Outplacement',
    subtitulo: 'Assessment, desenvolvimento organizacional e desligamento humanizado',
    paragrafo:
      'Além de encontrar os profissionais certos, apoiamos as empresas no desafio mais amplo de gerir e desenvolver pessoas. Atuamos como parceiros estratégicos de RH — com visão de negócio, método e cuidado com cada contexto.',
    cards: [
      {
        icone: IconePrancheta,
        titulo: 'Assessment',
        descricao:
          'Avaliação de profissionais, internos ou candidatos, processos e estruturas organizacionais completas, com diagnóstico aprofundado, entrevistas e parecer executivo para suporte à tomada de decisão e melhoria de performance.',
      },
      {
        icone: IconeRecarregar,
        titulo: 'Outplacement',
        descricao:
          'Apoio técnico para desligamento humanizado, incluindo reposicionamento profissional, desenvolvimento de networking, preparação para entrevistas e inclusão em nossa rede de oportunidades.',
      },
      {
        icone: IconeBrilho,
        titulo: 'Soluções Personalizadas',
        descricao:
          'Cada empresa tem um desafio único. Desenvolvemos soluções sob medida para demandas específicas de RH, sempre com uma estratégia clara e execução orientada a resultados.',
      },
    ],
  },
];

export const METODOLOGIA: Grupo[] = [
  {
    titulo: 'Alinhamento',
    itens: ['Entendimento da posição e cultura do cliente', 'Objetivos e desafios', 'Motivo da contratação', 'Definição do cronograma'],
  },
  { titulo: 'Mapeamento de mercado', itens: ['Universo de empresas target', 'Inteligência de mercado', 'Hunting ativo', 'Indicações'] },
  {
    titulo: 'Avaliação',
    itens: ['Entrevistas', 'Avaliação técnica e comportamental', 'Alinhamento de expectativas', 'Comparação entre os candidatos'],
  },
  {
    titulo: 'Apresentação de candidatos',
    itens: ['Longlist', 'Shortlist', 'Resumo dos perfis selecionados e recomendações', 'Referências profissionais'],
  },
  {
    titulo: 'Condução do processo',
    itens: ['Suporte nas entrevistas', 'Checagem de referências', 'Suporte na negociação salarial', 'Proximidade dos candidatos e gestores'],
  },
  { titulo: 'Onboarding', itens: ['Monitoramento formal pelos 6 primeiros meses do profissional contratado'] },
];

export const SETORES = [
  {
    nome: 'Petróleo & Gás',
    imagem: 'oil-gas',
    descricao: 'Empresas de upstream, midstream e downstream — desde operadoras e empresas de serviço até distribuidoras de combustíveis.',
  },
  {
    nome: 'Energia',
    imagem: 'energy',
    descricao: 'Geradoras, transmissoras e distribuidoras de energia elétrica, além de empresas de fontes renováveis e comercializadoras.',
  },
  {
    nome: 'Infraestrutura',
    imagem: 'infrastructure',
    descricao: 'Concessionárias, construtoras, empresas de logística, saneamento e telecomunicações.',
  },
  {
    nome: 'Mineração',
    imagem: 'mining',
    descricao: 'Mineradoras, siderúrgicas, empresas de metais e fornecedoras de equipamentos e serviços para a cadeia mineral.',
  },
  {
    nome: 'Indústria',
    imagem: 'industry',
    descricao: 'Indústrias de bens de consumo, alimentos e bebidas, química e petroquímica, e manufatura em geral.',
  },
  {
    nome: 'Tecnologia',
    imagem: 'technology',
    descricao: 'Empresas de software e SaaS, integradoras, fintechs e áreas de tecnologia de grandes corporações.',
  },
];

export const DIFERENCIAIS = [
  {
    titulo: 'Boutique por escolha',
    texto: 'Atendemos menos clientes para atender melhor. Disponibilizamos uma equipe exclusiva de consultores para cuidar de cada projeto.',
  },
  {
    titulo: 'Consultores atenciosos',
    texto: 'Buscamos entender a fundo o desafio de cada cliente, entregando resultados com humanidade, assertividade e agilidade.',
  },
  {
    titulo: 'Processo estruturado',
    texto: 'Aplicamos metodologias desenvolvidas ao longo de anos em um processo estruturado, que entrega os melhores resultados.',
  },
  {
    titulo: 'Rede construída com relacionamento real',
    texto:
      'Nossa equipe se dedica diariamente a conhecer os melhores profissionais em nossas áreas de atuação, criando um robusto banco de candidatos.',
  },
];
