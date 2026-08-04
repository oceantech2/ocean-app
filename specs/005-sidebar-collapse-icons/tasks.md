# Tasks: Barra Lateral Colapsável com Ícones

**Input**: Design documents from `/specs/005-sidebar-collapse-icons/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3, US4)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Frontend: `frontend/src/components/Layout.tsx`, `frontend/src/components/navIcons.tsx`, `frontend/src/store/index.ts`
- Contratos: `specs/005-sidebar-collapse-icons/contracts/ui-sidebar-collapse.md`
- Modelo: `specs/005-sidebar-collapse-icons/data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/005-sidebar-collapse-icons/plan.md`, `spec.md`, `research.md`, `data-model.md` e `contracts/ui-sidebar-collapse.md` e confirmar escopo (só frontend; SVG inline; sem API; sem overlay mobile)
- [x] T002 [P] Confirmar array `MENU` e markup atual da `<aside>` em `frontend/src/components/Layout.tsx` (paths, labels, notifKey, adminOnly)
- [x] T003 [P] Confirmar padrão `useUIStore` + `localStorage` (`ocean-dark`) em `frontend/src/store/index.ts` para espelhar na preferência da sidebar

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estado de UI + mapa de ícones — bloqueia todas as user stories

**⚠️ CRITICAL**: Não iniciar mudanças de UX na sidebar antes desta fase

- [x] T004 Estender `useUIStore` em `frontend/src/store/index.ts` com `sidebarCollapsed: boolean` (default `false`), `setSidebarCollapsed(collapsed: boolean)` e `toggleSidebarCollapsed()` conforme `contracts/ui-sidebar-collapse.md`
- [x] T005 [P] Criar `frontend/src/components/navIcons.tsx` com componentes SVG inline (`currentColor`, stroke) e mapa `path → Icon` cobrindo todos os paths de `MENU` em `Layout.tsx` (Dashboard, Calendário, NFs, Contas, Fluxo de Caixa, Impostos, Retiradas, Bônus, DH, Colaboradores, Férias, Patrimônio, Relatórios, Auditoria, Segurança, Configurações)

**Checkpoint**: Store e ícones prontos — stories de UI podem começar

---

## Phase 3: User Story 1 — Navegar com ícones e rótulos (Priority: P1) 🎯 MVP

**Goal**: Barra expandida exibe ícone + rótulo em cada item visível; navegação e destaque ativo preservados

**Independent Test**: Com barra expandida, cada item mostra ícone e rótulo; clique navega; permissões/filtros atuais intactos

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/components/Layout.tsx`, importar o mapa de `navIcons.tsx` e renderizar ícone + rótulo em cada item do menu no modo expandido
- [x] T007 [US1] Em `frontend/src/components/Layout.tsx`, garantir que item ativo, filtros `menuVisivel` (papel/permissão) e layout expandido (~`w-56`) continuam corretos com os ícones

**Checkpoint**: MVP — sidebar expandida com ícones utilizável

---

## Phase 4: User Story 2 — Colapsar a barra (Priority: P1)

**Goal**: Controle explícito colapsa/expande; colapsado = só ícones; clique no conteúdo colapsa; contador numérico permanece; conteúdo ganha espaço

**Independent Test**: Alternar pelo botão; clicar em `main` colapsa; barra colapsada só com ícones e badges numéricos; expandir só pelo controle

### Implementation for User Story 2

- [x] T008 [US2] Em `frontend/src/components/Layout.tsx`, conectar `sidebarCollapsed` / `toggleSidebarCollapsed` de `useUIStore` e aplicar larguras expandido (~`w-56`) vs colapsado (~`w-16`)
- [x] T009 [US2] Em `frontend/src/components/Layout.tsx`, adicionar botão de recolher/expandir na `<aside>` com `aria-expanded` e rótulos acessíveis (“Recolher menu” / “Expandir menu”)
- [x] T010 [US2] Em `frontend/src/components/Layout.tsx`, no modo colapsado ocultar rótulos de texto ao lado dos ícones e manter navegação por clique nos ícones
- [x] T011 [US2] Em `frontend/src/components/Layout.tsx`, no `<main>`, ao clicar/mousedown: se expandido → `setSidebarCollapsed(true)`; se já colapsado → no-op; cliques na aside não colapsam
- [x] T012 [US2] Em `frontend/src/components/Layout.tsx`, reposicionar badge numérico de notificação no modo colapsado (ex.: absoluto no ícone) mantendo o **mesmo contador** (não ponto)

**Checkpoint**: Colapso completo (controle + clique fora + badges) sem persistência ainda

---

## Phase 5: User Story 3 — Identificar itens colapsados (Priority: P2)

**Goal**: No modo colapsado, hover/foco revelam o nome do item; ativo permanece distinguível

**Independent Test**: Barra colapsada → tooltip/`title` e `aria-label` com o rótulo; item ativo visível

### Implementation for User Story 3

- [x] T013 [US3] Em `frontend/src/components/Layout.tsx`, no modo colapsado adicionar `title={item.label}` e `aria-label={item.label}` em cada `Link` do menu
- [x] T014 [US3] Em `frontend/src/components/Layout.tsx`, revisar estilos de item ativo no modo colapsado para permanecer distinguível (fundo/cor) sem depender do rótulo

**Checkpoint**: Modo só-ícones identificável e acessível

---

## Phase 6: User Story 4 — Preferência lembrada por usuário (Priority: P3)

**Goal**: Estado expandido/colapsado persistido por usuário logado no navegador; default expandido; sem herança entre usuários

**Independent Test**: Colapsar → F5 restaura; trocar de usuário não herda preferência; primeira visita expandida

### Implementation for User Story 4

- [x] T015 [US4] Em `frontend/src/store/index.ts`, implementar leitura/escrita de `localStorage` na chave `ocean-sidebar-collapsed:{usuario}` (`"true"`/`"false"`) nas actions `setSidebarCollapsed` / `toggleSidebarCollapsed`, e helper de hidratação por usuário (default expandido se ausente)
- [x] T016 [US4] Em `frontend/src/components/Layout.tsx`, ao montar / quando `usuario` de `useAuthStore` mudar, hidratar `sidebarCollapsed` com a preferência daquele usuário (não herdar estado do usuário anterior)

**Checkpoint**: Persistência por usuário alinhada a SC-006/SC-007 e User Story 4

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Acabamento e validação ponta a ponta

- [x] T017 [P] Em `frontend/src/components/Layout.tsx`, adicionar transição curta de largura (`transition-[width] duration-200` ou equivalente) sem quebrar layout
- [x] T018 [P] Revisar contraste dos ícones/badges em tema claro e escuro em `frontend/src/components/Layout.tsx` e `navIcons.tsx`
- [x] T019 Executar `npm run lint` e `npm run type-check` em `frontend/` e corrigir erros introduzidos pela feature
- [x] T020 Percorrer cenários de `specs/005-sidebar-collapse-icons/quickstart.md` (expandido, colapso, clique fora, tooltip, preferência por usuário, permissões)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as stories
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da US1 (ícones já no Layout) + store da Phase 2
- **US3 (Phase 5)**: Depende da US2 (modo colapsado existente)
- **US4 (Phase 6)**: Depende da US2 (estado de colapso já usado na UI)
- **Polish (Phase 7)**: Depende das stories desejadas (idealmente todas)

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — independente das demais
- **US2 (P1)**: Após US1 — adiciona colapso sobre a base com ícones
- **US3 (P2)**: Após US2 — polish de identificação no colapsado
- **US4 (P3)**: Após US2 — pode ser paralelo a US3 (arquivos: store vs Layout tooltips)

### Parallel Opportunities

- T002 e T003 em paralelo (Phase 1)
- T005 em paralelo a T004 se T004 não for pré-requisito de tipos em navIcons (arquivos distintos)
- Após US2: T013–T014 (US3) e T015–T016 (US4) podem ser paralelizados por pessoas diferentes com cuidado em `Layout.tsx` / `store`
- T017 e T018 em paralelo na Phase 7

---

## Parallel Example: Foundational

```bash
# Após T001–T003:
Task: "Estender useUIStore em frontend/src/store/index.ts"
Task: "Criar frontend/src/components/navIcons.tsx com mapa path → Icon"
```

## Parallel Example: US3 + US4 (após US2)

```bash
Task: "title/aria-label no Layout.tsx (US3)"
Task: "localStorage por usuário em store/index.ts (US4)"
# Depois integrar hidratação no Layout (T016) se US4 store já estiver pronto
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2
2. Phase 3 (US1) — ícones na barra expandida
3. **STOP e validar** no browser (porta 5193)

### Incremental Delivery

1. Setup + Foundational
2. US1 → demo MVP (ícones)
3. US2 → colapso + clique fora + badges
4. US3 → tooltips
5. US4 → persistência por usuário
6. Polish + quickstart

### Suggested MVP Scope

**US1 apenas** (ícones + rótulos expandido). Valor completo da feature pede US2 em seguida (colapso).

---

## Notes

- Sem tasks de teste automatizado (não pedidas no spec)
- Sem mudanças em `backend/`
- Não adicionar lib de ícones (`lucide`, etc.)
- Commit após cada tarefa ou grupo lógico, se solicitado pelo usuário
