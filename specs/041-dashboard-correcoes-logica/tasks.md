# Tasks: Dashboard — Correções de Lógica, DRL e Ajustes Visuais

**Input**: Design documents from `/specs/041-dashboard-correcoes-logica/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2 → P1 US3 → P2 US4). Helpers em `utils/` podem ser `[P]`; alterações em `Dashboard.tsx` → sequencial dentro da história quando no mesmo arquivo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/utils/dashboardDespesas.ts`, `frontend/src/utils/dashboardSaldo.ts` (novo)
- Contrato UI: `specs/041-dashboard-correcoes-logica/contracts/ui-dashboard-correcoes-logica.md`
- **Não alterar**: schema/migration, backend, outras páginas

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 041 sobre baseline 040

- [x] T001 Confirmar escopo: correções em `Dashboard.tsx` + utils; dependência de seções/cards da `040` e nomenclatura `039`; portas 5193/8001 inalteradas; sem endpoints/migrations novos conforme [plan.md](./plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helpers de saldo por conta e auditoria de despesas — bloqueia US1–US4

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Criar `frontend/src/utils/dashboardSaldo.ts` com tipo `RecorteSaldo` (`ano`, `mes: number | null`, `mesAte?`) e função `saldoCorrenteDashboard(conta, saldos, nfs, contasPagas, manuais, padrao, recorte)` conforme [research.md](./research.md) §2 e [data-model.md](./data-model.md): `saldo_base + Σ NF.valor_bruto − Σ (bruto − líquido) − Σ despesas pagas operacionais` (excluir impostos e pendentes; filtrar movimentos no recorte)
- [x] T003 [P] Auditar `frontend/src/utils/dashboardDespesas.ts`: garantir que `naturezaDespesa` / `EXCLUIDAS` tratam `impostos` case-insensitive; documentar aliases se necessário; preparar extensão para uso em `saldoCorrenteDashboard` (import de `naturezaDespesa`)

**Checkpoint**: Helper de saldo testável isoladamente; mapa de despesas consistente

---

## Phase 3: User Story 1 - Ler metas e saldos com valores e percentuais corretos (Priority: P1) 🎯 MVP

**Goal**: Meta anual com % na barra (Receita Líquida acumulada); saldo por conta corrente via movimentos alocados

**Independent Test**: Meta anual com % visível na barra (≥18%); slots CC com valores distintos quando movimentos diferem; investimento inalterado; conferência manual da fórmula FR-002

### Implementation for User Story 1

- [x] T004 [US1] Em `frontend/src/pages/Dashboard.tsx`, corrigir **Meta de Receita Anual**: `realizadoAnual = Σ faturamentoLiquidoMes(ano).valor` (meses 1..limite recorte); `pctAnual = min(realizado/meta×100, 100)`; exibir `{pct}%` dentro da barra quando `pct >= 18` (igual meta mensal); valor à esquerda = realizado formatado (FR-001, SC-001)
- [x] T005 [US1] Em `frontend/src/pages/Dashboard.tsx`, substituir `saldoVisivel` nos slots CC 1–3 por `saldoCorrenteDashboard` importado de `frontend/src/utils/dashboardSaldo.ts`; manter rótulos/nome/fallback; passar recorte alinhado ao filtro mês/ano (`mes`, `mesAteAno`)
- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx` + `frontend/src/utils/dashboardSaldo.ts`, tratar edge cases FR-002: saldo base 0 sem registro; valores negativos formatados; slot sem conta → "—"; despesas pendentes não entram no cálculo

**Checkpoint**: SC-001, SC-002 parcial; US1 testável via quickstart §2 e §4

---

## Phase 4: User Story 2 - Confiar nos totais de Despesa sem impostos (Priority: P1)

**Goal**: Nenhum campo/gráfico de Despesa inclui impostos

**Independent Test**: Com contas `impostos` pagas/pendentes no recorte, cards Fixas/Variáveis/Pendentes e donuts não somam impostos (quickstart §3)

### Implementation for User Story 2

- [x] T007 [US2] Em `frontend/src/utils/dashboardDespesas.ts`, reforçar `totaisDespesa`: normalizar categoria (`trim().toLowerCase()`); garantir exclusão de `impostos` e aliases legados (`IMPOSTOS`) em fixas, variáveis e pendentes (FR-004)
- [x] T008 [US2] Em `frontend/src/utils/dashboardDespesas.ts`, reforçar `filtrarCustoSemImpostos`: filtrar por `categoria` e `centro_custo` case-insensitive; recalcular `total` e `percentual` (FR-005)
- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, confirmar que cards Despesa usam `totaisDespesa` e donuts usam `filtrarCustoSemImpostos` antes de `mapCustoResposta`; remover qualquer caminho que reintroduza impostos

**Checkpoint**: SC-003; US2 testável independentemente dos ajustes DRL/cores

---

## Phase 5: User Story 3 - Analisar DRL como série histórica contínua (Priority: P1)

**Goal**: DRL linha única jan/2024→mês atual; só meses com valor > 0; eixo Mês/Ano; independente do filtro ano

**Independent Test**: DRL mostra Jan/24… com pontos apenas onde há receita líquida; sem linha comparativa; filtro ano no Head não restringe DRL (quickstart §5)

### Implementation for User Story 3

- [x] T010 [US3] Em `frontend/src/pages/Dashboard.tsx`, remover estado/uso de `mostrarAnterior`, `anoComparar` e request `faturamentoLiquidoMes(anoComparar)` do fluxo de dados do DRL; eliminar `<Line dataKey="valorAnterior" />`
- [x] T011 [US3] Em `frontend/src/pages/Dashboard.tsx`, buscar `faturamentoLiquidoMes(y)` em paralelo para `y = 2024 .. ANO_ATUAL`; montar array flat `{ mesLabel: 'Jan/24', valor, ano, mes }` apenas onde `valor > 0` e `≤ mês corrente`; ordenar cronologicamente (FR-006, FR-007)
- [x] T012 [US3] Em `frontend/src/pages/Dashboard.tsx`, atualizar gráfico DRL: `LineChart` com uma `<Line dataKey="valor" name="Receita Líquida" />`; eixo X `dataKey="mesLabel"`; considerar `overflow-x-auto` se muitos pontos (SC-004)

**Checkpoint**: SC-004; US3 testável; FR-006/FR-007 atendidos

---

## Phase 6: User Story 4 - Cabeçalho simplificado e cores de Saldo padronizadas (Priority: P2)

**Goal**: Head só Mês/Ano; correntes verde; investimento azul

**Independent Test**: Sem checkbox Comparar; inspeção visual verde CC / azul investimento (quickstart §1, §4)

### Implementation for User Story 4

- [x] T013 [US4] Em `frontend/src/pages/Dashboard.tsx`, remover do cabeçalho checkbox "Comparar", `<select anoComparar>` e labels associados; limpar imports/estado morto restante (FR-008, SC-005)
- [x] T014 [US4] Em `frontend/src/pages/Dashboard.tsx`, seção Saldo: aplicar esquema **verde** nos 3 cards CC e **azul** no card Conta Investimento (inverter classes atuais conforme [contracts/ui-dashboard-correcoes-logica.md](./contracts/ui-dashboard-correcoes-logica.md)) (FR-009, FR-010, SC-006)

**Checkpoint**: SC-005, SC-006; US4 testável

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T015 Revisar edge cases em `frontend/src/pages/Dashboard.tsx` e utils conforme [spec.md](./spec.md) (meta barra estreita, DRL meses omitidos, FR-011 recorte KPIs vs DRL fixo)
- [x] T016 Rodar `npm run lint` e `npm run type-check` em `frontend/`; executar checklist completo de [quickstart.md](./quickstart.md) (admin; opcional visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** US1–US4
- **US1 (Phase 3)**: Após T002 — MVP meta + saldo
- **US2 (Phase 4)**: Após T003; **paralelo** a US1/US3 (arquivos distintos ou auditoria em `dashboardDespesas.ts`)
- **US3 (Phase 5)**: Após Phase 2; pode paralelizar com US2; T010–T012 sequenciais em `Dashboard.tsx`
- **US4 (Phase 6)**: Após US3 recomendado (T013 limpa head após remoção comparar no DRL); T014 independente de US3
- **Polish (Phase 7)**: Após histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Depende T002 — meta anual + saldo por conta
- **US2 (P1)**: Depende T003 — reforço impostos; independente de US1 para teste (cards já existem da 040)
- **US3 (P1)**: Depende Phase 2 — DRL; T010 deve preceder T011/T012
- **US4 (P2)**: T014 independente; T013 ideal após US3 (mesmo arquivo, menos conflito)

### Parallel Opportunities

- **T002** e **T003** em paralelo (arquivos diferentes)
- **US2** (T007–T009) em paralelo com **US1** (T004–T006) após Phase 2 — cuidado com merge em `Dashboard.tsx` na T009 vs T004–T006
- **T014** (cores) pode rodar em paralelo com **T011–T012** se em branches distintas; no mesmo arquivo, sequenciar

### Within Dashboard.tsx (sequência sugerida)

1. T004 (meta anual)
2. T005–T006 (saldo)
3. T010–T012 (DRL)
4. T013 (head)
5. T014 (cores)
6. T009 (auditoria wiring despesas — pode ser antes de T010 se preferir)

---

## Parallel Example: User Story 2 + User Story 1

```bash
# Após Phase 2, em paralelo (devs ou ordem cuidadosa):
Task T004–T006: meta anual + saldo em Dashboard.tsx
Task T007–T008: reforço impostos em dashboardDespesas.ts

# Depois merge + T009 confirma wiring no Dashboard
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2
2. Phase 3 (US1): meta anual % + saldo por conta
3. **STOP and VALIDATE** quickstart §2 e §4
4. Seguir US2 → US3 → US4

### Incremental Delivery

1. Foundation → US1 (MVP financeiro: metas + saldos corretos)
2. US2 (confiança em despesas)
3. US3 (DRL histórico)
4. US4 (UX head + cores)
5. Polish

### Parallel Team Strategy

- Dev A: T002 + US1 (saldo/meta)
- Dev B: T003 + US2 (despesas)
- Dev C: US3 (DRL) após T002 merge base
- US4 + Polish: qualquer dev após US3 ou em paralelo T014

---

## Notes

- Baseline 040 deve estar presente na branch (seções, cards, `dashboardDespesas.ts`)
- DRL: tipicamente 2–3 requests `faturamentoLiquidoMes` (2024–2026)
- Impostos por conta no saldo: derivar de NF (`valor_bruto − valor_liquido`), não de contas categoria impostos
- Commit sugerido por fase ou por história de usuário
