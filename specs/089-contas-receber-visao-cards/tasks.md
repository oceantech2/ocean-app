# Tasks: Visão Líquido/Bruto e novos cards em Contas a Receber

**Input**: Design documents from `/specs/089-contas-receber-visao-cards/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — validação via [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Confirmar escopo em [plan.md](./plan.md): só frontend, resumo existente, backend intocado

## Phase 2: Foundational

- [x] T002 [P] Criar `frontend/src/utils/resumoReceber.ts` com `cardsResumoReceber(resumo, visao)` retornando os 4 cards (valor e quantidade; total = soma)
- [x] T003 [P] Em `frontend/src/store/index.ts`, adicionar `nfsVisao: VisaoReceita` (padrão `'liquido'`) e `setNfsVisao` em `usePageFilters`

## Phase 3: User Story 1 - Cards do período (P1) 🎯 MVP

- [x] T004 [US1] Em `frontend/src/pages/NFs.tsx`, substituir os 4 cards atuais pelos cards de `cardsResumoReceber` (Receita Total azul, Recebido verde, Pendente amarelo, Vencido vermelho, com "N registro(s)")

## Phase 4: User Story 2 - Alternar Líquido/Bruto (P1)

- [x] T005 [US2] Em `frontend/src/pages/NFs.tsx`, adicionar o segmentado Líquido|Bruto no cabeçalho ligado a `nfsVisao`; rótulos dos cards com "· líquido/bruto"
- [x] T006 [US2] Em `frontend/src/pages/NFs.tsx`, derivar as colunas (e a largura mínima) da visão, ocultar a célula de valor correspondente no corpo e migrar `sortField` da coluna oculta para a visível

## Phase 5: Polish

- [x] T007 Rodar `npm run type-check` e `npm run build` em `frontend/`
- [x] T008 Validar os cenários de [quickstart.md](./quickstart.md) no navegador

## Dependencies & Execution Order

- T002, T003 → T004 → T005 → T006 → T007 → T008
- T004–T006 editam o mesmo arquivo: executar em sequência
