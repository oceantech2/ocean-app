import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createServer, type Plugin } from 'vite';

type Idioma = 'pt' | 'en';

interface EntradaServidor {
  IDIOMAS: { id: Idioma }[];
  PAGINAS: string[];
  CAMINHOS: Record<string, Record<Idioma, string>>;
  LANG: Record<Idioma, string>;
  render: (caminho: string) => string;
  tagsSeo: (pagina: string, idioma: Idioma) => string;
  sitemap: () => string;
}

/** Arquivo gerado para cada caminho do site; o vercel.json reescreve cada rota para o seu arquivo. */
function arquivoDaPagina(caminho: string) {
  return `site/paginas/${caminho === '/' ? 'index' : caminho.slice(1)}.html`;
}

// Gera o HTML já renderizado de cada página do site institucional (pt e en), com título, descrição,
// canonical e hreflang próprios, para buscadores e prévias de link que não executam JavaScript.
export default function prerenderSite(): Plugin {
  let raiz = '';
  let saida = '';
  return {
    name: 'prerender-site',
    apply: 'build',
    configResolved(config) {
      raiz = config.root;
      saida = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const servidor = await createServer({
        root: raiz,
        configFile: false,
        logLevel: 'error',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false },
      });
      try {
        const m = (await servidor.ssrLoadModule('/src/site/entry-server.tsx')) as EntradaServidor;
        const modelo = readFileSync(resolve(saida, 'site.html'), 'utf8');
        if (!modelo.includes('<!-- seo -->') || !modelo.includes('<div id="root"></div>')) {
          throw new Error('site.html sem os marcadores esperados (<!-- seo --> e <div id="root"></div>)');
        }
        for (const pagina of m.PAGINAS) {
          for (const { id: idioma } of m.IDIOMAS) {
            const caminho = m.CAMINHOS[pagina][idioma];
            const html = modelo
              .replace(/<html lang="[^"]*">/, () => `<html lang="${m.LANG[idioma]}">`)
              .replace(/<!-- seo -->[\s\S]*?<!-- \/seo -->/, () => m.tagsSeo(pagina, idioma))
              .replace('<div id="root"></div>', () => `<div id="root">${m.render(caminho)}</div>`);
            const arquivo = resolve(saida, arquivoDaPagina(caminho));
            mkdirSync(dirname(arquivo), { recursive: true });
            writeFileSync(arquivo, html);
          }
        }
        writeFileSync(resolve(saida, 'site/sitemap.xml'), m.sitemap());
      } finally {
        await servidor.close();
      }
    },
  };
}
