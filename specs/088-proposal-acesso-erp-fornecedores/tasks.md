# Tasks: Acesso ao Proposal pelo ERP e liberação para fornecedores

**Input**: Design documents from `/specs/088-proposal-acesso-erp-fornecedores/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: o repositório não tem suíte automatizada; a validação segue `quickstart.md` + checagem de tipos do front.

## Phase 1: Foundational (bloqueia todas as histórias)

- [X] T001 Adicionar `fornecedor_id` e `senha_pendente` em `UsuarioApp` e o modelo `TokenAcesso` em `backend/app/models/__init__.py`
- [X] T002 Migração inline em `backend/app/main.py::_migrar()`: colunas novas em `usuarios_app`, índice único parcial de `fornecedor_id`, tabela `tokens_acesso` com check e índices
- [X] T003 Criar `backend/app/services/acesso_proposal.py` com: gerar token (hash SHA-256), emitir/consumir token atômico, invalidar convites, normalizar e-mail
- [X] T004 Recusar `senha_pendente` nos logins do ERP (`backend/app/api/routes/auth.py`) e do Proposal (`backend/app/api/routes/proposal_auth.py`); normalizar login com `@` no Proposal
- [X] T005 Criar `frontend/src/utils/proposalUrl.ts` (base do Proposal a partir de `VITE_PROPOSAL_PUBLIC_URL` ou do host)

## Phase 2: User Story 1 — Proposal no menu com entrada automática (P1) 🎯

- [X] T006 [US1] `acesso_proposal` nas respostas de `POST /api/auth/token` e `GET /api/auth/me`; `POST /api/auth/proposal-sso` em `backend/app/api/routes/auth.py`
- [X] T007 [US1] `POST /api/proposal/auth/sso` em `backend/app/api/routes/proposal_auth.py`
- [X] T008 [P] [US1] `acessoProposal` no `useAuthStore` (`frontend/src/store/index.ts`) e gravação no login (`frontend/src/components/Login.tsx`)
- [X] T009 [P] [US1] `authService.me` e `authService.proposalSso` em `frontend/src/services/api.ts`
- [X] T010 [US1] Item **Proposal** no menu, atualização via `/auth/me` e abertura em nova aba em `frontend/src/components/Layout.tsx` (+ ícone em `frontend/src/components/navIcons.tsx`)
- [X] T011 [P] [US1] `entrarSso` em `frontend/src/proposal/services/proposalApi.ts` e página `frontend/src/proposal/pages/Entrar.tsx`
- [X] T012 [US1] Rota pública `/entrar` em `frontend/src/proposal/App.tsx`; mensagem vinda do redirecionamento em `frontend/src/proposal/pages/Login.tsx`

## Phase 3: User Story 2 — Liberar fornecedor com convite (P1)

- [X] T013 [US2] Serviço de liberação (`liberar_fornecedor`, `gerar_convite`, pré-preenchimento do perfil) em `backend/app/services/acesso_proposal.py`
- [X] T014 [US2] Router `backend/app/api/routes/proposal_acessos.py` (`GET /`, `POST /liberar`, `POST /{id}/convite`) e registro em `backend/app/main.py` com `require_admin`
- [X] T015 [US2] `POST /convite/consultar` e `POST /convite/aceitar` em `backend/app/api/routes/proposal_auth.py`
- [X] T016 [P] [US2] `consultarConvite`/`aceitarConvite` em `frontend/src/proposal/services/proposalApi.ts` e página `frontend/src/proposal/pages/Convite.tsx`; rota pública `/convite` em `frontend/src/proposal/App.tsx`
- [X] T017 [P] [US2] `proposalAcessosService` e tipos em `frontend/src/services/api.ts` / `frontend/src/types/index.ts`
- [X] T018 [US2] Fornecedores: coluna de status, ação **Liberar Proposal** por linha e modal de links com **Copiar** em `frontend/src/pages/Fornecedores.tsx`

## Phase 4: User Story 3 — Acompanhar e revogar (P2)

- [X] T019 [US3] `revogar_acesso_fornecedor` e status derivado em `backend/app/services/acesso_proposal.py`; `POST /{id}/revogar` em `backend/app/api/routes/proposal_acessos.py`
- [X] T020 [US3] Revogar ao desativar (`DELETE`), ao atualizar com `ativo=false` (`PUT`) e ao excluir permanentemente em `backend/app/api/routes/colaboradores.py`
- [X] T021 [US3] Ações **Novo convite** e **Revogar Proposal** (com `window.confirm`) e selos de status em `frontend/src/pages/Fornecedores.tsx`

## Phase 5: User Story 4 — Liberação em massa (P3)

- [X] T022 [US4] Seleção por linha + "selecionar todos" e botão **Liberar Proposal (N)** no cabeçalho, reaproveitando o modal de resultados em `frontend/src/pages/Fornecedores.tsx`

## Phase 6: Polish

- [X] T023 [P] Documentar `VITE_PROPOSAL_PUBLIC_URL` também como endereço do item de menu em `.env.deploy.example`
- [X] T024 Checagem de tipos/lint do front (`npx tsc --noEmit`) e compilação do backend (`python -m py_compile`)
- [X] T025 Executar os cenários de `quickstart.md` no ambiente local

## Dependencies & Execution Order

- Phase 1 bloqueia tudo.
- US1 (Phase 2) e US2 (Phase 3) são independentes entre si após a Phase 1.
- US3 depende do serviço de US2 (T013); US4 depende da tela de US2 (T018).
- Polish por último.
