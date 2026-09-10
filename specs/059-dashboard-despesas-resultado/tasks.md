# Tasks: Despesas & Resultado no Dashboard

**Input**: Design documents from `/specs/059-dashboard-despesas-resultado/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundation (reescrita `totaisDespesa` + helpers Resultado) → US1–US3 (P1) → US4 (P2) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/utils/dashboardDespesas.ts`, `frontend/src/pages/Dashboard.tsx`, `frontend/src/utils/metaPeriodo.ts`, `frontend/src/utils/pipelineReceita.ts`, `frontend/src/utils/receitaAbas.ts`
- Contratos: `specs/059-dashboard-despesas-resultado/contracts/`
- **Não alterar**: Centro de Despesa; Demonstrativo de Resultado; Aging / Alerta (08–09); backend Contas a Pagar / `custo-por-categoria` / DRE (permanecem divergentes de propósito)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 059

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): Dashboard; agregação client em `dashboardDespesas.ts`; receita via Pipeline + Por Caixa; Centro/Demonstrativo intocados; excluir imposto; ignorar flag `pago`; Resultado = valor + %; portas 5193/8001; sem migration; sem endpoint novo; sem 08–09

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Regras canônicas de despesa e helpers de Resultado — bloqueia US1–US4

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `frontend/src/utils/dashboardDespesas.ts`, atualizar `ContaParaDespesa` para incluir `tipo_despesa` e `data_pagamento` (manter `categoria` / `valor` / `data_vencimento`; **não** usar `pago` nos cards canônicos) — [contracts/calc-despesas-resultado.md](./contracts/calc-despesas-resultado.md), [data-model.md](./data-model.md)
- [x] T003 Em `frontend/src/utils/dashboardDespesas.ts`, reescrever `totaisDespesa` conforme contrato: Fixas = tipo `fixo` + `data_pagamento` no recorte; Variáveis = tipo `variavel` (default se ausente) + `data_pagamento` no recorte; Pendentes = `data_vencimento` no recorte + `data_pagamento` vazio; excluir imposto via `categoriaEhImpostos`; **remover** classificação legada por sets de categoria FIXAS/VARIAVEIS e filtro de pagas por vencimento — FR-002–FR-004, FR-012–FR-013, FR-020
- [x] T004 [P] Em `frontend/src/utils/dashboardDespesas.ts`, adicionar `calcularResultado(receita, despesasTotais)` retornando `{ valor, pct }` com `valor = receita − despesasTotais`, `pct = null` se `receita <= 0`, senão `(valor / receita) * 100`; documentar que `despesasTotais` = fixas + variáveis (sem pendentes) — FR-007–FR-011, [contracts/calc-despesas-resultado.md](./contracts/calc-despesas-resultado.md)

**Checkpoint**: Util alinhado ao contrato de cálculo; foundation liberada para UI

---

## Phase 3: User Story 1 - Ler Despesas Fixas, Variáveis e Pendentes (Priority: P1) 🎯 MVP

**Goal**: Três cards de despesa no Dashboard com regras tipo + datas; imunes ao toggle

**Independent Test**: Quickstart §1–§2 — totais batem com fixture; imposto fora; inconsistência pago só em Pendentes; toggle não altera despesas

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/pages/Dashboard.tsx`, garantir que `setDespesasTotais(totaisDespesa(...))` no `carregarDados` passa a lista completa de Contas a Pagar (incl. `tipo_despesa` / `data_pagamento`) e o recorte `ano`/`mes` (só-ano = `mes: null` cobrindo o ano) — FR-001, FR-014
- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx`, atualizar rótulos auxiliares dos três cards (Fixas / Variáveis / Pendentes) para refletir “pagas no período” (pagamento) e “vencimento no período sem pagamento”; manter formatação `fmt` — [contracts/ui-dashboard-despesas-resultado.md](./contracts/ui-dashboard-despesas-resultado.md), FR-005
- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, confirmar que alternar `visaoReceita` **não** recalcula nem altera os três totais de despesa exibidos — FR-005, SC-002

**Checkpoint**: MVP de Despesas — SC-001 / SC-001a / SC-001b / SC-002

---

## Phase 4: User Story 2 - Ler Resultado Competência e Resultado Caixa (Priority: P1)

**Goal**: Dois cards lado a lado (valor + %) substituindo o Lucro canônico; receita via toggle

**Independent Test**: Quickstart §3 — dois cards; fórmulas; %; toggle muda só receita/resultado

### Implementation for User Story 2

- [x] T008 [US2] Em `frontend/src/pages/Dashboard.tsx`, calcular `receitaComp` = `valorPorVisao(pipeline.fechado…)` e `receitaCaixaValor` = `valorPorVisao(receitaCaixa.recebido…)` com `visaoReceita`; `despesasTotaisResultado = fixas + variaveis`; chamar `calcularResultado` para Competência e Caixa — FR-007–FR-011, [contracts/calc-despesas-resultado.md](./contracts/calc-despesas-resultado.md)
- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, substituir o card único **Lucro** por dois cards lado a lado **Resultado Competência** e **Resultado Caixa**, cada um só com valor + percentual (omitir % se `pct === null`); estilo de prejuízo para valor negativo — FR-006, FR-016, [contracts/ui-dashboard-despesas-resultado.md](./contracts/ui-dashboard-despesas-resultado.md)
- [x] T010 [US2] Em `frontend/src/pages/Dashboard.tsx`, remover uso canônico de `lucroCard` neste bloco (import/chamada) se não for mais necessário; manter loading/erro/vazio (R$ 0,00; “—” para %) conforme contrato UI — FR-009, SC-007

**Checkpoint**: SC-003 / SC-004 / SC-007

---

## Phase 5: User Story 3 - Coerência com toggle, período e abas (Priority: P1)

**Goal**: Mesmo período/base que Por Caixa / Por Competência; Pendentes fora da fórmula

**Independent Test**: Quickstart §4–§5 — cruzar com abas (± R$ 0,01); mudar mês/só-ano

### Implementation for User Story 3

- [x] T011 [US3] Em `frontend/src/pages/Dashboard.tsx`, garantir que mudança de `mes`/`ano` (incl. só-ano) refaz `totaisDespesa` e Resultados no mesmo `carregarDados` que Pipeline/Caixa — FR-014, SC-006
- [x] T012 [US3] Em `frontend/src/pages/Dashboard.tsx`, ao alternar toggle, Resultados recalculam na nova base sem refetch de despesas; Pendentes **não** entram em `despesasTotaisResultado` — FR-010, FR-011, FR-015, SC-005
- [x] T013 [US3] Validar mentalmente/na UI que receita implícita dos Resultados coincide com Total Fechado (aba Competência) e Recebido (aba Caixa) na mesma `visaoReceita` — FR-015, SC-005

**Checkpoint**: Coerência cross-seção ok

---

## Phase 6: User Story 4 - Substituir leitura legada (Priority: P2)

**Goal**: Cards canônicos seguem tipo + data de pagamento; Lucro legado fora; legado por categoria morto neste bloco

**Independent Test**: Quickstart §1 item tipo vs categoria + §3 item sem Lucro; Centro/Demonstrativo intocados (§7)

### Implementation for User Story 4

- [x] T014 [US4] Em `frontend/src/utils/dashboardDespesas.ts`, remover ou isolar código morto dos sets FIXAS/VARIAVEIS usados só pelos cards canônicos (não reativar heurística por categoria); manter `categoriaEhImpostos` / `filtrarCustoSemImpostos` para Centro (inalterado) — FR-012, FR-019
- [x] T015 [US4] Em `frontend/src/pages/Dashboard.tsx`, checklist visual: sem card Lucro canônico; Fixas/Variáveis/Pendentes + dois Resultados presentes; **não** editar seções Centro de Despesa nem Demonstrativo de Resultado — FR-016, FR-019, SC-007

**Checkpoint**: US4 + FR-019 respeitado

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e aceite

- [x] T016 Confirmar `admin` e `visualizador` veem os mesmos totais (somente leitura) — FR-017, SC-008
- [x] T017 [P] Rodar `cd frontend && npm run lint && npm run type-check`
- [x] T018 Executar validação manual de [quickstart.md](./quickstart.md) (incl. divergência esperada Centro/Demonstrativo)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as US
- **US1 (Phase 3)**: Após Foundation — MVP
- **US2 (Phase 4)**: Após Foundation; na prática após US1 (mesma página, usa `despesasTotais`)
- **US3 (Phase 5)**: Após US1 + US2 (coerência)
- **US4 (Phase 6)**: Após US1 + US2 (limpeza legado)
- **Polish (Phase 7)**: Após US desejadas

### User Story Dependencies

- **US1 (P1)**: Só Foundation
- **US2 (P1)**: Foundation + totais de despesa (US1) para a fórmula
- **US3 (P1)**: US1 + US2
- **US4 (P2)**: US1 + US2 (cleanup)

### Parallel Opportunities

- T004 pode rodar em paralelo com T002–T003 (mesmo arquivo: sequenciar se um agente só)
- T016 / T017 em paralelo no Polish
- US3 e US4 após US2 podem ser sequenciais no mesmo `Dashboard.tsx` (evitar conflito)

### Parallel Example: Foundation

```bash
# Sequencial no mesmo arquivo (recomendado):
Task: T002 ContaParaDespesa em frontend/src/utils/dashboardDespesas.ts
Task: T003 reescrever totaisDespesa
Task: T004 calcularResultado
```

### Parallel Example: Polish

```bash
Task: T016 papéis admin/visualizador
Task: T017 lint + type-check
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup  
2. Phase 2 Foundation (`totaisDespesa`)  
3. Phase 3 US1 — três cards corretos  
4. **STOP** e validar Quickstart §1–§2  

### Incremental Delivery

1. Setup + Foundation  
2. US1 → Despesas canônicas (MVP)  
3. US2 → Dois Resultados  
4. US3 → Coerência período/toggle/abas  
5. US4 → Limpeza legado  
6. Polish + quickstart completo  

### Suggested MVP Scope

**US1 apenas** (três métricas de despesa corretas e imunes ao toggle). Resultado (US2) é o próximo incremento de maior valor.

---

## Notes

- Sem testes automatizados nesta lista (spec não pediu TDD)
- Não criar endpoint backend nesta feature (research §1 / §7)
- Não tocar Centro de Despesa / Demonstrativo
- Commit por tarefa ou grupo lógico a pedido do usuário
- Implement 2026-09-10: T001–T018 concluídas. `type-check` ainda reporta erros pré-existentes em Label do DRE (`Dashboard.tsx`) e `DH.tsx` — fora do escopo 059. Validação E2E do quickstart fica para o usuário com fixture.
