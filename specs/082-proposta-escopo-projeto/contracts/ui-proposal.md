# Contrato: Interface (alterações da 082)

Só as diferenças em relação a [081/contracts/ui-proposal.md](../../081-proposta-idioma-moeda/contracts/ui-proposal.md).

## 1. Formulário (Nova proposta, Editar, Criar cópia) — `ModeloForm`

Seção **Projeto**, logo depois de "Nome do projeto" e antes de Garantia/Validade:

- Rótulo: **Escopo do Projeto (opcional)**.
- Texto de apoio: "Aparece na seção Escopo do Projeto da proposta. Deixe em branco para não exibir a seção."
- Editor (`EditorEscopo`, carregado com `React.lazy`; enquanto carrega, uma caixa com a mesma altura e spinner `animate-spin`):
  - Barra de comandos com botões com ícone e `title`/`aria-label`: **Negrito** (Ctrl/Cmd+B), **Lista numerada**, **Lista com marcadores**, **Aumentar recuo** (Tab), **Diminuir recuo** (Shift+Tab). O botão ativo fica destacado (`bg-ocean-700 text-white`), no mesmo padrão do alternador %/R$.
  - "Aumentar recuo" só fica habilitado num item de lista do 1º nível (limite de 2 níveis).
  - Área editável com a altura mínima de cerca de 6 linhas, crescendo com o conteúdo, borda e foco no padrão dos inputs (`border-gray-300`, `focus:ring-ocean-600`; `border-red-400` com erro).
  - A área usa os estilos de lista dentro do editor (numeração, marcadores e recuo visíveis), porque o reset do Tailwind remove marcadores.
  - Contador à direita, abaixo da área: "N / 5.000", em vermelho acima do limite.
- Validação no envio: mais de 5.000 caracteres → erro no campo "Escopo do projeto deve ter no máximo 5.000 caracteres" e envio bloqueado.
- Payload: `projeto_escopo` = HTML do editor, ou `null` quando `contarCaracteres(html) === 0`.
- Edição e Criar cópia: o editor abre com o escopo salvo (`formDeModelo` copia `projeto_escopo`).
- Resumo lateral: sem mudança.

## 2. Detalhe — `Detalhe.tsx`

- Card **Escopo do Projeto** depois do card do projeto (nas propostas por modelo), com o conteúdo exibido por `EscopoRico`, com estilo de leitura (listas com numeração e marcadores, negrito). Sem escopo: "Não informado" em cinza.
- Propostas simples: o card não aparece.
- Histórico: rótulo `projeto_escopo` → "Escopo do Projeto"; valores convertidos por `escopoParaTexto` e exibidos com `whitespace-pre-line`; `null` → "—".

`escopoParaTexto(html)`:

```text
<p>Neste projeto, a Ocean irá:</p><ol><li>Assessar…<ul><li><strong>Gerência:</strong> hard…</li></ul></li></ol>
→
Neste projeto, a Ocean irá:
1. Assessar…
   • Gerência: hard…
```

## 3. Página do cliente — `ExecutiveSearchV1` (versões 1 e 2)

Recursos por versão em `versoes.ts` ([data-model.md](../data-model.md) §5).

### 3.1 Título da divisão (versão 2)

- Menu: o primeiro link `<a href="#servico">` exibe `t.servico.tituloDivisao` ("Executive Search").
- `<section id="servico">`: `<h2>` com `t.servico.tituloDivisao`.
- Versão 1: continua com `t.nav.servico` ("Serviço"/"Service").

### 3.2 Seção Escopo do Projeto (versão 2, só com `projeto_escopo`)

Menu, entre Metodologia e Investimento:

```html
<a href="#escopo">{t.nav.escopo}</a>
```

Seção, entre `#metodologia` e `#investimento`:

```html
<section id="escopo">
  <div class="head"><h2>{t.nav.escopo}</h2></div>
  <div class="scope"><EscopoRico html={projeto_escopo} /></div>
</section>
```

- Sem escopo (ou versão 1): nem o link nem a seção são renderizados (sem `hidden`, sem espaço reservado).
- CSS acrescentado a `executive-search-v1.css`, copiado do modelo novo e escopado em `.tpl-es`:

```css
.tpl-es .scope{max-width:760px;font-size:16px;line-height:1.6}
.tpl-es .scope p{margin:0 0 var(--space-12)}
.tpl-es .scope ol{margin:0 0 var(--space-12);padding-left:22px;display:grid;gap:var(--space-12)}
.tpl-es .scope ol>li{padding-left:6px}
.tpl-es .scope ol>li::marker{color:var(--action);font-weight:600}
.tpl-es .scope ul{list-style:disc;margin:var(--space-8) 0 0;padding-left:20px;display:grid;gap:var(--space-8);font-size:15px}
.tpl-es .scope ul li::marker{color:var(--navy)}
.tpl-es .scope strong{font-weight:600;color:var(--fg-title)}
```

  Mais uma regra de quebra para palavras longas (`overflow-wrap:anywhere` em `.tpl-es .scope`), exigida pelo edge case de item longo.

- Impressão: a seção segue as regras de impressão já existentes (sem regra nova; nenhum `display:none`).

### 3.3 Textos novos (i18n)

| Chave | pt-BR | en-US |
|---|---|---|
| `nav.escopo` | Escopo do Projeto | Project Scope |
| `servico.tituloDivisao` | Executive Search | Executive Search |

### 3.4 `EscopoRico`

- Entrada: HTML canônico. Saída: elementos React criados a partir de `DOMParser().parseFromString(html, 'text/html').body`, percorrendo os nós e aceitando só `P`, `OL`, `UL`, `LI`, `STRONG` (e `B` como `strong`), `BR` e nós de texto; outras tags viram apenas o texto delas; nenhum atributo é copiado.
- Usado na página do cliente (dentro de `.scope`) e no detalhe.
