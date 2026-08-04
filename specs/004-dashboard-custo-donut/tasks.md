# Tasks: Dashboard — Gráfico Donut de Custo por Categoria

**Input**: Design documents from `/specs/004-dashboard-custo-donut/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run type-check` / `lint` + smoke JWT do endpoint

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/api/routes/relatorios.py`, `backend/app/models/__init__.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`, `frontend/src/pages/Contas.tsx` (referência de labels)
- Contratos: `specs/004-dashboard-custo-donut/contracts/rest-custo-por-categoria.md`, `ui-dashboard-custo-donut.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/004-dashboard-custo-donut/plan.md`, `spec.md`, `research.md` e `contracts/rest-custo-por-categoria.md` + `contracts/ui-dashboard-custo-donut.md` e confirmar escopo (endpoint + donut abaixo do DRE half-width; sem migration; sem menu novo)
- [x] T002 [P] Confirmar em `backend/app/models/__init__.py` os campos/enums: `ContaPagar.valor` / `data_vencimento` / `centro_custo` / `pago`, e valores de `CentroCusto` (incl. `IMPOSTOS`, `RETIRADA_LUCRO`)
- [x] T003 [P] Confirmar padrão de agregação e PieChart em `backend/app/api/routes/relatorios.py` (`/dre-mensal`) e `frontend/src/pages/Relatorios.tsx` (`PieChart`/`Pie`/`Cell`) + mapa `CENTRO_LABEL` em `frontend/src/pages/Contas.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API custo-por-categoria + cliente HTTP — bloqueia todas as user stories de UI

**⚠️ CRITICAL**: Não iniciar o donut na Dashboard antes desta fase

- [x] T004 Implementar `GET /custo-por-categoria?ano=&mes_ate=` em `backend/app/api/routes/relatorios.py` retornando `{ ano, mes_ate, total, categorias[] }` com `centro_custo`, `valor`, `percentual` conforme `specs/004-dashboard-custo-donut/contracts/rest-custo-por-categoria.md` e `data-model.md`
- [x] T005 Em `backend/app/api/routes/relatorios.py`, agregar Σ `ContaPagar.valor` por `centro_custo` com `data_vencimento` não nula, ano = `ano`, mês ≤ `mes_ate`; incluir **todos** os centros (impostos e retirada de lucro); não filtrar por `pago`; omitir soma zero; ordenar por `valor` DESC; `total` = soma; `percentual` = valor/total×100
- [x] T006 Garantir auth JWT via `get_current_user` e validação 422 de `ano` / `mes_ate` (1–12) no endpoint em `backend/app/api/routes/relatorios.py`
- [x] T007 Adicionar `custoPorCategoria: (ano: number, mesAte: number) => api.get('/relatorios/custo-por-categoria', { params: { ano, mes_ate: mesAte } })` em `relatoriosService` em `frontend/src/services/api.ts`

**Checkpoint**: Endpoint e client prontos — stories de UI podem começar

---

## Phase 3: User Story 1 — Ver composição percentual do custo (Priority: P1) 🎯 MVP

**Goal**: Bloco donut abaixo do DRE; half-width no desktop / full no mobile; fatias por categoria (valor &gt; 0) ordenadas DESC; legenda com nome + %; total R$ no miolo; período YTD/ano completo

**Independent Test**: Abrir Dashboard no ano corrente com despesas em ≥2 centros; confirmar posição abaixo do DRE, layout 50/50, fatias, ordem e total no centro (quickstart V1/V2/V4)

### Implementation for User Story 1

- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, calcular `mesAte` (ano corrente → mês atual; ano passado → 12; ano futuro → não carregar / estado vazio) e chamar `relatoriosService.custoPorCategoria(ano, mesAte)` no carregamento (ex.: `Promise.all` / `.catch` dedicado)
- [x] T009 [US1] Guardar estado da resposta (`total`, `categorias`) em `frontend/src/pages/Dashboard.tsx` e mapear labels legíveis com o mesmo mapa de Contas a Pagar (`CENTRO_LABEL` / equivalente) a partir de `centro_custo`
- [x] T010 [US1] Inserir grid `grid-cols-1 md:grid-cols-2` imediatamente após o bloco DRE em `frontend/src/pages/Dashboard.tsx`: célula esquerda = bloco do donut com título claro de custo/categoria e `{ano}`; célula direita vazia nesta versão
- [x] T011 [US1] Renderizar `PieChart`/`Pie` com `innerRadius` (donut) e `Cell` por categoria em `frontend/src/pages/Dashboard.tsx`, cores estáveis por `centro_custo` conforme `specs/004-dashboard-custo-donut/research.md`
- [x] T012 [US1] Exibir `Legend` com nome + percentual e total formatado `pt-BR` no miolo do donut quando `total > 0` em `frontend/src/pages/Dashboard.tsx`
- [x] T013 [US1] Confirmar que metas, saldos, DRE e demais gráficos em `frontend/src/pages/Dashboard.tsx` não mudam de comportamento (só deslocamento vertical / faixa half-width)

**Checkpoint**: US1 testável — donut visível, ordenado e coerente com a API

---

## Phase 4: User Story 2 — Inspecionar valor e percentual (Priority: P1)

**Goal**: Tooltip (hover/toque) com nome da categoria, valor BRL e percentual sobre o mesmo total

**Independent Test**: Inspecionar fatias; conferir nome, R$ e % = valor/total (quickstart V3/V5)

### Implementation for User Story 2

- [x] T014 [US2] Configurar `Tooltip` do Recharts em `frontend/src/pages/Dashboard.tsx` mostrando nome legível, valor `pt-BR` currency e percentual (1 casa decimal)
- [x] T015 [US2] Garantir que todas as fatias usam o mesmo `total` da resposta API como base do % em `frontend/src/pages/Dashboard.tsx` (sem recalcular base divergente)
- [x] T016 [US2] Validar amostragem: comparar uma categoria do tooltip com soma manual / Contas a Pagar no período (e opcionalmente resposta do endpoint) alinhado a quickstart V5

**Checkpoint**: US2 testável — tooltip completo sobre o donut da US1

---

## Phase 5: User Story 3 — Ausência ou falha de dados (Priority: P2)

**Goal**: Bloco permanece no layout com mensagem clara em vazio/erro; sem total positivo falso; uma única categoria = 100%; resto da dashboard utilizável

**Independent Test**: Ano sem contas / ano futuro / falha isolada do endpoint; uma só categoria (quickstart V6)

### Implementation for User Story 3

- [x] T017 [US3] Tratar falha de `custoPorCategoria` em `frontend/src/pages/Dashboard.tsx` com mensagem no bloco do donut (toast opcional) sem derrubar DRE/saldos/KPIs
- [x] T018 [US3] Exibir estado vazio legível no bloco em `frontend/src/pages/Dashboard.tsx` quando `total === 0`, lista vazia ou ano futuro — sem fatias inventadas e sem total enganoso no miolo
- [x] T019 [US3] Confirmar comportamento com exatamente uma categoria (`percentual` 100%, uma fatia) em `frontend/src/pages/Dashboard.tsx`
- [x] T020 [US3] Validar `mesAte` / período: ano corrente YTD, ano anterior 12 meses, em `frontend/src/pages/Dashboard.tsx` alinhado a FR-006

**Checkpoint**: Todas as user stories cobertas na UI + API

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e qualidade

- [x] T021 Executar cenários V1–V6 de `specs/004-dashboard-custo-donut/quickstart.md` (layout, composição/ordem, tooltip, ano, amostragem API, vazio/erro)
- [x] T022 [P] Rodar `npm run type-check` e `npm run lint` em `frontend/`
- [x] T023 [P] Smoke manual `GET http://localhost:8001/api/relatorios/custo-por-categoria?ano=YYYY&mes_ate=M` com JWT e conferir ordem DESC, total e percentuais
- [x] T024 Revisar responsividade half-width / full-width e legenda em viewport estreita em `frontend/src/pages/Dashboard.tsx` (sem sobrepor o DRE)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → sem dependências
- **Phase 2 (Foundational)** → após Setup; **bloqueia** US1–US3
- **Phase 3 (US1)** → após Foundational; MVP
- **Phase 4 (US2)** → após US1 (tooltip sobre o mesmo chart)
- **Phase 5 (US3)** → após US1 (estados no mesmo bloco); pode sobrepor parcialmente US2
- **Phase 6 (Polish)** → após US1–US3 desejadas

### User Story Dependencies

- **US1 (P1)**: Após Foundational — sem dependência de outras stories
- **US2 (P1)**: Após US1 (mesmo bloco donut)
- **US3 (P2)**: Após US1 (estados vazio/erro no bloco)

### Parallel Opportunities

- T002 ∥ T003 (Setup)
- T022 ∥ T023 (Polish)
- Dentro de Foundational: T004–T006 sequenciais no mesmo arquivo `relatorios.py`; T007 pode em paralelo após contrato definido (idealmente após T004)

### Parallel Example: Setup

```bash
Task: "T002 Confirmar ContaPagar/CentroCusto em backend/app/models/__init__.py"
Task: "T003 Confirmar dre-mensal + PieChart Relatorios + CENTRO_LABEL Contas"
```

### Parallel Example: Polish

```bash
Task: "T022 npm run type-check && lint em frontend/"
Task: "T023 Smoke JWT GET /custo-por-categoria"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup  
2. Phase 2: Foundational (API + `api.ts`)  
3. Phase 3: US1 (donut + layout + total)  
4. **STOP and VALIDATE** (quickstart V1/V2/V4)  
5. Demo se pronto  

### Incremental Delivery

1. Setup + Foundational → base pronta  
2. US1 → donut de composição (MVP)  
3. US2 → tooltips ricos  
4. US3 → vazio/erro isolados  
5. Polish → quickstart completo + lint/type-check  

### Suggested MVP Scope

**US1 apenas** (T001–T013): endpoint + donut half-width com % e total no centro.

---

## Notes

- [P] = arquivos diferentes / sem dependência bloqueante
- Sem tarefas de teste automatizado (não pedidas no spec)
- Labels de categoria alinhados a Contas a Pagar; cores por `centro_custo` estáveis
- Diff vs DRE: este total **inclui** impostos como fatia
- Commit após cada task ou grupo lógico, se o usuário pedir
