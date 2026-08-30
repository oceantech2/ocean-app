# Tasks: Contas a Pagar — Listagem em Tabela com Colunas Tipo, Categoria e Mês/Ano

**Input**: Design documents from `/specs/046-contas-pagar-listagem-colunas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contas-pagar-listagem-colunas.md](./contracts/ui-contas-pagar-listagem-colunas.md), [contracts/rest-contas-pagar-listagem-colunas.md](./contracts/rest-contas-pagar-listagem-colunas.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md). Testes Vitest opcionais para helpers na fase Polish.

**Organization**: Tarefas por história (P1 US1 → US2 → US3 → P2 US4). Sem `[P]` em edições simultâneas do mesmo arquivo (`Contas.tsx`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US4 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/`
- Backend (export XLSX): `backend/app/`
- Página alvo: `frontend/src/pages/Contas.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte e ambiente; sem migration, sem campos novos no banco

- [x] T001 Confirmar portas 5193/8001 e escopo: tabela plana + filtro Mês/Ano em `frontend/src/pages/Contas.tsx`; helpers em `frontend/src/utils/`; export estendido em `backend/app/api/routes/contas.py` e `backend/app/services/excel_io.py`; **não** alterar schema PostgreSQL nem `GET /api/contas/` (listagem)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helpers puros de rótulo Mês/Ano, anos permitidos e match de competência — bloqueiam coluna e filtro

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 [P] Em `frontend/src/utils/contasPagarAgrupamento.ts`, adicionar `rotuloMesAnoColuna(dataVencimento?)` retornando `"Agosto/2026"` (mês por extenso + `/` + ano, pt-BR) ou `—` sem vencimento; reutilizar `chaveMesVencimento` existente (sem `new Date('YYYY-MM-DD')` para a chave)
- [x] T003 [P] Criar `frontend/src/utils/contasPagarFiltroMes.ts` com: `anosPermitidosContasPagar(anoCorrente)` → `[corrente-5 … corrente+5]`; `mesesDisponiveis()` → `[1..12]`; `passaFiltroMesAno(conta, mes, ano, todos)` comparando `chaveMesVencimento` a `` `${ano}-${String(mes).padStart(2,'0')}` `` (excluir sem vencimento se não `todos`)

**Checkpoint**: Helpers importáveis; `rotuloMesAnoColuna('2026-08-15')` → `Agosto/2026`; filtro competência testável isoladamente

---

## Phase 3: User Story 1 - Tabela plana com colunas Tipo, Categoria e Mês/Ano (Priority: P1) 🎯 MVP

**Goal**: Uma única tabela sem agrupamento; colunas na ordem fixa; Tipo, Categoria e Mês/Ano visíveis em cada linha; ordenação padrão vencimento asc

**Independent Test**: Quickstart cenário 1: sem blocos por mês/categoria; ordem das colunas correta; RH com subcategoria; sem vencimento com `—` (só visível após US2 com Todos)

### Implementation for User Story 1

- [x] T004 [US1] Em `frontend/src/pages/Contas.tsx`, remover estado e lógica de agrupamento da feature `034`: `gruposAbertos`, `gruposLista`, `resetColapsoMesRef`, `alternarGrupoMes`, subgrupos por categoria dentro de mês, imports não usados de `agruparPorMes` / `chaveMesInicialAberta` / `totalGrupo` (FR-014)
- [x] T005 [US1] Em `frontend/src/pages/Contas.tsx`, substituir o loop de cards colapsáveis por **uma** `<table>` sobre `ordenar(contasFiltradas)` (FR-001)
- [x] T006 [US1] Em `frontend/src/pages/Contas.tsx`, definir cabeçalhos e células na ordem fixa: Descrição → Categoria → Mês/Ano → Fornecedor → Valor → Vencimento → Pagamento → Conta → Tipo → Status → Nota fiscal → Ações (FR-001a)
- [x] T007 [US1] Em `frontend/src/pages/Contas.tsx`, popular colunas **Categoria** (`categoriaLabel`), **Mês/Ano** (`rotuloMesAnoColuna`) e **Tipo** (`labelTipoDespesa`); manter badge Reclassificar na Descrição quando `categoria_pendente` (FR-002, FR-003, FR-004)
- [x] T008 [US1] Em `frontend/src/pages/Contas.tsx`, garantir `sortField`/`sortDir` padrão `data_vencimento` / `asc` e contas sem vencimento após as datadas na ordenação por vencimento (FR-010a)

**Checkpoint**: SC-003 (colunas); tabela plana visível; agrupamento removido; ainda sem filtro Mês/Ano dedicado (US2)

---

## Phase 4: User Story 2 - Filtrar por Mês/Ano com padrão corrente e opção Todos (Priority: P1)

**Goal**: Seletores Mês + Ano + **Todos**; padrão mês/ano civis correntes; meses futuros permitidos; ano corrente ±5

**Independent Test**: Quickstart cenário 2: ao abrir, só mês corrente; **Todos** lista multi-mês; anos 2021–2031 se corrente=2026; setembro futuro selecionável

### Implementation for User Story 2

- [x] T009 [US2] Em `frontend/src/pages/Contas.tsx`, adicionar estado local: `contasMesTodos` (default `false`), `contasMes` (default mês civil corrente), `contasAno` (default ano civil corrente) — **não** persistir em `frontend/src/store/index.ts` (FR-005, FR-006)
- [x] T010 [US2] Em `frontend/src/pages/Contas.tsx`, na barra de filtros, adicionar checkbox/toggle **Todos** + `<select>` **Mês** (jan–dez) + `<select>` **Ano** (`anosPermitidosContasPagar`); desabilitar Mês/Ano quando **Todos** ativo (FR-007, FR-007a, FR-007b)
- [x] T011 [US2] Em `frontend/src/pages/Contas.tsx`, estender `contasFiltradas` com `passaFiltroMesAno` de `frontend/src/utils/contasPagarFiltroMes.ts` (interseção com filtros existentes) (FR-008)
- [x] T012 [US2] Em `frontend/src/pages/Contas.tsx`, adicionar `useEffect`: quando `contasAlertaVencimento` ∈ `{ hoje, 7dias, vencida }`, forçar `contasMesTodos = true` (links de notificação em `frontend/src/components/Layout.tsx`); ao limpar alerta, restaurar mês/ano correntes se aplicável ([research.md](./research.md) §4)

**Checkpoint**: SC-001, SC-002; FR-005 a FR-007b; contas sem vencimento só em **Todos**

---

## Phase 5: User Story 3 - Combinar filtro Mês/Ano com demais recortes e cards (Priority: P1)

**Goal**: Filtros combinados por interseção; cards Total/Pago/A pagar/Vencido = soma das linhas visíveis; reset de ordenação ao mudar filtros

**Independent Test**: Quickstart cenário 3: Marketing + mês corrente; cards batem com linhas; Total = Pago + A pagar + Vencido

### Implementation for User Story 3

- [x] T013 [US3] Em `frontend/src/pages/Contas.tsx`, ao alterar qualquer filtro (Mês/Ano/Todos, categoria, status, descrição, datas), resetar `sortField` para `data_vencimento` e `sortDir` para `asc` (FR-010a)
- [x] T014 [US3] Em `frontend/src/pages/Contas.tsx`, confirmar que `totaisCards` usa `contasFiltradas` **após** filtro Mês/Ano (já inclui alertas e datas locais) e mantém parcelas mutuamente exclusivas (FR-009)
- [x] T015 [US3] Em `frontend/src/pages/Contas.tsx`, validar interseção Mês/Ano + intervalo venc. de/até + categoria + status; estado vazio claro sem linhas fantasma (FR-008; edge cases spec)
- [x] T016 [US3] Em `frontend/src/pages/Contas.tsx`, conferir papel `visualizador`: mesmos filtros e tabela; sem ações de escrita (FR-012)

**Checkpoint**: SC-004; FR-008, FR-009, FR-012

---

## Phase 6: User Story 4 - Ordenar e exportar com as novas colunas (Priority: P2)

**Goal**: Ordenação por Categoria, Mês/Ano e Tipo; CSV/Excel/PDF com colunas alinhadas à tabela

**Independent Test**: Quickstart cenários 4 e 6: sort por Mês/Ano desc; CSV com colunas na ordem; Excel com Categoria/Mês/Ano/Tipo

### Implementation for User Story 4

- [x] T017 [US4] Em `frontend/src/pages/Contas.tsx`, estender `ordenar()` / `alternarOrdenacao` para campos `categoria` (rótulo legível), `mes_ano` (chave `YYYY-MM`; sem vencimento no final em asc) e `tipo_despesa` (FR-010)
- [x] T018 [US4] Em `frontend/src/pages/Contas.tsx`, atualizar `exportar` (CSV) para ordem FR-001a e colunas Categoria, Mês/Ano, Tipo a partir de `contasFiltradas` ordenadas (FR-011)
- [x] T019 [US4] Em `frontend/src/services/api.ts`, alterar `contasService.exportarXlsx` para aceitar e enviar `{ categoria, subcategoria, pago, mes, ano }` conforme [contracts/rest-contas-pagar-listagem-colunas.md](./contracts/rest-contas-pagar-listagem-colunas.md)
- [x] T020 [US4] Em `frontend/src/pages/Contas.tsx`, passar estado atual dos filtros (incl. omitir mes/ano se **Todos**) ao chamar `exportarXlsx`
- [x] T021 [US4] Em `backend/app/api/routes/contas.py`, estender `exportar_contas_xlsx` com query params `categoria`, `subcategoria`, `pago` (mesma regra de `listar_contas`) + `mes`/`ano` opcionais
- [x] T022 [US4] Em `backend/app/services/excel_io.py`, incluir colunas **Categoria**, **Mês/Ano**, **Tipo** (e ordem lógica alinhada à tabela) no export do template contas
- [x] T023 [US4] Em `frontend/src/pages/Contas.tsx`, revisar impressão PDF (`window.print()`): tabela visível com colunas novas legíveis (CSS print existente ou ajuste mínimo em `Contas.tsx`/estilos globais) (FR-011)

**Checkpoint**: SC-006; FR-010, FR-011

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Limpeza, testes de helper, qualidade e validação ponta a ponta

- [x] T024 [P] Remover funções mortas de `frontend/src/utils/contasPagarAgrupamento.ts` (`agruparPorMes`, `chaveMesInicialAberta`, `rotuloGrupoMes`, etc.) se não houver outros imports no repo
- [ ] T025 [P] Criar `frontend/src/utils/contasPagarFiltroMes.test.ts` (Vitest) cobrindo `rotuloMesAnoColuna`, `passaFiltroMesAno` e `anosPermitidosContasPagar` — **adiado**: projeto sem Vitest configurado
- [x] T026 Em `frontend/src/pages/Contas.tsx`, rótulos acessíveis nos seletores Mês, Ano e opção Todos conforme [contracts/ui-contas-pagar-listagem-colunas.md](./contracts/ui-contas-pagar-listagem-colunas.md)
- [x] T027 Rodar `npm run lint` e `npm run type-check` em `frontend/` — `Contas.tsx` sem erros; falhas pré-existentes em `Dashboard.tsx`/`DH.tsx`; ESLint sem config no projeto
- [ ] T028 Percorrer [quickstart.md](./quickstart.md) (cenários 1–7) em `http://localhost:5193` contra API `8001` — validação manual pendente

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de T001 — **bloqueia** US1–US4
- **US1 (Phase 3)**: Depende da Phase 2 — **MVP** (tabela plana)
- **US2 (Phase 4)**: Depende de US1 (mesmo `Contas.tsx` e `contasFiltradas`)
- **US3 (Phase 5)**: Depende de US2 (filtro Mês/Ano ativo)
- **US4 (Phase 6)**: Depende de US1 (colunas); export CSV/PDF após US2/US3; backend T021–T022 paralelos ao frontend após T019
- **Polish (Phase 7)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2; remove agrupamento `034`; base da tabela
- **User Story 2 (P1)**: Após US1; filtro mensal no mesmo arquivo
- **User Story 3 (P1)**: Após US2; cards e interseção de filtros
- **User Story 4 (P2)**: Após US1 (sort/export colunas); idealmente após US2/US3 para export com recorte correto

### Parallel Opportunities

- **Phase 2**: T002 e T003 em paralelo (arquivos diferentes)
- **Phase 6**: T021 (`contas.py`) e T022 (`excel_io.py`) em paralelo após T019
- **Phase 7**: T024 e T025 em paralelo
- **Não paralelizar** T004–T016 no mesmo `Contas.tsx`

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Helpers em arquivos distintos:
Task T002: rotuloMesAnoColuna em frontend/src/utils/contasPagarAgrupamento.ts
Task T003: contasPagarFiltroMes.ts
```

---

## Parallel Example: User Story 4 (Backend export)

```bash
# Após T019 (api.ts):
Task T021: backend/app/api/routes/contas.py
Task T022: backend/app/services/excel_io.py
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Phase 1: Setup (T001)
2. Phase 2: Foundational (T002–T003)
3. Phase 3: US1 — tabela plana e colunas (T004–T008)
4. Phase 4: US2 — filtro Mês/Ano (T009–T012)
5. **STOP and VALIDATE**: Quickstart cenários 1–2
6. Entrega mínima utilizável: listagem plana com recorte mensal padrão

### Incremental Delivery

1. Setup + Foundational → helpers prontos
2. US1 → tabela plana (sem filtro mensal ainda incompleto para operação diária)
3. US2 → filtro Mês/Ano + **Todos** → **MVP operacional**
4. US3 → cards e combinação de filtros
5. US4 → ordenação extra + exportações
6. Polish → lint, testes helper, quickstart completo

### Parallel Team Strategy

- Dev A: US1 + US2 + US3 sequencial em `Contas.tsx`
- Dev B (após US2): US4 backend T021–T022 enquanto Dev A faz US3
- Dev B: US4 frontend export wiring T017–T020, T023

---

## Notes

- Substitui comportamento da feature `034`; não reintroduz toggle Por mês / Por categoria
- Filtro Mês/Ano é **client-side**; listagem API inalterada
- Excel server-side não replica filtros locais (descrição/intervalo); CSV/PDF sim — ver contrato REST
- `[P]` = arquivos diferentes; `Contas.tsx` = sequencial
- Total de tarefas: **28** (T001–T028)
