# Tasks: Dashboard — Gráfico DRE Empilhado

**Input**: Design documents from `/specs/003-dashboard-dre-chart/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados no spec — validação manual via [quickstart.md](./quickstart.md) + `npm run type-check` / `lint` + smoke JWT do endpoint

**Organization**: Tasks agrupadas por user story para entrega incremental e teste independente

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story (US1, US2, US3)
- Incluir caminhos de arquivo exatos nas descrições

## Path Conventions

- Backend: `backend/app/api/routes/relatorios.py`
- Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/services/api.ts`
- Contratos: `specs/003-dashboard-dre-chart/contracts/rest-dre-mensal.md`, `ui-dashboard-dre.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto e limites antes de editar código

- [x] T001 Revisar `specs/003-dashboard-dre-chart/plan.md`, `spec.md`, `research.md` e `contracts/rest-dre-mensal.md` + `contracts/ui-dashboard-dre.md` e confirmar escopo (endpoint + bloco DRE abaixo dos saldos; sem migration; sem menu novo)
- [x] T002 [P] Confirmar em `backend/app/models/__init__.py` os enums/campos usados: `StatusNF.PAGA`, `NF.valor_bruto`/`data_emissao`, `ContaPagar.valor`/`data_vencimento`/`centro_custo`, `CentroCusto.IMPOSTOS` / `RETIRADA_LUCRO`
- [x] T003 [P] Confirmar padrão de agregação mensal em `backend/app/api/routes/impostos.py` (`/de-contas`) e `backend/app/api/routes/relatorios.py` (`/faturamento-liquido-mes`) para espelhar estilo de queries

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API DRE + cliente HTTP — bloqueia todas as user stories de UI

**⚠️ CRITICAL**: Não iniciar o gráfico na Dashboard antes desta fase

- [x] T004 Implementar `GET /dre-mensal?ano=` em `backend/app/api/routes/relatorios.py` retornando `{ ano, dados[12] }` com `mes`, `receita_bruta`, `despesa`, `impostos`, `lucro` conforme `specs/003-dashboard-dre-chart/contracts/rest-dre-mensal.md` e `data-model.md`
- [x] T005 Em `backend/app/api/routes/relatorios.py`, calcular por mês: receita = Σ NF pagas `valor_bruto` por `data_emissao`; impostos = Σ contas `IMPOSTOS` por `data_vencimento` (pago+pendente, ignorar vencimento null); despesa = Σ demais centros **exceto** `IMPOSTOS` (inclui `RETIRADA_LUCRO`); lucro = receita − despesa − impostos
- [x] T006 Garantir auth JWT via `get_current_user` no endpoint em `backend/app/api/routes/relatorios.py` (mesmo padrão dos outros relatórios; 422 se `ano` ausente)
- [x] T007 Adicionar `dreMensal: (ano: number) => api.get('/relatorios/dre-mensal', { params: { ano } })` em `relatoriosService` em `frontend/src/services/api.ts`

**Checkpoint**: Endpoint e client prontos — stories de UI podem começar

---

## Phase 3: User Story 1 — Ver DRE em duas barras por mês (Priority: P1) 🎯 MVP

**Goal**: Bloco DRE abaixo dos saldos; por mês barra de Receita bruta (azul) ao lado da pilha Despesa (vermelho) + Impostos (cinza) + Lucro empilhado (verde se ≥ 0); eixo conforme FR-007; tooltip em BRL

**Independent Test**: Abrir Dashboard no ano corrente com dados; confirmar posição abaixo dos saldos, pares de barras, cores e eixo só até o mês atual (quickstart V1/V5)

### Implementation for User Story 1

- [x] T008 [US1] Incluir chamada `relatoriosService.dreMensal(ano)` no carregamento de `frontend/src/pages/Dashboard.tsx` (ex.: `Promise.all` / `.catch` dedicado) e guardar estado dos pontos mensais
- [x] T009 [US1] Mapear resposta da API para dados do chart em `frontend/src/pages/Dashboard.tsx`: labels `Jan`…`Dez`, `lucro_empilhado = max(0, lucro)`, preservar `lucro` real para tooltip
- [x] T010 [US1] Aplicar corte de eixo em `frontend/src/pages/Dashboard.tsx`: ano corrente → meses 1..`MES_ATUAL`; ano &lt; corrente → 12 meses; ano &gt; corrente → sem barras (estado tratado na US3)
- [x] T011 [US1] Inserir bloco gráfico imediatamente após o grid de saldos e antes do faturamento líquido em `frontend/src/pages/Dashboard.tsx`, com título claro incluindo DRE e `{ano}`
- [x] T012 [US1] Renderizar `BarChart` (Recharts) em `frontend/src/pages/Dashboard.tsx` com `Bar` Receita bruta `stackId="receita"` fill `#3B82F6` e Bars Despesa/Impostos/Lucro empilhado `stackId="composicao"` fills `#EF4444` / `#9CA3AF` / `#22C55E` (ordem Despesa → Impostos → Lucro)
- [x] T013 [US1] Configurar `Tooltip` formatado `pt-BR` currency e eixos em `frontend/src/pages/Dashboard.tsx` mostrando mês e valores dos aspectos (incluir `lucro` real no payload do tooltip)
- [x] T014 [US1] Confirmar que saldos, metas, KPIs e gráfico de faturamento em `frontend/src/pages/Dashboard.tsx` não mudam de comportamento (só deslocamento vertical)

**Checkpoint**: US1 testável — gráfico DRE visível e coerente com a API

---

## Phase 4: User Story 2 — Escolher aspectos via labels (Priority: P1)

**Goal**: Legenda/labels para ligar/desligar Receita bruta, Despesa, Impostos e Lucro; default todos ligados; sem persistência

**Independent Test**: Toggle cada label; segmentos somem/reaparecem; desmarcar todos sem crash (quickstart V3)

### Implementation for User Story 2

- [x] T015 [US2] Adicionar estado local das quatro séries (default `true`) em `frontend/src/pages/Dashboard.tsx` sem `localStorage`
- [x] T016 [US2] Condicionar render/`hide` das `Bar` de Receita, Despesa, Impostos e Lucro empilhado ao estado das labels em `frontend/src/pages/Dashboard.tsx`
- [x] T017 [US2] Expor `Legend` interativa (ou controles equivalentes) em `frontend/src/pages/Dashboard.tsx` para alternar as quatro séries com nomes: Receita bruta, Despesa, Impostos, Lucro
- [x] T018 [US2] Garantir que com só Receita ativa resta a barra azul e com um único segmento da pilha a segunda barra vira simples em `frontend/src/pages/Dashboard.tsx`

**Checkpoint**: US2 testável — toggles funcionam sobre o chart da US1

---

## Phase 5: User Story 3 — Ausência ou falha de dados (Priority: P2)

**Goal**: Bloco DRE permanece no layout com mensagem clara em vazio/erro; resto da dashboard utilizável; Lucro negativo sem segmento empilhado + tooltip

**Independent Test**: Ano sem dados / ano futuro / falha isolada do endpoint; prejuízo num mês (quickstart V4/V6)

### Implementation for User Story 3

- [x] T019 [US3] Tratar falha de `dreMensal` em `frontend/src/pages/Dashboard.tsx` com mensagem no bloco DRE (e toast opcional) sem derrubar saldos/KPIs
- [x] T020 [US3] Exibir estado vazio legível no bloco DRE em `frontend/src/pages/Dashboard.tsx` quando ano futuro ou todos os valores do eixo forem zero
- [x] T021 [US3] Garantir Lucro &lt; 0: sem `Bar` verde empilhada (`lucro_empilhado=0`) e tooltip/rótulo mostrando prejuízo em `frontend/src/pages/Dashboard.tsx`
- [x] T022 [US3] Validar eixo do ano corrente (sem meses futuros) e anos anteriores (12 meses com zeros) em `frontend/src/pages/Dashboard.tsx` alinhado a FR-007

**Checkpoint**: Todas as user stories cobertas na UI + API

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e qualidade

- [x] T023 Executar cenários V1–V6 de `specs/003-dashboard-dre-chart/quickstart.md` (posição, ano anterior, labels, prejuízo, amostragem API, vazio/erro)
- [x] T024 [P] Rodar `npm run type-check` e `npm run lint` em `frontend/`
- [x] T025 [P] Smoke manual `GET http://localhost:8001/api/relatorios/dre-mensal?ano=YYYY` com JWT e conferir 12 itens + aritmética lucro
- [x] T026 Revisar responsividade do chart em viewport estreita em `frontend/src/pages/Dashboard.tsx` (labels/ticks legíveis, sem quebrar layout dos saldos)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → sem dependências
- **Phase 2 (Foundational)** → após Setup; **bloqueia** US1–US3
- **Phase 3 (US1)** → após Foundational; **MVP**
- **Phase 4 (US2)** → após US1 (precisa do chart)
- **Phase 5 (US3)** → após US1 (estados do mesmo bloco); pode sobrepor fim da US2
- **Phase 6 (Polish)** → após US1–US3 desejadas

### User Story Dependencies

```text
Setup → Foundational (API + api.ts)
              ↓
            US1 (chart)  ← MVP
           /         \
        US2 (labels)  US3 (vazio/erro/prejuízo)
              \         /
               Polish
```

- US2 e US3 dependem do shell do gráfico (US1), não uma da outra de forma rígida; US3 T021 (prejuízo) pode ser feita junto com T009/T013 se conveniente

### Parallel Opportunities

- T002 ∥ T003 (Setup)
- Após T007: documentação/contrato já cobertos; implementação UI sequencial no mesmo arquivo `Dashboard.tsx` (evitar paralelizar T008–T022 no mesmo arquivo)
- T024 ∥ T025 (Polish)

### Parallel Example (Foundational)

```bash
# Sequencial no backend, depois client:
# T004 → T005 → T006 (mesmo arquivo relatorios.py)
# T007 em api.ts pode seguir assim que o path do endpoint estiver definido
```

---

## Implementation Strategy

### MVP (só User Story 1)

1. Completar Phase 1–2 (endpoint + `dreMensal`)
2. Completar Phase 3 (chart abaixo dos saldos, cores, eixo, tooltip)
3. Validar quickstart V1 + V5
4. Entregar valor gerencial antes de polish de labels/estados

### Incremental Delivery

1. MVP = US1  
2. + US2 = toggles de aspectos  
3. + US3 = robustez vazio/erro/prejuízo  
4. Polish = quickstart completo + lint/type-check  

### Suggested MVP Scope

**US1 apenas** (T001–T014): gráfico DRE utilizável com os quatro aspectos sempre visíveis.

---

## Task Summary

| Métrica | Valor |
|---------|--------|
| **Total tasks** | 26 |
| **US1** | 7 (T008–T014) |
| **US2** | 4 (T015–T018) |
| **US3** | 4 (T019–T022) |
| **Setup + Foundational + Polish** | 11 (T001–T007, T023–T026) |
| **Parallel marcadas [P]** | T002, T003, T024, T025 |
| **Test tasks automatizados** | 0 (não solicitados) |

**Format validation**: Todas as tasks usam `- [ ]`, ID `Tnnn`, labels `[USx]` só em fases de story, e caminhos de arquivo nas descrições.
