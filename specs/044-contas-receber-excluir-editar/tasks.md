# Tasks: Contas a Receber — Excluir linha, Tipo e campos Maggo editáveis

**Input**: Design documents from `/specs/044-contas-receber-excluir-editar/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-contas-receber-edicao.md](./contracts/rest-contas-receber-edicao.md), [contracts/ui-contas-receber-edicao.md](./contracts/ui-contas-receber-edicao.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → US2, depois P2 US3). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1 exclusão; US2 Tipo/Parcela; US3 Maggo editável
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e arquivos-alvo; sem dependências novas

- [x] T001 Confirmar branch `044-contas-receber-excluir-editar`, portas 8001/5193/5433 e arquivos-alvo listados em [plan.md](./plan.md) (`nfs.py`, `NFs.tsx`, `DH.tsx`, `main.py`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Coluna `excluida_em`, modelo e filtro de visíveis nas rotas de NF — bloqueia US1

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/main.py` (`_migrar`): `ALTER TABLE nfs ADD COLUMN IF NOT EXISTS excluida_em TIMESTAMP NULL` conforme [data-model.md](./data-model.md)
- [x] T003 Adicionar `excluida_em` ao modelo `NF` em `backend/app/models/__init__.py`
- [x] T004 Em `backend/app/api/routes/nfs.py`: helper `_nfs_visiveis` (`excluida_em IS NULL`); aplicar em `GET /`, resumo e exportação; `GET /{id}` retorna 404 se excluída

**Checkpoint**: Banco migrado; listagem/resumo/export não devolvem excluídas (ainda sem botão de excluir)

---

## Phase 3: User Story 1 - Excluir uma linha da listagem (Priority: P1) 🎯 MVP

**Goal**: Admin exclui linha (manual ou Maggo, pendente ou recebida) com confirmação; a Maggo não recria; caixa não é desfeito

**Independent Test**: Excluir manual e Maggo; recarregar — não voltam. Excluir recebida — Fluxo de Caixa intacto. Visualizador sem ação. `DELETE /todas` continua 403.

### Implementation for User Story 1

- [x] T005 [US1] Reativar `DELETE /nfs/{id}` em `backend/app/api/routes/nfs.py`: `require_admin`; setar `excluida_em`; auditoria `deletar`; 404 se já excluída; **não** apagar linha nem mexer em caixa; `DELETE /todas` permanece 403 conforme [contracts/rest-contas-receber-edicao.md](./contracts/rest-contas-receber-edicao.md)
- [x] T006 [US1] Em `_sync_maggo_stub` em `backend/app/api/routes/nfs.py`: se `maggo_id` já existe (visível **ou** excluída), `continue` sem atualizar nem ressuscitar
- [x] T007 [US1] PUT, upload/remoção de anexo em `backend/app/api/routes/nfs.py` retornam 404 quando `excluida_em` está preenchido
- [x] T008 [P] [US1] Filtrar `excluida_em IS NULL` nas consultas de NF em `backend/app/api/routes/relatorios.py`
- [x] T009 [P] [US1] Filtrar `excluida_em IS NULL` nas consultas de NF em `backend/app/api/routes/metas.py`
- [x] T010 [P] [US1] Filtrar `excluida_em IS NULL` nas consultas de NF em `backend/app/api/routes/impostos.py`
- [x] T011 [P] [US1] Filtrar `excluida_em IS NULL` nas consultas de NF em `backend/app/services/email.py`
- [x] T012 [US1] Botão **Excluir** na coluna Ações (admin) em `frontend/src/pages/NFs.tsx`: `confirm`, `nfsService.deletar`, toast; distinto de arquivar; visualizador sem o botão conforme [contracts/ui-contas-receber-edicao.md](./contracts/ui-contas-receber-edicao.md)

**Checkpoint**: SC-001, SC-002, SC-008, SC-009; FR-001, FR-002, FR-003, FR-004

---

## Phase 4: User Story 2 - Ver e escolher Tipo (Retainer, Parcela, Sucesso) (Priority: P1)

**Goal**: Rótulo **Tipo**; opção visível **Parcela** (valor gravado `parcelamento`); mesmas telas/e-mails novos sem a palavra Parcelamento

**Independent Test**: Cabeçalho Tipo; três opções; CSV Tipo/Parcela; DH card/select/assunto novo dizem Parcela

### Implementation for User Story 2

- [x] T013 [US2] Aceitar alias `parcela` → `parcelamento` em `_tipo_oficial` em `backend/app/schemas.py` e em `_parse_tipo_create` em `backend/app/api/routes/nfs.py`
- [x] T014 [US2] Em `frontend/src/pages/NFs.tsx`: cabeçalho, label do form e CSV **Tipo**; `tipoLabel` e `<option>` **Parcela** (value `parcelamento`); ordem Retainer, Sucesso, Parcela
- [x] T015 [P] [US2] Em `frontend/src/pages/DH.tsx`: `TIPOS`/`tipoLabel`/card/select **Parcela** no lugar de Parcelamento
- [x] T016 [P] [US2] Em `backend/app/api/routes/dh.py`: mapa de assunto de e-mail **novo** usa **Parcela** (não reescrever assuntos já gravados)

**Checkpoint**: SC-003, SC-004, SC-005; FR-005, FR-006, FR-007, FR-008

---

## Phase 5: User Story 3 - Editar no Ocean os campos que vieram da Maggo (Priority: P2)

**Goal**: Admin edita grupo Maggo no Ocean (origem continua Maggo); Maggo não recebe nem sobrescreve

**Independent Test**: Editar bruto/tipo de conta Maggo; recarregar persiste; sync Maggo não reverte; visualizador não edita

### Implementation for User Story 3

- [x] T017 [US3] Em `frontend/src/pages/NFs.tsx`: `maggoEditavel` verdadeiro para admin também em origem Maggo (projeto, tipo, empresa, candidato, bruto, imposto, líquido, data de fechamento); atualizar texto de ajuda da origem
- [x] T018 [US3] Confirmar em `backend/app/api/routes/nfs.py` que PUT aplica grupo Maggo (exceto `origem`/`maggo_id`) e que `_sync_maggo_stub` não atualiza registro existente visível (T006)

**Checkpoint**: SC-006, SC-007; FR-009, FR-010, FR-011, FR-013

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação ponta a ponta e qualidade

- [x] T019 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 Executar cenários de [quickstart.md](./quickstart.md) (Tipo, excluir manual/Maggo/recebida, Maggo editável, visualizador, sem Deletar Todas)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da Phase 2; T014 em `NFs.tsx` depois de T012 (mesmo arquivo)
- **US3 (Phase 5)**: Depende da Phase 2; T017 em `NFs.tsx` depois de T014
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Independente após Phase 2
- **US2 (P1)**: Independente no DH (`T015`/`T016`); `NFs.tsx` sequencial após T012
- **US3 (P2)**: UI após T014; merge já coberto em T006/T018

### Parallel Opportunities

- T008, T009, T010, T011 após T005/T006
- T015 e T016 em paralelo com T013 (arquivos diferentes)

### Parallel Example: User Story 1

```bash
# Após T005–T007, totais em paralelo:
Task: "Filtrar excluídas em backend/app/api/routes/relatorios.py"
Task: "Filtrar excluídas em backend/app/api/routes/metas.py"
Task: "Filtrar excluídas em backend/app/api/routes/impostos.py"
Task: "Filtrar excluídas em backend/app/services/email.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (excluir linha)
3. **STOP**: validar exclusão Maggo/manual/recebida e visualizador
4. Demo se pronto

### Incremental Delivery

1. Setup + Foundational
2. US1 → exclusão operacional (MVP)
3. US2 → Tipo / Parcela
4. US3 → Maggo editável
5. Polish / quickstart

---

## Notes

- `[P]` = arquivos diferentes, sem dependência incompleta
- Não filtrar `excluida_em` em `nf_duplicidade.py` — número continua único
- Sem escrita na Maggo; sem lixeira; sem `DELETE /todas`
- Validar no browser (Contas a Receber, DH, Fluxo de Caixa após excluir recebida)
