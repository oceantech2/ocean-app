# Research: Ações de Tabela Só com Tooltip

**Feature**: `064-tabelas-acoes-tooltip` | **Date**: 2026-09-14

## 1. Superfície de alteração

**Decision**: Centralizar o padrão ícone + tooltip em `ActionButton` quando `context === 'row'`: não renderizar o `<span>{label}</span>` visível; garantir `aria-label={label}` e `title` com o nome da ação (respeitando `title` explícito do chamador, se houver). Manter `context === 'header'` com ícone + texto como hoje.

**Rationale**: Todas as ações de linha tipadas (Editar, Arquivar, Pagar, Excluir, Docs, etc.) já passam por `ActionButton` + `context="row"`. Uma mudança no componente cobre NFs, Contas, Fornecedores, Bonus, Férias, DH, Patrimônio e Fluxo de Caixa sem duplicar lógica. Constituição V: menor superfície.

**Alternatives considered**:
- Editar página a página removendo spans — rejeitado (drift e inconsistência).
- Novo componente `IconActionButton` — rejeitado (duplicação; `context` já distingue header/row).
- Biblioteca de tooltip (Radix, Tippy, etc.) — rejeitado (over-engineering; `title` nativo atende SC-002 e o pedido “ao deixar o mouse em cima”).

## 2. Mecanismo de tooltip

**Decision**: Usar o atributo HTML `title` com o mesmo texto de `label` (salvo override via prop `title` já usada, ex. Excluir permanente em Fornecedores). Manter `aria-label={label}` para leitores de tela / toque.

**Rationale**: Já existe `aria-label`; falta o hover visual. Delay do `title` nativo do browser fica tipicamente dentro de ~1s (SC-002). Sem dependência nova.

**Alternatives considered**:
- Tooltip custom com CSS/`group-hover` — possível depois; não necessário para a spec.
- Só `aria-label` sem `title` — rejeitado (não cumpre “label ao deixar o mouse em cima” de forma visível).

## 3. Layout horizontal sem wrap (FR-009)

**Decision**: Nos containers das células/listas de ações de linha que hoje usam `flex ... flex-wrap`, trocar para `flex-nowrap` (e `items-center` quando fizer sentido). Ajuste de `ROW_BASE` em `actionButtonStyles.ts` para botão mais compacto (menos padding horizontal / gap interno sem texto).

**Rationale**: Spec e clarificação pedem alinhamento horizontal sem quebra de linha. `flex-wrap` atual permite empilhar ícones; com ícones-only o nowrap é viável.

**Alternatives considered**:
- Menu “⋯” overflow — rejeitado (fora do escopo; muda o modelo de interação).
- Manter `flex-wrap` — rejeitado (contradiz FR-009 / SC-006).

## 4. Exceção ações só-texto (FR-003a)

**Decision**: Não converter botões plain text (ex.: Substituir / Remover / + Anexar em NFs e Contas; badges de envio no DH) em `ActionButton` nem adicionar ícones. Não exigir tooltip para identificação nesses casos.

**Rationale**: Clarificação C; escopo fechado.

**Alternatives considered**:
- Unificar tudo em ícone — rejeitado pelo usuário na clarify.
- Remover texto desses botões sem ícone — rejeitado (ficariam sem identificação).

## 5. Escopo de páginas e header

**Decision**: Qualquer uso de `ActionButton` com `context="row"` adota o novo padrão (inclui listas/cards no Fluxo de Caixa que já usam `context="row"`). `context="header"` (Importar, Exportar, Novo, etc.) permanece ícone + texto (FR-007).

**Rationale**: Consistência (FR-006) e spec: fora de tabela/coluna de ações de linha não alterar CTAs de página. Cards do Fluxo que já são “ações de linha” via o mesmo componente herdam o padrão sem trabalho extra.

**Alternatives considered**:
- Limitar só a `<table>` e deixar cards com texto — rejeitado (dois padrões no mesmo `context="row"`).
- Aplicar ícone-only também no header — rejeitado (FR-007; clarify).

## 6. Backend / dados

**Decision**: Nenhuma alteração em API, schemas, permissões ou sync.

**Rationale**: Feature 100% de apresentação; FR-004/005.

**Alternatives considered**: N/A.
