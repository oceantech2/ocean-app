# Tasks: Dashboard — Cards de Metas Lado a Lado

**Input**: Design documents from `/specs/002-dashboard-metas-cards/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via quickstart.md + `npm run type-check` / `lint`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Frontend: `frontend/src/`
- Arquivo principal desta feature: `frontend/src/pages/Dashboard.tsx`
- Serviço (sem mudança de contrato): `frontend/src/services/api.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/002-dashboard-metas-cards/plan.md`, `spec.md` e `contracts/dashboard-metas-ui.md` e confirmar escopo só de layout em `frontend/src/pages/Dashboard.tsx`
- [x] T002 [P] Confirmar que `metasService` em `frontend/src/services/api.ts` já expõe `progresso(mes, ano)` e `definir(mes, ano, valor_meta)` sem necessidade de alteração

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mapear o código atual que será reorganizado — bloqueia as user stories

**⚠️ CRITICAL**: Não iniciar layout das stories antes desta fase

- [x] T003 Localizar os dois blocos JSX de meta (mensal e anual) em `frontend/src/pages/Dashboard.tsx` e anotar ordem atual, classes de card e estados `editandoMeta` / `editandoMetaAnual`
- [x] T004 Confirmar que carregamento (`loading`), `papel` via `useAuthStore`, títulos oficiais e chamadas `metasService.progresso(MES_ATUAL, ano)` / `progresso(0, ano)` em `frontend/src/pages/Dashboard.tsx` devem ser preservados (sem mudança de regra de negócio)

**Checkpoint**: Base mapeada — implementação das stories pode começar

---

## Phase 3: User Story 1 — Ver metas anual e mensal lado a lado (Priority: P1) 🎯 MVP

**Goal**: Faixa única com card anual primeiro e card mensal segundo; lado a lado ≥768px (50/50, altura alinhada); empilhados &lt;768px

**Independent Test**: Abrir Dashboard em viewport ≥768px e &lt;768px; confirmar ordem anual → mensal e layout (grid vs. stack) sem precisar editar metas

### Implementation for User Story 1

- [x] T005 [US1] Envolver os dois blocos de meta em um container `grid grid-cols-1 md:grid-cols-2 gap-4` em `frontend/src/pages/Dashboard.tsx` (breakpoint Tailwind `md` = ~768px)
- [x] T006 [US1] Reordenar o JSX em `frontend/src/pages/Dashboard.tsx` para renderizar primeiro o card anual e depois o card de faturamento do mês
- [x] T007 [US1] Aplicar classes de altura alinhada (`h-full` nos cards / stretch do grid) em `frontend/src/pages/Dashboard.tsx` para largura 50/50 com mesma altura visual em `md+`
- [x] T008 [US1] Garantir títulos oficiais intactos em `frontend/src/pages/Dashboard.tsx`: `Meta de Faturamento Anual — {ano}` e `Meta de Faturamento — {mês}/{ano}`
- [x] T009 [US1] Confirmar que a faixa de metas permanece acima dos KPI cards e que bruto/líquido/pendentes/gráficos/retiradas/saldos em `frontend/src/pages/Dashboard.tsx` não mudam de conteúdo (só espaçamento se necessário)

**Checkpoint**: US1 testável — layout e ordem corretos em desktop e mobile

---

## Phase 4: User Story 2 — Definir ou editar metas a partir dos cards (Priority: P1)

**Goal**: Edição inline por card preservada após o grid; admin edita; visualizador só lê; estados independentes

**Independent Test**: Como admin, editar meta anual e mensal inline e salvar; como visualizador, ver cards sem botões de edição

### Implementation for User Story 2

- [x] T010 [US2] Preservar formulário de edição inline do card anual (`editandoMetaAnual`, `salvarMetaAnual`, Cancelar) dentro do grid em `frontend/src/pages/Dashboard.tsx`
- [x] T011 [US2] Preservar formulário de edição inline do card mensal (`editandoMeta`, `salvarMeta`, Cancelar) dentro do grid em `frontend/src/pages/Dashboard.tsx`
- [x] T012 [US2] Manter botões Definir/Editar meta condicionados a `papel === 'admin'` nos dois cards em `frontend/src/pages/Dashboard.tsx`
- [x] T013 [US2] Garantir que abrir edição em um card não corrompe o estado do outro e que a faixa mantém altura alinhada com um ou ambos em edição em `frontend/src/pages/Dashboard.tsx`
- [x] T014 [US2] Confirmar toasts de sucesso/erro existentes (`react-hot-toast`) e recarga via `carregarDados` após salvar em `frontend/src/pages/Dashboard.tsx`

**Checkpoint**: US2 testável — CRUD visual de metas intacto no novo layout

---

## Phase 5: User Story 3 — Estado sem meta definida (Priority: P2)

**Goal**: Card permanece visível sem meta; sem barra enganosa; admin pode definir

**Independent Test**: Período sem meta (ou `tem_meta` falso); card mostra ausência; barra oculta; admin vê Definir meta

### Implementation for User Story 3

- [x] T015 [US3] Confirmar/ajustar renderização do card anual em `frontend/src/pages/Dashboard.tsx` para meta ausente: valor “—”, sem barra de progresso, botão Definir meta só para admin
- [x] T016 [US3] Confirmar/ajustar renderização do card mensal em `frontend/src/pages/Dashboard.tsx` com a mesma regra de ausência (`tem_meta` / valor inválido) sem barra falsa
- [x] T017 [US3] Validar layout misto (uma meta definida e outra não) no grid/stack em `frontend/src/pages/Dashboard.tsx` mantendo ordem anual → mensal

**Checkpoint**: Todas as user stories funcionalmente cobertas na UI

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação end-to-end

- [x] T018 Rodar `npm run type-check` e `npm run lint` em `frontend/`
- [x] T019 Executar cenários V1–V6 de `specs/002-dashboard-metas-cards/quickstart.md` (desktop, mobile, edição admin, visualizador, sem meta, regressão de números)
- [x] T020 [P] Revisar `specs/002-dashboard-metas-cards/contracts/dashboard-metas-ui.md` vs. UI final e anotar desvios se houver (sem mudar API)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as stories
- **User Story 1 (Phase 3)**: Depende do Foundational — MVP
- **User Story 2 (Phase 4)**: Depende do Foundational; na prática segue US1 no mesmo arquivo (`Dashboard.tsx`)
- **User Story 3 (Phase 5)**: Depende do Foundational; refinamentos após faixa de cards existir
- **Polish (Phase 6)**: Depende das stories desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: Após Phase 2 — sem dependência de outras stories
- **US2 (P1)**: Após Phase 2 — preserva comportamento já existente; implementada no mesmo arquivo após/com o grid da US1
- **US3 (P2)**: Após Phase 2 — estados vazios nos cards da faixa US1

### Within Each User Story

- Layout/ordem antes de polimento visual fino
- Preservar handlers e estados antes de ajustar edge cases
- Story completa e checkpoint antes da próxima prioridade quando possível

### Parallel Opportunities

- T001 e T002 podem rodar em paralelo (docs vs. leitura de `api.ts`)
- T020 pode rodar em paralelo com T018/T019 após a UI estar estável
- Demais tasks tocavam o mesmo arquivo `Dashboard.tsx` → **sequenciais** (evitar conflitos)

---

## Parallel Example: Setup

```text
Task: "T001 Revisar plan/spec/contracts da feature"
Task: "T002 Confirmar metasService em frontend/src/services/api.ts"
```

## Parallel Example: User Stories

```text
# Não paralelizar implementação US1/US2/US3 no mesmo arquivo.
# Sequência recomendada: T005→T009 (US1), depois T010→T014 (US2), depois T015→T017 (US3).
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 + Phase 2
2. Completar Phase 3 (US1): grid, ordem, altura, títulos
3. **STOP e VALIDAR**: viewports ≥768px e &lt;768px
4. Demo do layout lado a lado

### Incremental Delivery

1. Setup + Foundational → base mapeada
2. US1 → layout/ordem (MVP)
3. US2 → confirmar edição/admin/visualizador
4. US3 → estados sem meta
5. Polish → lint/type-check + quickstart V1–V6

### Parallel Team Strategy

Com um único arquivo alvo, preferir **um implementador sequencial**. Segundo contribuinte pode validar quickstart / contratos em paralelo (T019/T020).

---

## Notes

- Sem tasks de backend, migration ou novos endpoints
- Sem tasks de testes automatizados (não pedidos no spec)
- [P] só onde arquivos/leituras diferem de fato
- Commit após grupo lógico (ex.: após US1, após US2)
- Parar em qualquer checkpoint para validar a story
