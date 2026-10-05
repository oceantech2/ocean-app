import { ReactNode, useMemo } from 'react';

// Só estas tags viram elementos; o resto vira apenas o texto. Nenhum atributo é copiado.
const PERMITIDAS: Record<string, 'p' | 'ol' | 'ul' | 'li' | 'strong'> = {
  P: 'p',
  OL: 'ol',
  UL: 'ul',
  LI: 'li',
  STRONG: 'strong',
  B: 'strong',
};

function converter(nos: NodeListOf<ChildNode>): ReactNode[] {
  return Array.from(nos).map((no, i) => {
    if (no.nodeType === Node.TEXT_NODE) return no.textContent;
    if (no.nodeType !== Node.ELEMENT_NODE) return null;
    const el = no as Element;
    if (el.tagName === 'BR') return <br key={i} />;
    const filhos = converter(el.childNodes);
    const Tag = PERMITIDAS[el.tagName];
    return Tag ? <Tag key={i}>{filhos}</Tag> : <span key={i}>{filhos}</span>;
  });
}

export default function EscopoRico({ html }: { html: string }) {
  const conteudo = useMemo(
    () => converter(new DOMParser().parseFromString(html, 'text/html').body.childNodes),
    [html],
  );
  return <>{conteudo}</>;
}
