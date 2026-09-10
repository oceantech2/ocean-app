# Tasks: Aging de Recebíveis no Dashboard

**Input**: Design documents from `/specs/060-dashboard-aging-recebiveis/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundation (schema + endpoint + client + util) → US1–US3 (P1) → US4 (P2) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/schemas.py`, `backend/app/api/routes/relatorios.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`, `frontend/src/utils/agingRecebiveis.ts`
- Contratos: `specs/060-dashboard-aging-recebiveis/contracts/`
- **Não alterar**: Alerta de Fluxo de Caixa (09); CRUD Contas a Receber; filtro de período no Aging; Pipeline / Por Caixa / Competência / Despesas & Resultado além do consumo do toggle; COUNT / linha residual / aviso de %

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 060

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): Dashboard; `GET /aging-recebiveis` sem `ano`/`mes`; Conta a Receber = `nfs`; `data_vencimento_nf` = `data_vencimento`; rótulo **1–60 dias**; residual só no total; sem COUNT; Total no cabeçalho; portas 5193/8001; sem migration; sem Seção 09

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, endpoint Aging, client e util de apresentação — bloqueia US1–US4

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Em `backend/app/schemas.py`, criar `AgingTotais` (`valor_liquido`, `valor_bruto`, `percentual_liquido`, `percentual_bruto`) e `AgingRecebiveisResponse` (`referencia`, `total_aberto`, `a_vencer_lt_30`, `d1_60`, `d60_90`, `d_mais_90`) alinhados a [contracts/rest-aging-recebiveis.md](./contracts/rest-aging-recebiveis.md) — **sem** `contagem`
- [x] T003 Em `backend/app/api/routes/relatorios.py`, implementar `GET /aging-recebiveis`: universo `excluida_em IS NULL` ∧ `status != cancelada` ∧ `data_emissao IS NOT NULL` ∧ `data_pagamento IS NULL` (incluir arquivadas); classificar por `data_vencimento` vs `date.today()` conforme [data-model.md](./data-model.md); dual-base + percentuais; residual só em `total_aberto`; **sem** filtro `ano`/`mes` — FR-002–FR-005, FR-007, FR-009, FR-010, [contracts/rest-aging-recebiveis.md](./contracts/rest-aging-recebiveis.md)
- [x] T004 [P] Em `frontend/src/services/api.ts`, adicionar `relatoriosService.agingRecebiveis()` tipado conforme o contrato REST (sem params de período)
- [x] T005 [P] Em `frontend/src/utils/agingRecebiveis.ts`, criar tipos/`normalizeAgingRecebiveis`, metadados dos 4 buckets (rótulo canônico **1–60 dias**, cor, ação), helpers `valorPorVisao`/`pctPorVisao` (ou reuso de `metaPeriodo.ts` / padrão Pipeline) — [contracts/ui-dashboard-aging.md](./contracts/ui-dashboard-aging.md), [data-model.md](./data-model.md)

**Checkpoint**: Smoke `GET /api/relatorios/aging-recebiveis` com JWT; client tipado; util pronto; foundation liberada

---

## Phase 3: User Story 1 - Quatro buckets de aging (Priority: P1) 🎯 MVP

**Goal**: Card no Dashboard com estoque aberto classificado em A vencer · &lt;30d / 1–60 / 60–90 / +90 (valor + % + cor + ação)

**Independent Test**: Quickstart §2–§3 — fixture cai nos buckets corretos; recebida/sem emissão fora; residual só no total

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx`, no `carregarDados`, chamar `relatoriosService.agingRecebiveis()` e guardar estado (`aging` / erro) sem derrubar Pipeline/Caixa se falhar — FR-018 implícito de isolamento
- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, renderizar card **Aging de Recebíveis** com os quatro buckets (ordem canônica), usando `visaoReceita` para valor/%, metadados de `agingRecebiveis.ts` — FR-001 (parcial), FR-005, FR-006, FR-014, [contracts/ui-dashboard-aging.md](./contracts/ui-dashboard-aging.md)
- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, tratar loading/erro/vazio do Aging (total zero → sem % inventados; buckets R$ 0,00) e garantir mesma leitura `admin`/`visualizador` — FR-007, FR-011, SC-007

**Checkpoint**: SC-001 / SC-005 / MVP visual dos buckets

---

## Phase 4: User Story 2 - Independente do período (Priority: P1)

**Goal**: Aging permanece estoque global ao mudar mês/ano do Dashboard

**Independent Test**: Quickstart §4 — trocar mês/só-ano; Aging igual; Pipeline/abas mudam

### Implementation for User Story 2

- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, garantir que o Aging **não** recebe `ano`/`mes` na chamada e que a UI indica estoque global (não “do mês”) — FR-004, FR-013, [contracts/ui-dashboard-aging.md](./contracts/ui-dashboard-aging.md)
- [x] T010 [US2] Em `frontend/src/pages/Dashboard.tsx`, ao mudar filtro de período, manter comportamento: refetch opcional em `carregarDados`, mas números do Aging independentes do período selecionado (validar vs Quickstart §4) — FR-004, SC-002

**Checkpoint**: SC-002 — Aging ≠ filtro de período

---

## Phase 5: User Story 3 - Toggle Bruto/Líquido (Priority: P1)

**Goal**: Alternar toggle muda só a base monetária do Total e buckets; composição igual

**Independent Test**: Quickstart §5 — Bruto ↔ Líquido; valores/% mudam; buckets iguais

### Implementation for User Story 3

- [x] T011 [US3] Em `frontend/src/pages/Dashboard.tsx`, aplicar `visaoReceita` ao Total e a cada bucket sem refetch ao alternar toggle — FR-008, SC-003
- [x] T012 [US3] Em `frontend/src/pages/Dashboard.tsx` (e/ou `agingRecebiveis.ts`), exibir percentuais da base ativa com tolerância visual; `null` → omitir / “—” — FR-007, SC-004

**Checkpoint**: SC-003 / SC-004

---

## Phase 6: User Story 4 - Total, cores e ações (Priority: P2)

**Goal**: Total em aberto no cabeçalho; cores e ações recomendadas legíveis; sem COUNT/aviso residual

**Independent Test**: Quickstart §2 — Total no cabeçalho; 4 ações; sem COUNT/Outros/aviso

### Implementation for User Story 4

- [x] T013 [US4] Em `frontend/src/pages/Dashboard.tsx`, exibir **Total em aberto** no cabeçalho/resumo do card na base do toggle (denominador dos %) — FR-001, SC-006, SC-009, clarify Q4
- [x] T014 [US4] Em `frontend/src/pages/Dashboard.tsx` + `frontend/src/utils/agingRecebiveis.ts`, garantir ações Monitorar / Cobrar ativamente / Escalar / Inadimplência — acionar jurídico e cores semânticas; **não** renderizar COUNT, linha residual nem aviso de % &lt; 100% — FR-006, FR-009, FR-014, SC-006, SC-008

**Checkpoint**: SC-006 / SC-008 / SC-009

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Qualidade e validação end-to-end

- [x] T015 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T016 Percorrer [quickstart.md](./quickstart.md) completo (smoke API + Dashboard + papéis) e marcar critérios de pronto
- [x] T017 Revisar que Seção 09 (Alerta), drill-down, filtro por período e migration **não** foram introduzidos — FR-012 / Out of Scope

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → libera Phase 2
- **Phase 2 (Foundation)** → bloqueia US1–US4
- **US1 (Phase 3)** → MVP; base para US2–US4
- **US2 / US3** → podem seguir em paralelo após US1 (arquivos principalmente `Dashboard.tsx` — sequenciar se conflitar)
- **US4** → depende do card existir (US1) e tipicamente após US3 (Total + toggle)
- **Polish** → após histórias desejadas

### User Story Dependencies

| Story | Depende de | Independente para testar? |
|-------|------------|---------------------------|
| US1 | Foundation | Sim — buckets + fixture |
| US2 | US1 (card) | Sim — troca de mês |
| US3 | US1 | Sim — toggle |
| US4 | US1 (+ ideal US3) | Sim — Total/cores/ações |

### Parallel Opportunities

- T002 ∥ T004 ∥ T005 (após T001; T003 após T002)
- T015 ∥ revisão de escopo T017
- Após US1: ajustes US2 e US3 em branches/worktrees distintos se necessário; no mesmo `Dashboard.tsx`, preferir sequência US2 → US3 → US4

### Parallel Example: Foundation

```text
# Após T001:
T002 schemas.py
T004 api.ts
T005 agingRecebiveis.ts
# Depois:
T003 relatorios.py (precisa T002)
```

---

## Implementation Strategy

### MVP (User Story 1)

1. T001 → T002–T005 → T003
2. T006–T008 — card com 4 buckets
3. Validar Quickstart §1–§3
4. Parar e demonstrar estoque aberto por faixa

### Incremental Delivery

1. MVP (US1) → classificação visível
2. + US2 → confiança no estoque global
3. + US3 → coerência com toggle do Dashboard
4. + US4 → Total + polish visual de risco
5. Polish → lint/type-check + quickstart completo

### Suggested MVP Scope

**US1 apenas** (foundation + card com buckets) — já entrega valor gerencial de aging.

---

## Notes

- Conta a Receber = `nfs`; não criar entidade nova
- Rótulo UI do 2º bucket: **1–60 dias** (não “30–60”)
- Endpoint **sem** query de período; `referencia` = hoje do servidor
- Alerta (09) consumirá `d60_90` no futuro — não implementar agora
