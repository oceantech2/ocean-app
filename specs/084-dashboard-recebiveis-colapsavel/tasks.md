# Tasks: Previsão de Recebíveis Recolhível no Dashboard

**Input**: Design documents from `/specs/084-dashboard-recebiveis-colapsavel/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Estado fechado por padrão (US1) → alternância acessível com indicador (US2) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US2 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Página: `frontend/src/pages/Dashboard.tsx` (bloco "Previsão de Recebíveis")
- Ícone reutilizado: `frontend/src/components/navIcons.tsx` (`ChevronRightIcon`, sem alteração)
- Contrato UI: `specs/084-dashboard-recebiveis-colapsavel/contracts/ui-previsao-recebiveis-colapsavel.md`
- **Não alterar**: backend; `frontend/src/utils/agingRecebiveis.ts`; carregamento de dados do aging

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-previsao-recebiveis-colapsavel.md](./contracts/ui-previsao-recebiveis-colapsavel.md): só apresentação em `frontend/src/pages/Dashboard.tsx`; sem dependência nova; backend intocado

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Adicionar estado `agingAberto` (`useState<boolean>(false)`) junto aos estados de aging em `frontend/src/pages/Dashboard.tsx`

**Checkpoint**: Estado disponível — histórias podem começar

---

## Phase 3: User Story 1 - Ver Dashboard com a Previsão de Recebíveis recolhida (Priority: P1) 🎯 MVP

**Goal**: Seção inicia fechada mostrando apenas cabeçalho e total.

**Independent Test**: Abrir `/dashboard` → cabeçalho e "Total em aberto" visíveis; cards por faixa ocultos (quickstart cenários 1, 5, 6).

- [x] T003 [US1] Renderizar o grid de cards por faixa e a mensagem `agingErro` somente quando `agingAberto` for `true`, mantendo título, subtítulo e "Total em aberto" sempre visíveis, em `frontend/src/pages/Dashboard.tsx`

**Checkpoint**: US1 funcional (seção fechada por padrão)

---

## Phase 4: User Story 2 - Expandir e recolher a seção sob demanda (Priority: P1)

**Goal**: Cabeçalho clicável/teclado alterna a seção, com seta indicadora e ARIA.

**Independent Test**: Clicar/Enter/Espaço no cabeçalho alterna cards; seta rotaciona (quickstart cenários 2–4, 7, 8).

- [x] T004 [US2] Importar `ChevronRightIcon` de `../components/navIcons` em `frontend/src/pages/Dashboard.tsx`
- [x] T005 [US2] Transformar o cabeçalho da seção em `<button type="button">` com `onClick` alternando `agingAberto`, `aria-expanded`, `aria-controls="previsao-recebiveis-conteudo"` e foco visível, em `frontend/src/pages/Dashboard.tsx`
- [x] T006 [US2] Adicionar `ChevronRightIcon` à esquerda do título com `transition-transform` e `rotate-90` quando aberta; atribuir `id="previsao-recebiveis-conteudo"` ao contêiner do conteúdo recolhível em `frontend/src/pages/Dashboard.tsx`

**Checkpoint**: US1 + US2 completos

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T007 Rodar `npm run type-check` e `npm run lint` em `frontend/` sem erros novos (type-check: 3 erros pré-existentes do Recharts, inalterados; lint: projeto sem config ESLint)
- [x] T008 Validar manualmente os cenários de [quickstart.md](./quickstart.md) (tema claro/escuro, mobile, `admin` e `visualizador`)

---

## Dependencies & Execution Order

- T001 → T002 → T003 (US1) → T004 → T005 → T006 (US2) → T007 → T008
- Todas as tarefas tocam `frontend/src/pages/Dashboard.tsx`; não há paralelismo real.

## Parallel Example

- Nenhuma tarefa marcada `[P]` (mesmo arquivo).

## Implementation Strategy

- **MVP**: Phase 1–3 (seção fechada por padrão). US2 é necessária para acessar os detalhes, então ambas são entregues juntas.
- Entrega incremental em um único commit na `main`.
