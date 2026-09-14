# Tasks: Contas a Pagar — Edição em massa de datas

**Input**: Design documents from `/specs/067-contas-pagar-datas-massa/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Fundação API (schemas + endpoint + client); US1 MVP (seleção por linha + modal + aplicar); US2 (grupo Mês/Ano + limpar seleção em filtros); US3 (confirmação, feedback processados/ignorados, limpar após sucesso); polish no fim.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/schemas.py`, `backend/app/api/routes/contas.py`
- Frontend: `frontend/src/pages/Contas.tsx`, `frontend/src/services/api.ts`, `frontend/src/types/index.ts`
- Util agrupamento: `frontend/src/utils/contasPagarAgrupamento.ts` (reusar `chaveMesVencimento` / `rotuloMesAnoColuna`)
- Referência de lote UI: `frontend/src/pages/Bonus.tsx`
- Contratos: `specs/067-contas-pagar-datas-massa/contracts/rest-contas-pagar-datas-massa.md`, `ui-contas-pagar-datas-massa.md`
- **Não alterar**: Contas a Receber, exclusão em massa descontinuada, schema físico / migrations, limpeza de datas no lote

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova, sem migration

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e contratos REST/UI: um endpoint `POST /api/contas/acoes/editar-datas`; UI só em `Contas.tsx`; portas 5193/8001 inalteradas; papéis admin/visualizador; sem limpeza de datas no lote

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contrato REST e client HTTP — bloqueia aplicar datas (US1/US3)

**⚠️ CRITICAL**: Histórias que gravam lote não começam até esta fase terminar

- [x] T002 [P] Em `backend/app/schemas.py`, adicionar `ContasDatasLoteRequest` (`ids: List[int]`, `data_vencimento` e `data_pagamento` opcionais `Optional[date]`) e `ContasDatasLoteResponse` (`processados: int`, `ignorados: int`) conforme [contracts/rest-contas-pagar-datas-massa.md](./contracts/rest-contas-pagar-datas-massa.md)
- [x] T003 Em `backend/app/api/routes/contas.py`, implementar `POST /acoes/editar-datas` com `require_admin`: validar `ids` não vazio e ≥1 data válida (omitido/`null` = não alterar; nunca limpar); aplicar vencimento e/ou pagamento; se pagamento → `pago=True` e resolver `caixa` via `_resolver_caixa_conta` se vazio (senão ignorar); ids inexistentes ou falha de caixa → `ignorados`; auditoria `editar` por conta processada; retornar `{ processados, ignorados }`; sem regra pagamento ≥ vencimento
- [x] T004 [P] Em `frontend/src/types/index.ts` (se já houver tipos de Contas) e/ou tipagem inline, declarar payload/resposta do lote alinhados ao contrato REST
- [x] T005 Em `frontend/src/services/api.ts`, adicionar `contasService.editarDatasLote(ids, { data_vencimento?, data_pagamento? })` → `POST /contas/acoes/editar-datas` retornando `{ processados, ignorados }`

**Checkpoint**: Admin autentica e chama o endpoint (curl ou client) com ids reais; visualizador recebe 403; body sem datas → 422

---

## Phase 3: User Story 1 - Alterar vencimento e/ou pagamento em massa (Priority: P1) 🎯 MVP

**Goal**: Admin marca contas por linha, abre **Editar datas em massa**, informa vencimento e/ou pagamento e grava o lote; listagem/cards atualizam; visualizador sem ação

**Independent Test**: Criar ≥3 contas; selecionar 2 por checkbox de linha; aplicar novo vencimento e/ou pagamento; conferir listagem, cards e reabertura individual; visualizador sem checkboxes/ação

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/pages/Contas.tsx`, adicionar estado `selecionados: Set<number>`, `toggleSelecionado`, coluna de checkbox por linha só se `isAdmin` (espelhar padrão de `Bonus.tsx`); visualizador não vê seleção
- [x] T007 [US1] Em `frontend/src/pages/Contas.tsx`, barra/ação **Editar datas em massa** visível só com `selecionados.size >= 1` e admin; desabilitada/oculta sem seleção (FR-006)
- [x] T008 [US1] Em `frontend/src/pages/Contas.tsx`, modal único com `input type="date"` de vencimento e pagamento; ajuda “em branco = não alterar”; validar ≥1 data preenchida antes de chamar API; sem controle de limpar datas
- [x] T009 [US1] Em `frontend/src/pages/Contas.tsx`, ao confirmar o modal: chamar `contasService.editarDatasLote` só com os campos preenchidos; em sucesso recarregar listagem/cards (`carregar` / totais existentes); preservar edição individual intacta (FR-010)
- [x] T010 [US1] Validar MVP: só vencimento preserva pagamento; só pagamento marca paga; ambos aplicam; toast básico de sucesso/erro; visualizador bloqueado (FR-002–004, FR-009, SC-004)

**Checkpoint**: MVP testável — lote por seleção de linhas + modal + API (SC-001 parcial)

---

## Phase 4: User Story 2 - Selecionar contas na listagem para o lote (Priority: P1)

**Goal**: Seleção por linha **e** por grupo Mês/Ano visível; contador N; limpar seleção ao mudar filtros; sem “marcar todas no servidor”

**Independent Test**: Marcar/desmarcar linhas e grupo de um mês; contador coerente; mudar filtro Mês/Ano ou status → seleção limpa; sem seleção → ação não dispara

### Implementation for User Story 2

- [x] T011 [US2] Em `frontend/src/pages/Contas.tsx`, agrupar visualmente o recorte filtrado por `chaveMesVencimento` (reusar `frontend/src/utils/contasPagarAgrupamento.ts`): inserir linha/faixa de cabeçalho de grupo com rótulo `rotuloMesAnoColuna` (ou “Sem vencimento”) **sem** colapsar nem reabrir modo `034`
- [x] T012 [US2] Em `frontend/src/pages/Contas.tsx`, checkbox no cabeçalho de cada grupo Mês/Ano que marca/desmarca todos os ids **visíveis** daquele grupo (`toggleGrupo`); opcional checkbox no `thead` para marcar todas as linhas visíveis do recorte
- [x] T013 [US2] Em `frontend/src/pages/Contas.tsx`, exibir contador “N selecionada(s)” quando N ≥ 1; limpar `selecionados` ao mudar filtros (status, categoria, descrição, intervalo, mês/ano/Todos, busca) via `useEffect` (FR-007, FR-001a)
- [x] T014 [US2] Validar: grupo marca só o mês visível; mudar filtro limpa seleção; ação some/desabilita com N=0 (FR-001, SC-005 parcial)

**Checkpoint**: Seleção confiável linha + grupo (US2)

---

## Phase 5: User Story 3 - Confirmar o lote e receber feedback claro (Priority: P2)

**Goal**: Resumo antes de gravar; cancelar não altera dados nem limpa seleção; sucesso informa processados/ignorados, atualiza UI e limpa seleção

**Independent Test**: Abrir fluxo, cancelar → datas e seleção intactas; confirmar lote válido → toast com contagens, cards ok, seleção vazia; simular ids inválidos → ignorados no feedback

### Implementation for User Story 3

- [x] T015 [US3] Em `frontend/src/pages/Contas.tsx`, passo de confirmação (mesmo modal ou etapa seguinte) com resumo: quantidade N e quais campos (vencimento e/ou pagamento) serão aplicados (FR-005, SC-005)
- [x] T016 [US3] Em `frontend/src/pages/Contas.tsx`, Cancelar em qualquer passo: não chama API; seleção permanece; datas inalteradas (SC-002)
- [x] T017 [US3] Em `frontend/src/pages/Contas.tsx`, após resposta **200**: toast com `processados` e `ignorados` (FR-012); recarregar listagem/cards; **limpar seleção** (FR-007a, SC-003); em erro HTTP 4xx/5xx: toast de erro, seleção permanece
- [x] T018 [US3] Validar cenários de [quickstart.md](./quickstart.md) seção feedback/cancelamento e falha parcial (ignorados)

**Checkpoint**: Confirmação e feedback completos (US3)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T019 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 Executar o checklist completo de [quickstart.md](./quickstart.md) (admin + visualizador + opcional curl); conferir SC-001–SC-005 e que Contas a Receber / exclusão em massa / edição individual não regressaram

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** US1/US3 (gravação)
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Pode iniciar após T006 (estado de seleção); idealmente após US1 mínimo; não depende do grupo para o endpoint
- **US3 (Phase 5)**: Depende do modal/API da US1
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 — seleção por linha + modal + lote
- **User Story 2 (P1)**: Amplia seleção (grupo + limpar filtros); independentemente testável com a barra de ação já existente
- **User Story 3 (P2)**: Aprimora confirmação/feedback/limpeza pós-sucesso sobre US1

### Within Each User Story

- Backend/contrato antes do client (Phase 2)
- Estado de seleção antes do modal
- Modal antes da confirmação/feedback refinados
- Story completa antes do polish

### Parallel Opportunities

- T002 e T004 em paralelo (schemas backend vs types frontend)
- T011–T012 sequenciais no mesmo arquivo `Contas.tsx` (evitar conflito)
- Após Phase 2, um dev pode fechar API smoke enquanto outro inicia T006 em `Contas.tsx`

---

## Parallel Example: Foundational

```bash
# Em paralelo (arquivos diferentes):
Task: "T002 ContasDatasLoteRequest/Response em backend/app/schemas.py"
Task: "T004 Tipos do lote em frontend/src/types/index.ts"
# Depois:
Task: "T003 POST /acoes/editar-datas em backend/app/api/routes/contas.py"
Task: "T005 contasService.editarDatasLote em frontend/src/services/api.ts"
```

---

## Parallel Example: User Story 1

```bash
# Sequencial no mesmo Contas.tsx após Phase 2:
Task: "T006 seleção por linha"
Task: "T007 barra Editar datas em massa"
Task: "T008 modal de datas"
Task: "T009 chamada API + reload"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (API + client)
2. Phase 3 US1 (checkbox linha + modal + aplicar)
3. **STOP e VALIDAR** com quickstart parcial (lote por linhas)
4. Demo interno se pronto

### Incremental Delivery

1. Setup + Foundational → endpoint ok
2. US1 → MVP seleção linha + datas
3. US2 → grupos Mês/Ano + limpar filtros
4. US3 → confirmação + feedback + limpar após sucesso
5. Polish → lint/type-check + quickstart completo

### Parallel Team Strategy

1. Dev A: T002–T003 (backend)
2. Dev B: T004–T005 (frontend client) em paralelo após T002 types acordados
3. Mesmo dev ou B: Contas.tsx US1→US2→US3 (mesmo arquivo — evitar parallel edit)

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem tasks de teste automatizado (spec não pediu TDD)
- Não reabrir agrupamento colapsável `034`; só cabeçalho de grupo na tabela plana `046`
- Null/omitido no lote = não alterar; limpar pagamento só na edição individual
- Commit por tarefa ou grupo lógico; validar em cada checkpoint
