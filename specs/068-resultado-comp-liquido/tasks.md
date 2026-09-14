# Tasks: Resultado Competência fixo em líquido

**Input**: Design documents from `/specs/068-resultado-comp-liquido/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec — validação manual via [quickstart.md](./quickstart.md)

**Organization**: Tarefas por user story para entrega incremental e teste independente

**Nota**: `setup-tasks.ps1` apontou para `066` (`.specify/feature.json` estava desatualizado); tasks geradas para **`068-resultado-comp-liquido`** (feature desta sessão). `feature.json` realinhado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefas incompletas)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Web app: `frontend/src/`, `backend/` (backend **inalterado** nesta feature)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Alinhar escopo e contratos antes de editar código

- [x] T001 Confirmar escopo em `specs/068-resultado-comp-liquido/plan.md` e `specs/068-resultado-comp-liquido/research.md`: Resultado Competência = `pipeline.fechado.valor_liquido`; subtítulo canônico **“base líquida”**; Resultado Caixa com `valorPorVisao`; sem backend/migration; portas 5193/8001
- [x] T002 [P] Relêr `specs/068-resultado-comp-liquido/contracts/calc-resultado-comp-liquido.md` e `specs/068-resultado-comp-liquido/contracts/ui-resultado-comp-liquido.md` e localizar em `frontend/src/pages/Dashboard.tsx` os pontos `receitaComp` / card Resultado Competência / Resultado Caixa e em `frontend/src/utils/dashboardDespesas.ts` a função `calcularResultado`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Baseline e garantia de que a função de cálculo não será alterada

**⚠️ CRITICAL**: User stories só após esta fase

- [x] T003 Em `frontend/src/pages/Dashboard.tsx`, registrar baseline: `receitaComp` deve deixar de usar (ou já não usar) `valorPorVisao` sobre `pipeline.fechado`; `receitaCaixaValor` permanece com `valorPorVisao` — FR-001/FR-004
- [x] T004 Confirmar que `calcularResultado` em `frontend/src/utils/dashboardDespesas.ts` permanece intocado (valor = receita − despesas; pct null se receita ≤ 0) — contrato calc

**Checkpoint**: Fundação pronta — implementação das user stories pode começar

---

## Phase 3: User Story 1 — Resultado Competência estável no toggle (Priority: P1) 🎯 MVP

**Goal**: Valor e % do Resultado Competência sempre na base líquida; subtítulo fixo **“base líquida”**; estável ao alternar Bruto ↔ Líquido

**Independent Test**: Com Total Fechado bruto ≠ líquido, anotar Competência em Líquido; trocar para Bruto — valor, % e subtítulo “base líquida” iguais; Impostos Recolhidos também estável

### Implementation for User Story 1

- [x] T005 [US1] Em `frontend/src/pages/Dashboard.tsx`, definir `receitaComp = Number(pipeline.fechado.valor_liquido) || 0` (MUST NOT usar `valorPorVisao` neste card) e manter `resultadoCompetencia = calcularResultado(receitaComp, despesasTotaisResultado)` — FR-001/FR-002/FR-003
- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx`, no card **Resultado Competência**, exibir subtítulo canônico **“base líquida”** (substituir qualquer microcopy legado como “Não alterna com Bruto/Líquido”) em ambas as posições do toggle — FR-009/SC-007
- [x] T007 [US1] Validar manualmente cenário 1 de `specs/068-resultado-comp-liquido/quickstart.md` (estabilidade + subtítulo) no Dashboard (`http://localhost:5193`)

**Checkpoint**: US1 funcional — MVP entregável

---

## Phase 4: User Story 2 — Resultado Caixa e demais métricas intactas (Priority: P1)

**Goal**: Resultado Caixa e Despesas continuam no comportamento atual; só Competência fica fixo; Caixa **sem** subtítulo “base líquida”

**Independent Test**: Alternar toggle — Caixa muda e sem “base líquida”; Competência não muda e mantém subtítulo; Fixas/Variáveis/Pendentes iguais

### Implementation for User Story 2

- [x] T008 [US2] Em `frontend/src/pages/Dashboard.tsx`, garantir `receitaCaixaValor = valorPorVisao(receitaCaixa.recebido.valor_liquido, receitaCaixa.recebido.valor_bruto, visaoReceita)` e `resultadoCaixa = calcularResultado(...)` inalterados — FR-004/SC-003
- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, garantir que o card **Resultado Caixa** NÃO exibe o texto “base líquida” (mesmo com toggle em Líquido) — FR-010
- [x] T010 [US2] Confirmar em `frontend/src/pages/Dashboard.tsx` que Despesas Fixas/Variáveis/Pendentes e Impostos Recolhidos não foram alterados por esta feature — FR-005/FR-008
- [x] T011 [US2] Validar manualmente cenários 2–3 de `specs/068-resultado-comp-liquido/quickstart.md` (fórmula vs Total Fechado líquido; Caixa ainda reage)

**Checkpoint**: US1 + US2 sem regressão no restante do bloco

---

## Phase 5: User Story 3 — Coerência de período e casos sem receita (Priority: P2)

**Goal**: Mudança de mês/ano e modo só-ano recalculam Competência em líquido; % indisponível se receita líquida = 0; subtítulo permanece

**Independent Test**: Trocar período; conferir recálculo líquido + subtítulo; período sem fechamentos → valor = `0 − despesas`, % “—”, subtítulo presente

### Implementation for User Story 3

- [x] T012 [US3] Em `frontend/src/pages/Dashboard.tsx`, confirmar que `receitaComp` / `resultadoCompetencia` usam o `pipeline` já filtrado pelo período do Dashboard (mês ou `mes === null` só-ano), sem lógica especial de toggle — FR-006
- [x] T013 [US3] Em `frontend/src/pages/Dashboard.tsx`, confirmar que com `receitaComp <= 0` o % usa `fmtResultadoPct(null)` / “—” e o subtítulo **“base líquida”** continua visível — FR-002/US3
- [x] T014 [US3] Validar manualmente cenário 4 de `specs/068-resultado-comp-liquido/quickstart.md` (período + receita zero)

**Checkpoint**: Todas as user stories independentemente verificáveis

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, papéis e checklist de pronto

- [x] T015 [P] Validar cenário 5 de `specs/068-resultado-comp-liquido/quickstart.md` com papel `visualizador` (mesmos números e subtítulo) — FR-007/SC-006
- [x] T016 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T017 Revisar diff final em `frontend/src/pages/Dashboard.tsx` (e garantir zero mudanças em `frontend/src/utils/dashboardDespesas.ts` / backend) contra FR-008 e Out of Scope da spec
- [x] T018 Executar checklist completo de `specs/068-resultado-comp-liquido/quickstart.md` (critério de pronto)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as user stories
- **US1 (Phase 3)**: Após Phase 2 — MVP
- **US2 (Phase 4)**: Após Phase 2; na prática após T005–T006 no mesmo arquivo `Dashboard.tsx` (evitar conflito de edição)
- **US3 (Phase 5)**: Após US1 (confirmação de período sobre o mesmo cálculo)
- **Polish (Phase 6)**: Após US1–US3 desejadas

### User Story Dependencies

- **US1 (P1)**: Independente após Phase 2 — MVP
- **US2 (P1)**: Independente em critério de teste; mesmo arquivo que US1 → sequenciar no `Dashboard.tsx`
- **US3 (P2)**: Depende do cálculo/UI de US1 estarem corretos

### Parallel Opportunities

- T001 ∥ T002 (setup)
- T015 ∥ T016 (polish em frentes distintas)
- User stories **não** em paralelo no mesmo arquivo — um implementador sequencial é o caminho natural

---

## Parallel Example: Setup

```text
Task: "T001 Confirmar escopo em plan.md / research.md"
Task: "T002 Relêr contracts e localizar pontos em Dashboard.tsx / dashboardDespesas.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2  
2. Phase 3 (T005–T007): cálculo líquido + subtítulo **“base líquida”**  
3. **STOP** e validar quickstart cenário 1  
4. Demo MVP

### Incremental Delivery

1. MVP (US1) → estabilidade Competência + subtítulo  
2. US2 → regressão Caixa/Despesas/Impostos + FR-010  
3. US3 → período / receita zero  
4. Polish → visualizador + lint/type-check + quickstart completo

### Gap já conhecido no working tree

- Cálculo em `valor_liquido` pode já estar aplicado — T005 vira verificação/ajuste  
- Subtítulo legado “Não alterna com Bruto/Líquido” **deve** ser trocado em T006 para **“base líquida”**

---

## Notes

- Sem testes automatizados (não pedidos na spec)
- Backend intocado
- Texto canônico do subtítulo: exatamente **“base líquida”**
- Commit sob demanda do usuário (não automático)
- Implementado 2026-09-14: subtítulo alinhado; cálculo já estava em `valor_liquido`; validação UI no Dashboard (toggle Bruto/Líquido)
