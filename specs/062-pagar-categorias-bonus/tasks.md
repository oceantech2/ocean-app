# Tasks: Contas a Pagar — Categoria Bônus e Catálogo Editável

**Input**: Design documents from `/specs/062-pagar-categorias-bonus/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Três histórias P1. Catálogo CRUD já existe (049); tarefas de US2/US3 são conferir e fechar gaps. Gestão só no formulário de Contas a Pagar.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar feature ativa e arquivos-alvo

- [x] T001 Confirmar feature `specs/062-pagar-categorias-bonus`, portas 8001/5193/5433 e mapear arquivos-alvo em [plan.md](./plan.md) (`categorias_contas.py`, `contas.py`, `main.py`, `Contas.tsx`, `api.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Seed no startup e cliente de catálogo — bloqueia as histórias

**⚠️ CRITICAL**: Não iniciar US1–US3 sem completar esta fase

- [x] T002 Confirmar que `seed_subcategorias_rh` é chamado no startup em `backend/app/main.py`; se ausente, ligar a chamada para ambientes já seedados receberem o rótulo novo
- [x] T003 [P] Confirmar métodos de catálogo (`atualizarCategoria`, `excluirCategoria`, `criarSubcategoriaRh`, `atualizarSubcategoriaRh`, `excluirSubcategoriaRh`) em `frontend/src/services/api.ts`; completar só se faltar algum

**Checkpoint**: Startup atualiza seed; frontend já fala com o catálogo. US1 pode começar.

---

## Phase 3: User Story 1 - Subcategoria RH "Bônus" (Priority: P1) 🎯 MVP

**Goal**: Na página Contas a Pagar, a opção `bonus` exibe **Bônus** (não Comissões nem Bônus & Comissão); **Comissão** permanece; contas existentes sem reclassificar; importação aceita os três nomes como a mesma classificação

**Independent Test**: Nova conta → RH → ver **Bônus** e **Comissão**; listagem/filtro/export da página usam **Bônus**; legado “Comissões (legado)” intacto; importar linhas Bônus / Comissões / Bônus & Comissão → mesma subcategoria; Dashboard fora da verificação

### Implementation for User Story 1

- [x] T004 [US1] Alterar `SUBCATEGORIAS_RH[SUB_BONUS]` para `"Bônus"`; incluir aliases de import `bônus`/`bonus` e manter `comissões`/`bônus & comissão` (e variantes); atualizar mensagem de `validar_classificacao` que ainda cita “bônus & comissão”; **não** alterar `LABELS_LEGADO["bonus"]` em `backend/app/services/categorias_contas.py`
- [x] T005 [US1] Em `seed_subcategorias_rh` de `backend/app/services/categorias_contas.py`, se `codigo==bonus` e `sistema` e nome ∈ {`Comissões`, `Bônus & Comissão`}, gravar `"Bônus"`; não sobrescrever nome já editado pelo admin
- [x] T006 [US1] Em `validar_classificacao` de `backend/app/services/categorias_contas.py`, quando RH e o valor não for código válido, resolver via `resolver_import_subcategoria` antes de recusar
- [x] T007 [US1] Garantir que `importar_contas_xlsx` em `backend/app/api/routes/contas.py` usa `validar_classificacao` (com o resolvedor de T006) para a subcategoria da linha
- [x] T008 [US1] No `mapear` do CSV em `frontend/src/pages/Contas.tsx`, resolver subcategoria por código, nome do catálogo (case-insensitive) e aliases (Bônus, Comissões, Bônus & Comissão) e enviar o **código** (`bonus` / `comissao`) na API
- [x] T009 [US1] Conferir seletor, filtro, coluna e exportação em `frontend/src/pages/Contas.tsx`: opção vigente `bonus` mostra **Bônus**; sem hardcode “Comissões” ou “Bônus & Comissão” para essa opção; manter `LABELS_LEGADO.bonus` = “Comissões (legado)”

**Checkpoint**: SC-001, SC-002, SC-008; FR-001–FR-003, FR-015

---

## Phase 4: User Story 2 - Editar e excluir categorias cadastradas (Priority: P1)

**Goal**: Admin edita/exclui só categorias que ele criou, no formulário; oficiais imutáveis; bloqueio com vínculos; após excluir a selecionada o seletor vai para Adm/Financeiro

**Independent Test**: Renomear cadastrada; excluir sem vínculo OK e formulário volta a Adm/Financeiro; com vínculo bloqueado; oficial sem editar/excluir; visualizador sem mutação

### Implementation for User Story 2

- [x] T010 [US2] Conferir e completar `atualizar_cadastrada` / `excluir_cadastrada` (vínculos em `ContaPagar`, oficiais intocáveis) em `backend/app/services/categorias_contas.py`
- [x] T011 [US2] Conferir `PATCH` e `DELETE /api/contas/categorias/{id}` (admin, auditoria, 404/422/409) em `backend/app/api/routes/contas.py`
- [x] T012 [US2] Em `frontend/src/pages/Contas.tsx`: Editar/Excluir só em `cadastradas`; confirmação; toasts; oficiais e visualizador sem ação; após exclusão bem-sucedida `categoria='adm_financeiro'` e `subcategoria=''`; modal permanece aberto

**Checkpoint**: SC-003, SC-005, SC-006 (parte categorias); FR-004, FR-005, FR-008–FR-012a, FR-013

---

## Phase 5: User Story 3 - Gerenciar subcategorias RH (Priority: P1)

**Goal**: Admin adiciona sub RH, edita qualquer nome e exclui só as `sistema=false`; após excluir a selecionada o campo fica vazio

**Independent Test**: Criar “Teste Sub RH” (fica selecionada); editar Salário; tentar excluir Salário/Bônus (bloqueado); excluir custom sem vínculo (some, campo vazio); com vínculo bloqueado

### Implementation for User Story 3

- [x] T013 [US3] Conferir e completar create/update/delete de subcategoria RH (PATCH qualquer nome; DELETE só `sistema=false` e sem vínculos) em `backend/app/services/categorias_contas.py`
- [x] T014 [P] [US3] Conferir `POST`/`PATCH`/`DELETE /api/contas/categorias/subcategorias-rh` (admin, erros 422/409) em `backend/app/api/routes/contas.py`
- [x] T015 [US3] Em `frontend/src/pages/Contas.tsx`: adicionar (seleciona a nova); editar qualquer; excluir só se `sistema === false`; após exclusão bem-sucedida `subcategoria=''` com RH permanece; visualizador sem mutação

**Checkpoint**: SC-004, SC-005, SC-006; FR-006, FR-007, FR-009–FR-013

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Escopo fechado e validação ponta a ponta

- [x] T016 Confirmar que `frontend/src/pages/Dashboard.tsx` e `frontend/src/pages/Bonus.tsx` **não** foram alterados nesta entrega (página Comissões e Dashboard fora de escopo)
- [x] T017 Executar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T018 Percorrer o checklist de [quickstart.md](./quickstart.md) na página Contas a Pagar (admin e visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — **bloqueia** US1–US3
- **US1 (Phase 3)**: depende da Phase 2 — MVP
- **US2 (Phase 4)**: depende da Phase 2; independente de US1
- **US3 (Phase 5)**: depende da Phase 2; independente de US1/US2 (mesmo arquivo `Contas.tsx` — sequenciar com US1/US2 se um único implementador)
- **Polish (Phase 6)**: depois das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: pode começar após Phase 2 — sem dependência de outras histórias
- **US2 (P1)**: pode começar após Phase 2 — testável sem o rótulo Bônus, mas `Contas.tsx` conflita com US1/US3
- **US3 (P1)**: pode começar após Phase 2 — idem conflito em `Contas.tsx`

### Within Each User Story

- Serviço (`categorias_contas.py`) antes de rotas (`contas.py`)
- Backend de resolução de import (T006) antes de XLSX (T007) e CSV (T008)
- Seed (T005) depois da constante de rótulo (T004)
- UI depois das APIs da mesma história

### Parallel Opportunities

- T002 e T003 em paralelo (arquivos diferentes)
- T007 (backend XLSX) e T008 (frontend CSV) em paralelo após T006
- T014 em paralelo com T013 (rotas vs serviço), se T013 não mudar a assinatura pública
- US2 e US3 em paralelo só com dois implementadores e merge cuidadoso de `Contas.tsx`

---

## Parallel Example: User Story 1

```bash
# Depois de T004–T006:
Task: "Garantir importar_contas_xlsx usa validar_classificacao em backend/app/api/routes/contas.py"
Task: "Resolver subcategoria no CSV em frontend/src/pages/Contas.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational
3. Phase 3 US1 (rótulo Bônus + import)
4. **STOP and VALIDATE** no quickstart seção 1 e 4
5. Demo na página Contas a Pagar

### Incremental Delivery

1. Setup + Foundational
2. US1 → validar rótulo e import (MVP)
3. US2 → validar editar/excluir categorias
4. US3 → validar CRUD sub RH
5. Polish → lint + quickstart completo

### Parallel Team Strategy

Com um implementador: US1 → US2 → US3 (mesmo `Contas.tsx`).  
Com dois: A faz T004–T007 (backend US1); B faz T008–T009 depois do merge do rótulo; US2/US3 em seguida.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem tarefas de teste automatizado (spec não pediu)
- CRUD de catálogo pode já estar feito — conferir e só completar gaps
- Não implementar Dashboard, Impostos, Retiradas nem ordenação por lançamento
- Commit por tarefa ou por história, se o usuário pedir
