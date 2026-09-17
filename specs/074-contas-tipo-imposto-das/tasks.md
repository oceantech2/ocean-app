# Tasks: Contas a Pagar — Tipo Imposto / DAS

**Input**: Design documents from `/specs/074-contas-tipo-imposto-das/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (US1–US5). Evitar `[P]` em tarefas que editam o mesmo arquivo na mesma fase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e dependências do plano

- [x] T001 Confirmar escopo em [plan.md](./plan.md): alterar `backend/app/main.py`, `models/__init__.py`, `schemas.py`, `api/routes/contas.py`, `api/routes/impostos.py`, `api/routes/relatorios.py`, `services/categorias_contas.py`, `frontend/src/types/index.ts`, `pages/Contas.tsx`, `pages/Impostos.tsx`, `utils/dashboardDespesas.ts`, `utils/import.ts`; **não** criar filtro por Tipo nem fatia Impostos no donut; portas 5193/8001/5433 inalteradas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ampliar `tipo_despesa`, aceitar `imposto_das`, migração de categoria Impostos — bloqueia todas as US

**⚠️ CRITICAL**: Nenhuma história de UI/API completa até T007

- [x] T002 Em `backend/app/main.py` (`_migrar`): ampliar `contas_pagar.tipo_despesa` para `VARCHAR(20)`; `UPDATE` contas com `lower(categoria) IN ('impostos','imposto')` para `tipo_despesa='imposto_das'`, `categoria=NULL`, `subcategoria=NULL`, `categoria_pendente=FALSE`
- [x] T003 Em `backend/app/models/__init__.py`, alterar `ContaPagar.tipo_despesa` para `String(20)` (NOT NULL, default `variavel`)
- [x] T004 Em `backend/app/schemas.py`, estender `Literal` de `tipo_despesa` em Create/Update/Response para `'fixo' | 'variavel' | 'imposto_das'`
- [x] T005 Em `backend/app/api/routes/contas.py`, atualizar `TIPOS_DESPESA`, `_rotulo_tipo_despesa` (Imposto / DAS) e `_validar_tipo_despesa`; validar categoria×tipo (categoria opcional só para `imposto_das`; rejeitar categoria `impostos`/`imposto`; exigir categoria ao sair de `imposto_das`)
- [x] T006 Em `backend/app/services/categorias_contas.py`, remover `impostos` do conjunto oficial `CATEGORIAS`/catálogo; manter rejeição/aliases de import para Impostos; ajustar heurísticas que ainda devolvem `CATEGORIA_IMPOSTOS`
- [x] T007 [P] Em `frontend/src/types/index.ts`, estender `tipo_despesa` para `'fixo' | 'variavel' | 'imposto_das'`

**Checkpoint**: Reiniciar backend; migração aplicada; POST com `imposto_das` sem categoria OK; categoria Impostos rejeitada

---

## Phase 3: User Story 1 — Três Tipos (Priority: P1) 🎯 MVP

**Goal**: Campo Tipo com Fixo, Variável e Imposto / DAS; default Variável; listagem com rótulos

**Independent Test**: Quickstart §1 — criar uma conta de cada Tipo; Imposto / DAS persiste; visualizador só lê

### Implementation for User Story 1

- [x] T008 [US1] Em `frontend/src/pages/Contas.tsx`, atualizar `labelTipoDespesa`, select Tipo (3 opções), tipos do form/payload e sort de `tipo_despesa` (fixo=0, variavel=1, imposto_das=2)
- [x] T009 [US1] Em `frontend/src/pages/Contas.tsx`, garantir validação de Tipo obrigatório e persistência de `imposto_das` no `salvar()` / `abrirEditar()`

**Checkpoint**: SC-001, SC-002; FR-001 a FR-003

---

## Phase 4: User Story 2 — Remover Impostos das Categorias (Priority: P1)

**Goal**: Taxonomia sem Impostos; categoria opcional quando Tipo = Imposto / DAS; obrigatória para Fixo/Variável

**Independent Test**: Quickstart §2 — Impostos ausente no select/filtro; Imposto / DAS sem categoria salva; Variável sem categoria bloqueia

### Implementation for User Story 2

- [x] T010 [US2] Em `frontend/src/pages/Contas.tsx`, remover opção/filtro/rótulo de categoria Impostos; ajustar validação: categoria opcional se `tipo_despesa === 'imposto_das'`; se RH com Imposto / DAS, exigir subcategoria
- [x] T011 [US2] Em `frontend/src/pages/Contas.tsx`, ao trocar Tipo de `imposto_das` para fixo/variavel com categoria vazia, bloquear save com toast claro

**Checkpoint**: SC-005; FR-004, FR-006a

---

## Phase 5: User Story 3 — Migração (Priority: P1)

**Goal**: Contas legadas Impostos viram Tipo Imposto / DAS sem categoria; demais Tipos intactos

**Independent Test**: Quickstart §3 — após restart, conta antiga Impostos mostra Imposto / DAS e categoria vazia

### Implementation for User Story 3

- [x] T012 [US3] Verificar/ajustar migração de T002 em `backend/app/main.py` e exibição de categoria vazia (traço) em `frontend/src/pages/Contas.tsx` para contas `imposto_das` sem categoria
- [x] T013 [US3] Garantir que contas não-imposto não recebem `imposto_das` na migração (revisão do `WHERE` em `backend/app/main.py`)

**Checkpoint**: SC-003, SC-009; FR-005, FR-006, FR-007

---

## Phase 6: User Story 4 — Página Impostos e custo por Tipo (Priority: P2)

**Goal**: `/impostos/de-contas` e exclusões de custo/DRE/despesas usam `imposto_das`; sem fatia Impostos no donut

**Independent Test**: Quickstart §4 — página Impostos lista por Tipo; empty state atualizado; donut sem fatia Impostos

### Implementation for User Story 4

- [x] T014 [US4] Em `backend/app/api/routes/impostos.py`, filtrar `de-contas` por `ContaPagar.tipo_despesa == 'imposto_das'` (não por categoria)
- [x] T015 [P] [US4] Em `frontend/src/pages/Impostos.tsx`, atualizar texto de empty state para Tipo **Imposto / DAS**
- [x] T016 [US4] Em `backend/app/api/routes/relatorios.py`, excluir `tipo_despesa == 'imposto_das'` no DRE/despesa e em `custo-por-categoria` (sem fatia impostos por Tipo)
- [x] T017 [US4] Em `frontend/src/utils/dashboardDespesas.ts`, excluir contas `imposto_das` em `totaisDespesa`/`categoriaEhImpostos`/helpers; manter `filtrarCustoSemImpostos` removendo fatia impostos residual

**Checkpoint**: SC-004, SC-010; FR-008, FR-009, FR-013

---

## Phase 7: User Story 5 — Exportação e importação (Priority: P3)

**Goal**: Export com rótulo Imposto / DAS; import rejeita categoria Impostos e aceita Tipo Imposto / DAS (categoria opcional)

**Independent Test**: Quickstart §5 — export mostra três Tipos; import Impostos rejeita; Imposto / DAS sem categoria aceita

### Implementation for User Story 5

- [x] T018 [US5] Em `backend/app/api/routes/contas.py` e/ou `backend/app/services/excel_io.py`, garantir rótulo **Imposto / DAS** na exportação XLSX
- [x] T019 [US5] Em `frontend/src/pages/Contas.tsx` (CSV/PDF) e `frontend/src/utils/import.ts` (e import no backend em `contas.py` se aplicável), exportar rótulo correto; rejeitar categoria Impostos; aceitar Tipo `imposto_das` / Imposto / DAS com categoria opcional; Tipo ausente → `variavel`

**Checkpoint**: SC-007; FR-010, FR-011

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: Lint/type-check e validação rápida

- [x] T020 Rodar `cd frontend && npm run type-check` e `npm run lint`; corrigir erros introduzidos pela feature
- [x] T021 Revisar [quickstart.md](./quickstart.md) contra o código e marcar inconsistências óbvias (rótulos, filtros, migração)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** (fundação) → **US1–US5**
- US1 e US2 podem seguir em sequência no mesmo `Contas.tsx` (não paralelo)
- US3 valida migração (depende de T002)
- US4 paralelo parcial: `impostos.py` / `Impostos.tsx` / `relatorios.py` / `dashboardDespesas.ts`
- US5 após rótulos de Tipo estáveis (pós US1)

### User Story Dependencies

```text
T001 → T002–T007 (fundação)
     → US1 (T008–T009)
     → US2 (T010–T011)  [mesmo Contas.tsx após US1]
     → US3 (T012–T013)  [valida migração]
     → US4 (T014–T017)  [Impostos + custo]
     → US5 (T018–T019)  [export/import]
     → T020–T021
```

### Parallel Opportunities

- T007 [P] com finais da fundação backend (após T003/T004 definidos)
- T015 [P] com T014/T016/T017 (arquivos diferentes)
- T018 e partes de frontend export em sequência no mesmo fluxo Contas

### Independent Test Criteria

| Story | Teste independente |
|-------|-------------------|
| US1 | Três Tipos no form/listagem |
| US2 | Sem Impostos nas categorias; opcional só para Imposto / DAS |
| US3 | Migração limpa categoria |
| US4 | Página Impostos + exclusão custo por Tipo |
| US5 | Export/import alinhados |

### Suggested MVP

**US1 + fundação (T001–T009)**: terceiro Tipo persistido e visível. Em seguida US2+US3 (taxonomia/migração) antes de US4/US5.

---

## Implementation Strategy

1. Fundar coluna + schemas + validação + remoção de Impostos do catálogo
2. MVP UI Tipo (US1)
3. Categoria opcional / sem Impostos (US2) + confirmar migração (US3)
4. Impostos page + custo (US4)
5. Export/import (US5)
6. Polish type-check/lint

## Format Validation

- Todas as tarefas usam `- [ ]`, ID `Tnnn`, labels de story nas fases US, e caminhos de arquivo explícitos
