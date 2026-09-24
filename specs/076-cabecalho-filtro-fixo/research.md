# Research: Cabeçalho com Filtros Fixo no Scroll

**Feature**: `076-cabecalho-filtro-fixo` | **Date**: 2026-09-23

## 1. Padrão de referência e correção de offset

**Decision**: Usar o espírito de `FluxoCaixa.tsx` (bloco sticky com título + filtros + ações, fundo opaco), mas **corrigir** `sticky top-0` para `sticky top-[5.5rem]`, alinhado ao header global e à sidebar em `Layout.tsx` (`top-[5.5rem]` / `h-[calc(100vh-5.5rem)]`).

**Rationale**: Com o header da app em `sticky top-0 z-50`, um cabeçalho de página com `top-0` gruda sob o logo/busca e fica parcialmente oculto. O Layout já documenta a altura efetiva (~`5.5rem`).

**Alternatives considered**:
- Manter `top-0` como Fluxo Caixa hoje — rejeitado (conflito visual com header global)
- `position: fixed` na viewport — rejeitado (sai do fluxo, exige spacer, mais frágil)
- Mudar o scroll para um container interno no `main` — rejeitado nesta entrega (refator de Layout; Constituição V)

## 2. Superfície: constante compartilhada

**Decision**: Criar `frontend/src/utils/pageHeaderSticky.ts` com classes canônicas, no mesmo espírito de `tableScroll.ts`:

| Constante | Uso |
|-----------|-----|
| `PAGE_HEADER_COMBINED_STICKY_CLASS` | Título + filtros + ações no **mesmo** bloco (Dashboard, Fluxo Caixa, etc.) |
| `PAGE_TITLE_STICKY_CLASS` | Só o card de título/ações (bloco superior) |
| `PAGE_FILTERS_STICKY_CLASS` | Só a barra de filtros, com `top` abaixo do título sticky |

Incluir: `sticky`, `top-[…]`, `z-20`/`z-30` (abaixo de `z-50` do Layout), fundo opaco `bg-white dark:bg-gray-800`, e sombra/borda se já existirem no card.

**Rationale**: ~12 páginas; constante única evita drift de offset/z-index/cores.

**Alternatives considered**:
- Componente React `<PageStickyHeader>` — rejeitado nesta entrega (refator grande; risco de regressão)
- Só classes duplicadas — aceitável, mas pior manutenção

## 3. Título e filtros em blocos separados + KPIs no meio

**Decision**: Dual sticky **sem reordenar** o DOM na v1:

1. Card de título/ações: `PAGE_TITLE_STICKY_CLASS` com `top-[5.5rem]` e `z-30`
2. Cards de KPI: **sem** sticky (rolam normalmente)
3. Barra de filtros: `PAGE_FILTERS_STICKY_CLASS` com `top-[calc(5.5rem+5.5rem)]` (offset Layout + altura aproximada do card de título) e `z-20`

Ao rolar, os KPIs saem da vista; filtros sobem até o offset e ficam **contíguos** sob o título (FR-003a / SC-005). Ajustar o segundo offset só se o título wrapar demais em mobile (constante documentada; fine-tune pontual).

**Rationale**: Clarify B + A (KPIs); preserva ordem visual em repouso (título → KPIs → filtros) usada em Contas a Pagar.

**Alternatives considered**:
- Reordenar DOM para título → filtros → KPIs e um único wrapper sticky — rejeitado na v1 (muda layout em repouso)
- `ResizeObserver` medindo altura do título — possível evolução; over-engineering agora
- Só sticky nos filtros — rejeitado (clarify B)

## 4. Inventário de páginas

**Decision**:

| Página | Tratamento |
|--------|------------|
| Fluxo de Caixa | Já sticky combinado — migrar para constante + corrigir `top` |
| Dashboard | Título + mês/ano/visão no mesmo card → sticky combinado; bloco “Limiar do Alerta” **não** sticky |
| Contas a Pagar | Dual sticky (título + filtros); KPIs rolam |
| NFs (Contas a receber) | Dual sticky (título + filtros); sem KPI entre (se surgir, mesmo padrão Contas) |
| Bônus, Férias, DH, Fornecedores, Patrimônio, Impostos, Retiradas, Auditoria | Sticky no(s) bloco(s) de título/filtros conforme estrutura atual (combinado ou dual) |
| Calendário, Segurança, Contratos, Configurações | Sem filtro de listagem no topo — **fora** |
| Header global / sidebar | Sem mudança de comportamento (só referência de altura) |
| Cabeçalho de colunas (`tableScroll.ts`) | Intocado; z-index da tabela permanece relativo ao scroll da grade |

**Rationale**: Spec FR-001/FR-004; inventário real do frontend.

## 5. Scroll da página vs. scroll interno da tabela

**Decision**: Sticky do cabeçalho de **página** responde ao scroll do documento (padrão atual do Layout: `min-h-screen` + `main` sem overflow próprio). O sticky de `th` (073) continua no container `overflow-auto` da tabela — independente.

**Rationale**: FR-005; não misturar os dois eixos de sticky.

**Alternatives considered**:
- Forçar a página a só rolar a tabela — rejeitado (já coberto por 073; esta feature é o chrome da página)

## 6. Fundo opaco, z-index e impressão

**Decision**:
- Fundo do sticky **sempre opaco** (claro/escuro)
- `z-20`/`z-30` no cabeçalho de página; header app `z-50`; dropdowns/modais acima
- Manter `no-print` onde já existir; não exigir sticky em `@media print`

**Rationale**: FR-006, edge cases da spec, SC-003.

## 7. Backend / dados

**Decision**: Nenhuma alteração de API, store de filtros além do layout, permissões ou persistência.

**Rationale**: Assumptions da spec; escopo só UX.
