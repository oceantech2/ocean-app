# Tasks: Cabeçalho com Filtros Fixo no Scroll

**Input**: Design documents from `/specs/076-cabecalho-filtro-fixo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Constantes compartilhadas (fundação) → Fluxo/Contas MVP (US1) → cobertura cross-página incl. Dashboard (US2) → legibilidade/ações/regressões (US3) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Constantes: `frontend/src/utils/pageHeaderSticky.ts`
- Referência Layout: `frontend/src/components/Layout.tsx` (`top-[5.5rem]`, header `z-50`)
- Referência sticky página: `frontend/src/pages/FluxoCaixa.tsx`
- Dual + KPIs: `frontend/src/pages/Contas.tsx`, `frontend/src/pages/DH.tsx`
- Combinado: `frontend/src/pages/Dashboard.tsx`, `Patrimonio.tsx`, `Impostos.tsx`, `Retiradas.tsx`
- Dual sem KPI (ou banner): `NFs.tsx`, `Bonus.tsx`, `Ferias.tsx`, `Fornecedores.tsx`, `Auditoria.tsx`
- Contrato UI: `specs/076-cabecalho-filtro-fixo/contracts/ui-cabecalho-filtro-fixo.md`
- **Não alterar**: backend; lógica de filtros/handlers; `frontend/src/utils/tableScroll.ts` (salvo validação de z-index); sticky de colunas da tabela

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-cabecalho-filtro-fixo.md](./contracts/ui-cabecalho-filtro-fixo.md): sticky de página com offset Layout `5.5rem`; modos combinado/dual; KPIs sem sticky; Dashboard no escopo; portas 5193/8001 inalteradas; não tocar backend nem `tableScroll.ts` além de validação

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constantes canônicas do cabeçalho de página — bloqueia todas as histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Criar `frontend/src/utils/pageHeaderSticky.ts` exportando constantes Tailwind conforme research/contrato: `PAGE_HEADER_COMBINED_STICKY_CLASS` (`sticky top-[5.5rem] z-30` + fundo opaco), `PAGE_TITLE_STICKY_CLASS` (mesmo offset/z para card de título), `PAGE_FILTERS_STICKY_CLASS` (`sticky top-[calc(5.5rem+5.5rem)] z-20` + fundo opaco); comentário breve pt-BR documentando uso combinado vs dual e proibição de sticky em KPIs
- [x] T003 Em `frontend/src/pages/FluxoCaixa.tsx`, migrar o card sticky de título+filtros (~`sticky top-0 z-20`) para `PAGE_HEADER_COMBINED_STICKY_CLASS` (corrigir offset sob o header global); preservar ações Exportar e selects; fundo opaco claro/escuro

**Checkpoint**: Constantes prontas; Fluxo de Caixa é a referência correta (abaixo do Layout)

---

## Phase 3: User Story 1 - Ajustar filtros sem perder o contexto ao rolar (Priority: P1) 🎯 MVP

**Goal**: Em Contas a Pagar (caso dual + KPIs), título/ações e filtros ficam fixos e utilizáveis após scroll; KPIs rolam e depois título+filtros ficam contíguos

**Independent Test**: Em Contas a Pagar, rolar a página — título e filtros permanecem abaixo do header global; KPIs saem; alterar filtro/categoria com a página rolada funciona sem voltar ao topo

### Implementation for User Story 1

- [x] T004 [US1] Em `frontend/src/pages/Contas.tsx`, aplicar `PAGE_TITLE_STICKY_CLASS` no card de título/ações e `PAGE_FILTERS_STICKY_CLASS` na barra de filtros; **não** sticky nos cards de KPI entre eles; preservar `no-print` e botões de ação (FR-001–FR-003a)
- [x] T005 [US1] Validar visualmente Contas + Fluxo (tema claro): scroll da página com cabeçalho fixo sob o Layout; em Contas, após KPIs saírem, sem faixa vazia grande entre título e filtros (SC-005); filtros/ações clicáveis (FR-002, SC-001 parcial)

**Checkpoint**: MVP testável — dual sticky + KPIs comprovados em Contas; referência Fluxo ok

---

## Phase 4: User Story 2 - Padrão consistente nas telas com filtro no topo (Priority: P1)

**Goal**: Mesmo comportamento em todas as telas no escopo, incluindo Dashboard; fora de escopo intacto

**Independent Test**: Percorrer ≥5 telas (Dashboard, NFs, Férias, DH, Auditoria, …); em cada uma com scroll de página, cabeçalho com filtros fixo e utilizável; Calendário sem mudança obrigatória

### Implementation for User Story 2

- [x] T006 [P] [US2] Em `frontend/src/pages/Dashboard.tsx`, aplicar `PAGE_HEADER_COMBINED_STICKY_CLASS` no card de título + mês/ano/visão Líquido·Bruto; **não** sticky no bloco “Limiar do Alerta” nem nos cards/gráficos abaixo
- [x] T007 [P] [US2] Em `frontend/src/pages/NFs.tsx`, dual sticky: título/ações + barra de filtros via `PAGE_TITLE_STICKY_CLASS` / `PAGE_FILTERS_STICKY_CLASS`; sem regressão da grade dual / sticky de colunas
- [x] T008 [P] [US2] Em `frontend/src/pages/Bonus.tsx`, dual sticky no card de título/ações e na barra de filtros (fornecedor/ano/recorte)
- [x] T009 [P] [US2] Em `frontend/src/pages/Ferias.tsx`, dual sticky no título e na barra de filtros; banner de aviso laranja **sem** sticky (rola como KPI)
- [x] T010 [P] [US2] Em `frontend/src/pages/DH.tsx`, dual sticky (título + filtros); KPIs entre título e filtros **sem** sticky (mesmo padrão Contas)
- [x] T011 [P] [US2] Em `frontend/src/pages/Fornecedores.tsx`, dual sticky no título e na barra de filtro (cargo)
- [x] T012 [P] [US2] Em `frontend/src/pages/Auditoria.tsx`, dual sticky no título e na barra de filtros (entidade/ação)
- [x] T013 [P] [US2] Em `frontend/src/pages/Patrimonio.tsx`, sticky combinado no card único (título + busca + filtros + ações) via `PAGE_HEADER_COMBINED_STICKY_CLASS`
- [x] T014 [P] [US2] Em `frontend/src/pages/Impostos.tsx`, sticky combinado no card título + ano/comparativo
- [x] T015 [P] [US2] Em `frontend/src/pages/Retiradas.tsx`, sticky combinado no card título + ano/ações; cards de KPI abaixo **sem** sticky
- [x] T016 [US2] Confirmar telas fora de escopo sem mudança obrigatória (`Calendario.tsx`, `Seguranca.tsx`, `Contratos.tsx`, `Configuracoes.tsx` sem filtro de listagem no topo); amostrar ≥5 telas do escopo conforme [quickstart.md](./quickstart.md) (FR-001, FR-004, SC-002)

**Checkpoint**: Cobertura cross-página (US2) completa; Dashboard incluído

---

## Phase 5: User Story 3 - Não cobrir conteúdo nem atrapalhar ações (Priority: P2)

**Goal**: Ações do cabeçalho seguem utilizáveis; fundo opaco em claro/escuro; sem regressão de tabela sticky (073) nem de modais

**Independent Test**: Com página rolada, clicar exportar/criar no cabeçalho; tema escuro legível; rolar área interna da tabela em Contas — `th` sticky intacto; abrir modal a partir do cabeçalho

### Implementation for User Story 3

- [x] T017 [US3] Em `frontend/src/pages/Contas.tsx` (e ao menos Fluxo ou NFs), validar botões do cabeçalho sticky após scroll; ajustar z-index/padding só se controle ficar inacessível (FR-007)
- [x] T018 [P] [US3] Revisar amostra ≥5 páginas do escopo em tema escuro — fundos sticky opacos, texto legível; corrigir semi-transparência se houver (FR-006, SC-003)
- [x] T019 [US3] Validar que sticky de colunas (`tableScroll.ts` / Contas·NFs) e scroll interno da tabela **não** regrediram; z-index do cabeçalho de página (`z-20`/`z-30`) permanece abaixo do header global `z-50` e não cobre modais (FR-005)

**Checkpoint**: US3 atendida — sticky sem regressão de ações/legibilidade/tabela

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final e qualidade

- [x] T020 Executar checklist de [quickstart.md](./quickstart.md) (Fluxo, Dashboard, Contas KPIs, amostra ≥5, modal, fora de escopo)
- [x] T021 [P] Em `frontend/`, rodar `npm run lint` e `npm run type-check` sem erros novos introduzidos por esta feature
- [x] T022 Ajustar offset de `PAGE_FILTERS_STICKY_CLASS` em `frontend/src/utils/pageHeaderSticky.ts` se, em viewport estreita, restar faixa vazia sistemática entre título e filtros (SC-005) — documentar o valor final no comentário do utilitário

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → sem dependências
- **Phase 2 (Foundational)** → após T001; **bloqueia** US1–US3
- **Phase 3 (US1)** → após T002–T003; MVP
- **Phase 4 (US2)** → após Phase 2 (pode em paralelo a polish de US1 após T005)
- **Phase 5 (US3)** → após amostra US2 aplicada (idealmente após T016)
- **Phase 6 (Polish)** → após US1–US3

### User Story Dependencies

- **US1**: Independente após fundação (Contas + validação Fluxo)
- **US2**: Independente por arquivo de página; depende só de `pageHeaderSticky.ts`
- **US3**: Validação/ajustes sobre páginas já sticky

### Within Each User Story

- Aplicar constantes → validar scroll/filtros → (US3) tema/ações/regressões

### Parallel Opportunities

- Após T002: T003 sequencial na referência Fluxo
- Após Phase 2: T006–T015 em paralelo (arquivos distintos)
- T018 e T021 em paralelo no polish relativo

---

## Parallel Example: User Story 2

```text
# Após T002–T003, em paralelo:
T006 Dashboard.tsx (combinado)
T007 NFs.tsx (dual)
T008 Bonus.tsx (dual)
T009 Ferias.tsx (dual)
T010 DH.tsx (dual + KPIs)
T011 Fornecedores.tsx (dual)
T012 Auditoria.tsx (dual)
T013 Patrimonio.tsx (combinado)
T014 Impostos.tsx (combinado)
T015 Retiradas.tsx (combinado)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. T001–T003 (setup + constantes + Fluxo)
2. T004–T005 (Contas dual + KPIs)
3. **STOP e validar** Contas/Fluxo no browser (porta 5193)

### Incremental Delivery

1. Fundation + Fluxo → baseline offset Layout
2. US1 Contas → prova dual + KPIs
3. US2 demais páginas + Dashboard → cobertura
4. US3 + polish → aceite quickstart

### Suggested MVP Scope

T001–T005 (Setup + Foundational + US1). Entrega demonstrável: filtros fixos em Fluxo e Contas com KPIs rolando.

---

## Notes

- [P] = arquivos diferentes, sem dependência incompleta entre si
- Sem tarefas de teste automatizado (spec não pediu)
- Commitar só se o usuário pedir
- Contagem: **22 tarefas** (T001–T022)
