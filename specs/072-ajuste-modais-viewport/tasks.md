# Tasks: Ajuste de Modais no Viewport

**Input**: Design documents from `/specs/072-ajuste-modais-viewport/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → fundação (`Modal.tsx`) → US1 (margem) → US2 (miolo rolável + chrome fixo) → US3 (consistência restante) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Shell: `frontend/src/components/Modal.tsx` (novo)
- Consumidores: páginas e componentes listados em [contracts/ui-modais-viewport.md](./contracts/ui-modais-viewport.md)
- **Não alterar**: backend, `frontend/src/services/api.ts`, handlers/validações de formulário, dropdowns/notificações
- Fora do escopo: `window.confirm` / `alert`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-modais-viewport.md](./contracts/ui-modais-viewport.md): margem ≥24px; header/footer fixos; miolo rolável; lista de consumidores; portas 5193/8001 inalteradas; sem lib de dialog externa

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shell reutilizável que implementa o contrato de layout (bloqueia todas as USs)

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Criar `frontend/src/components/Modal.tsx` com backdrop `fixed inset-0` + padding ≥`p-6` (24px), painel `max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden`, props `header`/`titulo`, `children` (body `flex-1 min-h-0 overflow-y-auto`), `footer`, `maxWidth` (default `max-w-md`), `onBackdropClick` opcional — visual alinhado ao padrão atual (`rounded-xl shadow-2xl bg-white dark:bg-gray-800 bg-black/50`)
- [x] T003 Em `frontend/src/components/Modal.tsx`, garantir que header e footer usam `shrink-0` e que o body é a única região com scroll ([data-model.md](./data-model.md); FR-001/FR-002/FR-007)

**Checkpoint**: `Modal` importável e pronto para migração; layout do contrato UI atendido no shell

---

## Phase 3: User Story 1 - Modal com margem confortável na tela (Priority: P1) 🎯 MVP

**Goal**: Modais migradas exibem margem ≥ ~24px em cima/baixo e não colam/cortam nas bordas

**Independent Test**: Abrir modal curta/média (ex.: Férias ou Import CSV) em altura de notebook; gap visível ≥24px no topo e na base; painel não cortado

### Implementation for User Story 1

- [x] T004 [P] [US1] Migrar overlay em `frontend/src/pages/Ferias.tsx` para `Modal` (separar título → header, campos → children, ações → footer); preservar handlers
- [x] T005 [P] [US1] Migrar `frontend/src/components/ImportCSV.tsx` para `Modal` com header/body/footer; remover `max-h-[90vh] overflow-y-auto` do painel inteiro
- [x] T006 [P] [US1] Migrar overlay(s) em `frontend/src/pages/DH.tsx` para `Modal`; preservar comportamento existente
- [x] T007 [US1] Validar visualmente T004–T006: margem ≥24px e centralização em conteúdo curto (sem scroll desnecessário no miolo)

**Checkpoint**: US1 testável — margem confortável nas modais migradas desta fase

---

## Phase 4: User Story 2 - Modal com conteúdo longo permanece usável (Priority: P1)

**Goal**: Em formulários densos, só o miolo rola; título e ações permanecem visíveis

**Independent Test**: Abrir Nova conta a pagar / receber com janela baixa ou zoom alto; rolar campos até o fim; título e Cancelar/Salvar (e +1 se houver) ficam fixos no painel

### Implementation for User Story 2

- [x] T008 [P] [US2] Migrar modal(is) principal(is) de `frontend/src/pages/Contas.tsx` (CRUD / datas em massa / categoria se usarem o padrão) para `Modal` com header/body/footer explícitos; **não** alterar lógica de salvar/+1/validações
- [x] T009 [P] [US2] Migrar modal(is) de `frontend/src/pages/NFs.tsx` para `Modal` com regiões distintas; preservar criação/edição/+1
- [x] T010 [P] [US2] Migrar modal(is) de `frontend/src/pages/Fornecedores.tsx` para `Modal` (incluir overlays do padrão `bg-black/50`; excluir só se for dropdown/overlay menor fora do contrato)
- [x] T011 [P] [US2] Migrar modal em `frontend/src/pages/Patrimonio.tsx` para `Modal` com chrome fixo
- [x] T012 [US2] Validar Contas e NFs: miolo rola; header/footer fixos; abrir/fechar/salvar inalterados

**Checkpoint**: US2 coberta nas modais longas críticas

---

## Phase 5: User Story 3 - Consistência visual entre páginas (Priority: P2)

**Goal**: Todas as demais modais do padrão compartilham o mesmo enquadramento

**Independent Test**: Amostrar ≥5 páginas/componentes do contrato; todas com margem e (quando aplicável) chrome fixo; sem regressão óbvia nas que já estavam ok

### Implementation for User Story 3

- [x] T013 [P] [US3] Migrar modal(is) de `frontend/src/pages/FluxoCaixa.tsx` para `Modal`
- [x] T014 [P] [US3] Migrar modal(is) de `frontend/src/pages/Configuracoes.tsx` para `Modal`
- [x] T015 [P] [US3] Migrar `frontend/src/components/DocumentosModal.tsx` para `Modal` (header/lista/footer; sem overflow no painel inteiro)
- [x] T016 [P] [US3] Migrar `frontend/src/components/GerenciadorArquivos.tsx` para `Modal` (já tem `p-4` — alinhar a `p-6`/contrato via shell)
- [x] T017 [US3] Em `frontend/src/components/Layout.tsx`, migrar busca global para `Modal` **ou** documentar exceção top-anchored no contrato mantendo margem ≥24px + max-height + scroll no miolo ([research.md](./research.md) §4)
- [x] T018 [US3] Grep em `frontend/src` por `fixed inset-0 bg-black` e eliminar restantes do padrão (exceto exceção documentada e overlays fora de escopo)

**Checkpoint**: FR-003 atendido; amostra ≥5 páginas consistente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação manual e higiene de código

- [x] T019 Executar smokes de [quickstart.md](./quickstart.md) (margem, miolo longo, consistência ≥5, sem regressão funcional)
- [x] T020 Rodar `npm run lint` e `npm run type-check` em `frontend/` e corrigir regressões desta feature
- [x] T021 Revisar que nenhum endpoint/backend foi alterado e que dropdowns/notificações/`confirm` permanecem fora do escopo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → **Phase 3 (US1 MVP)** → **Phase 4 (US2)** → **Phase 5 (US3)** → **Phase 6**
- US2 e US3 dependem do shell (T002–T003); US3 completa a cobertura após US1/US2

### User Story Dependencies

- **US1**: Após fundação; prova margem (MVP)
- **US2**: Após fundação (pode paralelizar arquivos com US1 se o shell existir); foca formulários longos
- **US3**: Após US1/US2 preferencialmente (mesmos padrões de migração); fecha inventário

### Within Each Story

- Migrar arquivo → validar comportamento do arquivo → seguir
- Não mudar handlers além do wrapping no `Modal`

### Parallel Opportunities

```text
Após T002–T003:
  US1: T004 ∥ T005 ∥ T006  → depois T007
  US2: T008 ∥ T009 ∥ T010 ∥ T011  → depois T012
  US3: T013 ∥ T014 ∥ T015 ∥ T016  → T017 → T018
```

---

## Parallel Example: User Story 1

```bash
# Após Modal.tsx pronto, em paralelo:
Task: "Migrar frontend/src/pages/Ferias.tsx para Modal"
Task: "Migrar frontend/src/components/ImportCSV.tsx para Modal"
Task: "Migrar frontend/src/pages/DH.tsx para Modal"
# Depois validação visual T007
```

---

## Parallel Example: User Story 2

```bash
Task: "Migrar Contas.tsx para Modal"
Task: "Migrar NFs.tsx para Modal"
Task: "Migrar Fornecedores.tsx para Modal"
Task: "Migrar Patrimonio.tsx para Modal"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (`Modal.tsx`)
2. Phase 3: migrar Férias / ImportCSV / DH
3. **STOP and VALIDATE**: margem ≥24px (quickstart smoke curto)
4. Seguir para US2 (Contas/NFs) — maior valor perceptível em formulários densos

### Incremental Delivery

1. Shell → MVP margem (US1)
2. Formulários longos (US2)
3. Resto do inventário (US3)
4. Polish / lint / quickstart completo

### Parallel Team Strategy

1. Dev A: shell (Phase 2)
2. Após shell: Dev A US1+parte US2; Dev B Contas/NFs; Dev C demais arquivos US3

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Spec não pediu testes automatizados — validação manual no quickstart
- Evitar `overflow-y-auto` no painel inteiro quando houver header/footer
- Commit por tarefa ou por grupo lógico (shell; depois lote de migrações)
