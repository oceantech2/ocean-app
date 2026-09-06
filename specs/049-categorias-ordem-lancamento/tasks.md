# Tasks: Categorias Contas a Pagar, Subcategorias RH e Ordenação por Lançamento

**Input**: Design documents from `/specs/049-categorias-ordem-lancamento/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Histórias P1 (US1–US3) depois P2 (US4). Gestão de catálogo só no formulário de Contas a Pagar.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar branch e arquivos-alvo

- [x] T001 Confirmar branch `049-categorias-ordem-lancamento`, portas 8001/5193/5433 e mapear arquivos-alvo em [plan.md](./plan.md) (`categorias_contas.py`, `contas.py`, `Contas.tsx`, `NFs.tsx`, `FluxoCaixa.tsx`, `fluxoCaixaMovimentos.ts`, `api.ts`, `types/index.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipagem/catálogo compartilhado e charset de nome — bloqueia histórias

**⚠️ CRITICAL**: Não iniciar US1–US4 sem completar esta fase

- [x] T002 Permitir caractere `&` em `_char_nome_ok` / validação de nome em `backend/app/services/categorias_contas.py` (rótulo **Bônus & Comissão**, máx. 20)
- [x] T003 [P] Estender `SubcategoriaRhItem` com `id` opcional e `sistema: bool` em `backend/app/schemas.py` (e respostas CRUD conforme [contracts/rest-categorias-subcategorias.md](./contracts/rest-categorias-subcategorias.md))
- [x] T004 [P] Estender `SubcategoriaRhItem` / `CatalogoCategoriasContas` e adicionar `criado_em?: string` em `ContaPagar`, `NF` e `MovimentoFluxo` em `frontend/src/types/index.ts`

**Checkpoint**: Validação de nome e tipos prontos para rename, CRUD e sort

---

## Phase 3: User Story 1 - Subcategoria RH "Bônus & Comissão" (Priority: P1) 🎯 MVP

**Goal**: Exibir **Bônus & Comissão** no lugar de **Comissões**; manter **Comissão**; contas `bonus` sem reclassificar

**Independent Test**: Formulário RH mostra **Bônus & Comissão** e **Comissão**; listagem/filtro/export usam o novo rótulo; legado “Comissões (legado)” intacto

### Implementation for User Story 1

- [x] T005 [US1] Alterar `SUBCATEGORIAS_RH[SUB_BONUS]` para `"Bônus & Comissão"` e aliases de import (`comissões`, `bônus & comissão`, etc.) em `backend/app/services/categorias_contas.py`; **não** alterar `LABELS_LEGADO["bonus"]`
- [x] T006 [US1] Garantir que `listar_catalogo` / `label_categoria` em `backend/app/services/categorias_contas.py` expõem o novo rótulo para codigo `bonus` (e mensagem de validação RH se ainda citar “comissões”)
- [x] T007 [US1] Verificar UI em `frontend/src/pages/Contas.tsx` (seletor, filtro, coluna categoria) consumindo catálogo — sem hardcode “Comissões” para `bonus`

**Checkpoint**: SC-001, SC-002; FR-001, FR-001a, FR-002

---

## Phase 4: User Story 2 - Editar e excluir categorias cadastradas (Priority: P1)

**Goal**: Admin edita/exclui só categorias criadas por ele, no formulário; oficiais imutáveis; bloqueio com vínculos

**Independent Test**: Renomear cadastrada; excluir sem vínculo OK; com vínculo bloqueado; oficial sem editar/excluir; visualizador sem mutação

### Implementation for User Story 2

- [x] T008 [US2] Implementar `atualizar_cadastrada` e `excluir_cadastrada` (checagem de vínculos em `ContaPagar`) em `backend/app/services/categorias_contas.py`
- [x] T009 [US2] Adicionar `PATCH /api/contas/categorias/{id}` e `DELETE /api/contas/categorias/{id}` (admin, auditoria, 404/422/409) em `backend/app/api/routes/contas.py`
- [x] T010 [P] [US2] Adicionar `atualizarCategoria` e `excluirCategoria` em `frontend/src/services/api.ts`
- [x] T011 [US2] UI no formulário de `frontend/src/pages/Contas.tsx`: editar/excluir só itens de `cadastradas`; confirmação; toasts; recarregar catálogo; ocultar para visualizador e oficiais

**Checkpoint**: SC-003, SC-005, SC-007 (parte categorias); FR-003, FR-003a, FR-005–FR-008

---

## Phase 5: User Story 3 - Gerenciar subcategorias RH (Priority: P1)

**Goal**: Persistência RH; adicionar; editar qualquer nome; excluir só custom; tudo no formulário

**Independent Test**: Criar sub RH; editar Salário; falha ao excluir Salário; excluir custom sem vínculo; com vínculo bloqueado

### Implementation for User Story 3

- [x] T012 [US3] Criar model `SubcategoriaRhCadastrada` em `backend/app/models/__init__.py` (`codigo`, `nome`, `sistema`, `criado_em`, `criado_por`)
- [x] T013 [US3] `CREATE TABLE IF NOT EXISTS subcategorias_rh_cadastradas` + seed das 5 padrão (`bonus` = Bônus & Comissão, `sistema=true`) em `backend/app/main.py`
- [x] T014 [US3] Atualizar `listar_catalogo`, validação RH, create/update/delete subcategorias e unicidade de nomes em `backend/app/services/categorias_contas.py` conforme [data-model.md](./data-model.md)
- [x] T015 [US3] Endpoints POST/PATCH/DELETE `/api/contas/categorias/subcategorias-rh` (+ schemas) em `backend/app/api/routes/contas.py` e `backend/app/schemas.py`
- [x] T016 [P] [US3] Métodos `criarSubcategoriaRh`, `atualizarSubcategoriaRh`, `excluirSubcategoriaRh` em `frontend/src/services/api.ts`
- [x] T017 [US3] UI no formulário RH de `frontend/src/pages/Contas.tsx`: adicionar; editar qualquer; excluir só `sistema === false`; confirmação; toasts; recarregar catálogo/filtros

**Checkpoint**: SC-004, SC-005; FR-004, FR-004a, FR-004b, FR-005–FR-008

---

## Phase 6: User Story 4 - Ordenar por ordem de lançamento (Priority: P2)

**Goal**: Ordenação asc/desc por `criado_em` em Contas a Pagar, Contas a Receber e Fluxo de Caixa

**Independent Test**: Em cada página, asc/desc reflete inclusão; filtros preservados; empate estável

### Implementation for User Story 4

- [x] T018 [P] [US4] Incluir sort por `criado_em` (rótulo ordem de lançamento) na tabela de `frontend/src/pages/Contas.tsx`; garantir que a listagem/API expõe `criado_em`
- [x] T019 [P] [US4] Incluir sort por `criado_em` na listagem de `frontend/src/pages/NFs.tsx`; tipar/consumir `criado_em` da API
- [x] T020 [US4] Propagar `criado_em` das fontes (NF, ContaPagar, movimento manual) em `frontend/src/utils/fluxoCaixaMovimentos.ts` para `MovimentoFluxo`
- [x] T021 [US4] Cabeçalho/sort por ordem de lançamento na tabela de movimentos em `frontend/src/pages/FluxoCaixa.tsx` (desempate por id)

**Checkpoint**: SC-006, SC-007 (leitura); FR-009–FR-011

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validação ponta a ponta e limpeza

- [x] T022 Executar cenários de [quickstart.md](./quickstart.md) (admin + visualizador) nas três páginas e no formulário de Contas
- [x] T023 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T024 Revisar mensagens de erro pt-BR e ausência de hardcode “Comissões” para taxonomia nova em `backend/app/services/categorias_contas.py` e `frontend/src/pages/Contas.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: após Foundational — MVP
- **US2 (Phase 4)**: após Foundational; independente de US1 (pode seguir US1 no mesmo formulário)
- **US3 (Phase 5)**: após Foundational; ideal após US1 (mesmo rótulo no seed); independente de US2
- **US4 (Phase 6)**: após Foundational; paraleliza bem com US2/US3 (arquivos de página distintos)
- **Polish (Phase 7)**: após histórias desejadas

### User Story Dependencies

- **US1**: só Foundational
- **US2**: Foundational; UI no mesmo `Contas.tsx` que US3 — sequenciar UI se um único dev
- **US3**: Foundational; seed deve usar rótulo da US1
- **US4**: Foundational; T020 antes de T021

### Parallel Opportunities

- T003 ∥ T004 (Foundational)
- T010 ∥ T008–T009 (cliente vs serviço; T011 após API)
- T016 ∥ T012–T015 (cliente vs backend)
- T018 ∥ T019 ∥ (T020→T021) após Foundational
- T023 ∥ revisão pontual após quickstart

---

## Parallel Example: User Story 4

```bash
# Em paralelo após Foundational:
Task: "Sort criado_em em frontend/src/pages/Contas.tsx"
Task: "Sort criado_em em frontend/src/pages/NFs.tsx"
Task: "Propagar criado_em em frontend/src/utils/fluxoCaixaMovimentos.ts"
# Depois:
Task: "Sort lançamento em frontend/src/pages/FluxoCaixa.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2  
2. Phase 3 (US1) — rename visível  
3. **STOP** e validar formulário/listagem RH  

### Incremental Delivery

1. US1 → rótulo correto  
2. US2 → CRUD categorias cadastradas  
3. US3 → CRUD subcategorias RH  
4. US4 → ordenação nas três páginas  
5. Polish / quickstart  

### Parallel Team Strategy

- Dev A: US1 → US3 (taxonomia backend + Contas form)  
- Dev B: US2 (categorias) em paralelo no backend; coordenar merge em `Contas.tsx`  
- Dev C: US4 (NFs + Fluxo + Contas sort)  

---

## Notes

- Sem tarefas de teste automatizado (não pedidas na spec)
- Confirmação de exclusão: padrão do produto (`window.confirm`)
- Não criar tela dedicada de gestão de catálogo
- Total: **24 tarefas** (T001–T024)
