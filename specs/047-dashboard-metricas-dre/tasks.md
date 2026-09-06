# Tasks: Dashboard — Alíquota, Lucro %, DRE Anual e Imposto por Competência

**Input**: Design documents from `/specs/047-dashboard-metricas-dre/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2 → P1 US3). Helpers em `utils/` podem ser `[P]`; alterações no mesmo arquivo → sequenciais dentro da fase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/api/routes/relatorios.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/utils/dashboardDespesas.ts`
- Contratos: `specs/047-dashboard-metricas-dre/contracts/rest-dre-mensal.md`, `ui-dashboard-metricas-dre.md`
- **Não alterar**: página Impostos, `backend/app/api/routes/impostos.py` (`de-contas`), migrations, DRL/Metas/Saldo (exceto impacto indireto do Lucro do DRE)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 047 sobre baselines 003/040/041

- [x] T001 Confirmar escopo em [plan.md](./plan.md): card Impostos + alíquota (NFs pagas ÷ Receita Bruta); % Lucro ÷ Receita Líquida; DRE eixo 12 meses; Impostos do DRE = NFs pagas; portas 5193/8001 inalteradas; sem migration; página Impostos intacta

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helpers compartilhados em `dashboardDespesas.ts` — bloqueia US1–US3

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `frontend/src/utils/dashboardDespesas.ts`, implementar `impostosDeNfsPagas(nfs, mes, ano, mesAte?)` retornando `{ valor, aliquota }` conforme [data-model.md](./data-model.md) e [research.md](./research.md) §1: Σ `valor_imposto` (null→0) de NFs `status=paga` / não excluídas com emissão no recorte; `aliquota = valor/receitaBruta*100` ou `null` se bruto ≤ 0 — receber `receitaBruta` do recorte como parâmetro (ou calcular bruto das mesmas NFs) para alinhar FR-002
- [x] T003 Em `frontend/src/utils/dashboardDespesas.ts`, alterar `lucroCard` para calcular `pct` como `valor / receitaLiquida` quando líquida > 0 (senão `null`); remover uso de Receita Bruta como denominador; ajustar assinatura se `receitaBruta` ficar morta (FR-004, FR-006, [research.md](./research.md) §4)

**Checkpoint**: Helpers testáveis isoladamente; foundation pronta para histórias

---

## Phase 3: User Story 1 - Impostos por competência das NFs pagas + alíquota sobre Receita Bruta (Priority: P1) 🎯 MVP

**Goal**: Card Impostos mostra Σ imposto das NFs pagas do recorte; alíquota sobre Receita Bruta; não usa Contas a Pagar / `de-contas`

**Independent Test**: Quickstart cenário A — mês M com NFs pagas e Contas Impostos defasadas; card = NFs; alíquota = ÷ bruto; pendentes fora

### Implementation for User Story 1

- [x] T004 [US1] Em `frontend/src/pages/Dashboard.tsx`, substituir `impostosDoRecorte(itensImpostos, …)` / carga de `impostosService.deContas` no card por `impostosDeNfsPagas` usando a lista de NFs já carregada + Receita Bruta do recorte (mesmo `mes` / `mesAte` dos KPIs) — FR-001, FR-002, FR-010
- [x] T005 [US1] Em `frontend/src/pages/Dashboard.tsx`, remover import/chamada de `impostosService` (e estado auxiliar) se ficar sem uso no Dashboard; manter `fmtAliquota` com "—" quando `aliquota === null` (FR-003)
- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx` + `frontend/src/utils/dashboardDespesas.ts`, garantir edge cases US1: visão Todos os meses (jan…mesAte); NFs pendentes excluídas; `valor_imposto` null = 0

**Checkpoint**: SC-001, SC-002; US1 testável sem depender do DRE backend

---

## Phase 4: User Story 2 - % de Lucro sobre Receita Líquida (Priority: P1)

**Goal**: Card Lucro exibe percentual sobre Receita Líquida e rótulo correto

**Independent Test**: Quickstart cenário B — % = Lucro ÷ líquida; texto "sobre Receita Líquida"

### Implementation for User Story 2

- [x] T007 [US2] Em `frontend/src/pages/Dashboard.tsx`, atualizar chamada a `lucroCard` para a nova assinatura (denominador líquida) e o texto de apoio de **"sobre Receita Bruta"** para **"sobre Receita Líquida"** (FR-004, contrato UI)
- [x] T008 [US2] Em `frontend/src/pages/Dashboard.tsx`, confirmar `fmtLucroPct` / exibição "—" quando `pct === null` (Receita Líquida zero) — FR-006

**Checkpoint**: SC-003, SC-005 parcial; US2 independente de Impostos/DRE

---

## Phase 5: User Story 3 - DRE com 12 meses e Impostos por NFs pagas (Priority: P1)

**Goal**: Eixo DRE jan–dez; Impostos mensais = NFs pagas (igual card); Lucro do DRE recalculado

**Independent Test**: Quickstart cenário C — 12 ticks no eixo; Impostos(M) DRE = card; smoke `dre-mensal`

### Implementation for User Story 3

- [x] T009 [US3] Em `backend/app/api/routes/relatorios.py`, na função `dre_mensal`, substituir Σ Contas a Pagar (categoria impostos / vencimento) por Σ `NF.valor_imposto` das NFs `status=paga`, `excluida_em IS NULL`, emissão no mês/ano; `NULL`→0; manter Despesa inalterada; `lucro = receita_bruta - despesa - impostos` — [contracts/rest-dre-mensal.md](./contracts/rest-dre-mensal.md), FR-009
- [x] T010 [US3] Em `frontend/src/pages/Dashboard.tsx`, remover truncamento de `cortarEixoDre` que faz `slice(0, MES_ATUAL)` no ano corrente — exibir os **12** pontos da API por padrão (FR-007, FR-008, [research.md](./research.md) §5); preservar estado vazio/erro do bloco DRE
- [x] T011 [US3] Em `frontend/src/pages/Dashboard.tsx`, após mapear `dre`, validar coerência: para mês concreto selecionado, `dre[M].impostos` ≈ `impostosCard.valor` (mesmo ano); ajustar labels/`impostos_pct` se ainda usarem base antiga — SC-006

**Checkpoint**: SC-004, SC-006; US3 testável; card e DRE alinhados

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Limpeza, regressão e validação rápida

- [x] T012 [P] Remover `impostosDoRecorte` de `frontend/src/utils/dashboardDespesas.ts` se não houver outros consumidores; ou documentar deprecação se ainda usado fora do Dashboard
- [x] T013 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T014 Executar checklist [quickstart.md](./quickstart.md) cenários A–D (inclui regressão página Impostos)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** → **Phase 2** → US1 / US2 / US3 (após foundation)
- **US1** (Phase 3) e **US2** (Phase 4) podem seguir em paralelo após T002/T003 (arquivos: helpers já feitos; `Dashboard.tsx` sequencial se mesma pessoa)
- **US3** (Phase 5) independente no backend (T009); no frontend depende de card estável (T004+) para SC-006
- **Phase 6** após US1–US3

### User Story Dependencies

| Story | Depende de | Entrega independente |
|-------|------------|----------------------|
| US1 | T002 | Card Impostos + alíquota |
| US2 | T003 | % Lucro + rótulo |
| US3 | T009 + T010; SC-006 após US1 | DRE 12 meses + Impostos NFs |

### Parallel Opportunities

- T009 (backend) ∥ T004–T008 (frontend) após Phase 2
- T012 ∥ T013 no polish
- T002 → T003 **sequenciais** (mesmo arquivo `dashboardDespesas.ts`)

### Parallel Example (após foundation)

```text
# Terminal A — backend US3
T009 relatorios.py dre_mensal

# Terminal B — frontend US1→US2 (sequencial no Dashboard)
T004 → T005 → T006 → T007 → T008
```

---

## Implementation Strategy

### MVP (somente User Story 1)

1. T001 → T002 → T003 (foundation)
2. T004 → T005 → T006
3. Validar quickstart cenário A

### Incremental delivery

1. MVP: card Impostos correto  
2. + US2: % Lucro sobre líquida  
3. + US3: DRE 12 meses + Impostos alinhados  
4. Polish T012–T014  

### Suggested MVP scope

**US1 apenas** (T001–T006): valor gerencial imediato no card Impostos/alíquota.

---

## Task Summary

| Métrica | Valor |
|---------|--------|
| Total de tarefas | 14 |
| US1 | 3 (T004–T006) + foundation T002 |
| US2 | 2 (T007–T008) + foundation T003 |
| US3 | 3 (T009–T011) |
| Setup / Foundation / Polish | T001; T002–T003; T012–T014 |
| Paralelo real | T009 ∥ frontend US1/US2; T012 ∥ T013 |
| Formato checklist | Todas com `- [ ]`, ID, paths |

**Próximo passo**: `/speckit-implement` (ou implementar T001 em diante).
