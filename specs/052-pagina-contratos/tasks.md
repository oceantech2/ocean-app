# Tasks: Página Contratos

**Input**: Design documents from `/specs/052-pagina-contratos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `npm run type-check`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Frontend: `frontend/src/pages/`, `frontend/src/utils/`, `frontend/src/components/`, `frontend/src/App.tsx`
- Backend: `backend/app/services/paginas_visibilidade.py`
- Contratos: `specs/052-pagina-contratos/contracts/ui-contratos.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar escopo e artefatos antes de editar código

- [X] T001 Revisar `specs/052-pagina-contratos/spec.md`, `plan.md`, `research.md`, `data-model.md` e `contracts/ui-contratos.md` (escopo: só atalhos Drive; chave `contratos`; sem API de contratos)
- [X] T002 [P] Confirmar padrão de registro de página em `frontend/src/utils/paginasCatalogo.ts`, `frontend/src/App.tsx` (`PAGE_COMPONENTS`), `frontend/src/components/navIcons.tsx` e defaults em `backend/app/services/paginas_visibilidade.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Registrar a página no catálogo e na visibilidade global — bloqueia menu, Configurações e rotas

**⚠️ CRITICAL**: Não implementar a UI dos atalhos antes desta fase

- [X] T003 Em `frontend/src/utils/paginasCatalogo.ts`, inserir entrada `contratos` após `patrimonio` e antes de `auditoria`: `key: 'contratos'`, `label: 'Contratos'`, `path: '/contratos'`, `desc` sobre pastas no Google Drive, `ocultavel: true`, sem `adminOnly`
- [X] T004 [P] Em `backend/app/services/paginas_visibilidade.py`, adicionar `"contratos": True` em `PAGINAS_VISIBILIDADE_DEFAULT` (merge com JSON existente via `ler_paginas_visibilidade`)

**Checkpoint**: Catálogo e defaults alinhados — Configurações/menu passam a conhecer `contratos` assim que a rota/página existirem

---

## Phase 3: User Story 1 — Abrir a página Contratos pelo menu (Priority: P1) 🎯 MVP

**Goal**: Item **Contratos** no menu; rota `/contratos` protegida; visibilidade e permissões no padrão das demais páginas

**Independent Test**: Admin vê Contratos no menu e abre a página; visualizador sem permissão não vê; Configurações lista Contratos em visibilidade e permissões; ocultar globalmente segue regra vigente

### Implementation for User Story 1

- [X] T005 [P] [US1] Criar `frontend/src/pages/Contratos.tsx` com shell mínimo (título **Contratos** + texto de apoio breve), sem CRUD, no padrão visual das demais páginas (Layout já envolve via `App.tsx`)
- [X] T006 [P] [US1] Em `frontend/src/components/navIcons.tsx`, adicionar ícone de documento/contrato para path `/contratos` em `NAV_ICONS` (estilo stroke `currentColor`, tamanho alinhado aos demais)
- [X] T007 [US1] Em `frontend/src/App.tsx`, lazy-importar `Contratos` e registrar `contratos: Contratos` em `PAGE_COMPONENTS` (rota deriva de `PAGINAS_CATALOGO` + `PaginaVisivelGuard`)

**Checkpoint**: MVP — navegação, guarda, Configurações e página shell funcionando

---

## Phase 4: User Story 2 — Acessar as duas pastas de contratos no Google Drive (Priority: P1)

**Goal**: Exatamente dois atalhos com rótulos e URLs fixos, abrindo em nova aba

**Independent Test**: Página mostra **Contratos ativos** e **Contratos arquivados**; cada link abre a URL correta em nova aba; aba Ocean permanece em `/contratos`

### Implementation for User Story 2

- [X] T008 [US2] Em `frontend/src/pages/Contratos.tsx`, renderizar exatamente dois links `<a>` conforme `contracts/ui-contratos.md`: (1) **Contratos ativos** → `https://drive.google.com/drive/u/2/folders/1pJGZNasVVx2pGdk0-mu6GA0L4x59gj9H`; (2) **Contratos arquivados** → `https://drive.google.com/drive/u/2/folders/1t8HPQgoqgyG1wWy7CjJbDoEJoayi_PJ-`; `target="_blank"` e `rel="noopener noreferrer"`
- [X] T009 [US2] Em `frontend/src/pages/Contratos.tsx`, garantir ausência de formulários, upload, listagem interna ou ações de CRUD; layout mínimo (lista/stack) compatível com dark mode

**Checkpoint**: US1 + US2 — página completa de atalhos conforme spec

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e qualidade

- [X] T010 Executar validação manual de `specs/052-pagina-contratos/quickstart.md` (menu, links, permissões, visibilidade, escopo fechado)
- [X] T011 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/` e corrigir regressões introduzidas pela feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** US1 e US2
- **User Story 1 (Phase 3)**: Depende da Phase 2
- **User Story 2 (Phase 4)**: Depende da Phase 3 (página shell em `Contratos.tsx`)
- **Polish (Phase 5)**: Depende de US1 + US2

### User Story Dependencies

- **User Story 1 (P1)**: Após Foundational — registra rota/menu/ícone/shell
- **User Story 2 (P1)**: Após US1 — completa os atalhos Drive na mesma página

### Within Each User Story

- US1: catálogo/defaults já feitos na Phase 2 → página shell + ícone (paralelo) → `App.tsx`
- US2: links e escopo fechado na página

### Parallel Opportunities

- T001 || T002 (Setup)
- T003 e T004 em paralelo (arquivos distintos) após Setup
- T005 || T006 (US1) após Phase 2; T007 após ambos
- T011 em paralelo a ajustes pontuais pós-T010, se não conflitar

---

## Parallel Example: User Story 1

```bash
# Após Phase 2, em paralelo:
Task: "Criar frontend/src/pages/Contratos.tsx (shell)"
Task: "Adicionar ícone /contratos em frontend/src/components/navIcons.tsx"

# Em seguida:
Task: "Registrar contratos em PAGE_COMPONENTS em frontend/src/App.tsx"
```

---

## Parallel Example: Foundational

```bash
Task: "Inserir contratos em frontend/src/utils/paginasCatalogo.ts"
Task: "Adicionar contratos: True em backend/app/services/paginas_visibilidade.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (catálogo + defaults)
2. Phase 3 (US1) — menu e página shell
3. **STOP e VALIDAR** menu/Configurações/guarda
4. Seguir para US2 (atalhos)

### Incremental Delivery

1. Setup + Foundational → chave `contratos` conhecida
2. US1 → navegação utilizável (MVP de entrada)
3. US2 → valor de negócio (links Drive)
4. Polish → quickstart + lint/type-check

### Parallel Team Strategy

Com dois desenvolvedores após Setup:

1. Dev A: T003 (catálogo) + US1 frontend
2. Dev B: T004 (backend defaults) + pode iniciar T006 (ícone)
3. Integrar T007; Dev A completa US2

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta
- Sem testes automatizados nesta feature (não pedidos no spec)
- Configurações já deriva de `PAGINAS_PERMISSOES` / `PAGINAS_VISIBILIDADE_UI` — não editar listas hardcoded
- Não criar endpoints REST de contratos
- Commit após cada tarefa ou grupo lógico, se solicitado pelo usuário
