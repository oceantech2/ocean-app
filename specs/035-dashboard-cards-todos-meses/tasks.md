# Tasks: Dashboard — Cards com Todos os Meses

**Input**: Design documents from `/specs/035-dashboard-cards-todos-meses/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2 → P2 US3). `[P]` só quando arquivos diferentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`
- Backend: `backend/app/api/routes/relatorios.py`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar portas 5193/8001 e escopo: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`, `backend/app/api/routes/relatorios.py`; não alterar donuts, DRE, saldos, outras páginas nem `frontend/src/store/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Recorte YTD em `resumo-financeiro` (`mes_ate`) e cliente Axios — bloqueia os KPIs da US1

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/api/routes/relatorios.py`, em `resumo_financeiro`, adicionar query opcional `mes_ate` (1–12): se `mes` informado, filtrar mês exato e ignorar `mes_ate`; se `mes` omitido e `mes_ate` informado, filtrar `1 ≤ mês(data_emissao) ≤ mes_ate`; se ambos omitidos, manter o comportamento atual (sem filtro de mês), conforme [contracts/rest-resumo-financeiro.md](./contracts/rest-resumo-financeiro.md)
- [x] T003 [P] Em `frontend/src/services/api.ts`, estender `resumoFinanceiro` para aceitar `mesAte` opcional e enviar `mes_ate` nos params **somente** quando informado (não enviar `mes` vazio/`null`)

**Checkpoint**: Smoke JWT do [quickstart.md](./quickstart.md): `?ano=&mes=` ≠ `?ano=&mes_ate=` quando houver NFs em meses distintos

---

## Phase 3: User Story 1 - Ver consolidado nos cards com Todos os meses (Priority: P1) 🎯 MVP

**Goal**: Com **Todos os meses**, Faturamento Bruto, Líquido e NFs pendentes mostram o consolidado do recorte (YTD / jan–dez), sem “Selecione um mês”

**Independent Test**: Quickstart itens 1–2 e 5: dois meses com dados; **Todos os meses** = soma do recorte; texto `Jan–{mês}/{ano}`

### Implementation for User Story 1

- [x] T004 [US1] Em `frontend/src/pages/Dashboard.tsx` (`carregarDados`): se `mes === null` e `mesAteAno(ano)` não for `null`, chamar `resumoFinanceiro(ano, undefined, mesAteAno)`; se ano futuro, **não** chamar e zerar o DTO; se `mes` concreto, manter `resumoFinanceiro(ano, mes)`; nunca usar `mes=0`
- [x] T005 [US1] Em `frontend/src/pages/Dashboard.tsx`, nos três cards KPI: remover `MSG_SELECIONE_MES` quando `mes === null`; sempre exibir números (zero válido); com **Todos os meses**, texto de apoio `Jan–{MESES_NOME[mesAte-1]}/{ano}` conforme [contracts/ui-dashboard-cards-todos-meses.md](./contracts/ui-dashboard-cards-todos-meses.md); com mês concreto, subtítulos atuais sem sufixo de recorte anual

**Checkpoint**: SC-001, SC-002, SC-006; FR-001 a FR-004, FR-007, FR-011 (KPIs)

---

## Phase 4: User Story 2 - Meta mensal some; meta anual em largura total (Priority: P1)

**Goal**: Com **Todos os meses**, o card de meta mensal não aparece; a meta anual ocupa a largura total; com mês concreto, os dois voltam lado a lado

**Independent Test**: Quickstart itens 3–4: **Todos os meses** sem meta mensal e anual full-width; mês concreto restaura o par

### Implementation for User Story 2

- [x] T006 [US2] Em `frontend/src/pages/Dashboard.tsx`, se `mes === null`, **não renderizar** o card de meta mensal (nem estado vazio); continuar sem `metasService.progresso(mes)` e sem editar meta mensal nessa visão
- [x] T007 [US2] Em `frontend/src/pages/Dashboard.tsx`, na fileira de metas: `mes === null` → só o card anual em largura total (`w-full`, sem `md:grid-cols-2`); `mes` concreto → restaurar `grid grid-cols-1 md:grid-cols-2` (anual | mensal), conforme o contrato UI

**Checkpoint**: SC-004; FR-005, FR-006, FR-009

---

## Phase 5: User Story 3 - Voltar ao mês isolado sem misturar recortes (Priority: P2)

**Goal**: Alternar mês concreto ↔ **Todos os meses** e trocar o ano mostra só o último recorte; meta mensal permanece oculta enquanto `mes === null`

**Independent Test**: Quickstart itens 4 e 6: voltar ao mês isola os KPIs; trocar ano com **Todos os meses** atualiza o consolidado e mantém meta mensal oculta

### Implementation for User Story 3

- [x] T008 [US3] Em `frontend/src/pages/Dashboard.tsx`, garantir que `carregarDados` (já disparado por `[ano, mes, anoComparar]`) aplica o **último** recorte: `setResumo` só com a resposta correspondente (mês isolado vs `mes_ate`); ao mudar só o ano com `mes === null`, recalcular `mesAteAno` e manter meta mensal fora do DOM
- [x] T009 [US3] Em `frontend/src/pages/Dashboard.tsx`, conferir papéis: `admin` e `visualizador` veem os mesmos KPIs e o mesmo layout de metas; edição de meta anual só `admin`; meta mensal só com mês concreto e `admin`

**Checkpoint**: SC-003, SC-005; FR-008, FR-009

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T010 Rodar `npm run lint` e `npm run type-check` em `frontend/`; executar o checklist de [quickstart.md](./quickstart.md) (smoke `resumo-financeiro` + UI)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: imediato
- **Foundational (Phase 2)**: após T001 — **bloqueia** US1
- **US1 (Phase 3)**: após T002–T003
- **US2 (Phase 4)**: após US1 (mesmo `Dashboard.tsx`; layout no topo)
- **US3 (Phase 5)**: após US1+US2 (alternância sobre o mesmo fluxo)
- **Polish (Phase 6)**: após as histórias desejadas

### User Story Dependencies

- **US1 (P1)**: depende só da fundação (`mes_ate` + `api.ts`)
- **US2 (P1)**: mesmo arquivo que US1; fazer depois para não conflitar no JSX das metas
- **US3 (P2)**: valida/amara o fluxo já introduzido em US1/US2

### Parallel Opportunities

- T002 e T003 em paralelo (backend vs `api.ts`)
- Demais tarefas sequenciais em `Dashboard.tsx`

### Parallel Example: Foundation

```bash
Task: "mes_ate em backend/app/api/routes/relatorios.py"
Task: "resumoFinanceiro mesAte em frontend/src/services/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 → T002+T003 → T004–T005
2. **STOP**: conferir KPIs com **Todos os meses**
3. Seguir US2 (layout de metas) antes de considerar a feature completa na UI do topo

### Incremental Delivery

1. Fundação API → KPIs consolidados (MVP de dados)
2. US2 → topo sem card vazio
3. US3 → troca de filtro confiável
4. T010 → quickstart

---

## Notes

- Sem testes automatizados (spec não pediu)
- Não persistir período; não tocar donuts/DRE/saldos
- `mes=0` continua sendo só meta anual
- Commit após cada tarefa ou grupo lógico, se o usuário pedir
