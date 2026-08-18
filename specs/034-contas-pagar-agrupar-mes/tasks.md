# Tasks: Contas a Pagar — Agrupar por Mês e Filtrar por Categorias

**Input**: Design documents from `/specs/034-contas-pagar-agrupar-mes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contas-pagar-agrupar-mes.md](./contracts/ui-contas-pagar-agrupar-mes.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2 → P2 US3). Sem `[P]` em edições simultâneas do mesmo arquivo (`Contas.tsx`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/`
- Página alvo: `frontend/src/pages/Contas.tsx` (Contas a Pagar)
- Helper: `frontend/src/utils/contasPagarAgrupamento.ts`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova, sem API

- [x] T001 Confirmar portas 5193/8001 e escopo só frontend: `frontend/src/pages/Contas.tsx` + `frontend/src/utils/contasPagarAgrupamento.ts`; não alterar `backend/app/api/routes/contas.py`, `frontend/src/store/index.ts` (filtros) nem outras páginas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Funções puras de chave/rótulo/ordem/total — bloqueiam o modo Por mês na página

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Criar `frontend/src/utils/contasPagarAgrupamento.ts` com: extração de chave `YYYY-MM` a partir de `data_vencimento` **sem** `new Date('YYYY-MM-DD')` (fuso); sentinela `sem-vencimento`; rótulo pt-BR (“Agosto 2026”) via `Date(ano, mes-1, 1)` + `toLocaleString('pt-BR')` com primeira letra maiúscula; ordenação meses decrescente + sentinela por último; soma de `valor`; `chaveMesInicialAberta` (primeiro `YYYY-MM` visível, ou a única chave se só existir sentinela)

**Checkpoint**: Helper importável; datas ISO não “voltam um dia”; ordem e rótulos conferíveis no console ou uso imediato na US1

---

## Phase 3: User Story 1 - Agrupar a listagem por mês de vencimento (Priority: P1) 🎯 MVP

**Goal**: Abrir Contas a Pagar já em Por mês; trocar para Por categoria; total único no cabeçalho; colapso só no modo mês (mês mais recente datado aberto)

**Independent Test**: Quickstart cenários 1–3: entrar na página agrupado por mês; só o mês mais recente aberto; abrir outro mês; Por categoria todos abertos; voltar a Por mês reseta o colapso

### Implementation for User Story 1

- [x] T003 [US1] Em `frontend/src/pages/Contas.tsx`, adicionar estado local `modoAgrupamento` (`'mes' | 'categoria'`) com padrão `'mes'` (não persistir em `frontend/src/store/index.ts`)
- [x] T004 [US1] Em `frontend/src/pages/Contas.tsx`, montar os grupos a partir de `contasFiltradas`: modo `categoria` mantém `grupoKey` / `tituloGrupo` atuais (sempre abertos); modo `mes` usa `frontend/src/utils/contasPagarAgrupamento.ts` (chave, rótulo, ordem, total)
- [x] T005 [US1] Em `frontend/src/pages/Contas.tsx`, na barra de filtros, adicionar controle **Agrupar** (Por mês / Por categoria) conforme [contracts/ui-contas-pagar-agrupar-mes.md](./contracts/ui-contas-pagar-agrupar-mes.md); troca de modo não limpa filtros
- [x] T006 [US1] Em `frontend/src/pages/Contas.tsx`, no modo mês: cabeçalho do card abre/fecha o grupo; estado de chaves abertas; inicial = `chaveMesInicialAberta`; tabela só se aberto; total visível fechado; modo categoria sem colapso
- [x] T007 [US1] Em `frontend/src/pages/Contas.tsx`, ao selecionar de novo Por mês, reaplicar o colapso inicial; grupo único começa aberto; “Sem vencimento” no fim e fechado se houver mês datado

**Checkpoint**: SC-001, SC-002; FR-001 a FR-005, FR-014 (exceto limpeza de chaves ao filtrar, US3)

---

## Phase 4: User Story 2 - Filtrar por categorias, incluindo Recursos Humanos (Priority: P1)

**Goal**: Filtros de categoria e subcategoria RH continuam iguais e valem nos dois modos de agrupamento

**Independent Test**: Quickstart cenário 4: RH (todas) e RH/Salário em Por mês e Por categoria; outras categorias não aparecem; meses vazios somem

### Implementation for User Story 2

- [x] T008 [US2] Em `frontend/src/pages/Contas.tsx`, garantir que os `<select>` Categorias e Subcategoria RH (já existentes) permanecem visíveis e que `carregarContas` segue passando `contasCategoria` / `contasSubcategoria` para `frontend/src/services/api.ts` nos dois modos
- [x] T009 [US2] Em `frontend/src/pages/Contas.tsx`, confirmar que grupos (mês e categoria) usam só `contasFiltradas` após a resposta da API (pendentes de reclassificação fora do filtro nomeado, conforme backend atual em `backend/app/api/routes/contas.py`); não filtrar categoria de novo no cliente de forma que duplique ou anule a API
- [x] T010 [US2] Em `frontend/src/pages/Contas.tsx`, conferir papel `visualizador`: mesmos filtros e agrupamento, sem ações de escrita (botões já condicionados a `papel === 'admin'`)

**Checkpoint**: SC-003, SC-004; FR-006, FR-007, FR-008, FR-011, FR-012

---

## Phase 5: User Story 3 - Combinar agrupamento, filtro de categoria e demais recortes (Priority: P2)

**Goal**: Status, descrição e intervalo de vencimento combinam com categoria e com o agrupamento; sem grupos fantasma; modo não reseta ao filtrar

**Independent Test**: Quickstart cenários 5–6: RH + pendente + datas; vazio sem cards; troca Agrupar mantém filtros; pendente de reclassificação no mês se filtro Todas

### Implementation for User Story 3

- [x] T011 [US3] Em `frontend/src/pages/Contas.tsx`, ao mudar `contasFiltradas` no modo mês, remover chaves abertas que sumiram; se nenhuma chave aberta restar entre as visíveis, abrir `chaveMesInicialAberta` (ver [research.md](./research.md) §7)
- [x] T012 [US3] Em `frontend/src/pages/Contas.tsx`, manter a mensagem “Nenhuma conta encontrada” quando não houver grupos; não renderizar card com lista vazia
- [x] T013 [US3] Em `frontend/src/pages/Contas.tsx`, garantir FR-010: alterar status, busca, venc. de/até ou categoria **não** reseta `modoAgrupamento`; alterar modo **não** limpa esses filtros

**Checkpoint**: SC-005; FR-009, FR-010

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Acessibilidade, qualidade e validação ponta a ponta

- [x] T014 Em `frontend/src/pages/Contas.tsx`, no cabeçalho acionável do modo mês, usar botão (ou equivalente) com `aria-expanded` conforme [contracts/ui-contas-pagar-agrupar-mes.md](./contracts/ui-contas-pagar-agrupar-mes.md); dark mode igual aos cards atuais
- [x] T015 Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T016 Percorrer [quickstart.md](./quickstart.md) (cenários 1–7) em `http://localhost:5193` contra API `8001`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende de T001 — **bloqueia** US1–US3
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende de US1 (mesmos grupos em `Contas.tsx`); filtro já existe, tarefas amarram o recorte aos dois modos
- **US3 (Phase 5)**: Depende de US1 (estado de chaves abertas) e se beneficia de US2
- **Polish (Phase 6)**: Depois das histórias desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2; sem dependência de US2/US3
- **User Story 2 (P1)**: Após US1 no mesmo arquivo (não paralelizar com T003–T007)
- **User Story 3 (P2)**: Após US1 (colapso); após US2 para validar combinação com RH

### Parallel Opportunities

- Quase nenhuma: T002 é o único arquivo distinto; depois tudo concentra em `Contas.tsx`
- T015 pode coincidir com revisão manual do quickstart se o lint já passou

### Parallel Example: Foundational

```bash
# Único arquivo novo — não paralelizar com Contas.tsx ainda:
Task: "Criar frontend/src/utils/contasPagarAgrupamento.ts (T002)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (helper)
2. Phase 3: modo mês, controle Agrupar, colapso
3. **STOP**: validar quickstart 1–3
4. Demo se o recorte mensal já resolve o pedido principal

### Incremental Delivery

1. Setup + helper
2. US1 → demo agrupamento por mês
3. US2 → demo filtro RH nos dois modos
4. US3 → demo combinação e vazio
5. Polish + quickstart completo

### Parallel Team Strategy

Um desenvolvedor em sequência (mesmo arquivo de página). Não dividir US1/US2/US3 em paralelo em `Contas.tsx`.

---

## Notes

- Sem tarefas de teste automatizado
- Não gravar agrupamento no Zustand
- Ordenação das **linhas** permanece `ordenar()` atual em `Contas.tsx`
- Próximo comando: `/speckit-implement`
