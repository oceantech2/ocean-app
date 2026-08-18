# Research: Tabela Contas a Receber — Cabeçalho e Área de Scroll

**Feature**: `033-contas-receber-tabela` | **Date**: 2026-08-18  
**Spec**: [spec.md](./spec.md)

## 1. Onde implementar (página vs componente compartilhado)

**Decision**: Alterar apenas `frontend/src/pages/NFs.tsx` (rota Contas a Receber). Não criar DataGrid genérico nem aplicar o padrão em Contas a Pagar nesta feature.

**Rationale**: Spec fecha o escopo nessa tabela; constituição pede a menor solução. A página já tem sticky à direita em Ações.

**Alternatives considered**:
- Componente `TabelaFixa` reutilizável — rejeitado (antecipação; outras páginas fora do escopo).
- Lib de grid (AG Grid, TanStack Table virtual) — rejeitado (dependência nova, overkill para ~15–100 linhas paginadas).

## 2. Altura: espaço restante da tela sem quebrar outras rotas

**Decision**: A página de NFs vira coluna flex com altura limitada ao viewport abaixo do header do Layout (`calc(100vh - altura do header - padding do main)`). Título, filtros e cards de resumo ficam `shrink-0`; o card da tabela fica `flex-1 min-h-0`. Paginação fica **fora** do viewport de scroll, no rodapé do card.

Se o `main` do Layout não transmitir altura (`min-h-0`), aplicar o menor ajuste possível (ex.: classe condicional na rota `/nfs` ou wrapper só nesta página). **Não** colocar `overflow-hidden` no `main` de todas as rotas.

**Rationale**: FR-006 / SC-006 exigem preencher o restante da tela; o Layout atual (`min-h-screen` + `main` sem altura travada) faz a página inteira crescer. Travamento global quebraria Dashboard, Contas a Pagar, etc.

**Alternatives considered**:
- `position: sticky` no `thead` com scroll da **janela** — rejeitado (clarify: não grudar no topo da janela).
- Altura fixa em px ou “N linhas” — rejeitado (clarify Q4).
- `h-screen` no Layout para todas as páginas — rejeitado (quebra scroll das outras telas).

## 3. Quebra do cabeçalho em duas linhas

**Decision**: Remover `whitespace-nowrap` dos `th` de dados. Usar quebra (`whitespace-normal`, `break-words`) com limite visual de duas linhas (`line-clamp-2` ou equivalente) e `title` / `aria-label` com o nome completo. Linha de cabeçalho com altura mínima para duas linhas de texto (leading compacto). Ícone de ordenação permanece na mesma célula, sem impedir a quebra. Reduzir `min-w` da tabela / larguras mínimas das colunas para o ganho de espaço (rótulos deixam de forçar uma linha larga).

**Rationale**: FR-001 a FR-003 e User Story 1. Células de **dados** mantêm `whitespace-nowrap` / truncate atuais (FR-011).

**Alternatives considered**:
- Abreviações (“Mét. pagto”) — rejeitado (spec pede quebra, não novo vocabulário).
- Cabeçalho sempre uma linha com tooltip — rejeitado (não atende duas linhas visíveis).

## 4. Colunas e cabeçalho fixos (sticky)

**Decision**: Uma única `<table>` (alinhamento de colunas nativo). No viewport de corpo:
- `thead th`: `sticky top-0` + fundo opaco (claro/escuro) + z-index acima das células.
- Primeira coluna (`th`/`td` Projeto): `sticky left-0` + fundo da linha (`rowBg`) para não transparecer.
- Última coluna Ações: manter `sticky right-0` já existente, com fundo da linha.
- Cantos (Projeto no thead, Ações no thead): z-index maior que as células sticky do corpo.

**Rationale**: Já há sticky à direita; o mesmo mecanismo atende FR-004, FR-005 e FR-012 sem duas tabelas.

**Alternatives considered**:
- Duas tabelas (header clone + body) com `colgroup` duplicado — só se o trilho horizontal no topo exigir; preferir uma tabela + trilho dummy se as larguras divergirem.
- `position: fixed` no cabeçalho — rejeitado (sai da área da tabela).

## 5. Rolagem horizontal no cabeçalho (não no rodapé da lista)

**Decision**: Viewport da tabela em duas faixas:
1. **Trilho horizontal no topo** (`overflow-x-auto`, altura do cabeçalho ou barra nativa visível junto aos nomes) — é o controle de FR-007.
2. **Corpo** (`flex-1 min-h-0`, `overflow-y-auto`, `overflow-x-hidden`) — só scroll vertical das linhas.

Sincronizar `scrollLeft` do trilho com o da tabela (refs + `onScroll`). Shift+roda / gesto horizontal no corpo encaminha para o trilho, se o overflow-x do corpo estiver oculto.

A barra horizontal **não** fica só depois da última linha da lista (problema atual de `overflow-x-auto` no wrapper da tabela inteira).

**Rationale**: Clarify: scroll horizontal no título; scroll vertical interno. Com viewport limitado, uma única `overflow: auto` colocaria a barra nativa na **base do painel** (melhor que hoje, mas não “no cabeçalho”).

**Alternatives considered**:
- Um único `overflow: auto` com sticky thead — mais simples, barra na base da área; rejeitado por FR-007.
- Truque `scaleY(-1)` para inverter a barra nativa — rejeitado (frágil com sticky e dark mode).

## 6. Estados vazio, loading e paginação

**Decision**: Loading e “nenhuma conta” permanecem como hoje, sem trilho de scroll falso. Com dados, paginação (`Pagination` + seletor “por página”) fica **abaixo** da área de scroll, sempre visível no card. Filtros e cards de resumo permanecem acima, fora do viewport da tabela.

**Rationale**: FR-009; empty state da spec.

**Alternatives considered**: Incluir paginação dentro do scroll do corpo — rejeitado (obrigaria descer para trocar de página).

## 7. Fundo das células sticky e dark mode

**Decision**: Células sticky usam as mesmas classes de fundo da linha (`rowBg`) e o thead usa o fundo atual (`bg-gray-50` / `dark:bg-gray-700`), para o conteúdo que passa por baixo não aparecer através da coluna/cabeçalho.

**Rationale**: Consistência visual (constituição IV); Ações já faz isso.

**Alternatives considered**: Fundo transparente — rejeitado (ilegível ao rolar).
