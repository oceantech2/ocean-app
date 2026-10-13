# Implementation Plan: Visão Líquido/Bruto e novos cards em Contas a Receber

**Branch**: `089-contas-receber-visao-cards` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/089-contas-receber-visao-cards/spec.md`

**Note**: Clarify 2026-10-13 — visão afeta cards e tabela; padrão Líquido.

## Summary

O endpoint `GET /api/nfs/resumo/total` já devolve `total_bruto_*`, `total_liquido_*` e `qtd_*` para pagas, pendentes e vencidas (canceladas fora). A mudança é 100% frontend em `NFs.tsx`: (1) estado `nfsVisao: 'liquido' | 'bruto'` no `usePageFilters` (persiste na navegação, padrão `'liquido'`); (2) botão **Líquido | Bruto** no cabeçalho, no mesmo visual do Dashboard; (3) cards Receita Total / Recebido / Pendente / Vencido calculados a partir do resumo com `valorPorVisao` (`utils/metaPeriodo.ts`); (4) colunas da tabela derivadas da visão — some "Bruto" ou "Líquido", "Imposto" permanece; ordenação ativa na coluna oculta migra para a visível. Backend intocado.

## Technical Context

**Language/Version**: TypeScript 5.2 + React 18 (frontend)

**Primary Dependencies**: React, Tailwind CSS, Zustand (`usePageFilters`), `utils/metaPeriodo.ts` (`VisaoReceita`, `valorPorVisao`, `rotuloVisao`)

**Storage**: N/A — sem mudança de schema; endpoint de resumo existente

**Testing**: Validação manual via [quickstart.md](./quickstart.md); `npm run type-check` e `npm run build` no `frontend/`

**Target Platform**: Web interna; frontend **5193**; API **8001** (inalteradas)

**Project Type**: Web application (somente frontend)

**Performance Goals**: Troca de visão instantânea (apenas re-render; sem nova requisição)

**Constraints**: Não alterar exportações, formulário, cálculo fiscal nem o endpoint de resumo; tema claro/escuro; `visualizador` também vê o botão

**Scale/Scope**: 3 arquivos (`pages/NFs.tsx`, `store/index.ts`, novo `utils/resumoReceber.ts`); 0 endpoints; 0 migrations

## Constitution Check

| Gate | Status |
|------|--------|
| I. Idioma Português (pt-BR) nos artefatos | PASS |
| II. Domínio financeiro / papéis admin·visualizador | PASS — exibição apenas; ambos os papéis |
| III. Clareza antes de implementar | PASS — clarify registrado (cards + tabela, padrão Líquido) |
| IV. Consistência com produto existente | PASS — mesmo botão e helpers do Dashboard |
| V. Simplicidade e escopo fechado | PASS — reuso do resumo e de `valorPorVisao` |
| Portas / segredos | PASS |

**Post-design re-check**: Sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/089-contas-receber-visao-cards/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contas-receber-visao-cards.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/utils/resumoReceber.ts  # cardsResumoReceber(resumo, visao) → 4 cards (puro)
frontend/src/store/index.ts          # nfsVisao + setNfsVisao em usePageFilters
frontend/src/pages/NFs.tsx           # botão Líquido|Bruto, cards novos, colunas por visão
```

**Structure Decision**: Cálculo dos cards em helper puro (`utils/resumoReceber.ts`), no padrão de `utils/receitaAbas.ts`; estado de visão no store de filtros por página, como os demais filtros de `NFs.tsx`.

## Complexity Tracking

> Sem violações a justificar.
