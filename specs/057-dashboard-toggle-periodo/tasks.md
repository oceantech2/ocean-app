# Tasks: Toggle Bruto/Líquido + Configuração do Período no Dashboard

**Input**: Design documents from `/specs/057-dashboard-toggle-periodo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundation (migration + APIs dual-base + clients) → US1–US5 (P1) → US6 (P2, massa) → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US6 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/main.py`, `backend/app/models/__init__.py`, `backend/app/schemas.py`, `backend/app/api/routes/metas.py`, `backend/app/api/routes/relatorios.py`, `backend/app/services/nf_valores.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`, `frontend/src/utils/metaPeriodo.ts`
- Contratos: `specs/057-dashboard-toggle-periodo/contracts/`
- **Não alterar**: listagem/formulário de `frontend/src/pages/NFs.tsx` (só efeitos via update em massa); meta anual (`mes=0`) no fluxo atual; cards briefing 05–09

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte da feature 057

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [research.md](./research.md): Dashboard; `metas_financeiras.aliquota_periodo`; toggle sessão; Pipeline dual-base; Conta a Receber = `nfs`; meta anual intacta; portas 5193/8001; sem cards 05–09

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistência, contratos REST base, clients e helpers — bloqueia US1–US6

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `backend/app/models/__init__.py`, adicionar `aliquota_periodo` (Float, nullable) em `MetaFinanceira` conforme [data-model.md](./data-model.md)
- [x] T003 Em `backend/app/main.py`, em `_migrar()`, executar `ALTER TABLE metas_financeiras ADD COLUMN IF NOT EXISTS aliquota_periodo DOUBLE PRECISION`
- [x] T004 [P] Em `backend/app/schemas.py`, criar schemas de Configuração do Período (GET response, PUT body, 409 `confirmacao_necessaria`) alinhados a [contracts/rest-configuracao-periodo.md](./contracts/rest-configuracao-periodo.md)
- [x] T005 [P] Em `backend/app/schemas.py` (e/ou tipos do Pipeline), estender estágios com `valor_liquido`, `valor_bruto`, `contagem`, `percentual_liquido`, `percentual_bruto` (+ espelho legado `valor`/`percentual` = líquido se necessário) — [contracts/rest-pipeline-receita-toggle.md](./contracts/rest-pipeline-receita-toggle.md)
- [x] T006 Em helper reutilizável (ex. `backend/app/services/meta_periodo.py` ou função em `metas.py`), implementar `meta_bruta(meta_liquida, aliquota_periodo) -> float | None` com `round(..., 2)` e rejeição se alíquota ∉ [0, 100)
- [x] T007 Em `backend/app/api/routes/metas.py`, implementar `GET /periodo?mes=&ano=` retornando `meta_liquida`, `aliquota_periodo`, `meta_bruta`, `configurada`, `registros_afetaveis` (COUNT NFs elegíveis) — contrato REST período; papéis admin e visualizador
- [x] T008 Em `backend/app/api/routes/relatorios.py`, estender `GET /pipeline-receita` para SUM `valor_bruto` e `valor_liquido` por estágio + percentuais por base + contagem única; manter invariante do funil nas duas bases — [contracts/rest-pipeline-receita-toggle.md](./contracts/rest-pipeline-receita-toggle.md)
- [x] T009 [P] Em `frontend/src/services/api.ts`, adicionar `metasService.obterPeriodo` / `salvarPeriodo` tipados e atualizar tipo de `pipelineReceita` para dual-base
- [x] T010 [P] Em `frontend/src/utils/metaPeriodo.ts`, helpers de cliente: cálculo/espelho de `meta_bruta`, labels do toggle (`liquido`|`bruto`), seleção de valor/`%` do Pipeline pela base ativa

**Checkpoint**: Smoke GET `/api/metas/periodo` e GET `/api/relatorios/pipeline-receita` com JWT; coluna migrada; clients tipados; foundation liberada

---

## Phase 3: User Story 1 - Alternar visão Bruto e Líquido (Priority: P1) 🎯 MVP

**Goal**: Toggle no header direito do Dashboard (padrão Líquido) altera KPIs de receita existentes para a base ativa, sem visão mista

**Independent Test**: Quickstart cenário 1 — alternar toggle; receita muda; Impostos/despesas ainda podem ser verificados na US2

### Implementation for User Story 1

- [x] T011 [US1] Em `frontend/src/pages/Dashboard.tsx`, adicionar estado `visaoReceita: 'liquido' | 'bruto'` default `'liquido'` e controle no header direito (rótulos textuais) — [contracts/ui-dashboard-toggle-periodo.md](./contracts/ui-dashboard-toggle-periodo.md), FR-001, FR-002
- [x] T012 [US1] Em `frontend/src/pages/Dashboard.tsx`, fazer cards de receita existentes (`faturamento_bruto_pago` / `faturamento_liquido_pago` / pendente e correlatos de receita) exibirem **somente** a base do toggle (sem mostrar bruto e líquido como duas verdades ao mesmo tempo) — FR-003, FR-003a, FR-004
- [x] T013 [US1] Em `frontend/src/pages/Dashboard.tsx`, indicar visualmente a base ativa (ex. subtítulo “visão líquida/bruta”) junto aos totais de receita

**Checkpoint**: MVP — toggle visível e KPIs de receita existentes respondem; SC-002 parcial

---

## Phase 4: User Story 2 - O que o toggle não altera (Priority: P1)

**Goal**: Impostos absolutos e despesas permanecem estáveis ao alternar o toggle

**Independent Test**: Quickstart cenário 1 — Impostos e despesas iguais após Bruto ↔ Líquido (SC-003)

### Implementation for User Story 2

- [x] T014 [US2] Em `frontend/src/pages/Dashboard.tsx`, garantir que o card **Impostos** (e métricas absolutas de imposto) **não** dependam de `visaoReceita` — FR-008
- [x] T015 [US2] Em `frontend/src/pages/Dashboard.tsx`, garantir que KPIs de **despesa**/custo/retiradas não-receita **não** mudem com o toggle — FR-007
- [x] T016 [US2] Revisar trechos mistos (receita+despesa) no Dashboard e isolar só a parcela de receita ao toggle, conforme [research.md](./research.md) §3

**Checkpoint**: SC-003 verificável

---

## Phase 5: User Story 3 - Configurar meta líquida e alíquota do período (Priority: P1)

**Goal**: Formulario único no Dashboard substitui edição isolada de meta mensal; admin salva ambos; visualizador só lê

**Independent Test**: Quickstart cenários 3 e 5 (parcial sem massa) — save conjunto; visualizador bloqueado; ausência clara

### Implementation for User Story 3

- [x] T017 [US3] Em `backend/app/api/routes/metas.py`, implementar `PUT /periodo` com validação obrigatória de `meta_liquida` + `aliquota_periodo` (0 ≤ x &lt; 100), upsert em `metas_financeiras`, 403 para visualizador, 422 se incompleto/ inválido — **ainda sem** update em massa (isso é US6); se alíquota mudar sem `confirmar_atualizacao_massa`, responder 409 com contagem (corpo do contrato) sem persistir — FR-009–FR-011, FR-017, FR-018
- [x] T018 [US3] Em `frontend/src/pages/Dashboard.tsx`, substituir o fluxo isolado `editandoMeta` / `salvarMeta` mensal por UI de Configuração do Período (meta líquida + alíquota) quando `mes` 1–12; carregar via `obterPeriodo`; estado “não configurada” explícito — FR-009a, [contracts/ui-dashboard-toggle-periodo.md](./contracts/ui-dashboard-toggle-periodo.md)
- [x] T019 [US3] Em `frontend/src/pages/Dashboard.tsx`, restringir save da Configuração a `admin`; `visualizador` somente leitura; toasts de sucesso/erro (422)
- [x] T020 [US3] Em `frontend/src/pages/Dashboard.tsx`, preservar fluxo de **meta anual** (`mes=0` / `metasService.definir(0, ano, …)`) inalterado

**Checkpoint**: Configuração mensal testável; SC-005, SC-007, SC-008; edição antiga só de meta mensal removida

---

## Phase 6: User Story 4 - Meta conforme o toggle (Priority: P1)

**Goal**: Meta mensal exibida e progresso seguem Líquido → `meta_liquida` / Bruto → `meta_bruta`

**Independent Test**: Quickstart cenário 2 — 300000 @ 18,5% → ≈ 368098,16 (SC-001)

### Implementation for User Story 4

- [x] T021 [US4] Em `backend/app/api/routes/metas.py`, estender `GET /progresso` (mês 1–12) com `aliquota_periodo`, `meta_bruta`, `realizado_liquido`, `realizado_bruto` conforme contrato de progresso — [contracts/rest-configuracao-periodo.md](./contracts/rest-configuracao-periodo.md) §4
- [x] T022 [US4] Em `frontend/src/services/api.ts`, tipar resposta de `metasService.progresso` com campos dual-base
- [x] T023 [US4] Em `frontend/src/pages/Dashboard.tsx`, exibir meta mensal / barra de progresso usando meta e realizado da base ativa do toggle; se não configurada ou conversão Bruto impossível, estado claro sem inventar número — FR-005, FR-006, FR-018

**Checkpoint**: SC-001; meta acompanha toggle

---

## Phase 7: User Story 5 - Pipeline e receitas dual-base (Priority: P1)

**Goal**: Pipeline usa `valor_liquido`/`valor_bruto` conforme toggle; contagens fixas; funil idêntico nas duas bases

**Independent Test**: Quickstart cenários 1 e 6 (SC-006)

### Implementation for User Story 5

- [x] T024 [US5] Em `frontend/src/pages/Dashboard.tsx`, no card Pipeline, selecionar `valor_*` e `percentual_*` via `metaPeriodo.ts` / helper conforme `visaoReceita`; contagens inalteradas ao alternar — FR-014, FR-015
- [x] T025 [US5] Validar invariante na UI (e corrigir agregação em `backend/app/api/routes/relatorios.py` se necessário): soma dos três estágios = fechado em valor na base ativa e em contagem
- [x] T026 [US5] Confirmar que, com toggle, nenhum KPI de receita existente fica na base oposta (auditoria visual alinhada a SC-002a)

**Checkpoint**: Pipeline + receitas coerentes com toggle; SC-002, SC-002a, SC-006

---

## Phase 8: User Story 6 - Atualização em massa ao salvar alíquota (Priority: P2)

**Goal**: Confirmação quando alíquota muda; atualiza `aliquota_imposto` + recalcula líquido/imposto nas NFs com emissão no período

**Independent Test**: Quickstart cenário 4 (SC-004, SC-004a)

### Implementation for User Story 6

- [x] T027 [US6] Em `backend/app/api/routes/metas.py` (serviço auxiliar se preferir), no PUT `/periodo` confirmado: em transação, upsert config + para cada NF elegível (`data_emissao` no mês/ano, `excluida_em IS NULL`, `status != cancelada`) setar `aliquota_imposto` e recalcular com `calcular_imposto_liquido` de `backend/app/services/nf_valores.py`; retornar `registros_atualizados`; sem emissão fora do update — FR-012, FR-012a, FR-013
- [x] T028 [US6] Em `backend/app/api/routes/metas.py`, garantir: alíquota igual → save sem tocar NFs e sem exigir flag; alíquota diferente sem flag → 409 sem persistir; cancelamento = não chamar confirm — FR-012b–FR-012d
- [x] T029 [US6] Em `frontend/src/pages/Dashboard.tsx`, ao salvar: se 409, `window.confirm` (ou modal) com `registros_afetaveis`; confirmar → PUT com `confirmar_atualizacao_massa: true`; cancelar → não persistir; só meta mudou → save direto — [contracts/ui-dashboard-toggle-periodo.md](./contracts/ui-dashboard-toggle-periodo.md)
- [x] T030 [US6] Em `frontend/src/pages/Dashboard.tsx`, após massa bem-sucedida: toast com `registros_atualizados` e recarregar dados do Dashboard (Pipeline/resumo/período)

**Checkpoint**: SC-004, SC-004a; página NFs sem redesign

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento e validação E2E

- [x] T031 Rodar cenários 1–7 de [quickstart.md](./quickstart.md) (toggle, meta bruta, save obrigatório, massa, papéis, funil, meta anual)
- [x] T032 [P] Em `frontend/`, executar `npm run lint` e `npm run type-check`; corrigir erros introduzidos pela feature
- [x] T033 Revisar diff: nenhum card Seções 05–09; meta anual intacta; `NFs.tsx` sem redesign de listagem/formulário

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: imediata
- **Phase 2 (Foundational)**: após Setup — **bloqueia** todas as USs
- **Phases 3–7 (US1–US5, P1)**: após Foundation; preferir ordem US1 → US2 → US3 → US4 → US5 (toggle → exclusões → config → meta → pipeline)
- **Phase 8 (US6, P2)**: após US3 (PUT período existente); ideal após US4/US5 para validar impacto no Dashboard
- **Phase 9 (Polish)**: após histórias desejadas

### User Story Dependencies

| Story | Depende de | Notas |
|-------|------------|--------|
| US1 Toggle receita | Foundation | MVP |
| US2 Impostos/despesas fixos | US1 (mesmo arquivo Dashboard) | Pode seguir logo após US1 |
| US3 Config período | Foundation | PUT sem massa completa até US6 |
| US4 Meta × toggle | US1 + US3 | Precisa config + toggle |
| US5 Pipeline dual | US1 + Foundation (T008) | |
| US6 Massa | US3 | Confirmação + `nf_valores` |

### Parallel Opportunities

- T004 ∥ T005 (schemas)
- T009 ∥ T010 (frontend clients/utils)
- T014 ∥ T015 (após US1, cuidados no mesmo `Dashboard.tsx` — preferir sequencial se um dev)
- T031 e T032 após implementação

---

## Parallel Example: Foundation

```bash
# Em paralelo após T002–T003:
Task: "Schemas Configuração do Período em backend/app/schemas.py"
Task: "Schemas Pipeline dual-base em backend/app/schemas.py"

# Em paralelo após endpoints:
Task: "metasService + pipeline types em frontend/src/services/api.ts"
Task: "Helpers metaPeriodo.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 + Phase 2  
2. Phase 3 (US1) — toggle + KPIs receita existentes  
3. **STOP** e validar cenário 1 (parcial)

### Incremental Delivery

1. US2 — trava impostos/despesas  
2. US3 — Configuração do Período (save sem massa ou com 409)  
3. US4 — meta bruta/líquida  
4. US5 — Pipeline dual-base  
5. US6 — confirmação + update em massa  
6. Polish / quickstart completo  

### Suggested MVP scope

**US1** (toggle + receitas existentes). Entrega mínima de valor do briefing Seção 02; US3 fecha Seção 03 no Dashboard.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta
- Sem tarefas TDD (spec não pediu)
- Commit por tarefa ou grupo lógico (somente se o usuário pedir)
- Conta a Receber = `nfs`; fechamento pipeline permanece `data_ent_pgto` (056)
- Validar formato: todas as tarefas usam `- [ ]`, ID `Tnnn`, labels de story nas fases US, e caminhos de arquivo
