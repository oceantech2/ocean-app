# Tasks: Ocultar Páginas — Configuração em Settings

**Input**: Design documents from `/specs/042-ocultar-paginas-config/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas agrupadas por história de usuário (P1 → P3). Backend + store na fase foundational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar contexto antes de codar

- [x] T001 Revisar [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-paginas-visibilidade.md](./contracts/rest-paginas-visibilidade.md) e [contracts/ui-paginas-visibilidade.md](./contracts/ui-paginas-visibilidade.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistência no servidor, API, catálogo de páginas e store — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Adicionar model `ConfiguracaoApp` (`id`, `chave` UNIQUE, `valor` TEXT) em `backend/app/models/__init__.py` conforme [data-model.md](./data-model.md)
- [x] T003 [P] Adicionar schemas `PaginasVisibilidadeResponse` e `PaginasVisibilidadeUpdate` em `backend/app/schemas.py` conforme [contracts/rest-paginas-visibilidade.md](./contracts/rest-paginas-visibilidade.md)
- [x] T004 Em `backend/app/main.py` (`_migrar`): `CREATE TABLE IF NOT EXISTS configuracao_app`; seed `paginas_visibilidade` com `dh: false` e demais `true` (`INSERT … ON CONFLICT DO NOTHING`) conforme [research.md](./research.md) §6
- [x] T005 Em `backend/app/api/routes/configuracoes.py`: helper ler/gravar/merge JSON; `GET /paginas-visibilidade` (autenticado); `PUT /paginas-visibilidade` (admin); forçar `dashboard: true`; ignorar/rejeitar `configuracoes` — [contracts/rest-paginas-visibilidade.md](./contracts/rest-paginas-visibilidade.md)
- [x] T006 Em `backend/app/api/routes/auth.py`: incluir `paginas_visibilidade` nas respostas de login (`POST /token`) e `GET /me` usando o mesmo helper de leitura
- [x] T007 [P] Criar `frontend/src/utils/paginasCatalogo.ts` com lista única (`key`, `label`, `path`, `desc`, `ocultavel`, `adminOnly?`); incluir **Patrimônio**; Dashboard `ocultavel: false`; Configurações fora da lista — [research.md](./research.md) §3
- [x] T008 Em `frontend/src/store/index.ts`: campo `paginasVisibilidade: Record<string, boolean> | null`; hidratar no `setAuth`; limpar no `logout`; setter `setPaginasVisibilidade` para após PUT
- [x] T009 [P] Em `frontend/src/services/api.ts`: `configuracoesService.obterPaginasVisibilidade()` e `atualizarPaginasVisibilidade(paginas)` apontando para `/configuracoes/paginas-visibilidade`
- [x] T010 [P] Em `frontend/src/components/Login.tsx`: passar `paginas_visibilidade` da resposta de login para `setAuth` (ou setter dedicado)

**Checkpoint**: API retorna config; login inclui `paginas_visibilidade`; store e catálogo prontos; DH oculta no seed

---

## Phase 3: User Story 1 - Administrador oculta a página DH (Priority: P1) 🎯 MVP

**Goal**: Seção em Configurações; páginas ocultas somem do menu/busca para todos; visualizador redirecionado em URL direta; admin acessa URL direta

**Independent Test**: [quickstart.md](./quickstart.md) § “estado inicial” — DH ausente no menu; `/dh` funciona para admin e redireciona visualizador

### Implementation for User Story 1

- [x] T011 [US1] Em `frontend/src/pages/Configuracoes.tsx`: card **Visibilidade de páginas** (admin-only) com toggles do catálogo; Dashboard desabilitado; botão Salvar + toast; carregar via GET ou store; PUT merge parcial — [contracts/ui-paginas-visibilidade.md](./contracts/ui-paginas-visibilidade.md)
- [x] T012 [US1] Em `frontend/src/components/Layout.tsx`: substituir array `MENU` hardcoded por `paginasCatalogo`; filtrar itens com `paginasVisibilidade[key] !== false` **antes** de papel/permissão; mesma regra na busca rápida (`FR-005`, `FR-007`)
- [x] T013 [P] [US1] Criar `frontend/src/components/PaginaVisivelGuard.tsx`: recebe `permKey`; se oculta e `papel === 'visualizador'` → `<Navigate to="/dashboard" replace />`; admin renderiza children — [research.md](./research.md) §4
- [x] T014 [US1] Em `frontend/src/App.tsx`: envolver rotas ocultáveis com `PaginaVisivelGuard` (mapear path → `permKey` via catálogo); não envolver `/dashboard`, `/configuracoes`, `/login`

**Checkpoint**: SC-001, SC-002, SC-003 (admin vs visualizador); seed DH oculta visível no comportamento

---

## Phase 4: User Story 2 - Administrador reativa uma página oculta (Priority: P2)

**Goal**: Marcar página oculta como visível restaura menu conforme permissões existentes, sem perda de dados

**Independent Test**: [quickstart.md](./quickstart.md) § “ocultar e reativar” — reativar Bônus ou DH devolve item no menu

### Implementation for User Story 2

- [x] T015 [US2] Em `frontend/src/pages/Configuracoes.tsx`: após PUT bem-sucedido, chamar `setPaginasVisibilidade` no store (sem exigir re-login) para menu refletir reativação imediata; merge PUT preserva chaves não enviadas (`FR-009`)
- [x] T016 [US2] Validar em `frontend/src/components/Layout.tsx` que item reativado reaparece para visualizador **somente** se `permissoes[key] === true` (regra pré-existente intacta)

**Checkpoint**: SC-004; cenários US2 da spec

---

## Phase 5: User Story 3 - Permissões respeitam páginas ocultas (Priority: P3)

**Goal**: Modal de visualizador não permite habilitar módulo globalmente oculto; permissão JSON preservada

**Independent Test**: [quickstart.md](./quickstart.md) § “permissões de usuário” — toggle DH desabilitado com “Oculta no sistema”

### Implementation for User Story 3

- [x] T017 [US3] Em `frontend/src/pages/Configuracoes.tsx`: no modal de usuário (`papel === 'visualizador'`), desabilitar toggles cujo `paginasVisibilidade[key] === false`; exibir indicação **Oculta no sistema**; alinhar lista `MENUS` ao catálogo (incluir `patrimonio`) — [contracts/ui-paginas-visibilidade.md](./contracts/ui-paginas-visibilidade.md)
- [x] T018 [US3] Garantir que `togglePermissao` em `frontend/src/pages/Configuracoes.tsx` não altere chaves globalmente ocultas (no-op ou disabled)

**Checkpoint**: SC-005; FR-008; US3 cenários 1–2

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Alertas suprimidos, tipos, lint e prova end-to-end

- [x] T019 Em `frontend/src/components/Layout.tsx`: filtrar array `alertas` excluindo destinos cuja `permKey` está oculta (`nfs`, `contas`, `ferias`) — `FR-012`, [research.md](./research.md) §5
- [x] T020 [P] Atualizar tipos de login/auth em `frontend/src/types/index.ts` (campo `paginas_visibilidade` opcional) se necessário para type-check
- [x] T021 Rodar `cd frontend && npm run lint && npm run type-check` e roteiro completo de [quickstart.md](./quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato
- **Foundational (Phase 2)**: depende de T001 — **bloqueia** US1–US3
- **US1 (Phase 3)**: após Phase 2 — **MVP**
- **US2 (Phase 4)**: após US1 (mesmo `Configuracoes.tsx` + `Layout.tsx`)
- **US3 (Phase 5)**: após Phase 2; modal em `Configuracoes.tsx` — sequencial após T011/T017 base
- **Polish (Phase 6)**: após histórias desejadas

### User Story Dependencies

- **US1 (P1)**: após foundation; não depende de US2/US3
- **US2 (P2)**: estende save/store de US1; testável após T011/T015
- **US3 (P3)**: usa `paginasVisibilidade` do store; independente de US2 mas compartilha `Configuracoes.tsx`

### Within Each User Story

- Backend (T002–T006) antes de frontend que consome API
- Catálogo (T007) antes de Layout/Configuracoes/App
- Store (T008) antes de Login/Configuracoes/Layout
- Guard (T013) antes de App (T014)

### Parallel Opportunities

- T002 + T003 + T007 + T009 + T010 em paralelo (arquivos distintos) após T001
- T013 (`PaginaVisivelGuard.tsx`) paralelo a T011 se T007/T008 prontos
- T020 paralelo a T019
- US3 (T017–T018) pode iniciar após T011 enquanto US2 em progresso, evitando conflito no mesmo arquivo

---

## Parallel Example: Foundational

```bash
# Backend em paralelo (devs diferentes):
T002 backend/app/models/__init__.py
T003 backend/app/schemas.py

# Frontend em paralelo (após T002–T006 backend prontos para testar API):
T007 frontend/src/utils/paginasCatalogo.ts
T009 frontend/src/services/api.ts
T010 frontend/src/components/Login.tsx
```

---

## Parallel Example: User Story 1

```bash
# Após foundation:
T011 Configuracoes.tsx (seção visibilidade)
T013 PaginaVisivelGuard.tsx   # paralelo
# Depois:
T012 Layout.tsx
T014 App.tsx                  # depende T013
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (foundation completa)
2. Phase 3 (US1)
3. **STOP and VALIDATE**: [quickstart.md](./quickstart.md) § estado inicial + ocultar manualmente
4. Deploy/demo — DH já oculta por seed

### Incremental Delivery

1. Foundation → API + store + catálogo
2. US1 → menu, guarda, seção Configurações (**MVP**)
3. US2 → reativação sem re-login
4. US3 → coerência permissões por usuário
5. Polish → alertas + lint + quickstart completo

### Parallel Team Strategy

- Dev A: T002–T006 (backend)
- Dev B: T007–T010 (catálogo + store + login)
- Após merge: Dev A → US1 Layout/Guard/App; Dev B → US1 Configuracoes
- Dev C → US3 modal após T011

---

## Notes

- Não remover rotas nem endpoints de módulos ocultos (`FR-010`)
- Não apagar `permissoes` JSON ao ocultar globalmente (`FR-009`)
- `dashboard` sempre `true` no backend mesmo se body enviar `false`
- Recarregar app ou atualizar store após PUT é suficiente (sem WebSocket)
- Total: **21 tarefas** | US1: 4 | US2: 2 | US3: 2 | Foundation: 9 | Setup: 1 | Polish: 3
