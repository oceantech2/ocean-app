# Tasks: Correção da liberação em massa e filtro por status de liberação em Bônus e Comissão

**Input**: Design documents from `/specs/086-comissoes-liberacao-massa-filtro/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Helpers puros (fundação) → liberação em massa confiável (US1) → filtro de status (US2) → selecionar todos exibidos (US3) → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US3 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Página: `frontend/src/pages/Bonus.tsx`
- Helpers: `frontend/src/utils/bonusSelecao.ts` (novo)
- Modal: `frontend/src/components/Modal.tsx` (reuso, sem alteração)
- Contrato UI: `specs/086-comissoes-liberacao-massa-filtro/contracts/ui-comissoes-liberacao-massa-filtro.md`
- **Não alterar**: backend (`backend/app/api/routes/bonus.py`), `services/api.ts`, ações por linha

---

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e no contrato de UI: só frontend, reuso de `bonusService.liberarLote/pagarLote` e de `components/Modal.tsx`, backend intocado

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Criar `frontend/src/utils/bonusSelecao.ts` com o tipo `StatusLiberacaoFiltro` e os helpers puros `filtrarPorStatusLiberacao`, `elegiveisParaLiberar`, `elegiveisParaPagar` e `somaValores`

**Checkpoint**: Regras de filtro e elegibilidade disponíveis

---

## Phase 3: User Story 1 - Liberar em massa com confiabilidade (Priority: P1) 🎯 MVP

**Goal**: Barra sempre visível, confirmação por modal do sistema, envio só de elegíveis e feedback claro.

**Independent Test**: Quickstart cenários 2, 3 e 4.

- [x] T003 [US1] Em `frontend/src/pages/Bonus.tsx`, derivar `paraLiberar`/`paraPagar` da seleção com os helpers e adicionar o estado `acaoMassa: 'liberar' | 'pagar' | null`
- [x] T004 [US1] Em `frontend/src/pages/Bonus.tsx`, substituir `liberarLote`/`pagarLote` (com `confirm`) por `executarAcaoMassa()`, que envia só os IDs elegíveis, mostra toast com processados/ignorados, recarrega a lista, limpa a seleção e fecha o modal; em erro, mantém a seleção
- [x] T005 [US1] Em `frontend/src/pages/Bonus.tsx`, mover a barra de ações para `fixed` no rodapé (`z-40`), com "N selecionada(s)", "Liberar em massa (X)", "Pagar em massa (Y)" (desabilitados com 0 elegíveis ou `processando`) e "Limpar seleção"; adicionar espaçador no fim da lista
- [x] T006 [US1] Em `frontend/src/pages/Bonus.tsx`, renderizar o modal de confirmação com `Modal` (título, quantidade, valor total, Cancelar/Confirmar, spinner no envio, Esc e clique no fundo cancelam fora do envio)

**Checkpoint**: Liberação em massa funcional sem diálogos nativos

---

## Phase 4: User Story 2 - Filtrar por status de liberação (Priority: P1)

**Goal**: Filtro Status (Todos / Liberados / Não liberados) aplicado à lista, aos totais e ao CSV.

**Independent Test**: Quickstart cenário 1.

- [x] T007 [US2] Em `frontend/src/pages/Bonus.tsx`, adicionar o estado `statusLiberacao` (padrão `'todos'`) e aplicá-lo em `bonusFiltrado` via `filtrarPorStatusLiberacao` (gráfico continua com `bonus`); incluir `statusLiberacao` no efeito que limpa a seleção e volta à página 1
- [x] T008 [US2] Em `frontend/src/pages/Bonus.tsx`, adicionar o `select` "Status" na barra de filtros e a mensagem de lista vazia que cita o status

**Checkpoint**: US1 + US2 completos

---

## Phase 5: User Story 3 - Selecionar todos exibidos (Priority: P2)

**Goal**: Marcar/desmarcar de uma vez todos os itens da página atual.

**Independent Test**: Quickstart cenário 2, passo 1.

- [x] T009 [US3] Em `frontend/src/pages/Bonus.tsx`, adicionar acima da lista (somente `admin`) o checkbox "Selecionar todos exibidos (N)", usando os IDs de `colsPaginados` e `toggleGrupo`

**Checkpoint**: US1–US3 completos

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T010 Rodar `npm run type-check` e `npm run build` em `frontend/` sem erros novos
- [ ] T011 Validar os cenários de [quickstart.md](./quickstart.md) no navegador (incluindo `window.confirm` bloqueado e o papel `visualizador`)

---

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → T005 → T006 (US1)
- T002 → T007 → T008 (US2)
- T009 depende de T005 (barra) e de T007 (lista filtrada)
- T003–T009 editam o mesmo arquivo (`Bonus.tsx`): executar em sequência
- T006 + T008 + T009 → T010 → T011

## Parallel Example

```text
Sem paralelismo relevante: após T002, todas as tarefas editam frontend/src/pages/Bonus.tsx.
```

## Implementation Strategy

- **MVP**: Phase 1–3 (correção da liberação em massa, que é o defeito reportado)
- US2 (filtro) e US3 (selecionar todos) entram na mesma entrega por fazerem parte do pedido
- Entrega em um único commit na `main`
