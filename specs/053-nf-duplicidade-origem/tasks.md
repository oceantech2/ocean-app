# Tasks: NF — Conflito de Duplicidade entre Origens

**Input**: Design documents from `/specs/053-nf-duplicidade-origem/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Estende feature 013. Fase 2 prepara o serviço de classificação; US1 bloqueia cruzamento de origens; US2 fecha unicidade na mesma origem + merge; US3 cobre UX/import/sync feedback.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar baseline 013/012 e arquivos-alvo

- [x] T001 Confirmar branch `053-nf-duplicidade-origem`, portas 8001/5193/5433 e presença de `backend/app/services/nf_duplicidade.py`, `backend/app/api/routes/nfs.py`, `frontend/src/pages/NFs.tsx` conforme [plan.md](./plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estender o serviço de duplicidade com classificação por origem — bloqueia todas as histórias

**⚠️ CRITICAL**: Nenhuma história de UI/rota até códigos e helpers estarem definidos

- [x] T002 Estender `backend/app/services/nf_duplicidade.py` com `CODE_ORIGEM_CONFLITO = "NF_NUMERO_ORIGEM_CONFLITO"`, mensagem pt-BR e `detail_*` incluindo `origem_existente`, conforme [contracts/rest-nf-duplicidade-origem.md](./contracts/rest-nf-duplicidade-origem.md) e [data-model.md](./data-model.md)
- [x] T003 Em `backend/app/services/nf_duplicidade.py`, alterar `garantir_numero_livre` (e/ou novo helper) para receber `origem_operacao`, classificar existente vs operação (`NF_NUMERO_DUPLICADO` mesma origem / `NF_NUMERO_ORIGEM_CONFLITO` origem diferente) e manter trim-only + número vazio sem checagem
- [x] T004 Em `backend/app/services/nf_duplicidade.py`, atualizar `raise_se_integrity_numero` para, após lookup, emitir o código adequado conforme `origem` da NF existente vs origem da operação

**Checkpoint**: Serviço classifica conflitos; UNIQUE global em `nfs.numero` permanece (sem migração)

---

## Phase 3: User Story 1 - Bloquear a mesma NF vinda de origens diferentes (Priority: P1) 🎯 MVP

**Goal**: Create/update/sync não gravam o mesmo número em duas origens; 409 `NF_NUMERO_ORIGEM_CONFLITO` no formulário

**Independent Test**: NF Maggo com número N → create Manual N → 409 origem + atalho; Maggo não sobrescreve Manual no sync

### Implementation for User Story 1

- [x] T005 [US1] Em `backend/app/api/routes/nfs.py` (`criar_nf`), passar `origem_operacao="manual"` para `garantir_numero_livre` / helper de classificação; Maggo existente com mesmo número → 409 `NF_NUMERO_ORIGEM_CONFLITO`
- [x] T006 [US1] Em `backend/app/api/routes/nfs.py` (`atualizar_nf`), ao alterar `numero`, classificar conflito contra outra NF (mesma origem vs origem diferente) conforme contrato REST
- [x] T007 [US1] Em `backend/app/api/routes/nfs.py` (`_sync_maggo_stub`), garantir que colisão com origem Manual (por `maggo_id` e/ou por `numero` quando houver) ignore a gravação Maggo, preserve Manual e acumule em lista de colisões / `X-Ocean-Maggo-Ignorados` (sem sobrescrever)
- [x] T008 [P] [US1] Em `frontend/src/utils/erros.ts` (e tipagem em `frontend/src/types/index.ts` se necessário), extrair `NF_NUMERO_ORIGEM_CONFLITO` e `origem_existente` do detail 409
- [x] T009 [US1] Em `frontend/src/pages/NFs.tsx`, tratar 409 `NF_NUMERO_ORIGEM_CONFLITO` com mensagem de outra origem + CTA “Abrir existente” (`nf_id`), sem sucesso falso, conforme [contracts/ui-nf-duplicidade-origem.md](./contracts/ui-nf-duplicidade-origem.md)

**Checkpoint**: SC-001, SC-004 (parcial); FR-001, FR-002, FR-004, FR-005 (sync)

---

## Phase 4: User Story 2 - Mesma origem: merge OK, segundo create bloqueado (Priority: P1)

**Goal**: Reenvio/merge mesma origem permitido; criar segundo registro com mesmo número na mesma origem bloqueado (`NF_NUMERO_DUPLICADO`)

**Independent Test**: Segunda Manual com número já Manual → 409 duplicado; edit da própria NF OK; Maggo reprocessando mesmo `maggo_id` não gera conflito de origem

### Implementation for User Story 2

- [x] T010 [US2] Verificar/ajustar `criar_nf` em `backend/app/api/routes/nfs.py`: número já em outra Manual → 409 `NF_NUMERO_DUPLICADO` (não ORIGEM_CONFLITO); IntegrityError mapeado via T004
- [x] T011 [US2] Verificar `_sync_maggo_stub` / merge em `backend/app/api/routes/nfs.py`: reenvio Maggo para registro já Maggo permanece no-op/merge mesma origem (não classificar como conflito entre origens)
- [x] T012 [P] [US2] Em `frontend/src/pages/NFs.tsx`, garantir que 409 `NF_NUMERO_DUPLICADO` continua com mensagem de duplicidade + “Abrir existente” (comportamento 013 preservado)

**Checkpoint**: SC-002, SC-002a; FR-003, FR-003a, FR-009

---

## Phase 5: User Story 3 - Feedback importação e distinção de erros (Priority: P2)

**Goal**: Import XLSX: `on_conflict` só Manual; Maggo → sempre `conflito_origem`; UI distingue motivos; sync sem toast dedicado

**Independent Test**: Import só Maggo → 200 com `conflito_origem` (sem 422); Manual → 422/`on_conflict`; resumo de erros distingue motivos

### Implementation for User Story 3

- [x] T013 [US3] Em `backend/app/api/routes/nfs.py` (`importar_nfs_xlsx`): classificar conflitos — só NFs `manual` entram em `conflitos` do 422; NFs `maggo` não disparam `NF_IMPORT_ON_CONFLICT_REQUIRED`
- [x] T014 [US3] Em `backend/app/api/routes/nfs.py` (`importar_nfs_xlsx`): processar linhas com número em Maggo sempre rejeitando com `motivo: "conflito_origem"` (+ `nf_id`/`origem_existente`); `on_conflict=update` **nunca** atualiza NF Maggo; novos inserts com `origem="manual"`
- [x] T015 [P] [US3] Em `frontend/src/services/api.ts`, tipar resposta de import/`erros` incluindo `conflito_origem` e detail 422 com `origem_existente` se aplicável
- [x] T016 [US3] Em `frontend/src/pages/NFs.tsx` (fluxo import), ajustar diálogo `on_conflict` para cópia de conflitos **Manual**; no resumo final distinguir `duplicado_arquivo` / `duplicado_cadastro` / `conflito_origem` conforme [contracts/ui-nf-duplicidade-origem.md](./contracts/ui-nf-duplicidade-origem.md)
- [x] T017 [US3] Em `frontend/src/pages/NFs.tsx`, garantir que colisões Maggo do sync **não** disparam toast dedicado nem notificação persistente (FR-005 / clarify Q3); header/diagnóstico existente basta

**Checkpoint**: SC-003, SC-003a, SC-005; FR-005a, FR-005b, FR-007

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação end-to-end e conformidade

- [x] T018 Percorrer cenários 1–9 de [quickstart.md](./quickstart.md) (create/edit/import/sync/visualizador) e corrigir regressões encontradas
- [x] T019 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 Confirmar FR-008/FR-010: visualizador sem escrita; sem listagem/saneamento histórico; UNIQUE `nfs.numero` intacto em `backend/app/models/__init__.py`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → histórias
- **US1 (Phase 3)** e **US2 (Phase 4)** após Phase 2; US2 depende dos helpers de T002–T004 (pode seguir US1 ou em paralelo parcial após T005–T006)
- **US3 (Phase 5)** após Phase 2; ideal após US1/US2 para reusar códigos na UI
- **Phase 6** após US1–US3

### User Story Dependencies

- **US1**: Bloqueio cross-origem (MVP)
- **US2**: Fecha mesma origem (create vs merge) — complementa US1
- **US3**: Import + UX de distinção — depende dos códigos da Phase 2

### Parallel Opportunities

- T008 ∥ T005–T007 (frontend tipagem enquanto backend sync/create)
- T012 ∥ T010–T011
- T015 ∥ T013–T014
- T019 ∥ T018

### Suggested MVP

T001–T009 (Setup + Foundation + **US1**) — já impede Manual×Maggo no formulário e no sync.

---

## Implementation Strategy

1. Foundation no serviço `nf_duplicidade` (códigos + classificação)
2. MVP: create/update/sync + UI 409 origem (US1)
3. Fechar mesma origem (US2)
4. Import classificado + UX (US3)
5. Quickstart + lint/type-check

## Task Summary

| Fase | Tasks | Contagem |
|------|-------|----------|
| Setup | T001 | 1 |
| Foundational | T002–T004 | 3 |
| US1 | T005–T009 | 5 |
| US2 | T010–T012 | 3 |
| US3 | T013–T017 | 5 |
| Polish | T018–T020 | 3 |
| **Total** | T001–T020 | **20** |

**Format validation**: Todas as tasks usam checkbox, ID `Tnnn`, `[P]` quando aplicável, `[USn]` nas fases de história, e caminhos de arquivo explícitos.

**Implementação**: 2026-09-06 — 20/20 concluídas.
