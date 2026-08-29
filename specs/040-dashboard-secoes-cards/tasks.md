# Tasks: Dashboard — Seções, Títulos e Reordenação de Cards

**Input**: Design documents from `/specs/040-dashboard-secoes-cards/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2 → P2 US3). Helpers em `utils/` podem ser `[P]`; UI no mesmo `Dashboard.tsx` → sequencial dentro da história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/utils/dashboardDespesas.ts`, `frontend/src/services/api.ts`
- Contrato UI: `specs/040-dashboard-secoes-cards/contracts/ui-dashboard-secoes-cards.md`
- **Não alterar**: schema/migration, backend (filtro Impostos no client), outras páginas

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo só Dashboard (seções, novos cards, saldos por CC, donut sem impostos, títulos DRE/DRL); portas 5193/8001 inalteradas; dependência de nomenclatura `039`; arquivos-alvo `frontend/src/pages/Dashboard.tsx` + `frontend/src/utils/dashboardDespesas.ts` conforme [plan.md](./plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mapa canônico e helpers de agregação — bloqueia US1–US3

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Criar `frontend/src/utils/dashboardDespesas.ts` com mapa natureza (`fixa` / `variavel` / excluída) conforme [research.md](./research.md) e [contracts/ui-dashboard-secoes-cards.md](./contracts/ui-dashboard-secoes-cards.md): `adm_financeiro|recursos_humanos|beneficios|tecnologia` → fixa; `operacoes|marketing|comercial` → variavel; `impostos` → excluída; default → variavel
- [x] T003 Em `frontend/src/utils/dashboardDespesas.ts`, implementar agregadores `totaisDespesa(contas, recorte)` → `{ fixas, variaveis, pendentes }` (pagas vs não pagas; excluir impostos; filtro por `data_vencimento` no recorte mês/ano) e `lucroCard(receitaLiquida, receitaBruta, fixas, variaveis)` → `{ valor, pct | null }` conforme [data-model.md](./data-model.md)
- [x] T004 Em `frontend/src/utils/dashboardDespesas.ts`, implementar `filtrarCustoSemImpostos(respostaCusto)` (remove fatia `impostos`, recalcula `total` e `percentual`) e `impostosDoRecorte(itensDeContas, mes, ano, mesAte?)` para valor/alíquota mês ou YTD a partir de `GET /impostos/de-contas`
- [x] T005 Conferir em `frontend/src/services/api.ts` que `impostosService.deContas` existe; importar `impostosService` em `frontend/src/pages/Dashboard.tsx` e incluir `impostosService.deContas(ano)` no `Promise.all` / `carregarDados` (tratar falha com fallback zero/"—")

**Checkpoint**: Helpers e fetch de impostos prontos; UI ainda pode estar no layout antigo

---

## Phase 3: User Story 1 - Ler o Dashboard por seções tituladas e na ordem definida (Priority: P1) 🎯 MVP

**Goal**: Conteúdo envolvido em seções com título visível na ordem Metas → Receita → Despesa|Resultado → Saldo → Centro de Despesa → Demonstrativo de Resultado

**Independent Test**: Abrir Dashboard e percorrer de cima para baixo: cada grupo tem `<h2>` (ou equivalente) com o nome da seção; linha 3 Despesa à esquerda / Resultado à direita em viewport larga; mobile empilha Despesa antes de Resultado

### Implementation for User Story 1

- [x] T006 [US1] Em `frontend/src/pages/Dashboard.tsx`, envolver blocos existentes em wrappers de seção com títulos **Metas**, **Receita**, **Despesa**, **Resultado**, **Saldo**, **Centro de Despesa**, **Demonstrativo de Resultado** conforme [contracts/ui-dashboard-secoes-cards.md](./contracts/ui-dashboard-secoes-cards.md)
- [x] T007 [US1] Em `frontend/src/pages/Dashboard.tsx`, reordenar o JSX para a sequência FR-013; na seção Metas colocar **Meta de Receita Mensal** antes de **Meta de Receita Anual**; grid da linha 3: Despesa | Resultado (`md`/`lg` lado a lado)
- [x] T008 [US1] Em `frontend/src/pages/Dashboard.tsx`, garantir que gráficos DRE e DRL fiquem sob **Demonstrativo de Resultado** (DRE acima de DRL) e donuts sob **Centro de Despesa**, mesmo que cards novos da US2 ainda não existam (placeholders ou cards atuais realocados)

**Checkpoint**: SC-001 parcial (títulos + ordem); FR-001, FR-002, FR-008, FR-012, FR-013; US1 testável visualmente

---

## Phase 4: User Story 2 - Ver cards de Metas, Receita, Despesa, Resultado e Saldo conforme o mapa (Priority: P1)

**Goal**: Cards na ordem do contrato, incluindo Impostos, Fixas, Variáveis, Pendentes, Lucro e saldos CC1–3 + Investimento

**Independent Test**: Conferir rótulos e atributos (R$ + alíquota; R$; R$ + %); Lucro = RL − Fixas − Variáveis; Impostos não entram em Despesa; CC com nome cadastrado; sem card consolidado único

### Implementation for User Story 2

- [x] T009 [US2] Em `frontend/src/pages/Dashboard.tsx`, seção Receita: grid Receita Bruta → **Impostos** (R$ + alíquota via `impostosDoRecorte`) → Receita Líquida → Receita Pendente; estados "—" quando base zero
- [x] T010 [US2] Em `frontend/src/pages/Dashboard.tsx`, seção Despesa: cards **Despesas Fixas**, **Despesas Variáveis**, **Despesas Pendentes** usando `totaisDespesa` sobre a lista de contas já carregada (recorte do filtro); excluir categoria impostos
- [x] T011 [US2] Em `frontend/src/pages/Dashboard.tsx`, seção Resultado: card **Lucro** com `lucroCard` (R$ + % sobre Receita Bruta); prejuízo negativo permitido
- [x] T012 [US2] Em `frontend/src/pages/Dashboard.tsx`, seção Saldo: remover card consolidado “Saldo Conta Corrente”; renderizar até 3 cards das primeiras CC ativas (`nome` ou fallback `Conta Corrente N` + `saldoVisivel`) + Conta Investimento; slots vazios explícitos

**Checkpoint**: SC-003, SC-005; FR-003 a FR-009, FR-011 (parte Despesa), FR-015; US2 testável

---

## Phase 5: User Story 3 - Interpretar gráficos de Centro de Despesa e Demonstrativo de Resultado (Priority: P2)

**Goal**: Títulos Despesas [Mês]/[Ano] e DRE/DRL; donuts sem impostos no total/fatias

**Independent Test**: Com lançamentos `impostos` no período, fatia Impostos ausente e total do donut menor que incluiria impostos; títulos conforme contrato; ordem DRE → DRL

### Implementation for User Story 3

- [x] T013 [US3] Em `frontend/src/pages/Dashboard.tsx`, ao montar fatias dos donuts, aplicar `filtrarCustoSemImpostos` aos dados de `custoPorCategoria` (mês e ano); atualizar `rotuloCustoMes` / `rotuloCustoAno` para identidade **Despesas — {mês}/{ano}** e **Despesas — {ano}**
- [x] T014 [US3] Em `frontend/src/pages/Dashboard.tsx`, confirmar títulos **DRE — {ano}** e **DRL** na seção Demonstrativo de Resultado; comportamento de séries/legenda do DRE e linha do DRL inalterados além do agrupamento/título

**Checkpoint**: SC-004; FR-010 a FR-012; US3 testável

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T015 Revisar edge cases em `frontend/src/pages/Dashboard.tsx` (Receita Bruta 0, lucro negativo, <3 CC, filtro “Todos os meses” / YTD para Impostos e despesas) conforme Edge Cases da [spec.md](./spec.md)
- [x] T016 Rodar `npm run lint` e `npm run type-check` em `frontend/`; executar checklist de [quickstart.md](./quickstart.md) (ordem, cards novos, exclusão Impostos, papéis admin/visualizador)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** todas as histórias
- **US1 (Phase 3)**: Após Phase 2 — MVP de layout
- **US2 (Phase 4)**: Após US1 recomendado (mesmo arquivo); pode reutilizar wrappers da US1
- **US3 (Phase 5)**: Após Phase 2; ideal após US1 (seção Centro/Demonstrativo já titulada)
- **Polish (Phase 6)**: Após histórias desejadas

### User Story Dependencies

- **US1 (P1)**: Independente após foundation — só estrutura/títulos/ordem
- **US2 (P1)**: Depende dos helpers T002–T005; integra nos wrappers da US1
- **US3 (P2)**: Depende de T004 (`filtrarCustoSemImpostos`); títulos de seção da US1

### Within Each User Story

- Helpers foundation antes da UI da história
- Cards/dados antes de polish
- Validar checkpoint antes da próxima prioridade

### Parallel Opportunities

- T002 pode iniciar em paralelo após T001
- T013/T014 (US3) podem avançar em paralelo a T009–T012 **se** pessoas diferentes e merge cuidadoso no mesmo `Dashboard.tsx` — na prática, **sequencial no mesmo arquivo** é mais seguro
- Lint/type-check só no polish

---

## Parallel Example: Foundational

```bash
# Após T001:
Task: "Criar mapa natureza em frontend/src/utils/dashboardDespesas.ts"
# Em seguida sequencial no mesmo arquivo:
Task: "Agregadores totaisDespesa + lucroCard"
Task: "filtrarCustoSemImpostos + impostosDoRecorte"
Task: "Wire impostosService.deContas no Dashboard.tsx"
```

## Parallel Example: User Story 2 (conceitual)

```bash
# Mesmo arquivo — executar em ordem T009 → T010 → T011 → T012
Task: "Card Impostos na Receita"
Task: "Cards Fixas / Variáveis / Pendentes"
Task: "Card Lucro"
Task: "Saldos por CC + Investimento"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2  
2. Phase 3 (US1) — seções e ordem  
3. **STOP**: validar títulos e layout  
4. Demo de hierarquia visual

### Incremental Delivery

1. Setup + Foundational  
2. US1 → layout  
3. US2 → cards e KPIs novos  
4. US3 → donuts sem impostos + títulos  
5. Polish + quickstart  

### Parallel Team Strategy

Com um único `Dashboard.tsx`, preferir um implementador sequencial US1→US2→US3; segundo dev pode preparar/testar `dashboardDespesas.ts` (T002–T004) em paralelo no início.

---

## Notes

- Sem testes automatizados nesta lista (spec não pediu)
- `[P]` raro: helpers vs página; UI sequencial
- Commit após cada fase ou checkpoint de história
- Não inventar campo `natureza` no backend nesta feature
