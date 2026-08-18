# Tasks: Contas a Receber — Alíquota do Mês no Tooltip de Imposto

**Input**: Design documents from `/specs/037-contas-receber-aliquota-tooltip/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/rest-impostos-de-contas.md](./contracts/rest-impostos-de-contas.md), [contracts/ui-contas-receber-aliquota-tooltip.md](./contracts/ui-contas-receber-aliquota-tooltip.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (US1 P1 → US2 P2). Sem `[P]` quando o mesmo arquivo seria editado em paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US2 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/`
- Backend inalterado nesta feature

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; não criar app, endpoint, menu nem portas novas

- [x] T001 Confirmar superfície única Contas a Receber = `frontend/src/pages/NFs.tsx` (rota `/nfs` em `frontend/src/App.tsx`) e que `impostosService.deContas` já existe em `frontend/src/services/api.ts`; portas 8001/5193 inalteradas; não alterar `frontend/src/pages/Impostos.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper de competência, disponibilidade e texto do tooltip — bloqueia as duas histórias

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Criar `frontend/src/utils/aliquotaMes.ts` conforme [data-model.md](./data-model.md) e [contracts/ui-contas-receber-aliquota-tooltip.md](./contracts/ui-contas-receber-aliquota-tooltip.md): competência (`data_emissao`, senão `data_vencimento`); chave `YYYY-MM`; percentual disponível só se `> 0`; textos `Alíquota do mês (MMM/AAAA): X,XX%` e `Alíquota do mês indisponível`; montar mapa a partir da lista `de-contas` (`mes`, `ano`, `percentual_imposto`)

**Checkpoint**: Funções puras prontas; a tabela ainda não mostra tooltip

---

## Phase 3: User Story 1 - Ver a alíquota do mês ao passar o cursor em Imposto (Priority: P1) 🎯 MVP

**Goal**: Na coluna Imposto da tabela de Contas a Receber, hover/foco mostram o % Imposto efetivo do mês de competência (igual à página Impostos), o mesmo para todas as linhas daquele mês; valor em reais na célula não muda

**Independent Test**: Mês com “% Imposto” numérico em Impostos; em Contas a Receber, hover na célula Imposto de um lançamento com emissão (ou vencimento) nesse mês mostra `Alíquota do mês (MMM/AAAA): X,XX%`; duas linhas do mesmo mês iguais; visualizador vê o mesmo

### Implementation for User Story 1

- [x] T003 [US1] Em `carregarNFs` de `frontend/src/pages/NFs.tsx`, além de `nfsService.listar`, buscar `impostosService.deContas(ano)` para cada ano de competência distinto das NFs carregadas (emissão/vencimento) conforme [contracts/rest-impostos-de-contas.md](./contracts/rest-impostos-de-contas.md) e [research.md](./research.md); guardar mapa via helper de `frontend/src/utils/aliquotaMes.ts`
- [x] T004 [US1] Na célula Imposto da tabela em `frontend/src/pages/NFs.tsx` (valor `fmtImposto` inalterado), envolver com controle focável (`tabIndex={0}`) com `title` e `aria-label` iguais ao texto do helper; admin e visualizador iguais; não alterar o modal de edição nem exportações

**Checkpoint**: SC-001/SC-002/SC-003 para linhas com percentual efetivo; FR-001/FR-002/FR-003/FR-005/FR-007/FR-008

---

## Phase 4: User Story 2 - Entender quando não há alíquota do mês (Priority: P2)

**Goal**: Sem percentual efetivo (ou competência indefinida, ou falha de `de-contas`), o tooltip abre com “Alíquota do mês indisponível”; célula Imposto “—” ainda mostra a alíquota do mês se ela existir; competência da linha, não o filtro da página

**Independent Test**: Mês com “—” em % Impostos → mensagem explícita; linha sem datas → mensagem; Imposto “—” com mês que tem % → ainda mostra alíquota; filtro de outro mês não troca o texto da linha

### Implementation for User Story 2

- [x] T005 [US2] Em `frontend/src/pages/NFs.tsx`, se `de-contas` falhar, mapa vazio (não inventar %; não bloquear a lista de NFs) e o helper de `frontend/src/utils/aliquotaMes.ts` devolver `Alíquota do mês indisponível` para competência indefinida ou percentual ≤ 0
- [x] T006 [US2] Garantir em `frontend/src/pages/NFs.tsx` os casos FR-004/FR-006/FR-009: competência pela linha (não pelo filtro `nfsMes`/`nfsAno`); célula “—” com % disponível ainda mostra alíquota rotulada como do mês; indisponível nunca usa % de outro mês

**Checkpoint**: US1 e US2 testáveis; quickstart passos 4–6

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade e validação ponta a ponta

- [x] T007 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T008 Executar o roteiro de [quickstart.md](./quickstart.md) (admin e visualizador; não regressão em Impostos/Dashboard/valor em reais da célula)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias
- **US1 (Phase 3)**: Depende do Foundational
- **US2 (Phase 4)**: Depende do US1 (mesma célula em `NFs.tsx`; completa os casos negativos)
- **Polish (Phase 5)**: Depende de US1+US2

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 — MVP
- **User Story 2 (P2)**: Após US1 no mesmo arquivo de página; helper já cobre os textos na Phase 2

### Parallel Opportunities

- Poucas: T001 isolada; o restante é sequencial no mesmo par `aliquotaMes.ts` / `NFs.tsx`
- Não marcar T003–T006 como `[P]` (mesmo `NFs.tsx`)

---

## Parallel Example: User Story 1

Não há tarefas `[P]` dentro da US1 (T003 e T004 no mesmo `frontend/src/pages/NFs.tsx`).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (helper)
2. Phase 3: carregar `de-contas` + tooltip na célula
3. **STOP**: validar hover/foco com % igual ao da tela Impostos

### Incremental Delivery

1. Setup + helper
2. US1 → demo do tooltip com alíquota
3. US2 → indisponível, “—”, competência da linha
4. Polish / quickstart

---

## Notes

- Backend sem tarefas — `GET /api/impostos/de-contas` já existe
- Não recalcular imposto÷bruto da linha
- Não alterar `Impostos.tsx`, Dashboard nem Contas a Pagar
- Commit após cada tarefa ou grupo lógico, se o usuário pedir
