# Tasks: Cabeçalho Fixo na Tabela de Contas a Pagar

**Input**: Design documents from `/specs/066-contas-pagar-cabecalho-fixo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec — sem fase TDD. Validação via [quickstart.md](./quickstart.md).

**Organization**: Setup → fundação (localizar wrapper da tabela) → US1 (área rolável + sticky) → US2 (ida/volta sem regressão visual) → polish (impressão + lint).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência incompleta)
- **[Story]**: US1–US2 conforme spec.md
- Caminhos de arquivo explícitos

## Path Conventions

- Página: `frontend/src/pages/Contas.tsx`
- CSS impressão (se necessário): `frontend/src/index.css`
- Contrato UI: `specs/066-contas-pagar-cabecalho-fixo/contracts/ui-contas-pagar-cabecalho-fixo.md`
- **Não alterar**: backend, APIs, outras páginas de tabela, sticky na viewport da página como solução principal

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar recorte; sem app novo, sem dependência nova

- [x] T001 Confirmar escopo em [plan.md](./plan.md) e [contracts/ui-contas-pagar-cabecalho-fixo.md](./contracts/ui-contas-pagar-cabecalho-fixo.md): só `Contas.tsx`; área rolável da tabela (não sticky na página); portas 5193/8001 inalteradas; não tocar backend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Identificar o wrapper atual da listagem e o que fica fora da área rolável

**⚠️ CRITICAL**: Histórias de usuário não começam até esta fase terminar

- [x] T002 Em `frontend/src/pages/Contas.tsx`, localizar o wrapper da tabela (`overflow-x-auto print-area` ~linha da listagem) e confirmar que título, cards de totais, filtros e botões de header estão **fora** desse wrapper (FR-006)

**Checkpoint**: Ponto de edição claro; chrome da página permanece fora do scroll das linhas

---

## Phase 3: User Story 1 - Manter o cabeçalho visível ao rolar a tabela (Priority: P1) 🎯 MVP

**Goal**: Listagem com área rolável própria; cabeçalho de colunas fixo no topo dessa área; título/filtros fora

**Independent Test**: Abrir Contas a Pagar com lista longa; rolar só a área da tabela; cabeçalho permanece no topo; chrome da página não some com o scroll das linhas

### Implementation for User Story 1

- [x] T003 [US1] Em `frontend/src/pages/Contas.tsx`, no wrapper da listagem, trocar/ampliar overflow para `overflow-auto` (vertical + horizontal) e definir `max-h-[calc(100vh-…)]` (offset conforme [research.md](./research.md) R3) para a tabela ocupar o espaço útil restante
- [x] T004 [US1] Em `frontend/src/pages/Contas.tsx`, tornar o cabeçalho sticky: aplicar `sticky top-0 z-10` (ou equivalente) nas `th` do `<thead>`, com fundo opaco claro/escuro (`bg-gray-50` / `dark:bg-gray-700` ou equivalente nas células) para as linhas não vazarem por cima (FR-001, FR-003)
- [x] T005 [US1] Validar visualmente conforme [quickstart.md](./quickstart.md) seção US1: scroll vertical na área da tabela; cabeçalho alinhado às colunas; título/cards/filtros fora da área rolável (FR-002, FR-006, SC-001, SC-005)

**Checkpoint**: MVP testável — cabeçalho fixo na área rolável (US1)

---

## Phase 4: User Story 2 - Voltar ao topo sem estranheza visual (Priority: P2)

**Goal**: Rolar para baixo e voltar ao topo sem cabeçalho duplicado nem sobreposição ilegível; scroll horizontal alinhado

**Independent Test**: Rolar a área da tabela para baixo e de volta ao topo; um único cabeçalho; rótulos legíveis; scroll H alinhado

### Implementation for User Story 2

- [x] T006 [US2] Em `frontend/src/pages/Contas.tsx`, ajustar z-index/fundo/bordas do cabeçalho sticky se necessário para eliminar “bleed” das linhas ou sombra/duplicação ao voltar ao topo (FR-003, SC-002)
- [x] T007 [US2] Validar conforme [quickstart.md](./quickstart.md) seções US2 + scroll horizontal + listagem curta: ida/volta limpa; alinhamento H; poucas linhas sem artefato estranho (SC-002, SC-003)

**Checkpoint**: US2 atendida sobre a base sticky da US1

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Impressão, qualidade e checklist completo

- [x] T008 Garantir impressão/PDF: em `frontend/src/pages/Contas.tsx` e/ou `frontend/src/index.css` (`@media print`), resetar `max-height`/`overflow` do wrapper da tabela para `.print-area` imprimir todas as linhas ([research.md](./research.md) R5)
- [x] T009 [P] Rodar `npm run lint` e `npm run type-check` em `frontend/`
- [x] T010 Executar o checklist completo de [quickstart.md](./quickstart.md) (US1, US2, horizontal, curta, impressão, visualizador, regressão SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia** as histórias
- **US1 (Phase 3)**: Depende da Phase 2 — MVP
- **US2 (Phase 4)**: Depende da US1 (refino visual sobre o sticky)
- **Polish (Phase 5)**: Depois das histórias desejadas (impressão pode seguir logo após US1 se preferir)

### User Story Dependencies

| Story | Depende de | Entrega independente |
|-------|------------|----------------------|
| US1 | Phase 2 | Área rolável + cabeçalho sticky |
| US2 | US1 | Refino ida/volta + validação H/curta |

### Parallel Opportunities

- T009 (lint/type-check) pode rodar em paralelo após as edições de código estabilizarem
- Demais tarefas são sequenciais no mesmo arquivo (`Contas.tsx`)

### Parallel Example: User Story 1

```text
# Sequencial no mesmo arquivo:
T003 → T004 → T005
```

---

## Implementation Strategy

### MVP First

1. Completar Phase 1–2
2. Completar US1 (T003–T005)
3. **STOP e validar** quickstart US1
4. Seguir US2 + polish

### Incremental Delivery

1. US1 → valor principal (cabeçalho não some ao rolar)
2. US2 → qualidade visual ida/volta
3. Polish → impressão + lint + checklist completo

### Notes

- Um único arquivo de implementação principal: `frontend/src/pages/Contas.tsx`
- Sem testes automatizados solicitados
- Total: **10 tarefas** (T001–T010)
- Implementação 2026-09-14: T009 — `eslint` sem config no repo; `tsc` falha só em `Dashboard.tsx` / `DH.tsx` pré-existentes (nada em `Contas.tsx`)
