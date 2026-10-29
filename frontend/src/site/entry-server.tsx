import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Estrutura } from './App';

export { IDIOMAS } from './idioma';
export { CAMINHOS, PAGINAS } from './rotas';
export { LANG, sitemap, tagsSeo } from './seo';

export function render(caminho: string) {
  return renderToString(
    <StaticRouter location={caminho}>
      <Estrutura />
    </StaticRouter>,
  );
}
