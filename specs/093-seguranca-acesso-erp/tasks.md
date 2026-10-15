# Tasks: Segurança de acesso ao ERP

**Input**: Design documents from `/specs/093-seguranca-acesso-erp/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec; validação por checks estáticos, smoke com `fastapi.testclient` e roteiro manual do [quickstart.md](./quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): sem tabelas novas; contas `admin`/`visualizador` existentes mantidas; revogação por reconferência no banco; olho da senha fora (096)

---

## Phase 2: Foundational (bloqueia todas as histórias)

- [x] T002 Em `backend/app/services/acesso_proposal.py`, criar `normalizar_login(valor)` (`strip()`; `lower()` se contém `@`) conforme R5

**Checkpoint**: regra única de normalização disponível.

---

## Phase 3: User Story 1 — Ninguém entra com credenciais padrão (P1) 🎯 MVP

**Goal**: login só para contas cadastradas e aptas; nenhuma credencial exibida; nenhuma conta criada automaticamente.

**Independent Test**: cenários 1 e 2 do [quickstart.md](./quickstart.md).

- [x] T003 [US1] Em `backend/app/api/routes/auth.py`, remover `USUARIOS_DEV`, `PERMISSOES_ADMIN` e `seed_usuarios_default`; em `login`, normalizar `username` com `normalizar_login`, buscar o usuário ativo e recusar com 401 se não existir, se tiver `senha_pendente` ou se a senha estiver errada; emitir o token com `sub = usuario_db.usuario` e devolver `usuario` canônico — [contracts/rest-auth-usuarios.md](./contracts/rest-auth-usuarios.md)
- [x] T004 [P] [US1] Em `frontend/src/components/Login.tsx`, remover o parágrafo com usuário/senha padrão e o rodapé "Ambiente de desenvolvimento" (FR-001)
- [x] T005 [P] [US1] Criar `backend/scripts/criar_admin.py` (R3): argumento `usuario`, flag `--redefinir-senha`; senha de `OCEAN_ADMIN_SENHA` ou `getpass` com confirmação e mínimo de 8 caracteres; cria admin ativo com `acesso_erp=True`, `senha_pendente=False` e permissões completas; recusa se o login já existir sem a flag; usa `normalizar_login` e o mesmo `CryptContext` (`sha256_crypt`)
- [x] T006 [P] [US1] Em `CLAUDE.md`, trocar a seção "Credenciais de desenvolvimento" por instrução de usar `scripts/criar_admin.py` em banco vazio (sem senhas no texto)

**Checkpoint**: brecha de credenciais padrão fechada.

---

## Phase 4: User Story 2 — Usuário liberado entra no ERP com a senha definida (P1)

**Goal**: senha definida pelo admin vale na hora; ERP não liga sem senha para pendentes; login de e-mail normalizado; pendência visível.

**Independent Test**: cenário 3 do [quickstart.md](./quickstart.md).

- [x] T007 [US2] Em `backend/app/api/routes/proposal_auth.py`, trocar a normalização do `login_proposal` por `normalizar_login`
- [x] T008 [P] [US2] Em `backend/app/schemas.py`, adicionar `senha_pendente: bool = False` a `UsuarioAppResponse`
- [x] T009 [US2] Em `backend/app/api/routes/configuracoes.py` `criar_usuario`: normalizar `usuario` (`normalizar_login`), recusar vazio, checar duplicidade no valor normalizado e criar com `senha_pendente=False`
- [x] T010 [US2] Em `backend/app/api/routes/configuracoes.py` `atualizar_usuario`: com `senha`, gravar hash, `senha_pendente=False` e `invalidar_convites(db, u.id)`; se o `acesso_erp` resultante for verdadeiro, `u.senha_pendente` e sem `senha`, responder 400 com a mensagem do contrato (FR-005, FR-006); recusar `ativo=False` no próprio usuário (com a revogação imediata, o admin se trancaria para fora — edge case "administrador tenta desativar o próprio acesso")
- [x] T011 [P] [US2] Em `frontend/src/types/index.ts`, adicionar `senha_pendente?: boolean` em `UsuarioApp`
- [x] T012 [US2] Em `frontend/src/pages/Configuracoes.tsx`: selo "Convite pendente" (âmbar) na coluna Status quando `u.senha_pendente`; no modal de edição de usuário pendente, aviso de que é preciso definir uma senha para ligar o ERP; em `salvar`, bloquear com toast se `editando.senha_pendente && form.acesso_erp && !form.senha`

**Checkpoint**: liberação do ERP funciona sem passar pelo Proposal.

---

## Phase 5: User Story 3 — Excluir/desativar corta o acesso de verdade (P2)

**Goal**: sessão do ERP reconferida no banco a cada ação; exclusão completa e auditada.

**Independent Test**: cenários 4, 5 e 6 do [quickstart.md](./quickstart.md).

- [x] T013 [US3] Em `backend/app/api/routes/auth.py`, criar `_usuario_erp(token, db) -> UsuarioApp` (decodifica, exige app ERP, busca por `sub`; 401 se inexistente, inativo, sem `acesso_erp` ou com `senha_pendente`) e reescrever `require_erp`, `get_current_user`, `get_current_papel` e `require_admin` para depender de `get_db` e usar o registro (papel do banco); `read_users_me` usa `_usuario_erp` e o papel do banco (R4, FR-010, FR-011)
- [x] T014 [US3] Em `backend/app/api/routes/configuracoes.py` `deletar_usuario`: apagar `UsuarioAuth` do mesmo login antes de apagar o usuário (FR-012)
- [x] T015 [US3] Em `backend/app/api/routes/configuracoes.py`, registrar auditoria (`registrar_auditoria`, entidade `UsuarioApp`) em criar, editar (campos alterados, "senha redefinida" sem valor) e excluir (FR-014, R7)

**Checkpoint**: todas as histórias funcionais.

---

## Phase 6: Polish & Cross-Cutting

- [x] T016 Rodar `python -m py_compile` nos arquivos alterados do backend e `npm run type-check` + `npm run build` em `frontend/`
- [x] T017 Smoke com `fastapi.testclient` contra o banco local (se disponível): login inexistente → 401 sem criar conta; usuário pendente + senha definida pelo admin → login 200; usuário excluído com token antigo → 401 em rota do ERP; rebaixado → 403 em rota admin
- [x] T018 Conferir com `rg` que não restam `USUARIOS_DEV`, `seed_usuarios_default` nem a senha padrão em `backend/app` e `frontend/src`

---

## Dependencies & Execution Order

- T002 bloqueia T003, T005, T007 e T009.
- US1 (T003–T006) é o MVP e pode ser implantada sozinha.
- US2 depende só de T002; T010 e T012 dependem de T008/T011.
- US3: T013 depende de T003 (mesmo arquivo); T014/T015 depois de T009/T010 (mesmo arquivo).

## Parallel Opportunities

- T004, T005 e T006 em paralelo com T003.
- T008 e T011 em paralelo.

## Implementation Strategy

1. MVP: Phase 2 + US1 → implantar já (fecha a brecha).
2. US2 → corrige o bug relatado.
3. US3 → revogação imediata e exclusão completa.
4. Polish e lembrete pós-implantação: trocar senhas de `admin`/`visualizador`.
