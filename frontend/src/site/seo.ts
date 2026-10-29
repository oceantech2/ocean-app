import { CONTATO } from './dados/conteudo';
import { IDIOMAS, type Idioma } from './idioma';
import { CAMINHOS, PAGINAS, type Pagina } from './rotas';

/** Domínio canônico: o outro host (sem www) deve redirecionar para este na Vercel. */
export const URL_SITE = 'https://www.oceantalentsolutions.com';

export const LANG: Record<Idioma, string> = { pt: 'pt-BR', en: 'en' };
const LOCALE_OG: Record<Idioma, string> = { pt: 'pt_BR', en: 'en_US' };

const IMAGEM = { caminho: '/site/img/home-hero.jpg', largura: 1376, altura: 768 };

const SEO: Record<Pagina, Record<Idioma, { titulo: string; descricao: string }>> = {
  home: {
    pt: {
      titulo: 'Ocean Talent Solutions | Executive Search e Capital Humano',
      descricao:
        'Consultoria boutique de capital humano: Executive Search, Offshore Talent, Outsourcing e Development & Outplacement em Petróleo & Gás, Energia, Mineração e mais.',
    },
    en: {
      titulo: 'Ocean Talent Solutions | Executive Search and Human Capital',
      descricao:
        'Boutique human capital consultancy: Executive Search, Offshore Talent, Outsourcing and Development & Outplacement in Oil & Gas, Energy, Mining and more.',
    },
  },
  solucoes: {
    pt: {
      titulo: 'Soluções em Capital Humano | Ocean Talent Solutions',
      descricao:
        'Executive Search, recrutamento offshore, outsourcing de profissionais, assessment e outplacement: soluções para toda a cadeia de capital humano.',
    },
    en: {
      titulo: 'Human Capital Solutions | Ocean Talent Solutions',
      descricao:
        'Executive search, offshore recruitment, professional outsourcing, assessment and outplacement: solutions across the entire human capital chain.',
    },
  },
  vagas: {
    pt: {
      titulo: 'Vagas Executivas | Ocean Talent Solutions',
      descricao:
        'Confira as vagas em andamento na Ocean Talent Solutions e demonstre interesse em posições de gerência, diretoria e C-level.',
    },
    en: {
      titulo: 'Executive Jobs | Ocean Talent Solutions',
      descricao:
        'Explore the current openings at Ocean Talent Solutions and register your interest in management, director and C-level positions.',
    },
  },
  noticias: {
    pt: {
      titulo: 'Notícias de Mercado | Ocean Talent Solutions',
      descricao:
        'Curadoria semanal das principais movimentações em RH, liderança, mercado de trabalho e tendências por setor.',
    },
    en: {
      titulo: 'Market News | Ocean Talent Solutions',
      descricao: 'Weekly curation of the main moves in HR, leadership, labour market and sector trends.',
    },
  },
};

function escapar(texto: string) {
  return texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function urlDaPagina(pagina: Pagina, idioma: Idioma) {
  return `${URL_SITE}${CAMINHOS[pagina][idioma]}`;
}

function dadosEstruturados(idioma: Idioma) {
  const dados = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${URL_SITE}/#organizacao`,
        name: 'Ocean Talent Solutions',
        url: `${URL_SITE}/`,
        logo: `${URL_SITE}/site/img/ocean-logo-wordmark.png`,
        image: `${URL_SITE}${IMAGEM.caminho}`,
        description: SEO.home[idioma].descricao,
        email: CONTATO.email,
        telephone: CONTATO.telefoneLink.replace('tel:', ''),
        sameAs: [CONTATO.linkedin],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: CONTATO.email,
          telephone: CONTATO.telefoneLink.replace('tel:', ''),
          availableLanguage: ['Portuguese', 'English'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${URL_SITE}/#site`,
        name: 'Ocean Talent Solutions',
        url: `${URL_SITE}/`,
        inLanguage: ['pt-BR', 'en'],
        publisher: { '@id': `${URL_SITE}/#organizacao` },
      },
    ],
  };
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}

/** Tags do <head> que variam por página e idioma; marcadas com data-seo para serem trocadas na navegação. */
export function tagsSeo(pagina: Pagina, idioma: Idioma) {
  const { titulo, descricao } = SEO[pagina][idioma];
  const outro: Idioma = idioma === 'pt' ? 'en' : 'pt';
  const imagem = `${URL_SITE}${IMAGEM.caminho}`;
  return [
    `<title data-seo>${escapar(titulo)}</title>`,
    `<meta data-seo name="description" content="${escapar(descricao)}" />`,
    `<link data-seo rel="canonical" href="${urlDaPagina(pagina, idioma)}" />`,
    ...IDIOMAS.map((i) => `<link data-seo rel="alternate" hreflang="${LANG[i.id]}" href="${urlDaPagina(pagina, i.id)}" />`),
    `<link data-seo rel="alternate" hreflang="x-default" href="${urlDaPagina(pagina, 'pt')}" />`,
    `<meta data-seo property="og:title" content="${escapar(titulo)}" />`,
    `<meta data-seo property="og:description" content="${escapar(descricao)}" />`,
    `<meta data-seo property="og:url" content="${urlDaPagina(pagina, idioma)}" />`,
    `<meta data-seo property="og:locale" content="${LOCALE_OG[idioma]}" />`,
    `<meta data-seo property="og:locale:alternate" content="${LOCALE_OG[outro]}" />`,
    `<meta data-seo property="og:image" content="${imagem}" />`,
    `<meta data-seo property="og:image:width" content="${IMAGEM.largura}" />`,
    `<meta data-seo property="og:image:height" content="${IMAGEM.altura}" />`,
    `<meta data-seo name="twitter:title" content="${escapar(titulo)}" />`,
    `<meta data-seo name="twitter:description" content="${escapar(descricao)}" />`,
    `<meta data-seo name="twitter:image" content="${imagem}" />`,
    `<script data-seo type="application/ld+json">${dadosEstruturados(idioma)}</script>`,
  ].join('\n    ');
}

export function aplicarSeo(pagina: Pagina, idioma: Idioma) {
  document.documentElement.lang = LANG[idioma];
  document.head.querySelectorAll('[data-seo]').forEach((tag) => tag.remove());
  document.head.insertAdjacentHTML('beforeend', tagsSeo(pagina, idioma));
}

export function sitemap() {
  const urls = PAGINAS.flatMap((pagina) =>
    IDIOMAS.map(({ id }) =>
      [
        '  <url>',
        `    <loc>${urlDaPagina(pagina, id)}</loc>`,
        ...IDIOMAS.map(
          (i) => `    <xhtml:link rel="alternate" hreflang="${LANG[i.id]}" href="${urlDaPagina(pagina, i.id)}" />`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlDaPagina(pagina, 'pt')}" />`,
        '  </url>',
      ].join('\n'),
    ),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
