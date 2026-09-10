# Tasks: Status Derivado + Pipeline de Receita no Dashboard

**Input**: Design documents from `/specs/056-status-conta-receber/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Foundation (helper + endpoint + client) → US1–US4 (P1, estágios + funil) → US5 (P2, refresh) → Polish. Endpoint único retorna todos os estágios; histórias validam/exibem incrementos testáveis.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/api/routes/relatorios.py`, `backend/app/schemas.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`, `frontend/src/utils/pipelineReceita.ts`
- Contratos: `specs/056-status-conta-receber/contracts/rest-pipeline-receita.md`, `ui-pipeline-receita.md`
- **Não alterar**: `frontend/src/pages/NFs.tsx` (coluna/status legado), migrations, toggle bruto/líquido, cards Seções 05–09

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 056

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): Dashboard apenas; `data_ent_pgto`/`data_emissao`/`data_pagamento`/`valor_liquido`; excluir cancelada + `excluida_em`; incluir arquivadas; sem migration; portas 5193/8001; página NFs intacta

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Classificação de ciclo + contrato REST + client — bloqueia US1–US5

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/api/routes/relatorios.py` (ou helper adjacente importado por ele), implementar função pura `status_ciclo_nf(data_emissao, data_pagamento) -> Literal["a_faturar","faturado_ag_pagamento","recebido"]` conforme [data-model.md](./data-model.md) / [research.md](./research.md) §2 (pagamento prevalece)
- [x] T003 [P] Em `backend/app/schemas.py`, adicionar schemas Pydantic do Pipeline (`PipelineEstagioTotais`, `PipelineReceitaResponse`) alinhados a [contracts/rest-pipeline-receita.md](./contracts/rest-pipeline-receita.md)
- [x] T004 Em `backend/app/api/routes/relatorios.py`, implementar `GET /pipeline-receita?ano=&mes=` : universo `excluida_em IS NULL`, `status != cancelada`, `data_ent_pgto` no período (mês ou ano inteiro se `mes` omitido); **não** filtrar `arquivada`; SUM(`valor_liquido`) + COUNT por estágio + `fechado`; percentuais com `fechado.valor==0` → `null`; invariante soma = fechado — FR-001–FR-011, [contracts/rest-pipeline-receita.md](./contracts/rest-pipeline-receita.md)
- [x] T005 [P] Em `frontend/src/services/api.ts`, adicionar `relatoriosService.pipelineReceita(ano, mes?)` tipado conforme o contrato REST
- [x] T006 [P] Em `frontend/src/utils/pipelineReceita.ts`, criar constantes de rótulos/badges/cores canônicos (A Faturar / sem NF; Faturado · Ag. Pagamento / NF emitida; Recebido / pago) e helper de exibição de % (`null` → "—")

**Checkpoint**: Smoke `GET /api/relatorios/pipeline-receita?ano=…&mes=…` com JWT; client tipado pronto; foundation liberada

---

## Phase 3: User Story 1 - Pipeline estágio A Faturar (Priority: P1) 🎯 MVP

**Goal**: Dashboard mostra card Pipeline com estágio **A Faturar** (valor, contagem, %, badge sem NF) para fechamentos sem emissão e sem pagamento

**Independent Test**: Quickstart cenário 2 caso A — registros só A Faturar elevam esse estágio; badge/rótulo corretos

### Implementation for User Story 1

- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, no `carregarDados`, chamar `relatoriosService.pipelineReceita(ano, mes)` e guardar estado (`pipeline` / loading / erro) sem quebrar demais cards
- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, na seção Receita, renderizar card **Pipeline de Receita** com bloco **A Faturar** (rótulo, badge sem NF, valor líquido formatado, contagem, %) usando `pipelineReceita.ts` — [contracts/ui-pipeline-receita.md](./contracts/ui-pipeline-receita.md), FR-002, FR-006–FR-008
- [x] T009 [US1] Em `frontend/src/pages/Dashboard.tsx`, tratar loading (spinner coerente) e erro (toast/estado local) da chamada Pipeline; período sem dados → zeros/"—" sem crash

**Checkpoint**: MVP visível — A Faturar testável no Dashboard; SC-001 parcial, SC-006 parcial

---

## Phase 4: User Story 2 - Pipeline estágio Faturado · Ag. Pagamento (Priority: P1)

**Goal**: Card exibe estágio **Faturado · Ag. Pagamento** (NF emitida) disjunto de A Faturar/Recebido

**Independent Test**: Quickstart cenário 2 caso B — emissão preenchida, pagamento vazio

### Implementation for User Story 2

- [x] T010 [US2] Em `frontend/src/pages/Dashboard.tsx`, adicionar bloco **Faturado · Ag. Pagamento** (badge NF emitida, valor, contagem, %) no card Pipeline — FR-003, FR-008
- [x] T011 [US2] Validar no endpoint (e UI) que registros caso B não entram em A Faturar nem Recebido; se bug na classificação, corrigir `status_ciclo_nf` / agregação em `backend/app/api/routes/relatorios.py`

**Checkpoint**: US2 testável; SC-001 parcial

---

## Phase 5: User Story 3 - Pipeline estágio Recebido (Priority: P1)

**Goal**: Card exibe **Recebido** (pago); recebimento prevalece mesmo sem emissão

**Independent Test**: Quickstart cenário 2 casos C e D

### Implementation for User Story 3

- [x] T012 [US3] Em `frontend/src/pages/Dashboard.tsx`, adicionar bloco **Recebido** (badge pago, valor, contagem, %) no card Pipeline — FR-004, FR-005, FR-008
- [x] T013 [US3] Confirmar em `backend/app/api/routes/relatorios.py` que `data_pagamento` preenchida classifica Recebido mesmo com `data_emissao` null; ajustar se necessário

**Checkpoint**: Três estágios visíveis; SC-001

---

## Phase 6: User Story 4 - Fechado no mês + consistência do funil (Priority: P1)

**Goal**: Bloco **Fechado no mês/período** como base 100%; soma dos três estágios = fechado (valor e contagem)

**Independent Test**: Quickstart cenário 1 (SC-002) e cenário 5 (SC-006)

### Implementation for User Story 4

- [x] T014 [US4] Em `frontend/src/pages/Dashboard.tsx`, exibir bloco **Fechado no mês** (ou “Fechado no período” se `mes` null) com valor, contagem e 100% — FR-007, FR-008
- [x] T015 [US4] Em `frontend/src/pages/Dashboard.tsx` (e/ou assert defensivo), garantir UI coerente com invariante: soma dos três = fechado; se API violar, não inventar números — FR-009, SC-002
- [x] T016 [US4] Em `backend/app/api/routes/relatorios.py`, revisar exclusões: cancelada e `excluida_em` fora; arquivadas **dentro**; NFs sem `data_ent_pgto` fora — FR-010, FR-011, SC-007

**Checkpoint**: Funil consistente; SC-002, SC-003, SC-007

---

## Phase 7: User Story 5 - Refresh após mudança de datas (Priority: P2)

**Goal**: Após editar emissão/pagamento no cadastro NFs, atualizar Dashboard move o registro de estágio; sem campo editável de status no Dashboard

**Independent Test**: Quickstart cenário 6 (SC-004)

### Implementation for User Story 5

- [x] T017 [US5] Em `frontend/src/pages/Dashboard.tsx`, garantir que mudança de `ano`/`mes` e reexecução de `carregarDados` (reload/navegação) recarrega Pipeline; **MUST NOT** haver input de status de ciclo no card — FR-012–FR-014
- [x] T018 [US5] Verificar manualmente (quickstart §6): A Faturar → +emissão → Faturado; +pagamento → Recebido; confirmar que `NFs.tsx` não foi alterado para novo ciclo — FR-015, SC-004

**Checkpoint**: US5 OK; SC-004, SC-005 (comparar admin/visualizador)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Lint, regressão e checklist

- [x] T019 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 [P] Smoke curl/JWT do endpoint Pipeline (mês com dados e mês vazio) conforme [quickstart.md](./quickstart.md)
- [x] T021 Executar checklist completo [quickstart.md](./quickstart.md) cenários 1–7; confirmar ausência de migration e de diffs em `frontend/src/pages/NFs.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → US1 → US2 → US3 → US4 → US5 → Polish
- **T002** antes de **T004**; **T003** pode paralelizar com **T002**; **T005**/**T006** após contrato mental do REST (podem paralelizar entre si e com T004 se tipagem manual)
- UI: **T007** antes de blocos **T008**/**T010**/**T012**/**T014**
- **Phase 8** após US1–US5

### User Story Dependencies

| Story | Depende de | Entrega independente |
|-------|------------|----------------------|
| US1 | Phase 2 | Card + A Faturar |
| US2 | US1 (mesmo card) | Bloco Faturado |
| US3 | US1 | Bloco Recebido |
| US4 | US1–US3 (blocos presentes) | Fechado + invariante |
| US5 | US1+ (card carregando) | Refresh / sem editor de status |

### Parallel Opportunities

- **Phase 2**: T003 ‖ T002; T005 ‖ T006 (após shape do response definido)
- **Phase 8**: T019 ‖ T020
- US2 e US3 UI podem ser feitos em sequência rápida no mesmo arquivo (`Dashboard.tsx` — **não** paralelizar edits no mesmo arquivo)

### Independent Test Criteria

| Story | Como testar sozinha |
|-------|---------------------|
| US1 | Só registros A Faturar no mês → bloco A Faturar > 0 |
| US2 | Caso B → só Faturado sobe |
| US3 | Casos C/D → Recebido; D sem emissão ainda Recebido |
| US4 | Soma três = Fechado; cancelados/excluídos fora; arquivada entra |
| US5 | Editar datas em NFs → reload Dashboard → estágio muda |

---

## Parallel Example: Phase 2

```text
# Paralelo após T001:
T002 status_ciclo_nf em relatorios.py
T003 schemas Pipeline em schemas.py

# Depois T002+T003:
T004 endpoint GET /pipeline-receita

# Paralelo com/após shape conhecido:
T005 relatoriosService.pipelineReceita em api.ts
T006 labels em pipelineReceita.ts
```

---

## Implementation Strategy

### MVP (User Story 1)

1. Completar Phase 1–2 (T001–T006)
2. Entregar T007–T009 (card + A Faturar)
3. Validar quickstart caso A + período vazio
4. **Stop e demo** se quiser feedback antes dos demais estágios

### Incremental Delivery

1. MVP (US1) → card vivo
2. US2 + US3 → funil completo visual
3. US4 → confiança na soma / exclusões
4. US5 → prova de refresh
5. Polish → lint + quickstart 1–7

### Notes

- Valor sempre `valor_liquido` (sem toggle nesta feature)
- Não persistir status de ciclo; não mudar enum `StatusNF`
- Constitution: artefatos e UI em pt-BR; papéis admin/visualizador mesma leitura

---

## Task Summary

| Métrica | Valor |
|---------|-------|
| **Total tasks** | 21 (T001–T021) |
| **US1** | 3 (T007–T009) |
| **US2** | 2 (T010–T011) |
| **US3** | 2 (T012–T013) |
| **US4** | 3 (T014–T016) |
| **US5** | 2 (T017–T018) |
| **Setup + Foundation + Polish** | 9 (T001–T006, T019–T021) |
| **Parallel marcadas [P]** | T003, T005, T006, T019, T020 |
| **MVP sugerido** | Phase 1–2 + US1 (T001–T009) |
| **Formato** | Todas com `- [ ]`, ID, paths; stories com [US#] |
