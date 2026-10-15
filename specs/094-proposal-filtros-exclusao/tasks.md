# Tasks: Filtros e exclusão de propostas no Proposal

**Input**: Design documents from `/specs/094-proposal-filtros-exclusao/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados; validação por checks estáticos e roteiro do [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Confirmar escopo em [plan.md](./plan.md): sem schema novo; filtros no servidor; exclusão física só admin com auditoria

---

## Phase 2: Foundational

- [x] T002 Em `backend/app/api/routes/proposal_propostas.py`, criar helpers `_contem(valor)` (escapa `\ % _`, devolve `%valor%`) e `_exigir_admin(user)` (403 "Ação permitida apenas para administradores")

---

## Phase 3: User Story 1 — Filtrar a lista (P1) 🎯 MVP

**Goal**: filtros combináveis aplicados antes da paginação.

**Independent Test**: cenários 1–7 do [quickstart.md](./quickstart.md).

- [x] T003 [US1] Em `backend/app/api/routes/proposal_propostas.py` `listar_propostas`, aceitar `empresa`, `modelo` (validar contra `MODELOS` + `simples`, 422), `projeto` (R3: `projeto_nome` ou `EXISTS jsonb_array_elements`), `data_de`/`data_ate` (R4: `COALESCE(data_proposta, data SP de emitida_em)`) e `criado_por` (só admin) — [contracts/rest-proposal-lista-exclusao.md](./contracts/rest-proposal-lista-exclusao.md)
- [x] T004 [US1] Em `backend/app/api/routes/proposal_propostas.py`, adicionar `GET /autores` (admin; `DISTINCT criado_por_usuario` ordenado) declarado antes de `/{proposta_id}`
- [x] T005 [P] [US1] Em `frontend/src/proposal/services/proposalApi.ts`, criar `FiltrosPropostas` (`status`, `empresa`, `modelo`, `projeto`, `data_de`, `data_ate`, `criado_por`), estender `listarPropostas` (omitindo vazios) e criar `listarAutores()`
- [x] T006 [US1] Em `frontend/src/proposal/pages/Lista.tsx`, barra de filtros (Empresa e Projeto com debounce de 300 ms, Modelo, Data de/até, Status, Criado por só admin via `listarAutores`), "Limpar filtros" quando houver filtro ativo, volta à página 1 a cada mudança e mensagem "Nenhuma proposta encontrada com esses filtros"

**Checkpoint**: US1 funcional.

---

## Phase 4: User Story 2 — Admin exclui proposta (P2)

**Goal**: exclusão definitiva com confirmação, auditada.

**Independent Test**: cenários 8 e 9 do [quickstart.md](./quickstart.md).

- [x] T007 [US2] Em `backend/app/api/routes/proposal_propostas.py`, adicionar `DELETE /{proposta_id}` (admin; `_obter_visivel`; `registrar_auditoria(..., "excluir", "Proposta", id, "{codigo} — {cliente} ({status})")`; `db.delete`; 204) conforme R6
- [x] T008 [P] [US2] Em `frontend/src/proposal/services/proposalApi.ts`, criar `excluirProposta(id)`; em `frontend/src/proposal/utils/propostaCalculo.ts`, criar `mensagemConfirmacaoExclusao(cliente, status)` com o texto reforçado para `assinada`
- [x] T009 [US2] Em `frontend/src/proposal/pages/Lista.tsx`, ação "Excluir" (admin) na coluna Ações: confirmação, toast "Proposta excluída", recarrega a lista; em erro, toast e recarrega
- [x] T010 [US2] Em `frontend/src/proposal/pages/Detalhe.tsx`, botão "Excluir" (admin) com a mesma confirmação; sucesso → toast e `navigate('/')`

---

## Phase 5: Polish

- [x] T011 `python -m py_compile backend/app/api/routes/proposal_propostas.py`; `npm run type-check` e `npm run build` em `frontend/`
- [x] T012 Smoke da consulta de filtros (compilação do SQL em dialeto PostgreSQL) e da exclusão com `fastapi.testclient`, quando possível

## Dependencies & Execution Order

- T002 → T003, T004, T007 (mesmo arquivo, sequenciais).
- T005 → T006; T008 → T009, T010.
- US1 e US2 são independentes entre si (exceto pelo arquivo de rotas compartilhado).

## Implementation Strategy

MVP = US1 (filtros). Depois US2 (exclusão). Polish no fim.
