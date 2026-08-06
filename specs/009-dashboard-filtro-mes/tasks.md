# Tasks: Dashboard — Filtro de Mês

**Input**: Design documents from `/specs/009-dashboard-filtro-mes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run lint` / `type-check` + smoke JWT do endpoint

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/api/routes/relatorios.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`
- Contratos: `specs/009-dashboard-filtro-mes/contracts/rest-custo-por-categoria.md`, `ui-dashboard-filtro-mes.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/009-dashboard-filtro-mes/plan.md`, `spec.md`, `research.md`, `data-model.md` e contratos em `specs/009-dashboard-filtro-mes/contracts/` e confirmar escopo (filtro mês só na Dashboard; custo mês isolado via `mes_de`; sem migration; sem `useFilterStore` obrigatório)
- [x] T002 [P] Confirmar em `frontend/src/pages/Dashboard.tsx` o header atual (Ano / Comparar), `MES_ATUAL`/`ANO_ATUAL`/`MESES_NOME` e pontos que usam `MES_ATUAL` hardcoded (meta mensal, custo YTD, rótulos)
- [x] T003 [P] Confirmar assinatura atual de `custoPorCategoria` em `frontend/src/services/api.ts` e filtro `month <= mes_ate` em `backend/app/api/routes/relatorios.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extensão API `mes_de` + cliente HTTP — bloqueia indicadores de custo da US2

**⚠️ CRITICAL**: Não ligar o donut ao mês selecionado antes desta fase

- [x] T004 Em `backend/app/api/routes/relatorios.py`, adicionar query `mes_de: int = Query(1, ge=1, le=12)` em `GET /custo-por-categoria` e filtrar `mes_de <= month(data_vencimento) <= mes_ate`; validar `mes_de <= mes_ate` (422 se inválido) conforme `specs/009-dashboard-filtro-mes/contracts/rest-custo-por-categoria.md`
- [x] T005 Em `backend/app/api/routes/relatorios.py`, incluir `mes_de` na resposta JSON junto de `ano`, `mes_ate`, `total`, `categorias` (demais regras de agregação 004/008 inalteradas)
- [x] T006 Atualizar `relatoriosService.custoPorCategoria` em `frontend/src/services/api.ts` para `(ano, mesAte, mesDe = 1)` enviando `mes_de` e `mes_ate` nos params

**Checkpoint**: Endpoint e client suportam mês isolado (`mes_de === mes_ate`) e YTD legado (`mes_de` omitido/1)

---

## Phase 3: User Story 1 — Selecionar mês e ano no topo (Priority: P1) 🎯 MVP

**Goal**: Select de **Mês** no header junto ao Ano; padrão mês/ano correntes; opções limitadas no ano corrente; clamp ao trocar ano; admin e visualizador podem filtrar

**Independent Test**: Abrir Dashboard; ver Mês+Ano; no ano corrente sem meses futuros; trocar ano passado↔corrente e ver clamp; ambos papéis alteram filtros (quickstart itens 1–4, 9)

### Implementation for User Story 1

- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, adicionar estado local `mes` (padrão `MES_ATUAL`) e helpers `maxMesPermitido(ano)` / lista de meses permitidos conforme `specs/009-dashboard-filtro-mes/research.md` e `data-model.md`
- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, renderizar `<select>` de Mês (label “Mês:”, opções `MESES_NOME` filtradas) na área de filtros do header junto ao Ano, estilo alinhado aos selects existentes (`contracts/ui-dashboard-filtro-mes.md`)
- [x] T009 [US1] Em `frontend/src/pages/Dashboard.tsx`, ao mudar o Ano: manter `mes` se ainda permitido; senão setar `mes = maxMesPermitido(novoAno)`; ao mudar Mês atualizar estado; incluir `mes` nas deps do `useEffect` que chama `carregarDados`
- [x] T010 [US1] Confirmar que `visualizador` e `admin` veem/usam os selects (sem mudar regras de edição de meta) em `frontend/src/pages/Dashboard.tsx`

**Checkpoint**: US1 testável — período selecionável no topo com regras de opções/clamp

---

## Phase 4: User Story 2 — Indicadores mensais seguem o período (Priority: P1)

**Goal**: Meta mensal, custo (mês isolado) e saldos (fallback ≤ mês) respeitam o filtro; séries anuais (DRE, faturamento) só o ano; rótulos mostram mês/ano do filtro

**Independent Test**: Dois meses com dados distintos — trocar mês muda meta/custo/saldos; DRE/faturamento não colapsam (quickstart 5–8)

### Implementation for User Story 2

- [x] T011 [US2] Em `frontend/src/pages/Dashboard.tsx`, trocar `metasService.progresso(MES_ATUAL, ano)` / `definir(MES_ATUAL, …)` pelo `mes` do filtro; manter meta anual com `progresso(0, ano)` / `definir(0, ano, …)`
- [x] T012 [US2] Em `frontend/src/pages/Dashboard.tsx`, atualizar título/rótulo do card de meta mensal para `Meta de Faturamento — {MESES_NOME[mes-1]}/{ano}` (não mais só `MES_ATUAL`)
- [x] T013 [US2] Em `frontend/src/pages/Dashboard.tsx`, chamar `relatoriosService.custoPorCategoria(ano, mes, mes)` (mês isolado); para ano futuro manter estado vazio sem inventar dados; atualizar título do donut para refletir mês/ano quando fizer sentido
- [x] T014 [US2] Em `frontend/src/pages/Dashboard.tsx`, ao escolher saldo corrente/investimento: registro com maior `mes` tal que `mes <= mêsSelecionado` e `ano === anoSelecionado`; se nenhum → vazio; rótulo do card mostra mês/ano do registro exibido
- [x] T015 [US2] Em `frontend/src/pages/Dashboard.tsx`, garantir que DRE (`dreMensal(ano)` + `cortarEixoDre`) e faturamento líquido por mês (+ comparar) **não** filtram/colapsam pelo mês — só `ano` / `anoComparar` (FR-007)

**Checkpoint**: US2 testável — indicadores mensais corretos; séries anuais intactas ao mudar só o mês

---

## Phase 5: User Story 3 — Período sem dados ou inválido (Priority: P2)

**Goal**: Estados vazios/erro legíveis por bloco; filtros e resto da página usáveis; ano futuro previsível

**Independent Test**: Mês sem lançamentos + falha simulada de um bloco; página não quebra (quickstart 10)

### Implementation for User Story 3

- [x] T016 [US3] Em `frontend/src/pages/Dashboard.tsx`, manter/ajustar mensagens de ausência de dados para meta mensal, custo e saldos quando o período selecionado não tem registro (sem derrubar a página)
- [x] T017 [US3] Em `frontend/src/pages/Dashboard.tsx`, preservar `.catch` / feedback de erro por bloco (DRE, custo, etc.) ao recarregar por mudança de mês; usuário pode alterar mês/ano de novo
- [x] T018 [US3] Em `frontend/src/pages/Dashboard.tsx`, para `ano > ANO_ATUAL`: não inventar meses/dados nos indicadores mensais nem nas séries (alinhado ao comportamento já usado para DRE/custo)

**Checkpoint**: US3 testável — vazios e erros isolados por bloco

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T019 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T020 Executar checklist de [quickstart.md](./quickstart.md) (UI + smoke `mes_de`/`mes_ate` com JWT na porta 8001)
- [x] T021 Revisar diff: nenhuma outra página alterada; portas 8001/5193 intactas; sem secrets em artefatos

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** custo isolado na US2
- **US1 (Phase 3)**: Pode começar após Setup (UI do select não depende de `mes_de`); idealmente após Phase 2 se for um único fluxo
- **US2 (Phase 4)**: Depende de Phase 2 (API) + US1 (estado `mes` no topo)
- **US3 (Phase 5)**: Depende de US1 + US2 (estados vazios sobre o mesmo carregamento)
- **Polish (Phase 6)**: Após stories desejadas

### User Story Dependencies

- **US1 (P1)**: Independente após Setup — MVP de filtro no topo
- **US2 (P1)**: Requer US1 (`mes` no estado) + Foundational (`mes_de`)
- **US3 (P2)**: Requer US1/US2 para exercitar períodos vazios com o novo fluxo

### Parallel Opportunities

- T002 ∥ T003 (Setup)
- T004→T005 sequenciais no mesmo arquivo backend; T006 pode seguir T004 em paralelo no frontend após contrato acordado
- T019 ∥ preparação do smoke T020

---

## Parallel Example: Setup

```bash
Task: "T002 Confirmar Dashboard.tsx header e MES_ATUAL"
Task: "T003 Confirmar api.ts + relatorios.py mes_ate"
```

## Parallel Example: Após contrato API

```bash
Task: "T004–T005 Backend mes_de em relatorios.py"
Task: "T006 Client custoPorCategoria(ano, mesAte, mesDe) em api.ts"  # após T004 assinado
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 3 US1 (select mês + regras de opções/clamp)
3. **STOP e VALIDAR** filtro no topo
4. Em seguida Phase 2 + US2 para valor gerencial completo

### Incremental Delivery

1. Setup → US1 (filtro visível) → demo MVP UX
2. Foundational + US2 (dados corretos por mês) → demo completo
3. US3 (resiliência) → Polish / quickstart

### Suggested MVP Scope

- **MVP mínimo**: Phase 1 + Phase 3 (US1)
- **MVP útil de negócio**: + Phase 2 + Phase 4 (US2)
- **Completo**: + Phase 5 (US3) + Phase 6

---

## Notes

- Sem tasks de teste automatizado (não pedidas no spec)
- Não usar `useFilterStore` nesta feature (research.md)
- Custo: sempre `mes_de = mes_ate = mes` na Dashboard; não voltar ao YTD por engano
- Total: **21 tasks** (T001–T021)
