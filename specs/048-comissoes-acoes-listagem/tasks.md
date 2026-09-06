# Tasks: Comissões — editar pela conta, liberar, colunas e ações em massa

**Input**: Design documents from `/specs/048-comissoes-acoes-listagem/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Gap-fill sobre 045. US1–US2 são sobretudo verificação/correção; US3 inclui o residual obrigatório (limpar seleção ao paginar). Hardening DELETE na fase Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline 045 e arquivos-alvo do residual 048

- [x] T001 Confirmar branch `048-comissoes-acoes-listagem`, portas 8001/5193/5433 e que a listagem de Comissões em `frontend/src/pages/Bonus.tsx` + rotas em `backend/app/api/routes/bonus.py` já cobrem liberar/pagar/lote conforme [plan.md](./plan.md) e [research.md](./research.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auditar contrato vs código — bloqueia histórias até o gap residual estar mapeado

**⚠️ CRITICAL**: Não iniciar correções de história sem esta auditoria

- [x] T002 [P] Auditar `POST /api/bonus/{id}/liberar`, `POST /api/bonus/{id}/pagar`, `POST /api/bonus/acoes/liberar` e `POST /api/bonus/acoes/pagar` em `backend/app/api/routes/bonus.py` contra [contracts/rest-comissoes-acoes.md](./contracts/rest-comissoes-acoes.md) (sem pré-requisito de NF recebida; 422 nos estados inválidos)
- [x] T003 [P] Auditar `frontend/src/pages/Bonus.tsx` contra [contracts/ui-comissoes-acoes.md](./contracts/ui-comissoes-acoes.md): Editar→NF, ausência de Deletar, Liberado linha+grupo, Pago, checkboxes, limpeza só em filtros (gap de paginação)
- [x] T004 Confirmar deep-link `?edit=` em `frontend/src/pages/NFs.tsx` e presença residual de `DELETE` em `backend/app/api/routes/bonus.py` + `bonusService.deletar` em `frontend/src/services/api.ts`

**Checkpoint**: Gaps conhecidos — ao menos FR-012a (limpar seleção ao paginar); DELETE ainda na API

---

## Phase 3: User Story 1 - Editar pela Conta a receber e remover Deletar (Priority: P1) 🎯 MVP

**Goal**: Editar abre a Conta a receber vinculada; sem Deletar na listagem; legado sem `nf_id` só com mensagem

**Independent Test**: Linha com vínculo → Editar abre `/nfs?edit=`; sem vínculo → toast; zero botões Deletar/Excluir na UI

### Implementation for User Story 1

- [x] T005 [US1] Verificar e corrigir em `frontend/src/pages/Bonus.tsx`: ação **Editar** usa `navigate('/nfs?edit=' + nf_id)` quando há vínculo; toast claro quando `nf_id` ausente; sem modal de edição isolada de comissão
- [x] T006 [US1] Verificar e garantir ausência de botão/handler **Deletar** (e equivalentes) na listagem de `frontend/src/pages/Bonus.tsx` para admin e visualizador
- [x] T007 [P] [US1] Verificar deep-link em `frontend/src/pages/NFs.tsx`: query `edit` abre modal da Conta a receber para admin; limpa query ao fechar

**Checkpoint**: SC-001; FR-001, FR-002, FR-003 (UI)

---

## Phase 4: User Story 2 - Liberar e colunas Liberado / Pago (Priority: P1)

**Goal**: Liberar/Pagar individuais; coluna Liberado (valor na linha + soma no grupo); coluna Pago; sem pré-requisito de NF

**Independent Test**: Liberar → valor na linha e soma do grupo; Pagar só após liberar; visualizador só leitura

### Implementation for User Story 2

- [x] T008 [P] [US2] Verificar em `backend/app/api/routes/bonus.py` que `liberar`/`pagar` individuais não exigem NF recebida nem `nf_id`; corrigir se houver gate indevido
- [x] T009 [US2] Verificar e corrigir em `frontend/src/pages/Bonus.tsx`: coluna **Liberado** por linha (valor ou “—”); soma **Liberado** no cabeçalho do grupo no recorte filtrado; badge **Pago**/**Pendente** por linha
- [x] T010 [US2] Verificar e corrigir ações **Liberar** / **Pagar** em `frontend/src/pages/Bonus.tsx` (`window.confirm`, toast, reload; Pagar só se `liberado && !pago`; ocultas para visualizador)

**Checkpoint**: SC-002, SC-005; FR-004 a FR-009, FR-013 (parte individual), FR-014

---

## Phase 5: User Story 3 - Caixa de seleção e ações em massa (Priority: P2)

**Goal**: Checkboxes na página atual; Liberar/Pagar em massa; **limpar seleção ao mudar página ou filtros**

**Independent Test**: Lote na página atual; ao paginar, seleção some; filtros também limpam; visualizador sem seleção

### Implementation for User Story 3

- [x] T011 [P] [US3] Verificar endpoints de lote e `bonusService.liberarLote`/`pagarLote` em `backend/app/api/routes/bonus.py` e `frontend/src/services/api.ts` (feedback `processados`/`ignorados`)
- [x] T012 [US3] Verificar checkboxes por linha/grupo e barra **Liberar em massa** / **Pagar em massa** em `frontend/src/pages/Bonus.tsx` (só admin; só elegíveis; confirm + toast)
- [x] T013 [US3] **Implementar** limpeza de `selecionados` ao mudar de página em `frontend/src/pages/Bonus.tsx` (envolver `Pagination.onChange` / `setPagina` para também `setSelecionados(new Set())`), conforme FR-012a e [contracts/ui-comissoes-acoes.md](./contracts/ui-comissoes-acoes.md)
- [x] T014 [US3] Confirmar que mudança de filtros (fornecedor, ano, recorte, mês, trimestre) em `frontend/src/pages/Bonus.tsx` continua limpando seleção; ajustar se algum filtro não limpar

**Checkpoint**: SC-003, SC-004; FR-010 a FR-012a

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening DELETE + validação end-to-end

- [x] T015 Remover ou desativar `DELETE /api/bonus/{id}` em `backend/app/api/routes/bonus.py` (405/403 estável ou remoção do route handler) conforme [contracts/rest-comissoes-acoes.md](./contracts/rest-comissoes-acoes.md)
- [x] T016 [P] Remover `bonusService.deletar` (e usos órfãos) em `frontend/src/services/api.ts`
- [x] T017 Executar validação manual dos cenários 1–6 de [quickstart.md](./quickstart.md) em `/comissoes` (admin + visualizador)
- [x] T018 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`

> **Nota implement (2026-09-06):** T017 validado por auditoria de código contra os cenários do quickstart (UI/API alinhados); smoke manual no browser recomendado. T018: `type-check` falha em `Dashboard.tsx`/`DH.tsx` pré-existentes; ESLint sem config no frontend — fora do escopo 048. Alterações desta feature não introduziram erros novos nesses arquivos.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato
- **Foundational (Phase 2)**: após Setup — bloqueia histórias
- **US1 (Phase 3)**: após Phase 2 — MVP
- **US2 (Phase 4)**: após Phase 2 (pode seguir US1; independente na prática)
- **US3 (Phase 5)**: após Phase 2; T013 depende do estado atual de `Bonus.tsx` (pode paralelizar T011 com US1/US2 em arquivos backend/api)
- **Polish (Phase 6)**: após US1–US3 desejadas

### User Story Dependencies

- **US1 (P1)**: sem dependência de US2/US3
- **US2 (P1)**: sem dependência de US1/US3 (mesmo arquivo UI — sequential se mesma pessoa)
- **US3 (P2)**: independente em lógica; T013/T014 editam o mesmo `Bonus.tsx` que US1/US2 → sequential no frontend

### Parallel Opportunities

- T002 ∥ T003 ∥ T004 (auditoria)
- T007 ∥ T005–T006 (NFs vs Bonus) se pessoas diferentes
- T008 ∥ T011 (backend)
- T015 → depois T016; T017 após T013; T018 ∥ T017 se código estável

---

## Parallel Example: User Story 3

```bash
# Em paralelo (arquivos diferentes):
Task: "T011 Verificar lote em bonus.py e api.ts"
# Sequencial no mesmo arquivo UI:
Task: "T012 Verificar checkboxes/barra em Bonus.tsx"
Task: "T013 Limpar selecionados ao paginar em Bonus.tsx"
Task: "T014 Confirmar limpeza nos filtros em Bonus.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1–2 (auditoria)
2. Phase 3 (US1) — Editar + sem Deletar na UI
3. Validar Independent Test US1

### Incremental Delivery

1. US1 → demo navegação/edição
2. US2 → Liberado/Pago/Liberar/Pagar
3. US3 → lote + **limpar ao paginar** (único gap obrigatório novo)
4. Polish → DELETE API + quickstart

### Suggested MVP scope

US1 apenas (Editar pela conta + sem Deletar). Na prática, o valor operacional completo exige US2+US3; o único código novo esperado é T013 (+ T015/T016 no polish).

---

## Notes

- Maioria das tarefas de “verificar e corrigir” deve fechar rápido se 045 estiver intacta — marcar concluída após confirmação no código/UI
- T013 é a tarefa residual crítica da clarify Q5 / FR-012a
- Não reimplementar cadastro de comissões na Conta a receber (fora de escopo 048)
- Commit após cada grupo lógico (US ou polish)
