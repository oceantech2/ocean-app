// Mantido em sincronia com backend/app/services/escopo_projeto.py
export const LIMITE_ESCOPO = 5000;
export const MSG_ESCOPO_LONGO = 'Escopo do projeto deve ter no máximo 5.000 caracteres';

const BLOCOS = new Set(['P', 'LI', 'OL', 'UL', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TABLE', 'TR', 'TD', 'TH']);
const ESPACOS = /[ \t\n\r\f]+/g;

const corpo = (html: string) => new DOMParser().parseFromString(html, 'text/html').body;
const limpar = (texto: string) => texto.replace(ESPACOS, ' ').trim();

/** Caracteres de texto sem marcação, com a mesma regra do servidor (espaços colapsados, bordas aparadas). */
export function contarCaracteres(html: string | null | undefined): number {
  if (!html) return 0;
  const linhas: string[] = [];
  let atual = '';
  const quebrar = () => {
    linhas.push(atual);
    atual = '';
  };
  const visitar = (no: Node) => {
    if (no.nodeType === Node.TEXT_NODE) {
      atual += no.textContent ?? '';
      return;
    }
    if (no.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (no as Element).tagName;
    if (tag === 'BR') return quebrar();
    const bloco = BLOCOS.has(tag);
    if (bloco) quebrar();
    no.childNodes.forEach(visitar);
    if (bloco) quebrar();
  };
  corpo(html).childNodes.forEach(visitar);
  quebrar();
  return linhas.reduce((total, linha) => total + limpar(linha).length, 0);
}

function textoInline(el: Element): string {
  let texto = '';
  el.childNodes.forEach((no) => {
    if (no.nodeType === Node.TEXT_NODE) texto += no.textContent ?? '';
    else if (no.nodeType === Node.ELEMENT_NODE) {
      const tag = (no as Element).tagName;
      if (tag === 'BR') texto += ' ';
      else if (tag !== 'OL' && tag !== 'UL') texto += textoInline(no as Element);
    }
  });
  return limpar(texto);
}

/** Texto simples para o histórico: "1." e "•" por item, 2º nível recuado. */
export function escopoParaTexto(html: string | null | undefined): string {
  if (!html) return '';
  const linhas: string[] = [];
  const listar = (lista: Element, nivel: number) => {
    let n = 1;
    Array.from(lista.children).forEach((li) => {
      const prefixo = lista.tagName === 'OL' ? `${n++}.` : '•';
      const texto = textoInline(li);
      if (texto) linhas.push(`${'   '.repeat(nivel)}${prefixo} ${texto}`);
      Array.from(li.children)
        .filter((filho) => filho.tagName === 'OL' || filho.tagName === 'UL')
        .forEach((sub) => listar(sub, nivel + 1));
    });
  };
  corpo(html).childNodes.forEach((no) => {
    if (no.nodeType === Node.TEXT_NODE) {
      const texto = limpar(no.textContent ?? '');
      if (texto) linhas.push(texto);
    } else if (no.nodeType === Node.ELEMENT_NODE) {
      const el = no as Element;
      if (el.tagName === 'OL' || el.tagName === 'UL') listar(el, 0);
      else {
        const texto = textoInline(el);
        if (texto) linhas.push(texto);
      }
    }
  });
  return linhas.join('\n');
}
