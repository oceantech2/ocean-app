# Tasks: Dashboard — Card NFs com Pagamento Pendente (R$)

**Input**: Design documents from `/specs/010-dashboard-nfs-pendente/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `type-check` + smoke JWT do `resumo-financeiro`

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/api/routes/relatorios.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`
- Contratos: `specs/010-dashboard-nfs-pendente/contracts/rest-resumo-financeiro.md`, `ui-dashboard-nfs-pendente.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/010-dashboard-nfs-pendente/plan.md`, `spec.md`, `research.md`, `data-model.md` e contratos em `specs/010-dashboard-nfs-pendente/contracts/` e confirmar escopo (card único com valor bruto + subtítulo de quantidade; só Dashboard; sem migration; Relatórios fora)
- [x] T002 [P] Confirmar em `frontend/src/pages/Dashboard.tsx` o 3º KPI atual (“NFs Pendentes”, `quantidade_pendentes`, cor laranja, grid `md:grid-cols-3`) e o estado inicial de `resumo`
- [x] T003 [P] Confirmar em `backend/app/api/routes/relatorios.py` o payload de `GET /resumo-financeiro` (já tem `quantidade_pendentes` e `faturamento_liquido_pendente`; falta `faturamento_bruto_pendente`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Expor `faturamento_bruto_pendente` na API — bloqueia o valor principal do card

**⚠️ CRITICAL**: Não alterar o KPI na UI antes desta fase (ou o card ficará sem dado confiável)

- [x] T004 Em `backend/app/api/routes/relatorios.py`, em `resumo_financeiro`, calcular e incluir `faturamento_bruto_pendente` como `sum(nf.valor_bruto for nf in nfs_pendentes)` no mesmo conjunto de `quantidade_pendentes`, conforme `specs/010-dashboard-nfs-pendente/contracts/rest-resumo-financeiro.md`
- [x] T005 Smoke JWT: `GET /api/relatorios/resumo-financeiro?ano=<ano>` e verificar que a resposta inclui `faturamento_bruto_pendente` (number) coerente com as NFs pendentes

**Checkpoint**: API devolve bruto pendente; clientes antigos ignoram o campo novo

---

## Phase 3: User Story 1 — Ver valor e quantidade no mesmo card (Priority: P1) 🎯 MVP

**Goal**: Substituir o KPI “NFs Pendentes” pelo card **“NFs com pagamento pendente (R$)”** com valor bruto em destaque e subtítulo `{n} NFs pendentes`

**Independent Test**: Abrir Dashboard com NFs pendentes; título correto; `fmt` do bruto; subtítulo `{n} NFs pendentes`; sem card separado só de quantidade (quickstart itens 1–5, 8)

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx`, incluir `faturamento_bruto_pendente: 0` no estado inicial de `resumo` e tratar ausência do campo no render com `?? 0` / `|| 0`
- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, no 3º KPI: título `NFs com pagamento pendente (R$)`; valor principal `fmt(resumo.faturamento_bruto_pendente ?? 0)`; subtítulo `` `${resumo.quantidade_pendentes ?? 0} NFs pendentes` ``; manter tipografia/cor laranja; remover destaque da quantidade como valor principal (`contracts/ui-dashboard-nfs-pendente.md`)
- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, garantir que a faixa permanece com exatamente 3 cards (Bruto / Líquido / Pendente R$) — sem 4º card de quantidade (FR-010)

**Checkpoint**: US1 testável — card unificado com valor + quantidade no subtítulo

---

## Phase 4: User Story 2 — Estado sem NFs pendentes (Priority: P2)

**Goal**: Sem pendências, o card permanece visível com `R$ 0,00` e `0 NFs pendentes`, sem erro ou ocultação

**Independent Test**: Ano/contexto sem NFs pendentes → zeros claros no mesmo card (quickstart item 6)

### Implementation for User Story 2

- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, validar visualmente (e ajustar se necessário) que com `faturamento_bruto_pendente === 0` e `quantidade_pendentes === 0` o card continua renderizado com `fmt(0)` e subtítulo `0 NFs pendentes`, sem mensagem de erro dedicada
- [x] T010 [US2] Confirmar que falha de carga do resumo segue o feedback existente da página e não inventa valores no card (padrão atual de `carregarDados` / toast)

**Checkpoint**: US2 testável — zeros explícitos; card sempre presente

---

## Phase 5: User Story 3 — Demais KPIs e layout da faixa (Priority: P2)

**Goal**: Bruto e Líquido intactos; ordem bruto → líquido → pendente R$; legível em desktop e mobile

**Independent Test**: Viewport larga e estreita; três KPIs legíveis na ordem correta (quickstart 5; US3 do spec)

### Implementation for User Story 3

- [x] T011 [US3] Em `frontend/src/pages/Dashboard.tsx`, confirmar que cards de Faturamento Bruto e Faturamento Líquido (título, valores, subtítulo `{n} NFs pagas`) não foram alterados
- [x] T012 [US3] Em `frontend/src/pages/Dashboard.tsx`, confirmar grid `grid-cols-1 md:grid-cols-3` e ordem Bruto → Líquido → NFs com pagamento pendente (R$); checar legibilidade em viewport estreita (empilhamento)
- [x] T013 [US3] Confirmar como `visualizador` e `admin` que o card é somente leitura (sem controles de edição) em `frontend/src/pages/Dashboard.tsx`

**Checkpoint**: US3 testável — faixa de 3 KPIs coerente e responsiva

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação end-to-end e qualidade

- [x] T014 Executar checklist de [quickstart.md](./quickstart.md) (smoke API + UI)
- [x] T015 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T016 Confirmar que `frontend/src/pages/Relatorios.tsx` não foi alterado (FR-009)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — começar imediatamente
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** o valor do card (US1+)
- **User Story 1 (Phase 3)**: Depende da Phase 2 — MVP
- **User Story 2 (Phase 4)**: Depende da US1 (mesmo card; valida zeros)
- **User Story 3 (Phase 5)**: Depende da US1 (regressão de layout/outros KPIs)
- **Polish (Phase 6)**: Depois das stories desejadas

### User Story Dependencies

- **US1 (P1)**: Após Foundational — sem dependência de outras stories
- **US2 (P2)**: Após US1 — valida estado vazio do mesmo card
- **US3 (P2)**: Após US1 — regressão de faixa; pode paralelizar com US2 após US1

### Within Each User Story

- API (Phase 2) antes do bind UI (US1)
- Card unificado (US1) antes de validar zeros (US2) e layout (US3)

### Parallel Opportunities

- T002 e T003 em paralelo (Setup)
- Após US1: T009–T010 (US2) e T011–T013 (US3) podem avançar em paralelo se houver capacidade
- T015 em paralelo com revisão de Relatórios (T016) na Phase 6

---

## Parallel Example: Setup

```bash
Task: "Confirmar 3º KPI atual em frontend/src/pages/Dashboard.tsx"
Task: "Confirmar payload resumo-financeiro em backend/app/api/routes/relatorios.py"
```

## Parallel Example: Após US1

```bash
Task: "Validar zeros no card (US2) em Dashboard.tsx"
Task: "Confirmar Bruto/Líquido intactos e grid 3 cols (US3) em Dashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: `faturamento_bruto_pendente` na API
3. Phase 3: Card unificado na Dashboard
4. **STOP and VALIDATE**: quickstart itens 1–5, 8
5. Demo se pronto

### Incremental Delivery

1. Setup + Foundational → campo na API
2. US1 → card unificado (MVP)
3. US2 → zeros explícitos
4. US3 → regressão de faixa / papéis
5. Polish → quickstart + lint/type-check

### Parallel Team Strategy

1. Time fecha Setup + Foundational juntos
2. Dev A: US1 → depois US2
3. Dev B (após US1): US3 + polish de Relatórios/lint

---

## Notes

- [P] = arquivos diferentes / sem dependência bloqueante
- Sem tasks de teste automatizado (não pedidas no spec)
- Não alterar `Relatorios.tsx` nem criar migration
- Texto de insight “Acompanhar N NFs pendentes” pode permanecer (fora do card KPI)
- Commit após cada tarefa ou grupo lógico
- Parar em qualquer checkpoint para validar a story
- Implementação 2026-08-06: smoke API OK (`faturamento_bruto_pendente` presente). `npm run lint` sem `.eslintrc` no frontend (pré-existente). `npm run type-check` com erros pré-existentes em Bonus/DH/Dashboard (labels Recharts) — nenhum introduzido por esta feature.
