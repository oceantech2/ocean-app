# Tasks: Abas Por Caixa e Por Competência no Dashboard

**Input**: Design documents from `/specs/058-dashboard-caixa-competencia/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundation (endpoint Caixa + clients + helpers) → US1–US4 (P1) → US5 (P2) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US5 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/schemas.py`, `backend/app/api/routes/relatorios.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`, `frontend/src/utils/receitaAbas.ts`, `frontend/src/utils/pipelineReceita.ts`, `frontend/src/utils/metaPeriodo.ts`
- Contratos: `specs/058-dashboard-caixa-competencia/contracts/`
- **Não alterar**: listagem NFs; Despesas & Resultado / Aging / Alerta (07–09); regras do Pipeline além do consumo; Configuração do Período (057) além do consumo na barra

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 058

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): Dashboard; Por Competência = reuso `pipeline-receita`; Por Caixa = `GET /receita-caixa`; remover cards Receita/Pendente; barra segue aba; padrão Caixa; modo só-ano; portas 5193/8001; sem migration; sem 07–09

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schemas, endpoint Por Caixa, clients e helpers — bloqueia US1–US5

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Em `backend/app/schemas.py`, criar schemas `ReceitaCaixaTotais` (valor_liquido, valor_bruto, contagem) e `ReceitaCaixaResponse` (ano, mes, recebido, impostos_recolhidos, a_receber, a_faturar) alinhados a [contracts/rest-receita-caixa.md](./contracts/rest-receita-caixa.md)
- [x] T003 Em `backend/app/api/routes/relatorios.py`, implementar `GET /receita-caixa?ano=&mes=`: exclusões iguais ao Pipeline (`excluida_em IS NULL`, `status != cancelada`, incluir arquivadas); Recebido por `data_pagamento` no período; Impostos = `SUM(COALESCE(valor_imposto,0))` no mesmo universo; A Receber / A Faturar por `data_ent_pgto` no período + emissão/pagamento conforme contrato; dual-base nos três blocos monetários de receita — FR-004–FR-008, [contracts/rest-receita-caixa.md](./contracts/rest-receita-caixa.md)
- [x] T004 [P] Em `frontend/src/services/api.ts`, adicionar `relatoriosService.receitaCaixa(ano, mes?)` tipado conforme o contrato REST
- [x] T005 [P] Em `frontend/src/utils/receitaAbas.ts`, criar tipos/`AbaReceita` (`'caixa' | 'competencia'`), labels canônicos das métricas, helper de numerador da barra (Recebido vs Total Fechado) e seleção de valor pela `VisaoReceita` reutilizando `metaPeriodo.ts` / padrão Pipeline

**Checkpoint**: Smoke `GET /api/relatorios/receita-caixa?ano=…&mes=…` com JWT; client tipado; foundation liberada

---

## Phase 3: User Story 1 - Alternar abas + remover cards legados (Priority: P1) 🎯 MVP

**Goal**: Card com abas Por Caixa / Por Competência (padrão Caixa); cards Receita e Receita Pendente removidos; Pipeline permanece

**Independent Test**: Quickstart §2 — abas visíveis, padrão Caixa, reload volta a Caixa, sem cards legados

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx`, adicionar estado `abaReceita: 'caixa' | 'competencia'` default `'caixa'` (sem persistência) e UI de abas na seção Receita — [contracts/ui-dashboard-receita-abas.md](./contracts/ui-dashboard-receita-abas.md), FR-001, FR-001c, FR-002
- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, remover renderização dos cards genéricos **Receita** e **Receita Pendente** (consumo de `resumo` para esses cards); manter card **Pipeline de Receita** — FR-001a, FR-001b, SC-009
- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, garantir que troca de aba preserva `ano`/`mes` e `visaoReceita` e que `admin`/`visualizador` veem as mesmas abas (somente leitura) — FR-002, FR-003

**Checkpoint**: MVP de navegação — SC-010; estrutura de seção Receita alinhada ao clarify Q1

---

## Phase 4: User Story 2 - Ler a aba Por Caixa (Priority: P1)

**Goal**: Métricas Recebido, Impostos Recolhidos, A Receber, A Faturar na aba Por Caixa com filtros do briefing

**Independent Test**: Quickstart §3 — Recebido/impostos/pendentes; pendente fora do período ausente; impostos estáveis no toggle

### Implementation for User Story 2

- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, no `carregarDados`, chamar `relatoriosService.receitaCaixa(ano, mes)` e guardar estado (`receitaCaixa` / erro) sem quebrar Pipeline — FR-018
- [x] T010 [US2] Em `frontend/src/pages/Dashboard.tsx`, na aba Por Caixa, renderizar Recebido / A Receber / A Faturar com `valorPorVisao` e Impostos Recolhidos **sem** aplicar toggle — FR-004–FR-008, FR-014, [contracts/ui-dashboard-receita-abas.md](./contracts/ui-dashboard-receita-abas.md)
- [x] T011 [US2] Em `frontend/src/pages/Dashboard.tsx`, tratar loading/erro/vazio da aba Caixa (R$ 0,00 quando zero; mensagem se falha) conforme contrato UI

**Checkpoint**: SC-001/SC-002/SC-004 parciais na aba Caixa

---

## Phase 5: User Story 3 - Ler a aba Por Competência (Priority: P1)

**Goal**: Total Fechado / Já Recebido / A Receber / A Faturar a partir do Pipeline; invariante da soma

**Independent Test**: Quickstart §4 — Totais = Pipeline; soma dos três = Fechado

### Implementation for User Story 3

- [x] T012 [P] [US3] Em `frontend/src/utils/receitaAbas.ts` (ou `pipelineReceita.ts`), helper que mapeia `PipelineReceita` → métricas Por Competência (`fechado`→Total Fechado, `recebido`→Já Recebido, `faturado_ag_pagamento`→A Receber, `a_faturar`→A Faturar) — [research.md](./research.md) §1, FR-010–FR-012
- [x] T013 [US3] Em `frontend/src/pages/Dashboard.tsx`, na aba Por Competência, renderizar as quatro métricas via Pipeline já carregado + `valorPorVisao` — FR-011, FR-014, [contracts/ui-dashboard-receita-abas.md](./contracts/ui-dashboard-receita-abas.md)
- [x] T014 [US3] Em `frontend/src/pages/Dashboard.tsx`, garantir que a aba Competência não dispara segundo endpoint de competência (só reutiliza `pipeline`) — FR-017

**Checkpoint**: SC-003 / SC-006 verificáveis na UI

---

## Phase 6: User Story 4 - Toggle e barra de meta seguem as abas (Priority: P1)

**Goal**: Toggle atualiza métricas de receita das abas (exceto impostos); barra do topo usa numerador da aba ativa e meta mensal/anual correta

**Independent Test**: Quickstart §5 — % Caixa = Recebido÷meta; % Competência = Fechado÷meta; sem barra duplicada

### Implementation for User Story 4

- [x] T015 [US4] Em `frontend/src/pages/Dashboard.tsx`, confirmar que todas as métricas de receita das abas (exceto Impostos Recolhidos) reagem a `visaoReceita` sem refetch — FR-014, SC-004
- [x] T016 [US4] Em `frontend/src/pages/Dashboard.tsx`, alterar a barra de progresso do bloco meta do topo: numerador = Recebido (aba Caixa) ou Total Fechado/`pipeline.fechado` (aba Competência) na base ativa; **não** usar `progresso.realizado_*` legado por emissão — FR-009, FR-009b, FR-013, [research.md](./research.md) §5
- [x] T017 [US4] Em `frontend/src/pages/Dashboard.tsx`, denominador: modo mês → `meta_exibida` mensal (057); modo só-ano → meta anual; rótulos “recebido”/“fechado”; estado claro se meta ausente; uma única barra — FR-009a, FR-009c, FR-015, FR-016, SC-005, SC-005a, SC-005b

**Checkpoint**: Clarify Q2/Q5 cobertos; SC-005 família

---

## Phase 7: User Story 5 - Coerência período / Pipeline / exclusões (Priority: P2)

**Goal**: Mudança de mês/ano atualiza abas + Pipeline juntos; modo só-ano agrega; cancelados/excluídos fora

**Independent Test**: Quickstart §6 e §4 — ano agrega; Total Fechado = Fechado Pipeline; exclusões já no backend

### Implementation for User Story 5

- [x] T018 [US5] Em `frontend/src/pages/Dashboard.tsx`, garantir que `useEffect`/`carregarDados` ao mudar `ano`/`mes` recarrega `receitaCaixa` e `pipeline` juntos (sem misturar períodos) — FR-018, FR-018a
- [x] T019 [US5] Revisar `GET /receita-caixa` em `backend/app/api/routes/relatorios.py` para modo só-ano (`mes` omitido) com `extract(year, …)` em `data_pagamento` / `data_ent_pgto` e mesmas exclusões do Pipeline — FR-018a, FR-019
- [x] T020 [US5] Em `frontend/src/pages/Dashboard.tsx`, smoke visual: no mesmo período/toggle, métricas Competência alinhadas ao card Pipeline (labels/estágios) — FR-017, SC-006, SC-011

**Checkpoint**: SC-006 / SC-011; coerência cross-card

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e higiene

- [x] T021 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T022 Executar checklist de [quickstart.md](./quickstart.md) (API smoke + abas + toggle + meta + só-ano + papéis)
- [x] T023 Revisar `Dashboard.tsx` para não restar referências órfãs aos cards Receita/Pendente na seção Receita e para não ter começado 07–09

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Após Setup — **bloqueia** todas as US
- **US1 (Phase 3)**: Após Foundation — MVP de navegação (pode ter placeholders de métricas)
- **US2 (Phase 4)**: Após US1 (precisa shell das abas) + Foundation (API Caixa)
- **US3 (Phase 5)**: Após US1; independente de US2 se Pipeline já existe (pode paralelizar com US2)
- **US4 (Phase 6)**: Após US2 + US3 (precisa numeradores das duas abas)
- **US5 (Phase 7)**: Após US2–US4 (coerência cross-cutting)
- **Polish (Phase 8)**: Após US desejadas

### User Story Dependencies

- **US1 (P1)**: Após Foundation — MVP
- **US2 (P1)**: Após US1 + Foundation
- **US3 (P1)**: Após US1; paralelo a US2 possível
- **US4 (P1)**: Após US2 e US3
- **US5 (P2)**: Após US4 (recomendado) ou após US2+US3 mínimos

### Within Each User Story

- Backend/helpers antes do wire completo na UI quando a história depende de dado novo
- Integração no Dashboard depois dos utils/clients
- Checkpoint antes da próxima prioridade

### Parallel Opportunities

- T002 ∥ T004 ∥ T005 (schemas / api.ts / receitaAbas.ts)
- Após Foundation: T012 (helper Competência) pode paralelizar com T009–T011 (Caixa) se US1 já feito
- T021 ∥ revisão de docs locais

---

## Parallel Example: Foundation

```bash
Task: "Schemas ReceitaCaixa em backend/app/schemas.py"
Task: "relatoriosService.receitaCaixa em frontend/src/services/api.ts"
Task: "Helpers em frontend/src/utils/receitaAbas.ts"
# Depois sequencial:
Task: "GET /receita-caixa em backend/app/api/routes/relatorios.py"
```

## Parallel Example: US2 + US3 (após US1)

```bash
Task: "Wire receitaCaixa + UI Por Caixa em Dashboard.tsx"
Task: "Helper map Pipeline → Competência em receitaAbas.ts / pipelineReceita.ts"
# Depois:
Task: "UI Por Competência em Dashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2 (Foundation)
2. Phase 3 (US1) — abas + remoção dos cards legados
3. **STOP e VALIDAR** Quickstart §2
4. Demo de navegação da seção Receita

### Incremental Delivery

1. Foundation → API Caixa pronta
2. US1 → shell de abas (MVP)
3. US2 → Por Caixa completo
4. US3 → Por Competência
5. US4 → barra de meta + toggle coerente
6. US5 → só-ano / coerência
7. Polish → quickstart completo

### Parallel Team Strategy

1. Dev A: T003 endpoint + T002 schemas
2. Dev B: T004 + T005 clients/utils; depois US1 UI
3. Após US1: Dev A wire Caixa (US2); Dev B Competência (US3); juntos US4/US5

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem testes automatizados nesta lista (spec não pediu)
- Conta a Receber = `nfs`; fechamento = `data_ent_pgto`; recebimento = `data_pagamento`
- Numerador da barra ≠ `metas/progresso.realizado_*` legado
- Commit por tarefa ou grupo lógico; validar checkpoint antes de avançar
