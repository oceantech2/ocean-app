# Tasks: DRE — Linha Impostos (Contas Imposto / DAS)

**Input**: Design documents from `/specs/075-dre-linha-impostos/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (US1–US4). Evitar `[P]` em tarefas que editam o mesmo arquivo na mesma fase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme [spec.md](./spec.md)
- Caminhos de arquivo explícitos

## Path Conventions

- Backend: `backend/app/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e dependências do plano

- [x] T001 Confirmar escopo em [plan.md](./plan.md): alterar apenas `backend/app/api/routes/relatorios.py` (`dre_mensal`) e `frontend/src/pages/Dashboard.tsx` (ordem das `<Bar>`); **não** alterar card Impostos (NFs), Fixas/Variáveis/Pendentes, Resultado, página Impostos nem adicionar hint; portas 5193/8001/5433/6380 inalteradas; sem migration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pré-condições de dados/código já existentes (`074`) antes das histórias

**⚠️ CRITICAL**: Confirmar exclusão de `imposto_das` na despesa do DRE antes de mudar Impostos

- [x] T002 Em `backend/app/api/routes/relatorios.py`, localizar `dre_mensal` e confirmar que a agregação de `despesa` já filtra `ContaPagar.tipo_despesa != "imposto_das"` com `data_vencimento` no mês; anotar o bloco atual de `impostos` (Σ `NF.valor_imposto`) a substituir na US2
- [x] T003 [P] Comparar filtro de `GET /api/impostos/de-contas` em `backend/app/api/routes/impostos.py` (`tipo_despesa == "imposto_das"` + vencimento) com o contrato [contracts/rest-dre-mensal-impostos-das.md](./contracts/rest-dre-mensal-impostos-das.md) — Impostos do DRE MUST usar o mesmo critério

**Checkpoint**: Critério de Impostos do DRE alinhado a `de-contas`; despesa já exclui `imposto_das`

---

## Phase 3: User Story 1 — Ordem Impostos entre Receita e Despesa (Priority: P1) 🎯 MVP

**Goal**: No gráfico DRE, ordem canônica Receita bruta → Impostos → Despesa → Lucro (legenda e pilha `composicao`)

**Independent Test**: Abrir Dashboard → DRE com todos os aspectos ativos; Impostos aparece antes de Despesa na legenda e na pilha; Lucro permanece por último

### Implementation for User Story 1

- [x] T004 [US1] Em `frontend/src/pages/Dashboard.tsx`, no `BarChart` do DRE, declarar `<Bar dataKey="impostos" …>` **antes** de `<Bar dataKey="despesa" …>` no `stackId="composicao"`; manter Receita bruta em `stackId` separado e Lucro por último; **não** adicionar subtítulo/hint de bases (FR-014 / [contracts/ui-dre-linha-impostos.md](./contracts/ui-dre-linha-impostos.md))
- [x] T005 [US1] Em `frontend/src/pages/Dashboard.tsx`, conferir que `toggleSerieDre` / estados `mostrarImpostos` / `mostrarDespesa` / `mostrarLucro` continuam funcionando após o reorder (ligar/desligar Impostos independente)

**Checkpoint**: Ordem visual correta mesmo com Impostos ainda vindos de NFs na API (números podem divergir do card até US2)

---

## Phase 4: User Story 2 — Impostos = Σ Contas Tipo Imposto / DAS (Priority: P1)

**Goal**: `impostos` mensal do DRE = soma de Contas a Pagar `tipo_despesa=imposto_das` com vencimento no mês

**Independent Test**: `GET /api/relatorios/dre-mensal?ano=A` — mês M com Contas Imposto / DAS conhecidas; `impostos` = soma por vencimento; bater com `GET /api/impostos/de-contas?ano=A` no mesmo mês (± 0,01)

### Implementation for User Story 2

- [x] T006 [US2] Em `backend/app/api/routes/relatorios.py` (`dre_mensal`), substituir a soma de `NF.valor_imposto` por Σ `ContaPagar.valor` com `tipo_despesa == "imposto_das"`, `data_vencimento IS NOT NULL`, ano/mês de `data_vencimento` = ponto mensal; **não** filtrar por `pago` nem `data_pagamento` (FR-003)
- [x] T007 [US2] Em `backend/app/api/routes/relatorios.py`, atualizar o docstring de `dre_mensal` para descrever Impostos via Contas Imposto / DAS por vencimento (não mais NFs pagas por emissão)
- [x] T008 [US2] Smoke: com JWT, chamar `GET /api/relatorios/dre-mensal?ano={ano}` e `GET /api/impostos/de-contas?ano={ano}`; confirmar shape inalterado (`ano`, `dados[12]` com `mes`, `receita_bruta`, `despesa`, `impostos`, `lucro`) e coerência mensal de `impostos` ↔ `valor_imposto`

**Checkpoint**: API DRE com nova fonte; frontend já consome o mesmo shape

---

## Phase 5: User Story 3 — Despesa e Lucro coerentes (Priority: P1)

**Goal**: Sem dupla contagem; Lucro = Receita bruta − Despesa − Impostos (nova fonte); Lucro negativo sem segmento empilhado

**Independent Test**: Conta Imposto / DAS no mês M não entra em `despesa`; `lucro` da API = R − D − I; no UI, prejuízo sem barra verde negativa

### Implementation for User Story 3

- [x] T009 [US3] Em `backend/app/api/routes/relatorios.py` (`dre_mensal`), confirmar após T006 que `despesa` continua com `tipo_despesa != "imposto_das"` e que `lucro = receita_bruta - despesa - impostos` usa o novo `impostos` (FR-006, FR-007)
- [x] T010 [US3] Em `frontend/src/pages/Dashboard.tsx`, confirmar que o mapeamento DRE (`lucro_empilhado` / tooltip de prejuízo) permanece: Lucro &lt; 0 sem segmento empilhado negativo; tooltip/rótulo legível (FR-008) — ajustar só se o reorder da US1 tiver quebrado o fluxo

**Checkpoint**: Identidade contábil do DRE válida com Impostos de Contas

---

## Phase 6: User Story 4 — Período e demais blocos intactos (Priority: P2)

**Goal**: Troca de ano recalcula DRE; card Impostos (NFs), Fixas/Variáveis/Pendentes e Resultado inalterados; sem hint de divergência

**Independent Test**: Mudar ano no Dashboard; card Impostos ≠ possível Impostos do DRE sem aviso novo; toggle Bruto/Líquido não muda Impostos do DRE; demais cards estáveis

### Implementation for User Story 4

- [x] T011 [P] [US4] Em `frontend/src/pages/Dashboard.tsx`, verificar que o card Impostos da seção Receita continua usando agregação de NFs (`impostosDeNfsPagas` ou equivalente em `frontend/src/utils/dashboardDespesas.ts`) — **sem** passar a usar Contas Imposto / DAS e **sem** novo texto/hint (FR-012–014)
- [x] T012 [US4] Regressão manual conforme [quickstart.md](./quickstart.md): trocar ano no DRE; alternar toggle Bruto/Líquido; conferir Fixas/Variáveis/Pendentes/Resultado e página Impostos inalterados; repetir leitura como `visualizador`

**Checkpoint**: Escopo fechado; divergência card × DRE silenciosa e aceita

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação final

- [x] T013 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T014 Executar checklist completo de [quickstart.md](./quickstart.md) (API + UI + regressão) e marcar SC-001..SC-006

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — bloqueia histórias de cálculo
- **US1 (Phase 3)**: Pode seguir após Setup (só UI); ideal após T001
- **US2 (Phase 4)**: Depende da Phase 2 (T002–T003)
- **US3 (Phase 5)**: Depende da US2 (T006)
- **US4 (Phase 6)**: Depende de US1 + US2 (ordem + fonte) para regressão completa
- **Polish (Phase 7)**: Após US1–US4 desejadas

### User Story Dependencies

- **US1 (P1)**: Independente da API — reorder visual
- **US2 (P1)**: Independente da UI — só `dre_mensal`
- **US3 (P1)**: Depende de US2 para Lucro/Despesa corretos
- **US4 (P2)**: Regressão após US1+US2

### Parallel Opportunities

- T003 [P] em paralelo com revisão de T002 (arquivos diferentes)
- T004/T005 (US1, frontend) em paralelo com T006–T008 (US2, backend) após Phase 2
- T011 [P] em paralelo com preparação de T012
- T013 [P] em paralelo com smoke API se frontend já está estável

---

## Parallel Example: US1 + US2

```bash
# Após Phase 2:
# Dev A — UI
Task: "T004 Reorder Bar impostos antes de despesa em frontend/src/pages/Dashboard.tsx"
Task: "T005 Verificar toggles da legenda DRE em frontend/src/pages/Dashboard.tsx"

# Dev B — API
Task: "T006 Trocar impostos do dre_mensal para ContaPagar imposto_das em backend/app/api/routes/relatorios.py"
Task: "T007 Atualizar docstring de dre_mensal"
Task: "T008 Smoke dre-mensal vs impostos/de-contas"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 + Phase 2  
2. US1 (ordem) **e/ou** US2 (fonte) em paralelo  
3. Validar ordem no UI + totais na API ([quickstart.md](./quickstart.md))  
4. Demo MVP

### Incremental Delivery

1. Setup + Foundational  
2. US1 → ordem visual  
3. US2 → números corretos  
4. US3 → Lucro/Despesa  
5. US4 → regressão  
6. Polish → lint + quickstart completo

### Suggested MVP scope

**US1 + US2** (ordem + Σ Contas Imposto / DAS). US3 é verificação curta pós-US2; US4 é regressão.

---

## Notes

- Sem testes automatizados nesta feature (não pedidos na spec)
- Shape REST inalterado — só semântica de `impostos`
- `frontend/src/services/api.ts` não precisa mudar salvo tipagem/comentário opcional
- Commit por história ou por fase lógica
- **Implementação 2026-09-16**: código aplicado; smoke HTTP adiado (API 8001 offline / Docker não rodando) — validar com [quickstart.md](./quickstart.md) após `docker compose up -d` + restart do backend; `tsc` reporta erros pré-existentes em `DrePctLabel`/`LabelList`; `eslint` sem config no frontend
