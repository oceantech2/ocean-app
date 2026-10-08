# Tasks: Cards Total de Despesas e Impostos Pagos na seção Despesa

**Input**: Design documents from `/specs/085-dashboard-despesa-total-impostos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Layout da seção para 5 cards (fundação) → Total de Despesas (US1) → Impostos Pagos (US2) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US2 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Página: `frontend/src/pages/Dashboard.tsx` (bloco "Despesa | Resultado (Seção 07)")
- Helpers: `frontend/src/utils/dashboardDespesas.ts`
- Contrato UI: `specs/085-dashboard-despesa-total-impostos/contracts/ui-despesa-total-impostos.md`
- **Não alterar**: backend; regras de `totaisDespesa` e `calcularResultado`; card "Impostos Recolhidos" da Receita

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-despesa-total-impostos.md](./contracts/ui-despesa-total-impostos.md): só frontend, reuso de `relatoriosService.receitaCaixa` em `frontend/src/services/api.ts` (sem alteração), backend intocado

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Reestruturar o bloco "Despesa | Resultado (Seção 07)" em `frontend/src/pages/Dashboard.tsx`: remover o grid externo `lg:grid-cols-3`; seção Despesa em largura inteira com grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`; seção Resultado logo abaixo, largura inteira, grid `grid-cols-1 sm:grid-cols-2` (cards inalterados)

**Checkpoint**: Seção comporta 5 cards — histórias podem começar

---

## Phase 3: User Story 1 - Ver o total de despesas do período (Priority: P1) 🎯 MVP

**Goal**: Card Total de Despesas (Fixas + Variáveis) como primeiro card da seção.

**Independent Test**: Total de Despesas aparece antes de Fixas e = Fixas + Variáveis (quickstart cenários 1, 2, 7).

- [x] T003 [US1] Inserir o card "Total de Despesas" antes de "Despesas Fixas" em `frontend/src/pages/Dashboard.tsx`, exibindo `fmt(despesasTotaisResultado)`, texto "Fixas + Variáveis pagas no período" e `rotuloDespesaResultado` no modo só-ano

**Checkpoint**: US1 funcional

---

## Phase 4: User Story 2 - Ver os impostos pagos no período (Priority: P1)

**Goal**: Card Impostos Pagos (último) com os impostos recolhidos do mês anterior (ou janela Dez/A−1..Nov/A no modo só-ano).

**Independent Test**: Impostos Pagos de M = "Impostos Recolhidos" (aba Por Caixa) de M−1; Janeiro usa Dez/A−1; modo só-ano soma Dez/A−1..Nov/A (quickstart cenários 3–6).

- [x] T004 [P] [US2] Adicionar helpers puros `mesAnterior(ano, mes)` e `rotuloImpostosPagos(ano, mes, mesesNome)` em `frontend/src/utils/dashboardDespesas.ts`
- [x] T005 [US2] Adicionar estado `impostosPagos` (`number | null`) e carregá-lo em `carregarDados` de `frontend/src/pages/Dashboard.tsx`, em paralelo com as demais consultas: modo mês = `receitaCaixa` do mês anterior; modo só-ano = `receitaCaixa(A−1, 12) + receitaCaixa(A) − receitaCaixa(A, 12)`; falha → `null`; respeitar `cargaSeq`
- [x] T006 [US2] Inserir o card "Impostos Pagos" após "Despesas Pendentes" em `frontend/src/pages/Dashboard.tsx`: valor `fmt(impostosPagos)` (tom neutro de `LABELS_CAIXA.impostos.valorClass`) ou "—"; texto auxiliar de `rotuloImpostosPagos` ou "Não foi possível carregar" em falha; não somar a Total nem a Resultado

**Checkpoint**: US1 + US2 completos

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T007 Rodar `npm run type-check`, `npm run lint` e `npm run build` em `frontend/` sem erros novos (type-check: 3 erros pré-existentes do Recharts, inalterados; lint: projeto sem config ESLint; build OK)
- [x] T008 Validar os cenários de [quickstart.md](./quickstart.md) (ordem, valores, virada de ano, modo só-ano, toggle, responsivo, `admin` e `visualizador`)

---

## Dependencies & Execution Order

- T001 → T002 → T003 (US1)
- T002 → T004 → T005 → T006 (US2)
- T004 pode rodar em paralelo com T003 (arquivo diferente)
- T003 + T006 → T007 → T008

## Parallel Example

```text
Em paralelo após T002:
  T003 [US1] card Total de Despesas em Dashboard.tsx
  T004 [US2] helpers em utils/dashboardDespesas.ts
```

## Implementation Strategy

- **MVP**: Phase 1–3 (Total de Despesas). US2 entra na mesma entrega por ser parte do pedido.
- Entrega em um único commit na `main`.
