# Tasks: Modelos de proposta no Proposal

**Input**: Design documents from `/specs/098-proposal-modelos-proposta/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rest-proposal-modelos.md, quickstart.md

**Tests**: Não solicitados na spec; validação por type-check, compilação e roteiro do quickstart.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Conferir que `.gitignore` cobre `node_modules/`, `dist/`, `__pycache__/`, `.env*` na raiz do repositório

---

## Phase 2: Foundational (bloqueia todas as histórias)

- [X] T002 Criar o model `ModeloProposta` (tabela `propostas_modelos`, `UNIQUE (divisao, nome)`, `CHECK validade_dias`) em backend/app/models/__init__.py
- [X] T003 [P] Criar o schema `ModeloPropostaIn` em backend/app/schemas.py
- [X] T004 Implementar `validar_modelo_proposta(payload)` em backend/app/services/proposta_modelos.py
- [X] T005 Habilitar RLS em `propostas_modelos` no `_migrar()` em backend/app/main.py
- [X] T006 [P] Adicionar tipos `ModeloProposta`/`ModeloPropostaPayload` e funções `listarModelosProposta`, `obterModeloProposta`, `criarModeloProposta`, `editarModeloProposta`, `excluirModeloProposta` em frontend/src/proposal/services/proposalApi.ts
- [X] T007 Implementar o router com `GET /` (filtros divisão/nome, paginação 100) e `GET /{id}` em backend/app/api/routes/proposal_modelos.py e registrá-lo em `/api/proposal/modelos` em backend/app/main.py

**Checkpoint**: API de leitura disponível e cliente HTTP tipado.

---

## Phase 3: User Story 2 - Administrador cadastra e mantém modelos (P1)

**Goal**: Admin cria, edita e exclui modelos com auditoria.

**Independent Test**: Quickstart passos 1, 2 e 3.

- [X] T008 [US2] Implementar `POST /`, `PUT /{id}` e `DELETE /{id}` (só admin, 409 nome repetido, auditoria) em backend/app/api/routes/proposal_modelos.py
- [X] T009 [US2] Adicionar a variante `'modelo'` (sem empresa, data e consultor; setor opcional; validade só em dias) e a prop `onAlterado` ao formulário em frontend/src/proposal/components/ModeloForm.tsx
- [X] T010 [US2] Exportar `formDeModeloProposta(modelo, perfil)` e `formModeloVazio()` em frontend/src/proposal/components/ModeloForm.tsx
- [X] T011 [US2] Criar a tela de criar/editar modelo (divisão, nome, formulário) em frontend/src/proposal/pages/ModeloEditor.tsx
- [X] T012 [US2] Registrar as rotas `/modelos/novo` e `/modelos/:id/editar` em frontend/src/proposal/App.tsx

**Checkpoint**: Admin consegue manter modelos.

---

## Phase 4: User Story 1 - Usar um modelo ao criar uma proposta (P1)

**Goal**: Seletor "Modelo" ao lado da divisão na nova proposta.

**Independent Test**: Quickstart passos 5, 6, 7 e 9.

- [X] T013 [US1] Renomear o campo para "Divisão", adicionar o seletor "Modelo" filtrado pela divisão, a confirmação de substituição e o suporte a `?modelo=<id>` em frontend/src/proposal/pages/Nova.tsx

**Checkpoint**: MVP (US1 + US2) funcional.

---

## Phase 5: User Story 3 - Consultar e filtrar modelos (P2)

**Goal**: Aba Modelos com filtros e visualização.

**Independent Test**: Quickstart passos 3, 4 e 8.

- [X] T014 [P] [US3] Criar a lista com filtros por divisão e nome, paginação e ações de admin em frontend/src/proposal/pages/Modelos.tsx
- [X] T015 [P] [US3] Criar a visualização do conteúdo com "Usar este modelo", Editar e Excluir (admin) em frontend/src/proposal/pages/ModeloVer.tsx
- [X] T016 [US3] Registrar as rotas `/modelos` e `/modelos/:id` em frontend/src/proposal/App.tsx
- [X] T017 [US3] Adicionar a navegação "Propostas | Modelos" no cabeçalho em frontend/src/proposal/components/ProposalLayout.tsx

---

## Phase 6: Polish & Cross-Cutting

- [X] T018 [P] Renomear filtro e coluna "Modelo" para "Divisão" em frontend/src/proposal/pages/Lista.tsx
- [X] T019 Rodar `npx tsc --noEmit` em frontend/ e `python -m py_compile` + validação de mappers no backend/

---

## Dependencies & Execution Order

- Phase 2 bloqueia todas as histórias (T002 → T004 → T007; T003 e T006 em paralelo).
- US2 (Phase 3) antes de US1 na prática, para haver modelos a usar; US1 depende de T010.
- US3 depende de T006/T007; T014 e T015 são arquivos distintos e podem andar em paralelo.
- Polish por último.

## Parallel Example

```text
T003 (schemas.py) ‖ T006 (proposalApi.ts)
T014 (Modelos.tsx) ‖ T015 (ModeloVer.tsx) ‖ T018 (Lista.tsx)
```

## Implementation Strategy

MVP = Phase 2 + US2 + US1 (cadastrar e usar). Depois US3 (aba de consulta) e polish.
