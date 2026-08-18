# Tasks: Tabela Contas a Receber — Cabeçalho em Duas Linhas e Coluna/Cabeçalho Fixos

**Input**: Design documents from `/specs/033-contas-receber-tabela/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contas-receber-tabela.md](./contracts/ui-contas-receber-tabela.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Tarefas por história (P1 US1 → P1 US2 → P1 US3). Sem `[P]` quando o mesmo arquivo seria editado em paralelo (`NFs.tsx`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Frontend: `frontend/src/`
- Página alvo: `frontend/src/pages/NFs.tsx` (Contas a Receber, rota `/nfs`)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo e sem dependência nova

- [x] T001 Confirmar portas 5193/8001 e que o escopo é só a grade em `frontend/src/pages/NFs.tsx` (sem API, sem menu em `frontend/src/components/Layout.tsx`, sem outras páginas)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Área da tabela com altura restante da tela e paginação fora do scroll — bloqueia as histórias de sticky e rolagem

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `frontend/src/pages/NFs.tsx`, transformar o wrapper da página em coluna flex com altura limitada ao viewport abaixo do header do Layout (`calc(100vh - header - padding do main)` conforme [research.md](./research.md)): título/botões, filtros e cards `shrink-0`; card da lista `flex-1 min-h-0 flex flex-col`
- [x] T003 Se T002 não preencher o restante da tela, aplicar o menor ajuste de cadeia flex/`min-h-0` em `frontend/src/components/Layout.tsx` **somente o necessário** para `/nfs`, sem `overflow-hidden` global que trave o scroll das outras rotas
- [x] T004 Em `frontend/src/pages/NFs.tsx`, colocar loading/vazio no card; com dados, isolar a grade em um viewport `flex-1 min-h-0` e manter `Pagination` **abaixo** desse viewport (sempre visível no card), conforme [contracts/ui-contas-receber-tabela.md](./contracts/ui-contas-receber-tabela.md)

**Checkpoint**: Na tela Contas a Receber, a lista usa o espaço restante da janela; paginação não some ao “descer as linhas”; outras páginas ainda rolam normalmente

---

## Phase 3: User Story 1 - Cabeçalho em duas linhas (Priority: P1) 🎯 MVP

**Goal**: Nomes das colunas quebram em até duas linhas; a linha de cabeçalho fica mais alta; colunas não se alargam só pelo rótulo em uma linha

**Independent Test**: Abrir Contas a Receber e ver “Método de pagamento” / “Data ent. pgto” em até duas linhas; “NF”/“Bruto” podem ficar em uma; células de dados (projeto) inalteradas

### Implementation for User Story 1

- [x] T005 [US1] Remover `whitespace-nowrap` dos `th` de dados em `frontend/src/pages/NFs.tsx`; aplicar quebra (`whitespace-normal`, `break-words`) e limite de duas linhas (`line-clamp-2` ou equivalente) + `title` com o nome completo
- [x] T006 [US1] Ajustar altura mínima do `thead` e leading compacto em `frontend/src/pages/NFs.tsx` para caber duas linhas; manter ícone de ordenação (`SortIcon`) na mesma célula sem impedir a quebra
- [x] T007 [US1] Reduzir `min-w` da tabela / larguras mínimas das colunas em `frontend/src/pages/NFs.tsx` para o ganho de espaço; **não** aplicar quebra de duas linhas nas células de dados (FR-011)

**Checkpoint**: SC-001, SC-002; FR-001, FR-002, FR-003, FR-011

---

## Phase 4: User Story 2 - Primeira coluna, Ações e cabeçalho fixos (Priority: P1)

**Goal**: Ao rolar a grade, o cabeçalho fica no topo da área da tabela; Projeto à esquerda e Ações à direita permanecem visíveis

**Independent Test**: Com overflow na grade, rolar vertical e horizontal e confirmar thead + primeira coluna + Ações fixos e alinhados (cantos superiores visíveis)

### Implementation for User Story 2

- [x] T008 [US2] Tornar `thead` sticky no topo do viewport da grade (`sticky top-0`, fundo opaco claro/escuro, z-index acima das células) em `frontend/src/pages/NFs.tsx`
- [x] T009 [US2] Sticky à esquerda na primeira coluna (`th`/`td` Projeto) com fundo da linha (`rowBg`) / fundo do thead em `frontend/src/pages/NFs.tsx`; z-index do canto Projeto no cabeçalho maior que o corpo
- [x] T010 [US2] Garantir sticky à direita na coluna Ações (já existente) com fundo da linha e canto do `th` Ações no mesmo z-index de canto; visualizador mantém a coluna fixa sem botões de escrita em `frontend/src/pages/NFs.tsx`

**Checkpoint**: SC-003 (parcial, cabeçalho visível na área), SC-004; FR-004, FR-005, FR-010, FR-012

---

## Phase 5: User Story 3 - Scroll vertical no corpo e horizontal no cabeçalho (Priority: P1)

**Goal**: Scroll vertical só nas linhas; controle de scroll horizontal junto aos nomes das colunas, sincronizado com o corpo

**Independent Test**: Trilho horizontal no topo da grade desloca as colunas do meio; Projeto e Ações ficam; não precisa ir ao fim da lista nem ao rodapé da página para rolar colunas; título/filtros não descem com as linhas

### Implementation for User Story 3

- [x] T011 [US3] Separar o viewport da grade em trilho horizontal no topo (`overflow-x-auto`) e corpo (`overflow-y-auto`, `overflow-x-hidden`) em `frontend/src/pages/NFs.tsx`, conforme [research.md](./research.md)
- [x] T012 [US3] Sincronizar `scrollLeft` entre trilho e tabela (refs + `onScroll`; encaminhar gesto horizontal/shift+roda do corpo ao trilho) em `frontend/src/pages/NFs.tsx` para FR-007 e FR-008
- [x] T013 [US3] Confirmar que o cabeçalho **não** gruda no header global do Layout; loading e lista vazia continuam sem trilho falso em `frontend/src/pages/NFs.tsx`

**Checkpoint**: SC-003, SC-004, SC-006; FR-006, FR-007, FR-008, FR-009

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regressão, resize, lint e roteiro de validação

- [x] T014 Verificar resize da janela: área da tabela acompanha altura/largura; sticky e alinhamento se mantêm em `frontend/src/pages/NFs.tsx`
- [x] T015 Confirmar filtros, ordenação, paginação, export e modais (criar/editar/pagar) intactos em `frontend/src/pages/NFs.tsx` (FR-009)
- [x] T016 Executar `npm run lint` e `npm run type-check` em `frontend/` e percorrer [quickstart.md](./quickstart.md) (incluindo visualizador e uma página que não seja NFs)

**Checkpoint**: Feature pronta para `/speckit-implement` / demo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — BLOQUEIA as histórias (área de altura restante)
- **US1 (Phase 3)**: Depende da Phase 2 — MVP de quebra do cabeçalho
- **US2 (Phase 4)**: Depende da Phase 2; na prática após US1 no mesmo arquivo
- **US3 (Phase 5)**: Depende de US2 (sticky precisa do viewport + trilho sem dessincronizar colunas)
- **Polish (Phase 6)**: Depende das três histórias

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 — cabeçalho em duas linhas mesmo sem sticky perfeito
- **User Story 2 (P1)**: Após Phase 2; integra com o `thead` da US1 no mesmo `NFs.tsx`
- **User Story 3 (P1)**: Após US2 — trilho horizontal não deve desfazer sticky

Todas as histórias P1 editam `frontend/src/pages/NFs.tsx`: **execução sequencial** (não paralelizar US1/US2/US3).

### Parallel Opportunities

- Quase nenhuma: um arquivo principal. T003 (`Layout.tsx`) só se T002 falhar — não paralelo a T002.
- T016 (lint/type-check) depois do código estável.

---

## Parallel Example: User Story 1

Não aplicável — T005–T007 no mesmo `frontend/src/pages/NFs.tsx`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (altura da área)
2. Phase 3: cabeçalho em duas linhas
3. **STOP and VALIDATE**: nomes longos quebram; dados inalterados
4. Demo parcial se quiser, depois US2 + US3 (pedido original inclui sticky e scrolls)

### Incremental Delivery

1. Setup + Foundational → área restante da tela
2. US1 → cabeçalho em 2 linhas (MVP visual)
3. US2 → colunas/cabeçalho fixos
4. US3 → scroll horizontal no título + vertical interno
5. Polish → quickstart

### Parallel Team Strategy

Um implementador no `NFs.tsx`. Não dividir histórias entre pessoas no mesmo arquivo.

---

## Notes

- Sem `[P]` em tarefas que tocam o mesmo arquivo ao mesmo tempo
- Sem tarefas de teste automatizado (spec não pediu TDD)
- Validar em `http://localhost:5193` rota Contas a Receber
- Não alterar Contas a Pagar, Dashboard nem contratos REST
