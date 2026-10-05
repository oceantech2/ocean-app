"""Escopo do Projeto (feature 082): normaliza o texto formatado para o HTML canônico restrito.

A saída é reconstruída do zero a partir de uma lista branca (p, ol, ul, li, strong, br), sem atributos e
com o texto escapado; o HTML recebido nunca é repassado. Gramática em specs/082-proposta-escopo-projeto/data-model.md §2.
"""
import html
import re
from html.parser import HTMLParser
from typing import Optional, Union

from fastapi import HTTPException

LIMITE_ESCOPO = 5000
LIMITE_ENTRADA = 100_000
MSG_ESCOPO_LONGO = "Escopo do projeto deve ter no máximo 5.000 caracteres"

_DESCARTAR_COM_CONTEUDO = {"script", "style", "template", "iframe", "object", "noscript", "textarea"}
# Blocos desconhecidos viram fronteira de parágrafo
_BLOCOS = {
    "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "table", "thead", "tbody", "tfoot",
    "tr", "td", "th", "section", "article", "header", "footer", "aside", "dl", "dt", "dd", "figure",
    "figcaption", "address",
}
_LISTAS = ("ol", "ul")
_BLOCO_OU_LISTA = ("p", "ol", "ul", "li")
# Mesmo conjunto que o navegador/ProseMirror colapsa (não inclui o espaço não separável)
_ESPACOS = re.compile(r"[ \t\n\r\f]+")


class _No:
    __slots__ = ("tag", "filhos")

    def __init__(self, tag: str):
        self.tag = tag
        self.filhos: list[Union["_No", str]] = []


class _Arvore(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.raiz = _No("raiz")
        self.pilha = [self.raiz]
        self.descartando = 0

    @staticmethod
    def _tag(tag: str) -> Optional[str]:
        if tag == "b":
            return "strong"
        if tag in _BLOCOS:
            return "p"
        if tag in ("p", "ol", "ul", "li", "strong"):
            return tag
        return None

    def handle_starttag(self, tag, attrs):
        if tag in _DESCARTAR_COM_CONTEUDO:
            self.descartando += 1
            return
        if self.descartando:
            return
        if tag == "br":
            self.pilha[-1].filhos.append(_No("br"))
            return
        mapeada = self._tag(tag)
        if mapeada:
            no = _No(mapeada)
            self.pilha[-1].filhos.append(no)
            self.pilha.append(no)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag != "br":
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in _DESCARTAR_COM_CONTEUDO:
            self.descartando = max(0, self.descartando - 1)
            return
        if self.descartando:
            return
        mapeada = self._tag(tag)
        if not mapeada:
            return
        for i in range(len(self.pilha) - 1, 0, -1):
            if self.pilha[i].tag == mapeada:
                del self.pilha[i:]
                return

    def handle_data(self, data):
        if not self.descartando and data:
            self.pilha[-1].filhos.append(data)


# Trecho inline: ("t", texto, negrito) ou ("br",)
Inline = list[tuple]


def _inline(filhos, negrito: bool = False) -> Inline:
    saida: Inline = []
    for f in filhos:
        if isinstance(f, str):
            saida.append(("t", f, negrito))
        elif f.tag == "br":
            saida.append(("br",))
        elif f.tag == "strong":
            saida.extend(_inline(f.filhos, True))
        else:
            saida.append(("br",))
            saida.extend(_inline(f.filhos, negrito))
            saida.append(("br",))
    return saida


def _limpar(trechos: Inline) -> Inline:
    """Colapsa espaços, apara as bordas (do bloco e em volta de <br>) e junta trechos vizinhos."""
    linhas: list[list[list]] = [[]]
    for t in trechos:
        if t[0] == "br":
            linhas.append([])
            continue
        texto = _ESPACOS.sub(" ", t[1])
        negrito = t[2] and texto.strip(" ") != ""
        atual = linhas[-1]
        if atual and atual[-1][1] == negrito:
            atual[-1][0] += texto
        else:
            atual.append([texto, negrito])

    limpas: list[list[list]] = []
    for linha in linhas:
        anterior_espaco = True
        for trecho in linha:
            if anterior_espaco:
                trecho[0] = trecho[0].lstrip(" ")
            trecho[0] = re.sub(r" {2,}", " ", trecho[0])
            if trecho[0]:
                anterior_espaco = trecho[0].endswith(" ")
        while linha and not linha[-1][0].rstrip(" "):
            linha.pop()
        if linha:
            linha[-1][0] = linha[-1][0].rstrip(" ")
        linha = [t for t in linha if t[0]]
        if linha:
            limpas.append(linha)

    saida: Inline = []
    for i, linha in enumerate(limpas):
        if i:
            saida.append(("br",))
        for texto, negrito in linha:
            saida.append(("t", texto, negrito))
    return saida


def _tamanho(trechos: Inline) -> int:
    return sum(len(t[1]) for t in trechos if t[0] == "t")


def _item(li: _No, nivel: int) -> list[dict]:
    """Um <li> vira um item; no 2º nível, listas internas são achatadas em itens irmãos logo depois."""
    trechos: Inline = []
    sub: Optional[dict] = None
    extras: list[dict] = []

    def consumir(filhos):
        nonlocal sub
        for f in filhos:
            if isinstance(f, _No) and f.tag in _LISTAS:
                itens = _itens(f, nivel + 1)
                if nivel == 1:
                    if sub is None:
                        sub = {"tipo": f.tag, "itens": []}
                    sub["itens"].extend(itens)
                else:
                    extras.extend(itens)
            elif isinstance(f, _No) and f.tag in ("p", "li"):
                if trechos:
                    trechos.append(("br",))
                consumir(f.filhos)
            else:
                trechos.extend(_inline([f]))

    consumir(li.filhos)
    item = {"inline": _limpar(trechos), "sub": sub}
    return [item, *extras]


def _itens(lista: _No, nivel: int) -> list[dict]:
    itens: list[dict] = []
    for f in lista.filhos:
        if isinstance(f, _No) and f.tag in _LISTAS:
            internos = _itens(f, nivel + 1)
            if nivel == 1 and itens:
                if itens[-1]["sub"] is None:
                    itens[-1]["sub"] = {"tipo": f.tag, "itens": []}
                itens[-1]["sub"]["itens"].extend(internos)
            else:
                itens.extend(internos)
        elif isinstance(f, _No) and f.tag == "li":
            itens.extend(_item(f, nivel))
        elif isinstance(f, str) and not f.strip(" \t\n\r\f"):
            continue
        else:
            falso = _No("li")
            falso.filhos = f.filhos if isinstance(f, _No) and f.tag == "p" else [f]
            itens.extend(_item(falso, nivel))
    return itens


def _blocos(filhos) -> list[dict]:
    blocos: list[dict] = []
    pendente: list = []

    def descarregar():
        if pendente:
            blocos.append({"tipo": "p", "inline": _limpar(_inline(pendente))})
            pendente.clear()

    for f in filhos:
        if isinstance(f, _No) and f.tag in _LISTAS:
            descarregar()
            blocos.append({"tipo": f.tag, "itens": _itens(f, 1)})
        elif isinstance(f, _No) and f.tag == "li":
            descarregar()
            blocos.extend(_blocos(f.filhos))
        elif isinstance(f, _No) and f.tag == "p":
            descarregar()
            if any(isinstance(n, _No) and n.tag in _BLOCO_OU_LISTA for n in f.filhos):
                blocos.extend(_blocos(f.filhos))
            else:
                blocos.append({"tipo": "p", "inline": _limpar(_inline(f.filhos))})
        else:
            pendente.append(f)
    descarregar()
    return blocos


def _html_inline(trechos: Inline) -> str:
    partes = []
    for t in trechos:
        if t[0] == "br":
            partes.append("<br>")
        elif t[2]:
            partes.append(f"<strong>{html.escape(t[1], quote=False)}</strong>")
        else:
            partes.append(html.escape(t[1], quote=False))
    return "".join(partes)


def _podar_itens(itens: list[dict]) -> list[dict]:
    vivos = []
    for item in itens:
        if item.get("sub"):
            item["sub"]["itens"] = _podar_itens(item["sub"]["itens"])
            if not item["sub"]["itens"]:
                item["sub"] = None
        if item["inline"] or item.get("sub"):
            vivos.append(item)
    return vivos


def _serializar(blocos: list[dict]) -> tuple[str, int]:
    partes: list[str] = []
    total = 0
    for bloco in blocos:
        if bloco["tipo"] == "p":
            if not bloco["inline"]:
                continue
            total += _tamanho(bloco["inline"])
            partes.append(f"<p>{_html_inline(bloco['inline'])}</p>")
            continue
        itens = _podar_itens(bloco["itens"])
        if not itens:
            continue
        lis = []
        for item in itens:
            total += _tamanho(item["inline"])
            interno = ""
            if item["sub"]:
                sub_lis = []
                for s in item["sub"]["itens"]:
                    total += _tamanho(s["inline"])
                    sub_lis.append(f"<li>{_html_inline(s['inline'])}</li>")
                tipo = item["sub"]["tipo"]
                interno = f"<{tipo}>{''.join(sub_lis)}</{tipo}>"
            lis.append(f"<li>{_html_inline(item['inline'])}{interno}</li>")
        partes.append(f"<{bloco['tipo']}>{''.join(lis)}</{bloco['tipo']}>")
    return "".join(partes), total


def normalizar_escopo(entrada: Optional[str]) -> Optional[str]:
    """Devolve o HTML canônico do escopo ou None quando não há texto visível (422 acima do limite)."""
    if entrada is None or not entrada.strip():
        return None
    if len(entrada) > LIMITE_ENTRADA:
        raise HTTPException(status_code=422, detail=MSG_ESCOPO_LONGO)
    arvore = _Arvore()
    arvore.feed(entrada)
    arvore.close()
    saida, total = _serializar(_blocos(arvore.raiz.filhos))
    if total > LIMITE_ESCOPO:
        raise HTTPException(status_code=422, detail=MSG_ESCOPO_LONGO)
    return saida or None
